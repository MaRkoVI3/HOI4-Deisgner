import type { NationalSpirit, SpiritModifiers, NationalSpiritInstance, BaseEntity } from '@generalstaff/shared-types';

export interface SpiritTree {
  id: string;
  name: string;
  countryTag: string;
  spirits: NationalSpirit[];
  categories: SpiritCategory[];
}

export interface SpiritCategory {
  id: string;
  name: string;
  description: string;
  spirits: string[];
}

export const SPIRIT_CATEGORIES = [
  'political',
  'industrial',
  'military',
  'research',
  'air',
  'naval',
  'covert',
] as const;

export type SpiritCategoryType = typeof SPIRIT_CATEGORIES[number];

export function calculateSpiritModifiers(
  instances: NationalSpiritInstance[],
  allSpirits: Record<string, NationalSpirit>
): SpiritModifiers {
  const combined: SpiritModifiers = {};

  for (const instance of instances) {
    const spirit = allSpirits[instance.spiritId];
    if (!spirit) continue;

    const modifiers = Array.isArray(spirit.modifiers)
      ? Object.fromEntries(spirit.modifiers.map(m => [m.stat, m.value]))
      : spirit.modifiers;

    for (const [key, value] of Object.entries(modifiers)) {
      if (typeof value === 'number') {
        combined[key] = (combined[key] || 0) + value;
      }
    }
  }

  return combined;
}

export function applySpiritToCountry(
  baseValues: Record<string, number>,
  spiritModifiers: SpiritModifiers
): Record<string, number> {
  const result = { ...baseValues };

  for (const [key, value] of Object.entries(spiritModifiers)) {
    if (typeof value === 'number') {
      if (key.endsWith('Factor') || key.includes('Gain') || key.includes('Output') || key.includes('Speed')) {
        result[key] = (result[key] || 0) * (1 + value / 100);
      } else {
        result[key] = (result[key] || 0) + value;
      }
    }
  }

  return result;
}

export function applySpiritToDivision(
  baseStats: any,
  spiritModifiers: SpiritModifiers
): any {
  const result = { ...baseStats };

  const militaryMods = [
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

  for (const mod of militaryMods) {
    const value = spiritModifiers[mod];
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

export function getSpiritsByCategory(
  category: SpiritCategoryType,
  allSpirits: Record<string, NationalSpirit>,
  countryTag?: string
): NationalSpirit[] {
  return Object.values(allSpirits).filter(s => {
    if (countryTag && s.countryTag !== countryTag) return false;
    return s.category === category;
  });
}

export function getAvailableSpirits(
  selected: string[],
  allSpirits: Record<string, NationalSpirit>,
  countryTag: string,
  politicalPower: number
): NationalSpirit[] {
  return Object.values(allSpirits).filter(s => {
    if (s.countryTag !== countryTag) return false;
    if (selected.includes(s.id)) return false;

    // Check political power cost (simplified - would need cost field on spirit)
    // For now just return all unselected
    return true;
  });
}

export function calculateSpiritCost(
  spiritId: string,
  allSpirits: Record<string, NationalSpirit>,
  politicalPower: number
): number {
  const spirit = allSpirits[spiritId];
  if (!spirit) return 0;

  // Base cost would be on the spirit, default to 150 PP
  const baseCost = (spirit as any).cost || 150;
  return baseCost;
}

export function getSpiritTree(
  countryTag: string,
  allSpirits: Record<string, NationalSpirit>
): SpiritTree {
  const countrySpirits = Object.values(allSpirits).filter(
    s => !s.countryTag || s.countryTag === countryTag
  );

  const categories: SpiritCategory[] = SPIRIT_CATEGORIES.map(cat => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    description: `${cat} national spirits`,
    spirits: countrySpirits.filter(s => (s as any).category === cat).map(s => s.id),
  })).filter(c => c.spirits.length > 0);

  return {
    id: `spirit_tree_${countryTag}`,
    name: `${countryTag} National Spirits`,
    countryTag,
    spirits: countrySpirits,
    categories,
  };
}

export function validateSpiritSelection(
  selections: string[],
  allSpirits: Record<string, NationalSpirit>,
  politicalPower: number
): { valid: boolean; errors: string[]; totalCost: number } {
  const errors: string[] = [];
  let totalCost = 0;

  for (const id of selections) {
    const spirit = allSpirits[id];
    if (!spirit) {
      errors.push(`Spirit not found: ${id}`);
      continue;
    }

    const cost = calculateSpiritCost(id, allSpirits, politicalPower);
    totalCost += cost;
  }

  if (totalCost > politicalPower) {
    errors.push(`Insufficient political power. Need ${totalCost}, have ${politicalPower}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    totalCost,
  };
}

export function getSpiritSynergies(
  selections: string[],
  allSpirits: Record<string, NationalSpirit>
): { spiritId: string; synergy: string; bonus: string }[] {
  const synergies: { spiritId: string; synergy: string; bonus: string }[] = [];
  const selected = selections.map(id => allSpirits[id]).filter(Boolean) as NationalSpirit[];

  // Define known synergies
  const knownSynergies: Record<string, { with: string; bonus: string }[]> = {
    // Political + Industrial
    'industrial_mobilization': [
      { with: 'war_economy', bonus: '+10% factory output' },
      { with: 'total_mobilization', bonus: '+15% construction speed' },
    ],
    // Military + Research
    'combined_arms_doctrine': [
      { with: 'mechanized_offensive', bonus: '+5% armor attack/defense' },
      { with: 'infantry_assault', bonus: '+5% infantry attack' },
    ],
    // Air synergies
    'air_superiority_doctrine': [
      { with: 'strategic_bombing_focus', bonus: '+10% air attack' },
      { with: 'close_air_support', bonus: '+10% ground attack' },
    ],
    // Naval synergies
    'decisive_battle_doctrine': [
      { with: 'capital_ship_focus', bonus: '+10% naval attack' },
      { with: 'carrier_aviation', bonus: '+10% naval air attack' },
    ],
  };

  for (const spirit of selected) {
    const synergiesList = knownSynergies[spirit.id];
    if (synergiesList) {
      for (const synergy of synergiesList) {
        if (selections.includes(synergy.with)) {
          synergies.push({
            spiritId: spirit.id,
            synergy: synergy.with,
            bonus: synergy.bonus,
          });
        }
      }
    }
  }

  return synergies;
}

export function calculateNationalSpiritBonuses(
  selections: string[],
  allSpirits: Record<string, NationalSpirit>
): Record<string, number> {
  const combined: Record<string, number> = {};

  for (const id of selections) {
    const spirit = allSpirits[id];
    if (!spirit) continue;

    for (const [key, value] of Object.entries(spirit.modifiers)) {
      if (typeof value === 'number') {
        combined[key] = (combined[key] || 0) + value;
      }
    }
  }

  return combined;
}