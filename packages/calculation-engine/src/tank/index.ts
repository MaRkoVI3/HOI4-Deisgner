import type { EquipmentVariant, EquipmentStats, EquipmentCategory } from '@generalstaff/shared-types';

export interface TankDesign {
  id: string;
  name: string;
  countryTag: string;
  year: number;
  role: TankRole;
  chassis: ChassisType;
  gun: GunType;
  armorLayout: ArmorLayout;
  engine: EngineType;
  suspension: SuspensionType;
  stats: TankStats;
  cost: number;
  reliability: number;
  productionCost: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TankRole =
  | 'light_tank'
  | 'medium_tank'
  | 'heavy_tank'
  | 'tank_destroyer'
  | 'spg'
  | 'anti_air_tank'
  | 'modern_tank'
  | 'super_heavy_tank';

export type ChassisType =
  | 'light_tank_chassis'
  | 'medium_tank_chassis'
  | 'heavy_tank_chassis'
  | 'modern_tank_chassis'
  | 'super_heavy_tank_chassis';

export type GunType =
  | 'small_caliber_gun'
  | 'medium_caliber_gun'
  | 'large_caliber_gun'
  | 'super_heavy_gun'
  | 'smoothbore_gun'
  | 'auto_cannon'
  | 'rocket_launcher';

export interface ArmorLayout {
  front: number;
  side: number;
  rear: number;
  top: number;
}

export type EngineType =
  | 'petrol_engine'
  | 'diesel_engine'
  | 'gas_turbine'
  | 'multifuel_engine';

export type SuspensionType =
  | 'leaf_spring'
  | 'torsion_bar'
  | 'hydro_pneumatic'
  | 'active_suspension';

export interface TankStats {
  hp: number;
  armor: number;
  piercing: number;
  softAttack: number;
  hardAttack: number;
  airAttack: number;
  defense: number;
  breakthrough: number;
  speed: number;
  reliability: number;
  weight: number;
  fuelConsumption: number;
  productionCost: number;
  crew: number;
  ammoCapacity: number;
  fireRate: number;
  gunDepression: number;
  gunElevation: number;
  traverseSpeed: number;
  optics: number;
  stabilization: StabilizationLevel;
  cost?: number;
  depression?: number;
  elevation?: number;
  complexity?: number;
  horsepower?: number;
}

export type StabilizationLevel = 'none' | 'basic' | 'advanced' | 'fully_stabilized';

export function calculateTankStats(design: Partial<TankDesign>): TankStats {
  const baseStats: TankStats = {
    hp: 0,
    armor: 0,
    piercing: 0,
    softAttack: 0,
    hardAttack: 0,
    airAttack: 0,
    defense: 0,
    breakthrough: 0,
    speed: 0,
    reliability: 0,
    weight: 0,
    fuelConsumption: 0,
    productionCost: 0,
    crew: 0,
    ammoCapacity: 0,
    fireRate: 0,
    gunDepression: 0,
    gunElevation: 0,
    traverseSpeed: 0,
    optics: 0,
    stabilization: 'none',
  };

  if (!design.chassis || !design.gun || !design.engine) {
    return baseStats;
  }

  const chassisStats = CHASSIS_STATS[design.chassis] || {};
  const gunStats = GUN_STATS[design.gun] || {};
  const engineStats = ENGINE_STATS[design.engine] || {};
  const suspensionStats = SUSPENSION_STATS[design.suspension || 'torsion_bar'] || {};

  const weight = (chassisStats.weight || 0) + (gunStats.weight || 0) + (engineStats.weight || 0);
  const powerToWeight = (engineStats.horsepower || 0) / Math.max(weight, 1);

  return {
    hp: (chassisStats.hp || 0) + (gunStats.hp || 0),
    armor: Math.max(
      design.armorLayout?.front || 0,
      design.armorLayout?.side || 0,
      design.armorLayout?.rear || 0
    ),
    piercing: gunStats.piercing || 0,
    softAttack: (gunStats.softAttack || 0) * (gunStats.fireRate || 1),
    hardAttack: (gunStats.hardAttack || 0) * (gunStats.fireRate || 1),
    airAttack: gunStats.airAttack || 0,
    defense: chassisStats.defense || 0,
    breakthrough: (chassisStats.breakthrough || 0) + (gunStats.breakthrough || 0),
    speed: Math.min(80, (powerToWeight * 30) + (suspensionStats.speedBonus || 0)),
    reliability: Math.max(10, 100 - (chassisStats.complexity || 0) - (gunStats.complexity || 0) - (engineStats.complexity || 0)),
    weight,
    fuelConsumption: (engineStats.fuelConsumption || 0) * (weight / 20),
    productionCost: (chassisStats.cost || 0) + (gunStats.cost || 0) + (engineStats.cost || 0) + (suspensionStats.cost || 0),
    crew: chassisStats.crew || 3,
    ammoCapacity: gunStats.ammoCapacity || 0,
    fireRate: gunStats.fireRate || 0,
    gunDepression: gunStats.depression || 0,
    gunElevation: gunStats.elevation || 0,
    traverseSpeed: (gunStats.traverseSpeed || 0) + (suspensionStats.traverseBonus || 0),
    optics: gunStats.optics || 0,
    stabilization: gunStats.stabilization || 'none',
  };
}

const CHASSIS_STATS_INTERNAL: Record<ChassisType, Partial<TankStats> & { complexity: number; horsepower: number }> = {
  light_tank_chassis: {
    hp: 80,
    defense: 10,
    breakthrough: 5,
    weight: 10,
    cost: 100,
    complexity: 10,
    horsepower: 300,
    crew: 3,
  },
  medium_tank_chassis: {
    hp: 100,
    defense: 20,
    breakthrough: 15,
    weight: 25,
    cost: 250,
    complexity: 20,
    horsepower: 600,
    crew: 4,
  },
  heavy_tank_chassis: {
    hp: 150,
    defense: 30,
    breakthrough: 25,
    weight: 45,
    cost: 500,
    complexity: 35,
    horsepower: 800,
    crew: 5,
  },
  modern_tank_chassis: {
    hp: 120,
    defense: 40,
    breakthrough: 35,
    weight: 35,
    cost: 800,
    complexity: 40,
    horsepower: 1200,
    crew: 3,
  },
  super_heavy_tank_chassis: {
    hp: 200,
    defense: 50,
    breakthrough: 40,
    weight: 80,
    cost: 1500,
    complexity: 50,
    horsepower: 1500,
    crew: 6,
  },
};

const GUN_STATS_INTERNAL: Record<GunType, Partial<TankStats> & { complexity: number }> = {
  small_caliber_gun: {
    piercing: 30,
    softAttack: 8,
    hardAttack: 12,
    airAttack: 5,
    breakthrough: 2,
    weight: 1,
    cost: 50,
    complexity: 5,
    ammoCapacity: 200,
    fireRate: 15,
    depression: 10,
    elevation: 20,
    traverseSpeed: 30,
    optics: 5,
    stabilization: 'none',
  },
  medium_caliber_gun: {
    piercing: 60,
    softAttack: 12,
    hardAttack: 25,
    airAttack: 2,
    breakthrough: 8,
    weight: 2,
    cost: 120,
    complexity: 15,
    ammoCapacity: 80,
    fireRate: 10,
    depression: 8,
    elevation: 20,
    traverseSpeed: 20,
    optics: 8,
    stabilization: 'basic',
  },
  large_caliber_gun: {
    piercing: 100,
    softAttack: 15,
    hardAttack: 45,
    airAttack: 1,
    breakthrough: 15,
    weight: 3,
    cost: 250,
    complexity: 25,
    ammoCapacity: 50,
    fireRate: 6,
    depression: 7,
    elevation: 20,
    traverseSpeed: 15,
    optics: 10,
    stabilization: 'basic',
  },
  super_heavy_gun: {
    piercing: 180,
    softAttack: 20,
    hardAttack: 80,
    airAttack: 0,
    breakthrough: 30,
    weight: 5,
    cost: 500,
    complexity: 35,
    ammoCapacity: 30,
    fireRate: 3,
    depression: 5,
    elevation: 15,
    traverseSpeed: 8,
    optics: 12,
    stabilization: 'advanced',
  },
  smoothbore_gun: {
    piercing: 200,
    softAttack: 18,
    hardAttack: 70,
    airAttack: 3,
    breakthrough: 25,
    weight: 3,
    cost: 800,
    complexity: 30,
    ammoCapacity: 40,
    fireRate: 8,
    depression: 8,
    elevation: 20,
    traverseSpeed: 25,
    optics: 20,
    stabilization: 'fully_stabilized',
  },
  auto_cannon: {
    piercing: 40,
    softAttack: 25,
    hardAttack: 15,
    airAttack: 20,
    breakthrough: 3,
    weight: 1,
    cost: 80,
    complexity: 10,
    ammoCapacity: 500,
    fireRate: 60,
    depression: 10,
    elevation: 60,
    traverseSpeed: 60,
    optics: 8,
    stabilization: 'basic',
  },
  rocket_launcher: {
    piercing: 120,
    softAttack: 40,
    hardAttack: 50,
    airAttack: 0,
    breakthrough: 20,
    weight: 2,
    cost: 300,
    complexity: 20,
    ammoCapacity: 20,
    fireRate: 2,
    depression: 0,
    elevation: 45,
    traverseSpeed: 5,
    optics: 5,
    stabilization: 'none',
  },
};

const ENGINE_STATS_INTERNAL: Record<EngineType, { horsepower: number; weight: number; cost: number; fuelConsumption: number; complexity: number }> = {
  petrol_engine: {
    horsepower: 500,
    weight: 2,
    cost: 50,
    fuelConsumption: 1.2,
    complexity: 5,
  },
  diesel_engine: {
    horsepower: 600,
    weight: 2.5,
    cost: 80,
    fuelConsumption: 0.8,
    complexity: 10,
  },
  gas_turbine: {
    horsepower: 1200,
    weight: 1.5,
    cost: 300,
    fuelConsumption: 2.0,
    complexity: 25,
  },
  multifuel_engine: {
    horsepower: 800,
    weight: 2,
    cost: 150,
    fuelConsumption: 1.0,
    complexity: 15,
  },
};

const SUSPENSION_STATS_INTERNAL: Record<SuspensionType, { speedBonus: number; traverseBonus: number; cost: number }> = {
  leaf_spring: {
    speedBonus: 0,
    traverseBonus: 0,
    cost: 20,
  },
  torsion_bar: {
    speedBonus: 5,
    traverseBonus: 5,
    cost: 50,
  },
  hydro_pneumatic: {
    speedBonus: 10,
    traverseBonus: 10,
    cost: 150,
  },
  active_suspension: {
    speedBonus: 15,
    traverseBonus: 20,
    cost: 400,
  },
};

export function createTankVariant(
  design: TankDesign,
  variantName: string,
  modifications: Partial<TankDesign>
): TankDesign {
  return {
    ...design,
    id: `${design.id}_${variantName}`,
    name: `${design.name} ${variantName}`,
    ...modifications,
    stats: calculateTankStats({ ...design, ...modifications }),
  };
}

export const CHASSIS_STATS: Record<ChassisType, Partial<TankStats> & { complexity: number; horsepower: number }> = CHASSIS_STATS_INTERNAL;
export const GUN_STATS: Record<GunType, Partial<TankStats> & { complexity: number }> = GUN_STATS_INTERNAL;
export const ENGINE_STATS: Record<EngineType, { horsepower: number; weight: number; cost: number; fuelConsumption: number; complexity: number }> = ENGINE_STATS_INTERNAL;
export const SUSPENSION_STATS: Record<SuspensionType, { speedBonus: number; traverseBonus: number; cost: number }> = SUSPENSION_STATS_INTERNAL;

export const TANK_ROLES: Record<TankRole, { description: string; defaultChassis: ChassisType }> = {
  light_tank: {
    description: 'Fast reconnaissance and exploitation tank',
    defaultChassis: 'light_tank_chassis',
  },
  medium_tank: {
    description: 'Main battle tank, balanced performance',
    defaultChassis: 'medium_tank_chassis',
  },
  heavy_tank: {
    description: 'Breakthrough tank with heavy armor',
    defaultChassis: 'heavy_tank_chassis',
  },
  tank_destroyer: {
    description: 'Specialized anti-tank vehicle',
    defaultChassis: 'medium_tank_chassis',
  },
  spg: {
    description: 'Self-propelled gun for indirect fire support',
    defaultChassis: 'medium_tank_chassis',
  },
  anti_air_tank: {
    description: 'Anti-aircraft tank',
    defaultChassis: 'light_tank_chassis',
  },
  modern_tank: {
    description: 'Modern main battle tank with advanced systems',
    defaultChassis: 'modern_tank_chassis',
  },
  super_heavy_tank: {
    description: 'Experimental super heavy breakthrough tank',
    defaultChassis: 'super_heavy_tank_chassis',
  },
};