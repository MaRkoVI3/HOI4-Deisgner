import type { EquipmentVariant, EquipmentCategory, EquipmentStats } from '@generalstaff/shared-types';
import { EQUIPMENT_VARIANTS } from './data';

export interface EquipmentVariantData extends EquipmentVariant {
  variantId: string;
}

export function calculateEquipmentStats(
  equipment: EquipmentVariant[],
  variantIds: string[]
): EquipmentStats {
  let softAttack = 0;
  let hardAttack = 0;
  let airAttack = 0;
  let defense = 0;
  let breakthrough = 0;
  let armor = 0;
  let piercing = 0;
  let reliability = 0;
  let ap = 0;
  let recon = 0;
  let entrenchment = 0;
  let initiative = 0;
  let suppression = 0;
  let weight = 0;
  let fuelConsumption = 0;
  let organization = 0;
  let recoveryRate = 0;
  let supplyConsumption = 0;
  let hp = 0;
  let speed = 0;
  let maxSpeed = 0;
  let apAttack = 0;
  let productionCost = 0;
  let hardness = 0;

  for (const variantId of variantIds) {
    const variant = equipment.find(e => e.id === variantId);
    if (variant) {
      softAttack += variant.stats.softAttack || 0;
      hardAttack += variant.stats.hardAttack || 0;
      airAttack += variant.stats.airAttack || 0;
      defense += variant.stats.defense || 0;
      breakthrough += variant.stats.breakthrough || 0;
      armor += variant.stats.armor || 0;
      piercing += variant.stats.piercing || 0;
      reliability += variant.stats.reliability || 0;
      ap += variant.stats.ap || 0;
      recon += variant.stats.recon || 0;
      entrenchment += variant.stats.entrenchment || 0;
      initiative += variant.stats.initiative || 0;
      suppression += variant.stats.suppression || 0;
      weight += variant.stats.weight || 0;
      fuelConsumption += variant.stats.fuelConsumption || 0;
      organization += variant.stats.organization || 0;
      recoveryRate += variant.stats.recoveryRate || 0;
      supplyConsumption += variant.stats.supplyConsumption || 0;
      hp += variant.stats.hp || 0;
      speed += variant.stats.speed || 0;
      maxSpeed += variant.stats.maxSpeed || 0;
      apAttack += variant.stats.apAttack || 0;
      productionCost += variant.stats.productionCost || 0;
      hardness += variant.stats.hardness || 0;
    }
  }

  return {
    softAttack,
    hardAttack,
    airAttack,
    defense,
    breakthrough,
    armor,
    piercing,
    reliability,
    ap,
    recon,
    entrenchment,
    initiative,
    suppression,
    weight,
    fuelConsumption,
    organization,
    recoveryRate,
    supplyConsumption,
    hp,
    speed,
    maxSpeed,
    apAttack,
    productionCost,
    hardness,
  };
}

export function getEquipmentByCategory(
  category: EquipmentCategory,
  countryTag?: string
): EquipmentVariant[] {
  return EQUIPMENT_VARIANTS.filter(e => {
    if (e.category !== category) return false;
    if (countryTag && e.countryTag !== countryTag && e.countryTag !== 'GENERIC') return false;
    return true;
  });
}

export function getEquipmentById(id: string): EquipmentVariant | undefined {
  return EQUIPMENT_VARIANTS.find(e => e.id === id);
}

export function getEquipmentVariantsByCountry(countryTag: string): EquipmentVariant[] {
  return EQUIPMENT_VARIANTS.filter(e => e.countryTag === countryTag || e.countryTag === 'GENERIC');
}

export function calculateEquipmentCost(variantIds: string[]): number {
  let cost = 0;
  for (const id of variantIds) {
    const variant = EQUIPMENT_VARIANTS.find(e => e.id === id);
    if (variant) {
      cost += variant.cost;
    }
  }
  return cost;
}

export function calculateEquipmentProductionCost(variantIds: string[]): number {
  let cost = 0;
  for (const id of variantIds) {
    const variant = EQUIPMENT_VARIANTS.find(e => e.id === id);
    if (variant) {
      cost += variant.productionCost || variant.cost;
    }
  }
  return cost;
}