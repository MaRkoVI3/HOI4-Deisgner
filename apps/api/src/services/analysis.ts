import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { getCachedAnalysis, setCachedAnalysis, invalidateAnalysisCache } from './redis';
import type {
  Division,
  DivisionStats,
  AnalysisResults,
  MatchupAnalysis,
} from '@generalstaff/shared-types';

// ============================================================================
// Types
// ============================================================================

export interface AnalysisRequest {
  division: Division;
  forceRefresh?: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResults;
  error?: string;
  cached?: boolean;
  processingTimeMs?: number;
}

// Internal types for prompt building
interface DivisionSummary {
  name: string;
  country: string;
  combatWidth: number;
  stats: DivisionStats;
  battalions: BattalionSummary[];
  supportCompanies: SupportCompanySummary[];
  doctrines: string[];
  nationalSpirits: string[];
}

interface BattalionSummary {
  name: string;
  type: string;
  count: number;
  equipment: Record<string, string>;
}

interface SupportCompanySummary {
  name: string;
  type: string;
  equipment?: string;
}

// ============================================================================
// Anthropic Client
// ============================================================================

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic | null {
  if (!config.anthropic.apiKey) {
    return null;
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }
  return anthropicClient;
}

// ============================================================================
// Cache Key Generation
// ============================================================================

function generateCacheKey(division: Division): string {
  // Create a deterministic key based on division composition
  const combatWidth = division.stats?.combatWidth || 0;
  const keyParts = [
    division.version.toString(), // Version first to ensure it's not truncated
    division.name,
    division.country.tag,
    combatWidth.toString(),
    division.battalions.map(b => `${b.templateId}:${b.count}:${JSON.stringify(b.equipmentAssignments)}`).sort().join('|'),
    division.supportCompanies.map(s => `${s.templateId}:${s.equipmentVariantId || 'none'}`).sort().join('|'),
    division.doctrines.map(d => d.doctrineId).sort().join(','),
    division.spirits.map(s => s.spiritId).sort().join(','),
    division.technologies.map(t => t.technologyId).sort().join(','),
  ];
  return Buffer.from(keyParts.join('::')).toString('base64url').substring(0, 100);
}

// ============================================================================
// Division Summarization for Prompt
// ============================================================================

function summarizeDivision(division: Division): DivisionSummary {
  const combatWidth = division.stats?.combatWidth || 0;
  return {
    name: division.name,
    country: division.country.name,
    combatWidth,
    stats: division.stats || {
      softAttack: 0,
      hardAttack: 0,
      airAttack: 0,
      defense: 0,
      breakthrough: 0,
      armor: 0,
      hardness: 0,
      piercing: 0,
      organization: 0,
      maxOrganization: 0,
      recoveryRate: 0,
      supplyConsumption: 0,
      fuelConsumption: 0,
      weight: 0,
      combatWidth,
      recon: 0,
      suppression: 0,
      entrenchment: 0,
      initiative: 0,
      speed: 0,
      maxSpeed: 0,
      hp: 0,
      apAttack: 0,
      manpower: 0,
      productionCost: 0,
      icCost: 0,
      battalionCount: 0,
      supportCompanyCount: 0,
      isValid: true,
      validationIssues: [],
    },
    battalions: division.battalions.map(b => ({
      name: b.customName || b.templateId,
      type: b.templateId,
      count: b.count,
      equipment: Object.fromEntries(
        Object.entries(b.equipmentAssignments)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, v!])
      ),
    })),
    supportCompanies: division.supportCompanies.map(s => ({
      name: s.templateId,
      type: s.templateId,
      equipment: s.equipmentVariantId,
    })),
    doctrines: division.doctrines.map(d => d.doctrineId),
    nationalSpirits: division.spirits.map(s => s.spiritId),
  };
}

// ============================================================================
// Prompt Engineering
// ============================================================================

const SYSTEM_PROMPT = `You are an expert Hearts of Iron IV division analyst. You analyze division templates and provide detailed tactical assessments for multiplayer competitive play.

Your analysis must be:
- Accurate to HOI4 game mechanics (as of No Step Back / By Blood Alone DLCs)
- Focused on competitive multiplayer viability
- Specific and actionable, not generic
- Structured in the exact JSON format requested

Key mechanics to consider:
- Combat width thresholds (20, 27, 40, 80) and reinforcement mechanics
- Org/HP thresholds for sustaining combat (30+ org recommended)
- Armor/piercing mechanics and the 50% rule
- Hardness and its effect on damage taken
- Supply/fuel consumption and logistics
- Specialized vs generalist templates
- Current meta: 20w infantry hold, 27w/40w armor push, 15w/20w CAS, 20w/40w AA`;

const USER_PROMPT_TEMPLATE = `Analyze this HOI4 division template and provide a comprehensive tactical assessment.

DIVISION: {name} ({country})
Combat Width: {combatWidth}

STATS:
- HP: {hp}
- Organization: {org} (Max: {maxOrg}, Recovery: {recovery}/hr)
- Soft Attack: {softAttack}
- Hard Attack: {hardAttack}
- Air Attack: {airAttack}
- Defense: {defense}
- Breakthrough: {breakthrough}
- Armor: {armor} (Hardness: {hardness}%)
- Piercing: {piercing}
- AP Attack: {apAttack}
- Initiative: {initiative}
- Entrenchment: {entrenchment}
- Recon: {recon}
- Suppression: {suppression}
- Speed: {speed} km/h (Max: {maxSpeed})
- Supply: {supply}/day
- Fuel: {fuel}/day
- Weight: {weight}k
- Manpower: {manpower}
- IC Cost: {icCost}
- Battalions: {battalionCount}, Support: {supportCompanyCount}

BATTALIONS:
{battalions}

SUPPORT COMPANIES:
{supportCompanies}

DOCTRINES: {doctrines}
NATIONAL SPIRITS: {nationalSpirits}

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": number (0-100),
  "categoryScores": {
    "offense": number (0-100),
    "defense": number (0-100),
    "mobility": number (0-100),
    "logistics": number (0-100),
    "costEfficiency": number (0-100)
  },
  "strengths": string[] (3-5 items, specific mechanics),
  "weaknesses": string[] (3-5 items, specific mechanics),
  "recommendations": string[] (3-5 items, actionable changes),
  "matchups": [
    {
      "enemyType": string,
      "winRate": number (0-100),
      "avgCombatDuration": number (hours),
      "keyFactors": string[]
    }
  ]
}

Matchup enemy types to cover: "20w Infantry (Hold)", "27w Medium Tanks (Push)", "40w Heavy Tanks (Breakthrough)", "15w CAS (Air Superiority)", "20w AA (Anti-Air)", "40w AT (Anti-Tank)"

Scoring guidelines:
- 90-100: Meta-defining, tournament viable
- 80-89: Strong competitive pick
- 70-79: Viable with good play
- 60-69: Niche/situational
- 50-59: Suboptimal but functional
- Below 50: Flawed design`;

function buildPrompt(division: DivisionSummary): string {
  const s = division.stats;
  const battalionsStr = division.battalions
    .map(b => `  - ${b.name} (${b.type}) x${b.count}: ${JSON.stringify(b.equipment)}`)
    .join('\n');
  const supportStr = division.supportCompanies
    .map(s => `  - ${s.name} (${s.type})${s.equipment ? ` [${s.equipment}]` : ''}`)
    .join('\n') || '  - None';

  return USER_PROMPT_TEMPLATE
    .replace('{name}', division.name)
    .replace('{country}', division.country)
    .replace('{combatWidth}', division.combatWidth.toString())
    .replace('{hp}', s.hp.toFixed(0))
    .replace('{org}', s.organization.toFixed(1))
    .replace('{maxOrg}', s.maxOrganization.toFixed(1))
    .replace('{recovery}', s.recoveryRate.toFixed(2))
    .replace('{softAttack}', s.softAttack.toFixed(1))
    .replace('{hardAttack}', s.hardAttack.toFixed(1))
    .replace('{airAttack}', s.airAttack.toFixed(1))
    .replace('{defense}', s.defense.toFixed(1))
    .replace('{breakthrough}', s.breakthrough.toFixed(1))
    .replace('{armor}', s.armor.toFixed(1))
    .replace('{hardness}', (s.hardness * 100).toFixed(1))
    .replace('{piercing}', s.piercing.toFixed(1))
    .replace('{apAttack}', s.apAttack.toFixed(1))
    .replace('{initiative}', s.initiative.toFixed(1))
    .replace('{entrenchment}', s.entrenchment.toFixed(1))
    .replace('{recon}', s.recon.toFixed(1))
    .replace('{suppression}', s.suppression.toFixed(1))
    .replace('{speed}', s.speed.toFixed(1))
    .replace('{maxSpeed}', s.maxSpeed.toFixed(1))
    .replace('{supply}', s.supplyConsumption.toFixed(1))
    .replace('{fuel}', s.fuelConsumption.toFixed(1))
    .replace('{weight}', (s.weight / 1000).toFixed(1))
    .replace('{manpower}', s.manpower.toFixed(0))
    .replace('{icCost}', s.icCost.toFixed(0))
    .replace('{battalionCount}', s.battalionCount.toString())
    .replace('{supportCompanyCount}', s.supportCompanyCount.toString())
    .replace('{battalions}', battalionsStr)
    .replace('{supportCompanies}', supportStr)
    .replace('{doctrines}', division.doctrines.join(', ') || 'None')
    .replace('{nationalSpirits}', division.nationalSpirits.join(', ') || 'None');
}

// ============================================================================
// Rule-Based Fallback Analysis
// ============================================================================

function calculateRuleBasedAnalysis(division: DivisionSummary): AnalysisResults {
  const s = division.stats;
  const cw = division.combatWidth;

  // Category scores based on mechanics
  let offense = 0;
  let defense = 0;
  let mobility = 0;
  let logistics = 0;
  let costEfficiency = 0;

  // Offense: Soft/Hard attack, breakthrough, armor piercing
  const hasArmor = s.armor > 0;
  const hasPiercing = s.piercing > 0;
  const effectiveAttack = Math.max(s.softAttack, s.hardAttack);
  offense = Math.min(100, Math.round(
    (effectiveAttack / 200) * 40 +
    (s.breakthrough / 100) * 25 +
    (hasArmor ? 15 : 0) +
    (hasPiercing ? 10 : 0) +
    (s.hardness > 0.5 ? 10 : 0)
  ));

  // Defense: Defense, armor, HP, org
  defense = Math.min(100, Math.round(
    (s.defense / 150) * 30 +
    (s.armor / 100) * 25 +
    (s.hp / 100) * 15 +
    (s.organization / 50) * 15 +
    (s.entrenchment / 10) * 10 +
    (s.recoveryRate > 2 ? 5 : 0)
  ));

  // Mobility: Speed, recon, initiative
  mobility = Math.min(100, Math.round(
    (s.speed / 20) * 40 +
    (s.recon / 50) * 25 +
    (s.initiative / 50) * 20 +
    (cw <= 27 ? 15 : 0)
  ));

  // Logistics: Supply, fuel, weight
  const supplyScore = Math.max(0, 100 - s.supplyConsumption * 2);
  const fuelScore = Math.max(0, 100 - s.fuelConsumption * 5);
  const weightScore = Math.max(0, 100 - (s.weight / 1000) * 2);
  logistics = Math.round((supplyScore + fuelScore + weightScore) / 3);

  // Cost Efficiency: Stats per IC
  const totalCombatStats = s.softAttack + s.hardAttack + s.defense + s.breakthrough + s.armor;
  costEfficiency = Math.min(100, Math.round(
    (totalCombatStats / (s.icCost / 100)) * 10
  ));

  // Overall score (weighted)
  const overallScore = Math.round(
    offense * 0.25 +
    defense * 0.25 +
    mobility * 0.15 +
    logistics * 0.15 +
    costEfficiency * 0.20
  );

  // Strengths
  const strengths: string[] = [];
  if (s.organization >= 35) strengths.push(`High organization (${s.organization.toFixed(1)}) sustains prolonged combat`);
  if (s.armor > 50 && s.piercing > s.armor) strengths.push(`Armor (${s.armor.toFixed(1)}) exceeds typical piercing, negating most enemy attacks`);
  if (s.hardness > 0.6) strengths.push(`High hardness (${(s.hardness * 100).toFixed(0)}%) reduces damage from soft attacks significantly`);
  if (s.breakthrough >= 50) strengths.push(`Strong breakthrough (${s.breakthrough.toFixed(1)}) enables offensive momentum`);
  if (s.recon >= 30) strengths.push(`Good reconnaissance (${s.recon.toFixed(1)}) provides tactical advantage`);
  if (s.recoveryRate > 2.5) strengths.push(`Fast org recovery (${s.recoveryRate.toFixed(2)}/hr) allows quick re-engagement`);
  if (cw === 20 || cw === 27) strengths.push(`Optimal combat width (${cw}) for reinforcement efficiency`);
  if (s.icCost > 0 && totalCombatStats / (s.icCost / 100) > 50) strengths.push(`Cost-efficient stat-to-IC ratio`);

  // Weaknesses
  const weaknesses: string[] = [];
  if (s.organization < 30) weaknesses.push(`Low organization (${s.organization.toFixed(1)}) risks shattering under sustained fire`);
  if (s.armor > 0 && s.piercing < s.armor / 2) weaknesses.push(`Armor (${s.armor.toFixed(1)}) vulnerable to piercing; enemies with ${(s.armor / 2).toFixed(1)}+ piercing negate it`);
  if (s.hardness < 0.3 && s.armor < 30) weaknesses.push(`Low hardness (${(s.hardness * 100).toFixed(0)}%) and armor takes full damage from all attack types`);
  if (s.supplyConsumption > 2.5) weaknesses.push(`High supply consumption (${s.supplyConsumption.toFixed(1)}/day) strains logistics in poor infrastructure`);
  if (s.fuelConsumption > 10) weaknesses.push(`High fuel consumption (${s.fuelConsumption.toFixed(1)}/day) requires secure oil supply`);
  if (s.speed < 4) weaknesses.push(`Low speed (${s.speed.toFixed(1)} km/h) limits strategic and tactical mobility`);
  if (cw > 27 && cw !== 40) weaknesses.push(`Non-standard combat width (${cw}) reduces reinforcement efficiency`);
  if (s.battalionCount < 3) weaknesses.push(`Few battalions (${s.battalionCount}) limits stat concentration`);

  // Recommendations
  const recommendations: string[] = [];
  if (s.organization < 30) recommendations.push('Add field hospital or logistic company to boost organization');
  if (s.armor > 0 && s.piercing < s.armor) recommendations.push('Increase piercing via support AT or higher-tier equipment to utilize armor');
  if (s.hardness < 0.3) recommendations.push('Add armor battalions or upgrade to medium/heavy tanks to increase hardness');
  if (s.supplyConsumption > 2.5) recommendations.push('Add logistics company or use motorized instead of mechanized to reduce supply');
  if (s.fuelConsumption > 10) recommendations.push('Consider removing fuel-hungry battalions or adding fuel-efficient variants');
  if (s.speed < 4 && cw <= 27) recommendations.push('Replace slow battalions with motorized/mechanized to reach 4+ km/h');
  if (!division.supportCompanies.some(s => s.type === 'signal')) recommendations.push('Add signal company for +planning speed and reinforcement rate');
  if (!division.supportCompanies.some(s => s.type === 'engineer')) recommendations.push('Add engineer company for entrenchment and river crossing');
  if (cw !== 20 && cw !== 27 && cw !== 40) recommendations.push(`Adjust to standard combat width (20/27/40) for optimal reinforcements`);

  // Matchups
  const matchups: MatchupAnalysis[] = [
    {
      enemyType: '20w Infantry (Hold)',
      winRate: Math.min(95, Math.max(5, offense + (hasArmor ? 15 : 0) - 10)),
      avgCombatDuration: Math.max(12, 48 - offense / 3),
      keyFactors: [
        hasArmor ? 'Armor negates infantry soft attack' : 'Vulnerable to sustained infantry fire',
        s.breakthrough > 30 ? 'High breakthrough overwhelms defensive lines' : 'Low breakthrough stalls against entrenchment',
      ],
    },
    {
      enemyType: '27w Medium Tanks (Push)',
      winRate: Math.min(90, Math.max(10, defense + (s.piercing > 50 ? 15 : 0) - (hasArmor ? 0 : 20))),
      avgCombatDuration: Math.max(8, 36 - defense / 4),
      keyFactors: [
        s.piercing > 50 ? 'Piercing defeats medium tank armor' : 'Medium tank armor negates attacks',
        s.armor > 60 ? 'High armor bounces medium tank guns' : 'Vulnerable to medium tank firepower',
      ],
    },
    {
      enemyType: '40w Heavy Tanks (Breakthrough)',
      winRate: Math.min(85, Math.max(5, defense + (s.piercing > 100 ? 20 : 0) + (s.hardness > 0.7 ? 15 : 0) - 30)),
      avgCombatDuration: Math.max(6, 24 - defense / 5),
      keyFactors: [
        s.piercing > 100 ? 'Sufficient piercing for heavy armor' : 'Heavy tank armor impenetrable',
        s.hardness > 0.7 ? 'High hardness mitigates heavy tank damage' : 'Takes full heavy tank damage',
      ],
    },
    {
      enemyType: '15w CAS (Air Superiority)',
      winRate: Math.min(95, Math.max(20, (s.airAttack > 100 ? 70 : 30) + (division.supportCompanies.some(s => s.type === 'anti_air') ? 20 : 0))),
      avgCombatDuration: 4,
      keyFactors: [
        s.airAttack > 100 ? 'Strong air attack shreds CAS' : 'Weak air defense vulnerable to CAS',
        division.supportCompanies.some(s => s.type === 'anti_air') ? 'Dedicated AA support company' : 'No specialized AA',
      ],
    },
    {
      enemyType: '20w AA (Anti-Air)',
      winRate: Math.min(90, Math.max(30, offense - (division.supportCompanies.some(s => s.type === 'anti_air') ? 0 : 15))),
      avgCombatDuration: 16,
      keyFactors: [
        hasArmor ? 'Armor reduces AA effectiveness' : 'No armor mitigation',
        s.airAttack > 50 ? 'Can threaten enemy air' : 'No air threat capability',
      ],
    },
    {
      enemyType: '40w AT (Anti-Tank)',
      winRate: Math.min(85, Math.max(10, defense + (hasArmor ? 20 : -20) + (s.piercing > 80 ? 15 : 0))),
      avgCombatDuration: Math.max(10, 30 - defense / 3),
      keyFactors: [
        hasArmor && s.armor > 100 ? 'Heavy armor bounces AT guns' : 'AT guns pierce armor easily',
        s.piercing > 80 ? 'Can counter-pierce AT divisions' : 'Struggles to damage AT divisions',
      ],
    },
  ];

  return {
    overallScore,
    categoryScores: { offense, defense, mobility, logistics, costEfficiency },
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    recommendations: recommendations.slice(0, 5),
    matchups,
  };
}

// ============================================================================
// AI Analysis (Anthropic)
// ============================================================================

async function runAIAnalysis(division: DivisionSummary): Promise<AnalysisResults | null> {
  const client = getAnthropicClient();
  if (!client) {
    return null;
  }

  const prompt = buildPrompt(division);

  try {
    const response = await client.messages.create({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      temperature: config.anthropic.temperature,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsed.overallScore || !parsed.categoryScores || !parsed.strengths || !parsed.weaknesses || !parsed.recommendations || !parsed.matchups) {
      throw new Error('Invalid response structure');
    }

    return parsed as AnalysisResults;
  } catch (error) {
    console.error('[Analysis] AI analysis failed:', error);
    return null;
  }
}

// ============================================================================
// Main Analysis Function
// ============================================================================

export async function analyzeDivision(request: AnalysisRequest): Promise<AnalysisResponse> {
  const startTime = Date.now();
  const { division, forceRefresh = false } = request;

  // Generate cache key
  const cacheKey = generateCacheKey(division);

  // Check cache unless forced refresh
  if (!forceRefresh) {
    const cached = await getCachedAnalysis(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          success: true,
          data: parsed,
          cached: true,
          processingTimeMs: Date.now() - startTime,
        };
      } catch {
        // Cache corrupted, continue to fresh analysis
      }
    }
  }

  // Summarize division for analysis
  const summary = summarizeDivision(division);

  // Try AI analysis first
  let results = await runAIAnalysis(summary);

  // Fall back to rule-based if AI unavailable or failed
  if (!results) {
    console.log('[Analysis] Using rule-based fallback');
    results = calculateRuleBasedAnalysis(summary);
  }

  // Cache results
  await setCachedAnalysis(cacheKey, JSON.stringify(results), config.cache.analysisTtlSeconds);

  return {
    success: true,
    data: results,
    cached: false,
    processingTimeMs: Date.now() - startTime,
  };
}

export async function invalidateAnalysis(division: Division): Promise<void> {
  const cacheKey = generateCacheKey(division);
  await invalidateAnalysisCache(cacheKey);
}

// Export for testing
export { calculateRuleBasedAnalysis, buildPrompt, summarizeDivision, generateCacheKey };