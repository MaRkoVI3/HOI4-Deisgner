import type { DivisionStats } from '@generalstaff/shared-types';

export function applyModifiers(stats: Partial<DivisionStats>, modifiers: Record<string, number>): Partial<DivisionStats> {
  const result = { ...stats };

  for (const [key, value] of Object.entries(modifiers)) {
    if (key in result) {
      const typedKey = key as keyof DivisionStats;
      const currentValue = result[typedKey];

      if (typeof currentValue === 'number') {
        if (value >= 1 || value <= -1) {
          (result as Record<string, number>)[key] = currentValue + value;
        } else {
          (result as Record<string, number>)[key] = currentValue * (1 + value);
        }
      }
    }
  }

  return result;
}

export function calculateStatWithModifiers(baseValue: number, modifiers: Record<string, number>, statKey: string): number {
  const modifier = modifiers[statKey];
  if (modifier === undefined) return baseValue;

  if (modifier >= 1 || modifier <= -1) {
    return baseValue + modifier;
  } else {
    return baseValue * (1 + modifier);
  }
}

export function combineModifiers(...modifierObjects: Record<string, number>[]): Record<string, number> {
  const combined: Record<string, number> = {};

  for (const modifiers of modifierObjects) {
    for (const [key, value] of Object.entries(modifiers)) {
      if (combined[key] !== undefined) {
        if (value >= 1 || value <= -1) {
          combined[key] += value;
        } else {
          combined[key] = (1 + combined[key]) * (1 + value) - 1;
        }
      } else {
        combined[key] = value;
      }
    }
  }

  return combined;
}

export function formatModifierValue(value: number, isPercentage: boolean): string {
  if (isPercentage) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  } else {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
  }
}