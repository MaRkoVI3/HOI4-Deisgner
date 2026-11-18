import type { Technology, TechnologyModifiers, TechnologyInstance, EquipmentStatModifiers } from '@generalstaff/shared-types';

export interface TechnologyTree {
  id: string;
  name: string;
  countryTag?: string;
  categories: TechnologyCategory[];
  connections: TechnologyConnection[];
}

export interface TechnologyCategory {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  x: number;
  y: number;
}

export interface TechnologyConnection {
  from: string;
  to: string;
  type: 'prerequisite' | 'unlock' | 'mutually_exclusive';
}

export interface TechnologyEffect {
  target: 'division' | 'battalion' | 'support_company' | 'equipment' | 'country';
  targetType?: string;
  modifiers: TechnologyModifiers;
}

export const TECHNOLOGY_CATEGORIES = [
  'infantry',
  'armor',
  'artillery',
  'support',
  'naval',
  'air',
  'industry',
  'doctrine',
  'secret',
] as const;

export type TechnologyCategoryType = typeof TECHNOLOGY_CATEGORIES[number];

export function calculateTechnologyEffects(
  technologies: TechnologyInstance[],
  allTechnologies: Record<string, Technology>
): TechnologyModifiers {
  const combined: TechnologyModifiers = {};

  for (const techInstance of technologies) {
    const tech = allTechnologies[techInstance.technologyId];
    if (!tech) continue;

    for (const [key, value] of Object.entries(tech.modifiers)) {
      if (typeof value === 'number') {
        combined[key] = (combined[key] || 0) + value;
      } else if (value && typeof value === 'object') {
        if (!combined[key]) {
          combined[key] = {};
        }
        const targetObj = combined[key] as Record<string, number>;
        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === 'number') {
            targetObj[subKey] = (targetObj[subKey] || 0) + subValue;
          }
        }
      }
    }
  }

  return combined;
}

export function applyTechnologyToEquipment(
  baseStats: EquipmentStatModifiers,
  techModifiers: TechnologyModifiers,
  equipmentCategory: string
): EquipmentStatModifiers {
  const categoryKey = equipmentCategory.replace('_equipment', '') + 'Equipment';
  const categoryMods = techModifiers[categoryKey] as EquipmentStatModifiers | undefined;

  if (!categoryMods) return baseStats;

  return {
    softAttack: (baseStats.softAttack || 0) + (categoryMods.softAttack || 0),
    hardAttack: (baseStats.hardAttack || 0) + (categoryMods.hardAttack || 0),
    airAttack: (baseStats.airAttack || 0) + (categoryMods.airAttack || 0),
    defense: (baseStats.defense || 0) + (categoryMods.defense || 0),
    breakthrough: (baseStats.breakthrough || 0) + (categoryMods.breakthrough || 0),
    armor: (baseStats.armor || 0) + (categoryMods.armor || 0),
    piercing: (baseStats.piercing || 0) + (categoryMods.piercing || 0),
    reliability: (baseStats.reliability || 0) + (categoryMods.reliability || 0),
    ap: (baseStats.ap || 0) + (categoryMods.ap || 0),
    recon: (baseStats.recon || 0) + (categoryMods.recon || 0),
    entrenchment: (baseStats.entrenchment || 0) + (categoryMods.entrenchment || 0),
    initiative: (baseStats.initiative || 0) + (categoryMods.initiative || 0),
    suppression: (baseStats.suppression || 0) + (categoryMods.suppression || 0),
    weight: (baseStats.weight || 0) + (categoryMods.weight || 0),
    fuelConsumption: (baseStats.fuelConsumption || 0) + (categoryMods.fuelConsumption || 0),
    cost: (baseStats.cost || 0) + (categoryMods.cost || 0),
  };
}

export function applyTechnologyToDivision(
  baseStats: any,
  techModifiers: TechnologyModifiers
): any {
  const result = { ...baseStats };

  const divisionMods = [
    'divisionAttack',
    'divisionDefense',
    'divisionBreakthrough',
    'orgGain',
    'recoveryRate',
    'maxOrg',
    'supplyConsumption',
    'planningSpeed',
    'maxPlanning',
    'entrenchment',
    'recon',
    'suppression',
    'fuelConsumption',
  ];

  for (const mod of divisionMods) {
    const value = techModifiers[mod];
    if (typeof value === 'number' && typeof result[mod] === 'number') {
      if (mod.endsWith('Gain') || mod.includes('Factor') || mod.includes('Consumption')) {
        result[mod] = result[mod] * (1 + value / 100);
      } else {
        result[mod] = result[mod] + value;
      }
    }
  }

  return result;
}

export function getAvailableTechnologies(
  researched: string[],
  allTechnologies: Record<string, Technology>
): string[] {
  const available: string[] = [];

  for (const [id, tech] of Object.entries(allTechnologies)) {
    if (researched.includes(id)) continue;

    const prerequisitesMet = tech.prerequisites.every(prereq => researched.includes(prereq));
    if (prerequisitesMet) {
      available.push(id);
    }
  }

  return available;
}

export function getResearchCost(
  technologyId: string,
  allTechnologies: Record<string, Technology>,
  modifiers: { researchSpeed?: number; technologyCost?: number } = {}
): number {
  const tech = allTechnologies[technologyId];
  if (!tech) return 0;

  let cost = tech.cost;

  if (modifiers.technologyCost) {
    cost *= (1 + modifiers.technologyCost / 100);
  }

  if (modifiers.researchSpeed) {
    cost /= (1 + modifiers.researchSpeed / 100);
  }

  return Math.round(cost);
}

export function getResearchTime(
  technologyId: string,
  allTechnologies: Record<string, Technology>,
  researchSpeed: number,
  modifiers: { researchSpeed?: number } = {}
): number {
  const tech = allTechnologies[technologyId];
  if (!tech) return 0;

  let speed = researchSpeed;

  if (modifiers.researchSpeed) {
    speed *= (1 + modifiers.researchSpeed / 100);
  }

  const baseDays = tech.cost / 10;
  return Math.round(baseDays / Math.max(speed, 0.1));
}

export function canResearch(
  technologyId: string,
  researched: string[],
  allTechnologies: Record<string, Technology>
): { can: boolean; missingPrerequisites: string[] } {
  const tech = allTechnologies[technologyId];
  if (!tech) return { can: false, missingPrerequisites: [] };

  const missing = tech.prerequisites.filter(p => !researched.includes(p));

  return {
    can: missing.length === 0 && !researched.includes(technologyId),
    missingPrerequisites: missing,
  };
}

export function getTechnologyTree(
  countryTag: string,
  allTechnologies: Record<string, Technology>
): TechnologyTree {
  const countryTechs = Object.values(allTechnologies).filter(
    t => !t.countryTag || t.countryTag === countryTag
  );

  const categories: TechnologyCategory[] = TECHNOLOGY_CATEGORIES.map((cat, i) => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '),
    description: `${cat} technologies`,
    technologies: countryTechs.filter(t => t.category === cat).map(t => t.id),
    x: (i % 3) * 400,
    y: Math.floor(i / 3) * 300,
  }));

  const connections: TechnologyConnection[] = [];
  for (const tech of countryTechs) {
    for (const prereq of tech.prerequisites) {
      connections.push({ from: prereq, to: tech.id, type: 'prerequisite' });
    }
    for (const unlock of tech.unlocks || []) {
      connections.push({ from: tech.id, to: unlock, type: 'unlock' });
    }
  }

  return {
    id: `tree_${countryTag}`,
    name: `${countryTag} Technology Tree`,
    countryTag,
    categories,
    connections,
  };
}