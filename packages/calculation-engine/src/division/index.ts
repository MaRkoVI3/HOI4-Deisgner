import type {
  DivisionTemplate,
  DivisionStats,
  BattalionInstance,
  SupportCompanyInstance,
  BattalionTemplate,
  SupportCompanyTemplate,
  EquipmentVariant,
  EquipmentStats,
  EquipmentCategory,
  Doctrine,
  NationalSpirit,
  Technology,
  CountryTag,
  ValidationIssue,
} from '@generalstaff/shared-types';
import { sum, average, weightedAverage, clamp, safeDivide, roundTo } from '../utils';

export interface CalculationContext {
  battalionTemplates: Record<string, BattalionTemplate>;
  supportCompanyTemplates: Record<string, SupportCompanyTemplate>;
  equipmentVariants: Record<string, EquipmentVariant>;
  doctrines: Record<string, Doctrine>;
  nationalSpirits: Record<string, NationalSpirit>;
  technologies: Record<string, Technology>;
  country?: CountryTag;
}

export const DEFAULT_COMBAT_WIDTH_LIMIT = 80;

export function calculateDivisionStats(
  template: DivisionTemplate,
  context: CalculationContext
): DivisionStats {
  const validationIssues: ValidationIssue[] = [];

  // Calculate battalion contributions
  let totalBattalionStats = calculateBattalionStats(template.battalions, context, validationIssues);

  // Calculate support company contributions
  let totalSupportStats = calculateSupportCompanyStats(template.supportCompanies, context, validationIssues);

  // Apply doctrine modifiers
  const doctrineModifiers = calculateDoctrineModifiers(template.doctrineSelections, context);
  totalBattalionStats = applyModifiers(totalBattalionStats, doctrineModifiers);
  totalSupportStats = applyModifiers(totalSupportStats, doctrineModifiers);

  // Apply national spirit modifiers
  const spiritModifiers = calculateSpiritModifiers(template.nationalSpirits, context);
  totalBattalionStats = applyModifiers(totalBattalionStats, spiritModifiers);
  totalSupportStats = applyModifiers(totalSupportStats, spiritModifiers);

  // Apply technology modifiers
  const techModifiers = calculateTechnologyModifiers(template.technologies, context);
  totalBattalionStats = applyModifiers(totalBattalionStats, techModifiers);
  totalSupportStats = applyModifiers(totalSupportStats, techModifiers);

  // Combine all stats
  const combinedStats = combineStats(totalBattalionStats, totalSupportStats);

  // Apply country modifiers
  if (context.country) {
    applyCountryModifiers(combinedStats, context.country);
  }

  // Calculate derived stats
  const stats = calculateDerivedStats(combinedStats, template, validationIssues);

  return {
    ...stats,
    isValid: validationIssues.filter(i => i.type === 'error').length === 0,
    validationIssues,
  };
}

function calculateBattalionStats(
  battalions: BattalionInstance[],
  context: CalculationContext,
  issues: ValidationIssue[]
): Partial<DivisionStats> {
  const stats: Partial<DivisionStats> = {
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
    recon: 0,
    suppression: 0,
    entrenchment: 0,
    initiative: 0,
    speed: 0,
    hp: 0,
    apAttack: 0,
    manpower: 0,
    productionCost: 0,
    icCost: 0,
    combatWidth: 0,
    battalionCount: battalions.length,
    supportCompanyCount: 0,
  };

  for (const battalion of battalions) {
    const template = context.battalionTemplates[battalion.templateId];
    if (!template) {
      issues.push({
        id: `missing-battalion-${battalion.templateId}`,
        type: 'error',
        message: `Battalion template not found: ${battalion.templateId}`,
        field: 'battalions',
      });
      continue;
    }

    const count = battalion.count;
    const equipmentStats = calculateBattalionEquipmentStats(battalion, template, context, issues);

    stats.softAttack! += (template.baseStats.softAttack + (equipmentStats.softAttack || 0)) * count;
    stats.hardAttack! += (template.baseStats.hardAttack + (equipmentStats.hardAttack || 0)) * count;
    stats.airAttack! += (template.baseStats.airAttack + (equipmentStats.airAttack || 0)) * count;
    stats.defense! += (template.baseStats.defense + (equipmentStats.defense || 0)) * count;
    stats.breakthrough! += (template.baseStats.breakthrough + (equipmentStats.breakthrough || 0)) * count;
    stats.armor! += (template.baseStats.armor + (equipmentStats.armor || 0)) * count;
    stats.piercing! += (equipmentStats.piercing || 0) * count;
    stats.hardness = weightedAverage(
      [stats.hardness!, template.baseStats.hardness + (equipmentStats.hardness || 0)],
      [stats.battalionCount! - 1, 1]
    );
    stats.organization! += (template.baseStats.org + (equipmentStats.organization || 0)) * count;
    stats.maxOrganization! += (template.baseStats.org + (equipmentStats.organization || 0)) * count;
    stats.recoveryRate! += (template.baseStats.recoveryRate + (equipmentStats.recoveryRate || 0)) * count;
    stats.supplyConsumption! += (template.baseStats.supplyConsumption + (equipmentStats.supplyConsumption || 0)) * count;
    stats.fuelConsumption! += (template.baseStats.fuelConsumption + (equipmentStats.fuelConsumption || 0)) * count;
    stats.weight! += (template.baseStats.weight + (equipmentStats.weight || 0)) * count;
    stats.recon! += (template.baseStats.recon + (equipmentStats.recon || 0)) * count;
    stats.suppression! += (template.baseStats.suppression + (equipmentStats.suppression || 0)) * count;
    stats.entrenchment! += (template.baseStats.entrenchment + (equipmentStats.entrenchment || 0)) * count;
    stats.initiative! += (template.baseStats.initiative + (equipmentStats.initiative || 0)) * count;
    stats.speed! += (template.baseStats.speed + (equipmentStats.speed || 0)) * count;
    stats.hp! += (template.baseStats.hp + (equipmentStats.hp || 0)) * count;
    stats.apAttack! += (template.baseStats.apAttack + (equipmentStats.apAttack || 0)) * count;
    stats.manpower! += template.manpower * count;
    stats.productionCost! += (template.baseStats.productionCost || 0) * count;
    stats.icCost! += (template.baseStats.productionCost || 0) * count;
    stats.combatWidth! += template.width * count;
  }

  return stats;
}

function calculateBattalionEquipmentStats(
  battalion: BattalionInstance,
  template: BattalionTemplate,
  context: CalculationContext,
  validationIssues: ValidationIssue[]
): Partial<EquipmentStats> {
  const stats: Partial<EquipmentStats> = {
    softAttack: 0,
    hardAttack: 0,
    airAttack: 0,
    defense: 0,
    breakthrough: 0,
    armor: 0,
    piercing: 0,
    reliability: 0,
    ap: 0,
    recon: 0,
    entrenchment: 0,
    initiative: 0,
    suppression: 0,
    weight: 0,
    fuelConsumption: 0,
    organization: 0,
    recoveryRate: 0,
    supplyConsumption: 0,
    speed: 0,
    hp: 0,
    apAttack: 0,
    hardness: 0,
  };

  for (const [category, variantId] of Object.entries(battalion.equipmentAssignments)) {
    if (!variantId) continue;
    const variant = context.equipmentVariants[variantId];
    if (!variant) {
      validationIssues.push({
        id: `missing-equipment-${variantId}`,
        type: 'warning',
        message: `Equipment variant not found: ${variantId}`,
        field: `battalions.${battalion.id}.equipmentAssignments.${category}`,
      });
      continue;
    }

    stats.softAttack! += variant.stats.softAttack || 0;
    stats.hardAttack! += variant.stats.hardAttack || 0;
    stats.airAttack! += variant.stats.airAttack || 0;
    stats.defense! += variant.stats.defense || 0;
    stats.breakthrough! += variant.stats.breakthrough || 0;
    stats.armor! += variant.stats.armor || 0;
    stats.piercing! += variant.stats.piercing || 0;
    stats.reliability! += variant.stats.reliability || 0;
    stats.ap! += variant.stats.ap || 0;
    stats.recon! += variant.stats.recon || 0;
    stats.entrenchment! += variant.stats.entrenchment || 0;
    stats.initiative! += variant.stats.initiative || 0;
    stats.suppression! += variant.stats.suppression || 0;
    stats.weight! += variant.stats.weight || 0;
    stats.fuelConsumption! += variant.stats.fuelConsumption || 0;
    stats.organization! += variant.stats.organization || 0;
    stats.recoveryRate! += variant.stats.recoveryRate || 0;
    stats.supplyConsumption! += variant.stats.supplyConsumption || 0;
    stats.speed! += variant.stats.speed || 0;
    stats.hp! += variant.stats.hp || 0;
    stats.apAttack! += variant.stats.apAttack || 0;
    stats.hardness! += variant.stats.hardness || 0;
  }

  return stats;
}

function calculateSupportCompanyStats(
  supportCompanies: SupportCompanyInstance[],
  context: CalculationContext,
  validationIssues: ValidationIssue[]
): Partial<DivisionStats> {
  const stats: Partial<DivisionStats> = {
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
    recon: 0,
    suppression: 0,
    entrenchment: 0,
    initiative: 0,
    speed: 0,
    hp: 0,
    apAttack: 0,
    manpower: 0,
    productionCost: 0,
    icCost: 0,
    combatWidth: 0,
    battalionCount: 0,
    supportCompanyCount: supportCompanies.length,
  };

  for (const sc of supportCompanies) {
    const template = context.supportCompanyTemplates[sc.templateId];
    if (!template) {
      validationIssues.push({
        id: `missing-support-${sc.templateId}`,
        type: 'error',
        message: `Support company template not found: ${sc.templateId}`,
        field: 'supportCompanies',
      });
      continue;
    }

    let equipmentStats: Partial<EquipmentStats> = {};
    if (sc.equipmentVariantId && template.equipment) {
      const variant = context.equipmentVariants[sc.equipmentVariantId];
      if (variant) {
        equipmentStats = variant.stats;
      }
    }

    stats.softAttack! += (template.stats.softAttack || 0) + (equipmentStats.softAttack || 0);
    stats.hardAttack! += (template.stats.hardAttack || 0) + (equipmentStats.hardAttack || 0);
    stats.airAttack! += (template.stats.airAttack || 0) + (equipmentStats.airAttack || 0);
    stats.defense! += (template.stats.defense || 0) + (equipmentStats.defense || 0);
    stats.breakthrough! += (template.stats.breakthrough || 0) + (equipmentStats.breakthrough || 0);
    stats.armor! += (template.stats.armor || 0) + (equipmentStats.armor || 0);
    stats.piercing! += (equipmentStats.piercing || 0);
    stats.organization! += (template.stats.org || 0) + (equipmentStats.organization || 0);
    stats.maxOrganization! += (template.stats.org || 0) + (equipmentStats.organization || 0);
    stats.recoveryRate! += (template.stats.recoveryRate || 0) + (equipmentStats.recoveryRate || 0);
    stats.supplyConsumption! += (template.stats.supplyConsumption || 0) + (equipmentStats.supplyConsumption || 0);
    stats.fuelConsumption! += (template.stats.fuelConsumption || 0) + (equipmentStats.fuelConsumption || 0);
    stats.weight! += (template.stats.weight || 0) + (equipmentStats.weight || 0);
    stats.recon! += (template.stats.recon || 0) + (equipmentStats.recon || 0);
    stats.suppression! += (template.stats.suppression || 0) + (equipmentStats.suppression || 0);
    stats.entrenchment! += (template.stats.entrenchment || 0) + (equipmentStats.entrenchment || 0);
    stats.initiative! += (template.stats.initiative || 0) + (equipmentStats.initiative || 0);
    stats.speed! += (template.stats.speed || 0) + (equipmentStats.speed || 0);
    stats.hp! += (template.stats.hp || 0) + (equipmentStats.hp || 0);
    stats.apAttack! += (equipmentStats.apAttack || 0);
    stats.productionCost! += (template.stats.productionCost || 0);
    stats.icCost! += (template.stats.productionCost || 0);
    stats.combatWidth! += template.width;
  }

  return stats;
}

function calculateDoctrineModifiers(
  doctrineIds: string[],
  context: CalculationContext
): Record<string, number> {
  const modifiers: Record<string, number> = {};

  for (const id of doctrineIds) {
    const doctrine = context.doctrines[id];
    if (doctrine) {
      for (const [key, value] of Object.entries(doctrine.modifiers)) {
        if (typeof value === 'number') {
          modifiers[key] = (modifiers[key] || 0) + value;
        }
      }
    }
  }

  return modifiers;
}

function calculateSpiritModifiers(
  spiritIds: string[],
  context: CalculationContext
): Record<string, number> {
  const modifiers: Record<string, number> = {};

  for (const id of spiritIds) {
    const spirit = context.nationalSpirits[id];
    if (spirit) {
      for (const [key, value] of Object.entries(spirit.modifiers)) {
        if (typeof value === 'number') {
          modifiers[key] = (modifiers[key] || 0) + value;
        }
      }
    }
  }

  return modifiers;
}

function calculateTechnologyModifiers(
  techIds: string[],
  context: CalculationContext
): Record<string, number> {
  const modifiers: Record<string, number> = {};

  for (const id of techIds) {
    const tech = context.technologies[id];
    if (tech) {
      for (const [key, value] of Object.entries(tech.modifiers)) {
        if (typeof value === 'number') {
          modifiers[key] = (modifiers[key] || 0) + value;
        } else if (value && typeof value === 'object') {
          for (const [subKey, subValue] of Object.entries(value)) {
            if (typeof subValue === 'number') {
              modifiers[`${key}.${subKey}`] = (modifiers[`${key}.${subKey}`] || 0) + subValue;
            }
          }
        }
      }
    }
  }

  return modifiers;
}

function applyModifiers(
  stats: Partial<DivisionStats>,
  modifiers: Record<string, number>
): Partial<DivisionStats> {
  const result = { ...stats };

  for (const [key, value] of Object.entries(modifiers)) {
    if (key in result && typeof result[key as keyof DivisionStats] === 'number') {
      const current = result[key as keyof DivisionStats] as number;
      if (key.endsWith('Percentage') || key.includes('Factor') || key.includes('Gain')) {
        result[key as keyof DivisionStats] = current * (1 + value / 100) as any;
      } else {
        result[key as keyof DivisionStats] = current + value as any;
      }
    }
  }

  return result;
}

function combineStats(
  battalionStats: Partial<DivisionStats>,
  supportStats: Partial<DivisionStats>
): Partial<DivisionStats> {
  const result: Partial<DivisionStats> = {};

  const allKeys = new Set([...Object.keys(battalionStats), ...Object.keys(supportStats)]);

  for (const key of allKeys) {
    const bVal = battalionStats[key as keyof DivisionStats] as number | undefined;
    const sVal = supportStats[key as keyof DivisionStats] as number | undefined;

    if (typeof bVal === 'number' || typeof sVal === 'number') {
      result[key as keyof DivisionStats] = (bVal || 0) + (sVal || 0) as any;
    }
  }

  return result;
}

function applyCountryModifiers(stats: Partial<DivisionStats>, country: CountryTag): void {
  if (country.modifiers) {
    for (const [key, value] of Object.entries(country.modifiers)) {
      if (key in stats && typeof stats[key as keyof DivisionStats] === 'number') {
        const current = stats[key as keyof DivisionStats] as number;
        if (key.endsWith('Factor') || key.includes('Gain')) {
          stats[key as keyof DivisionStats] = current * (1 + value / 100) as any;
        } else {
          stats[key as keyof DivisionStats] = current + value as any;
        }
      }
    }
  }
}

function calculateDerivedStats(
  baseStats: Partial<DivisionStats>,
  template: DivisionTemplate,
  validationIssues: ValidationIssue[]
): DivisionStats {
  const totalOrg = baseStats.organization || 1;
  const totalHp = baseStats.hp || 1;
  const totalWidth = baseStats.combatWidth || 1;

  // Validate
  if (totalWidth > DEFAULT_COMBAT_WIDTH_LIMIT) {
    validationIssues.push({
      id: 'combat-width-exceeded',
      type: 'error',
      message: `Combat width (${totalWidth}) exceeds limit (${DEFAULT_COMBAT_WIDTH_LIMIT})`,
      field: 'combatWidth',
    });
  }

  if (totalOrg < 10) {
    validationIssues.push({
      id: 'low-organization',
      type: 'warning',
      message: `Low organization (${totalOrg.toFixed(1)}). Consider adding more battalions or support companies.`,
      field: 'organization',
    });
  }

  if ((baseStats.supplyConsumption || 0) > 2.0) {
    validationIssues.push({
      id: 'high-supply',
      type: 'warning',
      message: `High supply consumption (${(baseStats.supplyConsumption || 0).toFixed(2)}). May struggle in low supply areas.`,
      field: 'supplyConsumption',
    });
  }

  if ((baseStats.hardness || 0) < 0.1 && (baseStats.hardAttack || 0) > 0) {
    validationIssues.push({
      id: 'low-hardness',
      type: 'info',
      message: 'Low hardness means hard attack will be less effective against armored targets.',
      field: 'hardness',
    });
  }

  if ((baseStats.speed || 0) < 4) {
    validationIssues.push({
      id: 'low-speed',
      type: 'warning',
      message: `Low speed (${(baseStats.speed || 0).toFixed(1)} km/h). Division may struggle to keep up with advances.`,
      field: 'speed',
    });
  }

  if ((baseStats.battalionCount || 0) < 3) {
    validationIssues.push({
      id: 'few-battalions',
      type: 'warning',
      message: 'Division has fewer than 3 battalions. Consider adding more for better combat performance.',
      field: 'battalions',
    });
  }

  if ((baseStats.supportCompanyCount || 0) === 0) {
    validationIssues.push({
      id: 'no-support',
      type: 'info',
      message: 'No support companies assigned. Consider adding engineer, recon, or signal companies.',
      field: 'supportCompanies',
    });
  }

  return {
    softAttack: roundTo(baseStats.softAttack || 0, 1),
    hardAttack: roundTo(baseStats.hardAttack || 0, 1),
    airAttack: roundTo(baseStats.airAttack || 0, 1),
    defense: roundTo(baseStats.defense || 0, 1),
    breakthrough: roundTo(baseStats.breakthrough || 0, 1),
    armor: roundTo(baseStats.armor || 0, 1),
    hardness: roundTo(baseStats.hardness || 0, 3),
    piercing: roundTo(baseStats.piercing || 0, 1),
    organization: roundTo(totalOrg, 1),
    maxOrganization: roundTo(baseStats.maxOrganization || totalOrg, 1),
    recoveryRate: roundTo(baseStats.recoveryRate || 0, 2),
    supplyConsumption: roundTo(baseStats.supplyConsumption || 0, 2),
    fuelConsumption: roundTo(baseStats.fuelConsumption || 0, 2),
    weight: roundTo(baseStats.weight || 0, 1),
    recon: roundTo(baseStats.recon || 0, 1),
    suppression: roundTo(baseStats.suppression || 0, 1),
    entrenchment: roundTo(baseStats.entrenchment || 0, 1),
    initiative: roundTo(baseStats.initiative || 0, 1),
    speed: roundTo(baseStats.speed || 0, 1),
    maxSpeed: roundTo(baseStats.maxSpeed || baseStats.speed || 0, 1),
    hp: roundTo(totalHp, 1),
    apAttack: roundTo(baseStats.apAttack || 0, 1),
    manpower: roundTo(baseStats.manpower || 0, 0),
    productionCost: roundTo(baseStats.productionCost || 0, 0),
    icCost: roundTo(baseStats.icCost || 0, 0),
    combatWidth: Math.round(baseStats.combatWidth || 0),
    battalionCount: baseStats.battalionCount || 0,
    supportCompanyCount: baseStats.supportCompanyCount || 0,
    isValid: true,
    validationIssues: [],
  };
}

export function calculateCombatWidth(template: DivisionTemplate, context: CalculationContext): number {
  let width = 0;

  for (const battalion of template.battalions) {
    const bt = context.battalionTemplates[battalion.templateId];
    if (bt) {
      width += bt.width * battalion.count;
    }
  }

  for (const sc of template.supportCompanies) {
    const sct = context.supportCompanyTemplates[sc.templateId];
    if (sct) {
      width += sct.width;
    }
  }

  return width;
}

export function isDivisionValid(stats: DivisionStats): boolean {
  return stats.isValid && stats.validationIssues.filter(i => i.type === 'error').length === 0;
}

export function getValidationErrors(stats: DivisionStats): ValidationIssue[] {
  return stats.validationIssues.filter(i => i.type === 'error');
}

export function getValidationWarnings(stats: DivisionStats): ValidationIssue[] {
  return stats.validationIssues.filter(i => i.type === 'warning');
}

export function getValidationInfo(stats: DivisionStats): ValidationIssue[] {
  return stats.validationIssues.filter(i => i.type === 'info');
}

export function validateDivision(
  stats: DivisionStats,
  template: DivisionTemplate,
  issues: ValidationIssue[],
  context: CalculationContext
): void {
  // Combat width validation
  if (stats.combatWidth > DEFAULT_COMBAT_WIDTH_LIMIT) {
    issues.push({
      id: 'combat-width-exceeded',
      type: 'error',
      message: `Combat width (${stats.combatWidth}) exceeds limit (${DEFAULT_COMBAT_WIDTH_LIMIT})`,
      field: 'combatWidth',
    });
  }

  // Organization validation
  if (stats.organization < 10) {
    issues.push({
      id: 'low-organization',
      type: 'warning',
      message: `Low organization (${stats.organization.toFixed(1)}). Consider adding more battalions or support companies.`,
      field: 'organization',
    });
  }

  // Supply validation
  if (stats.supplyConsumption > 2.0) {
    issues.push({
      id: 'high-supply',
      type: 'warning',
      message: `High supply consumption (${stats.supplyConsumption.toFixed(2)}). May struggle in low supply areas.`,
      field: 'supplyConsumption',
    });
  }

  // Hardness validation
  if (stats.hardness < 0.1 && stats.hardAttack > 0) {
    issues.push({
      id: 'low-hardness',
      type: 'info',
      message: 'Low hardness means hard attack will be less effective against armored targets.',
      field: 'hardness',
    });
  }

  // Armor validation - check if division has tank battalions
  const hasTankBattalions = template.battalions.some(b => {
    const bt = context.battalionTemplates[b.templateId];
    return bt?.type === 'light_tank' || bt?.type === 'medium_tank' || bt?.type === 'heavy_tank' || bt?.type === 'modern_tank' || bt?.type === 'super_heavy_tank';
  });
  if (stats.armor < 30 && hasTankBattalions) {
    issues.push({
      id: 'low-tank-armor',
      type: 'warning',
      message: `Tank division has low armor (${stats.armor.toFixed(1)}). Consider upgrading tank equipment.`,
      field: 'armor',
    });
  }

  // Speed validation
  if (stats.speed < 4) {
    issues.push({
      id: 'low-speed',
      type: 'warning',
      message: `Low speed (${stats.speed.toFixed(1)} km/h). Division may struggle to keep up with advances.`,
      field: 'speed',
    });
  }

  // Battalion count validation
  if (stats.battalionCount < 3) {
    issues.push({
      id: 'few-battalions',
      type: 'warning',
      message: 'Division has fewer than 3 battalions. Consider adding more for better combat performance.',
      field: 'battalions',
    });
  }

  // No support companies
  if (stats.supportCompanyCount === 0) {
    issues.push({
      id: 'no-support',
      type: 'info',
      message: 'No support companies assigned. Consider adding engineer, recon, or signal companies.',
      field: 'supportCompanies',
    });
  }
}