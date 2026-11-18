import type { EquipmentVariant, EquipmentStats } from '@generalstaff/shared-types';

export interface ShipDesign {
  id: string;
  name: string;
  countryTag: string;
  year: number;
  type: ShipType;
  hull: HullType;
  modules: ShipModule[];
  stats: ShipStats;
  cost: number;
  buildTime: number;
  reliability: number;
}

export type ShipType =
  | 'destroyer'
  | 'light_cruiser'
  | 'heavy_cruiser'
  | 'battlecruiser'
  | 'battleship'
  | 'super_battleship'
  | 'carrier'
  | 'light_carrier'
  | 'escort_carrier'
  | 'submarine'
  | 'nuclear_submarine'
  | 'frigate'
  | 'corvette'
  | 'amphibious_assault'
  | 'minelayer'
  | 'minesweeper';

export type HullType =
  | 'destroyer_hull'
  | 'cruiser_hull'
  | 'battlecruiser_hull'
  | 'battleship_hull'
  | 'super_battleship_hull'
  | 'carrier_hull'
  | 'submarine_hull'
  | 'nuclear_submarine_hull'
  | 'frigate_hull'
  | 'corvette_hull';

export interface ShipModule {
  id: string;
  type: ModuleType;
  slot: ModuleSlot;
  stats: ModuleStats;
}

export type ModuleType =
  | 'main_battery'
  | 'secondary_battery'
  | 'anti_air_battery'
  | 'torpedo_tubes'
  | 'depth_charges'
  | 'fire_control'
  | 'radar'
  | 'sonar'
  | 'armor_belt'
  | 'deck_armor'
  | 'torpedo_protection'
  | 'engine'
  | 'damage_control'
  | 'air_wing'
  | 'catapult'
  | 'arrestor_gear'
  | 'minelaying'
  | 'minesweeping';

export type ModuleSlot =
  | 'main_battery'
  | 'secondary_battery'
  | 'anti_air'
  | 'torpedo'
  | 'fire_control'
  | 'sensors'
  | 'armor'
  | 'protection'
  | 'propulsion'
  | 'damage_control'
  | 'aviation'
  | 'special';

export interface ModuleStats {
  // Combat
  attack: number;
  defense: number;
  range: number;
  accuracy: number;
  piercing: number;
  // Anti-air
  aaAttack: number;
  // Anti-sub
  aswAttack: number;
  subDetection: number;
  // Speed
  speed: number;
  // Armor/Protection
  armor: number;
  torpedoProtection: number;
  // Air
  airWingSize: number;
  airAttack: number;
  airDefense: number;
  airAgility: number;
  airRange: number;
  airNavalAttack: number;
  // Misc
  reliability: number;
  cost: number;
  weight: number;
}

export interface ShipStats {
  // Combat
  navalAttack: number;
  navalDefense: number;
  shoreBombardment: number;
  torpedoAttack: number;
  subAttack: number;
  // Anti-air
  antiAirAttack: number;
  // Anti-sub
  antiSubAttack: number;
  subDetection: number;
  // Speed/Range
  speed: number;
  range: number;
  // Armor/Protection
  armor: number;
  deckArmor: number;
  torpedoProtection: number;
  hp: number;
  // Air
  airWingSize: number;
  airAttack: number;
  airDefense: number;
  airAgility: number;
  airRange: number;
  airNavalAttack: number;
  // Misc
  reliability: number;
  cost: number;
  buildTime: number;
  weight: number;
  crew: number;
  fuelConsumption: number;
  supplyConsumption: number;
  // Visibility
  surfaceVisibility: number;
  subVisibility: number;
  // Organization
  organization: number;
  maxOrganization: number;
  recoveryRate: number;
}

export function calculateShipStats(design: ShipDesign): ShipStats {
  const hullStats = HULL_STATS[design.hull] || {};

  const moduleStats = design.modules.reduce(
    (acc, module) => {
      const stats = module.stats;
      acc.navalAttack += stats.attack || 0;
      acc.navalDefense += stats.defense || 0;
      acc.shoreBombardment += stats.attack * 0.5 || 0;
      acc.torpedoAttack += stats.attack * (module.type === 'torpedo_tubes' ? 1 : 0) || 0;
      acc.subAttack += stats.aswAttack || 0;
      acc.antiAirAttack += stats.aaAttack || 0;
      acc.antiSubAttack += stats.aswAttack || 0;
      acc.subDetection += stats.subDetection || 0;
      acc.speed += stats.speed || 0;
      acc.range += stats.range || 0;
      acc.armor += stats.armor || 0;
      acc.torpedoProtection += stats.torpedoProtection || 0;
      acc.airWingSize += stats.airWingSize || 0;
      acc.airAttack += stats.airAttack || 0;
      acc.airDefense += stats.airDefense || 0;
      acc.airAgility += stats.airAgility || 0;
      acc.airRange += stats.airRange || 0;
      acc.airNavalAttack += stats.airNavalAttack || 0;
      acc.reliability = Math.min(acc.reliability, stats.reliability || 100);
      acc.cost += stats.cost || 0;
      acc.weight += stats.weight || 0;
      return acc;
    },
    { ...hullStats, navalAttack: 0, navalDefense: 0, shoreBombardment: 0, torpedoAttack: 0, subAttack: 0, antiAirAttack: 0, antiSubAttack: 0, subDetection: 0, speed: 0, range: 0, armor: 0, deckArmor: 0, torpedoProtection: 0, hp: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 100, cost: 0, buildTime: 0, weight: 0, crew: 0, fuelConsumption: 0, supplyConsumption: 0, surfaceVisibility: 0, subVisibility: 0, organization: 0, maxOrganization: 0, recoveryRate: 0 }
  );

  // Apply hull multipliers
  const hullMultiplier = hullStats.multiplier || 1;
  moduleStats.navalAttack *= hullMultiplier;
  moduleStats.navalDefense *= hullMultiplier;
  moduleStats.torpedoAttack *= hullMultiplier;
  moduleStats.antiAirAttack *= hullMultiplier;

  // Calculate derived stats
  moduleStats.hp = (hullStats.baseHp || 0) + design.modules.reduce((sum, m) => sum + (m.stats.weight || 0) * 10, 0);
  moduleStats.armor += hullStats.baseArmor || 0;
  moduleStats.deckArmor = hullStats.baseDeckArmor || 0;
  moduleStats.torpedoProtection += hullStats.baseTorpedoProtection || 0;
  moduleStats.speed = Math.max(0, moduleStats.speed + (hullStats.baseSpeed || 0));
  moduleStats.range = Math.max(0, moduleStats.range + (hullStats.baseRange || 0));
  moduleStats.organization = hullStats.baseOrg || 30;
  moduleStats.maxOrganization = moduleStats.organization;
  moduleStats.recoveryRate = 0.2 + (hullStats.recoveryBonus || 0);
  moduleStats.crew = hullStats.baseCrew || 0;
  moduleStats.fuelConsumption = (moduleStats.weight / 1000) * (hullStats.fuelMultiplier || 1);
  moduleStats.supplyConsumption = moduleStats.crew / 1000;
  moduleStats.surfaceVisibility = hullStats.baseVisibility || 0;
  moduleStats.subVisibility = design.type === 'submarine' || design.type === 'nuclear_submarine' ? 10 : hullStats.baseVisibility || 0;

  return moduleStats as ShipStats;
}

export const HULL_STATS: Record<HullType, Partial<ShipStats> & { multiplier: number; baseHp: number; baseArmor: number; baseDeckArmor: number; baseTorpedoProtection: number; baseSpeed: number; baseRange: number; baseOrg: number; recoveryBonus: number; baseCrew: number; fuelMultiplier: number; baseVisibility: number }> = {
  destroyer_hull: {
    multiplier: 1.0,
    baseHp: 100,
    baseArmor: 0,
    baseDeckArmor: 0,
    baseTorpedoProtection: 10,
    baseSpeed: 35,
    baseRange: 4000,
    baseOrg: 30,
    recoveryBonus: 0.1,
    baseCrew: 200,
    fuelMultiplier: 1.0,
    baseVisibility: 15,
  },
  cruiser_hull: {
    multiplier: 1.5,
    baseHp: 300,
    baseArmor: 30,
    baseDeckArmor: 15,
    baseTorpedoProtection: 20,
    baseSpeed: 32,
    baseRange: 8000,
    baseOrg: 35,
    recoveryBonus: 0.05,
    baseCrew: 800,
    fuelMultiplier: 1.5,
    baseVisibility: 25,
  },
  battlecruiser_hull: {
    multiplier: 2.0,
    baseHp: 500,
    baseArmor: 80,
    baseDeckArmor: 40,
    baseTorpedoProtection: 30,
    baseSpeed: 30,
    baseRange: 10000,
    baseOrg: 40,
    recoveryBonus: 0,
    baseCrew: 1200,
    fuelMultiplier: 2.0,
    baseVisibility: 35,
  },
  battleship_hull: {
    multiplier: 2.5,
    baseHp: 800,
    baseArmor: 150,
    baseDeckArmor: 80,
    baseTorpedoProtection: 50,
    baseSpeed: 27,
    baseRange: 12000,
    baseOrg: 45,
    recoveryBonus: -0.05,
    baseCrew: 2000,
    fuelMultiplier: 3.0,
    baseVisibility: 45,
  },
  super_battleship_hull: {
    multiplier: 3.0,
    baseHp: 1200,
    baseArmor: 250,
    baseDeckArmor: 120,
    baseTorpedoProtection: 70,
    baseSpeed: 25,
    baseRange: 15000,
    baseOrg: 50,
    recoveryBonus: -0.1,
    baseCrew: 3000,
    fuelMultiplier: 4.0,
    baseVisibility: 55,
  },
  carrier_hull: {
    multiplier: 1.0,
    baseHp: 600,
    baseArmor: 20,
    baseDeckArmor: 30,
    baseTorpedoProtection: 40,
    baseSpeed: 30,
    baseRange: 10000,
    baseOrg: 35,
    recoveryBonus: 0,
    baseCrew: 2500,
    fuelMultiplier: 2.5,
    baseVisibility: 40,
  },
  submarine_hull: {
    multiplier: 1.0,
    baseHp: 150,
    baseArmor: 0,
    baseDeckArmor: 0,
    baseTorpedoProtection: 0,
    baseSpeed: 20,
    baseRange: 8000,
    baseOrg: 30,
    recoveryBonus: 0.2,
    baseCrew: 80,
    fuelMultiplier: 0.5,
    baseVisibility: 5,
  },
  nuclear_submarine_hull: {
    multiplier: 1.5,
    baseHp: 200,
    baseArmor: 0,
    baseDeckArmor: 0,
    baseTorpedoProtection: 0,
    baseSpeed: 30,
    baseRange: 99999,
    baseOrg: 40,
    recoveryBonus: 0.3,
    baseCrew: 120,
    fuelMultiplier: 0.1,
    baseVisibility: 3,
  },
  frigate_hull: {
    multiplier: 0.8,
    baseHp: 80,
    baseArmor: 0,
    baseDeckArmor: 0,
    baseTorpedoProtection: 5,
    baseSpeed: 28,
    baseRange: 5000,
    baseOrg: 30,
    recoveryBonus: 0.15,
    baseCrew: 150,
    fuelMultiplier: 0.8,
    baseVisibility: 12,
  },
  corvette_hull: {
    multiplier: 0.6,
    baseHp: 50,
    baseArmor: 0,
    baseDeckArmor: 0,
    baseTorpedoProtection: 0,
    baseSpeed: 30,
    baseRange: 3000,
    baseOrg: 25,
    recoveryBonus: 0.2,
    baseCrew: 80,
    fuelMultiplier: 0.6,
    baseVisibility: 10,
  },
};

export const SHIP_TYPES: Record<ShipType, { description: string; defaultHull: HullType; allowedModules: ModuleSlot[] }> = {
  destroyer: {
    description: 'Fast escort and patrol ship',
    defaultHull: 'destroyer_hull',
    allowedModules: ['main_battery', 'anti_air', 'torpedo', 'fire_control', 'sensors', 'armor', 'propulsion', 'damage_control'],
  },
  light_cruiser: {
    description: 'Light cruiser for screening and trade protection',
    defaultHull: 'cruiser_hull',
    allowedModules: ['main_battery', 'secondary_battery', 'anti_air', 'torpedo', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control'],
  },
  heavy_cruiser: {
    description: 'Heavy cruiser with larger guns',
    defaultHull: 'cruiser_hull',
    allowedModules: ['main_battery', 'secondary_battery', 'anti_air', 'torpedo', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control'],
  },
  battlecruiser: {
    description: 'Fast capital ship with battleship guns',
    defaultHull: 'battlecruiser_hull',
    allowedModules: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control'],
  },
  battleship: {
    description: 'Main line of battle ship',
    defaultHull: 'battleship_hull',
    allowedModules: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control'],
  },
  super_battleship: {
    description: 'Ultimate capital ship',
    defaultHull: 'super_battleship_hull',
    allowedModules: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control'],
  },
  carrier: {
    description: 'Fleet aircraft carrier',
    defaultHull: 'carrier_hull',
    allowedModules: ['anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  },
  light_carrier: {
    description: 'Light aircraft carrier',
    defaultHull: 'carrier_hull',
    allowedModules: ['anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  },
  escort_carrier: {
    description: 'Small escort carrier',
    defaultHull: 'carrier_hull',
    allowedModules: ['anti_air', 'sensors', 'protection', 'propulsion', 'damage_control', 'aviation'],
  },
  submarine: {
    description: 'Diesel-electric attack submarine',
    defaultHull: 'submarine_hull',
    allowedModules: ['torpedo', 'sensors', 'protection', 'propulsion', 'damage_control', 'special'],
  },
  nuclear_submarine: {
    description: 'Nuclear-powered attack/ballistic submarine',
    defaultHull: 'nuclear_submarine_hull',
    allowedModules: ['torpedo', 'sensors', 'protection', 'propulsion', 'damage_control', 'special'],
  },
  frigate: {
    description: 'Modern escort frigate',
    defaultHull: 'frigate_hull',
    allowedModules: ['main_battery', 'anti_air', 'torpedo', 'fire_control', 'sensors', 'protection', 'propulsion', 'damage_control'],
  },
  corvette: {
    description: 'Small patrol corvette',
    defaultHull: 'corvette_hull',
    allowedModules: ['main_battery', 'anti_air', 'sensors', 'protection', 'propulsion', 'damage_control'],
  },
  amphibious_assault: {
    description: 'Amphibious assault ship',
    defaultHull: 'carrier_hull',
    allowedModules: ['anti_air', 'sensors', 'protection', 'propulsion', 'damage_control', 'aviation', 'special'],
  },
  minelayer: {
    description: 'Minelaying vessel',
    defaultHull: 'cruiser_hull',
    allowedModules: ['anti_air', 'sensors', 'protection', 'propulsion', 'damage_control', 'special'],
  },
  minesweeper: {
    description: 'Minesweeping vessel',
    defaultHull: 'frigate_hull',
    allowedModules: ['anti_air', 'sensors', 'protection', 'propulsion', 'damage_control', 'special'],
  },
};

export function createShipVariant(
  design: ShipDesign,
  variantName: string,
  modifications: Partial<ShipDesign>
): ShipDesign {
  return {
    ...design,
    id: `${design.id}_${variantName}`,
    name: `${design.name} ${variantName}`,
    ...modifications,
    stats: calculateShipStats({ ...design, ...modifications }),
  };
}