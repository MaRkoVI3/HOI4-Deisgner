import type { EquipmentVariant, EquipmentStats } from '@generalstaff/shared-types';

export interface AircraftDesign {
  id: string;
  name: string;
  countryTag: string;
  year: number;
  type: AircraftType;
  role: AircraftRole;
  airframe: AirframeType;
  engine: EngineType;
  modules: AircraftModule[];
  stats: AircraftStats;
  cost: number;
  buildTime: number;
  reliability: number;
}

export type AircraftType =
  | 'fighter'
  | 'heavy_fighter'
  | 'jet_fighter'
  | 'interceptor'
  | 'cas'
  | 'naval_bomber'
  | 'tactical_bomber'
  | 'strategic_bomber'
  | 'transport'
  | 'recon'
  | 'flying_boat'
  | 'helicopter'
  | 'vtol'
  | 'uav';

export type AircraftRole =
  | 'air_superiority'
  | 'interception'
  | 'ground_attack'
  | 'naval_strike'
  | 'strategic_bombing'
  | 'tactical_bombing'
  | 'reconnaissance'
  | 'transport'
  | 'anti_sub'
  | 'aew'
  | 'tanker'
  | 'trainer';

export type AirframeType =
  | 'biplane'
  | 'monoplane'
  | 'jet_airframe'
  | 'stealth_airframe'
  | 'heavy_airframe'
  | 'transport_airframe'
  | 'rotary_wing'
  | 'vtol_airframe'
  | 'uav_airframe';

export type EngineType =
  | 'piston_engine'
  | 'radial_engine'
  | 'inline_engine'
  | 'turbojet'
  | 'turbofan'
  | 'turboprop'
  | 'turboshaft'
  | 'ramjet'
  | 'scramjet';

export interface AircraftModule {
  id: string;
  type: ModuleType;
  slot: ModuleSlot;
  stats: ModuleStats;
}

export type ModuleType =
  | 'gun'
  | 'cannon'
  | 'missile_air_air'
  | 'missile_air_ground'
  | 'missile_anti_ship'
  | 'missile_anti_radiation'
  | 'bomb'
  | 'torpedo'
  | 'depth_charge'
  | 'rocket'
  | 'radar'
  | 'irst'
  | 'ew_suite'
  | 'targeting_pod'
  | 'recon_pod'
  | 'fuel_tank'
  | 'armor'
  | 'chaff_flare'
  | 'thrust_vectoring'
  | 'stealth_coating'
  | 'data_link'
  | 'aerial_refueling';

export type ModuleSlot =
  | 'weapon'
  | 'sensor'
  | 'ew'
  | 'targeting'
  | 'recon'
  | 'fuel'
  | 'protection'
  | 'performance'
  | 'avionics';

export interface ModuleStats {
  // Air combat
  airAttack: number;
  airDefense: number;
  agility: number;
  speed: number;
  // Ground attack
  groundAttack: number;
  navalAttack: number;
  armorPenetration: number;
  // Range/Fuel
  range: number;
  fuelCapacity: number;
  // Sensors
  radarRange: number;
  radarCrossSection: number;
  irstRange: number;
  ewRating: number;
  // Targeting
  targetingAccuracy: number;
  nightCapability: number;
  // Recon
  reconRange: number;
  reconQuality: number;
  // Anti-sub
  subDetection: number;
  aswAttack: number;
  // Misc
  reliability: number;
  cost: number;
  weight: number;
}

export interface AircraftStats {
  // Air combat
  airAttack: number;
  airDefense: number;
  agility: number;
  speed: number;
  maxSpeed: number;
  climbRate: number;
  ceiling: number;
  turnRate: number;
  // Ground/Naval attack
  groundAttack: number;
  navalAttack: number;
  armorPenetration: number;
  strategicAttack: number;
  // Range/Fuel
  range: number;
  combatRange: number;
  ferryRange: number;
  fuelCapacity: number;
  // Sensors
  radarRange: number;
  radarCrossSection: number;
  irstRange: number;
  ewRating: number;
  detectionRange: number;
  // Targeting
  targetingAccuracy: number;
  nightCapability: number;
  // Recon
  reconRange: number;
  reconQuality: number;
  // Anti-sub
  subDetection: number;
  aswAttack: number;
  // Misc
  reliability: number;
  cost: number;
  buildTime: number;
  weight: number;
  emptyWeight: number;
  maxTakeoffWeight: number;
  crew: number;
  // Carrier ops
  carrierCapable: boolean;
  catapultRequired: boolean;
  arrestorHook: boolean;
  // VTOL
  vtolCapable: boolean;
  // Stealth
  stealthLevel: StealthLevel;
  // Organization
  organization: number;
  maxOrganization: number;
  recoveryRate: number;
}

export type StealthLevel = 'none' | 'low' | 'medium' | 'high' | 'very_high';

export function calculateAircraftStats(design: AircraftDesign): AircraftStats {
  const airframeStats = AIRFRAME_STATS[design.airframe] || {};
  const engineStats = ENGINE_STATS[design.engine] || {};

  const moduleStats = design.modules.reduce(
    (acc, module) => {
      const stats = module.stats;
      acc.airAttack += stats.airAttack || 0;
      acc.airDefense += stats.airDefense || 0;
      acc.agility += stats.agility || 0;
      acc.groundAttack += stats.groundAttack || 0;
      acc.navalAttack += stats.navalAttack || 0;
      acc.armorPenetration += stats.armorPenetration || 0;
      acc.range += stats.range || 0;
      acc.fuelCapacity += stats.fuelCapacity || 0;
      acc.radarRange += stats.radarRange || 0;
      acc.radarCrossSection = Math.min(acc.radarCrossSection, stats.radarCrossSection || 100);
      acc.irstRange += stats.irstRange || 0;
      acc.ewRating += stats.ewRating || 0;
      acc.targetingAccuracy += stats.targetingAccuracy || 0;
      acc.nightCapability += stats.nightCapability || 0;
      acc.reconRange += stats.reconRange || 0;
      acc.reconQuality += stats.reconQuality || 0;
      acc.subDetection += stats.subDetection || 0;
      acc.aswAttack += stats.aswAttack || 0;
      acc.reliability = Math.min(acc.reliability, stats.reliability || 100);
      acc.cost += stats.cost || 0;
      acc.weight += stats.weight || 0;
      return acc;
    },
    {
      airAttack: 0,
      airDefense: 0,
      agility: 0,
      groundAttack: 0,
      navalAttack: 0,
      armorPenetration: 0,
      range: 0,
      fuelCapacity: 0,
      radarRange: 0,
      radarCrossSection: 100,
      irstRange: 0,
      ewRating: 0,
      targetingAccuracy: 0,
      nightCapability: 0,
      reconRange: 0,
      reconQuality: 0,
      subDetection: 0,
      aswAttack: 0,
      reliability: 100,
      cost: 0,
      weight: 0,
    }
  );

  // Apply airframe multipliers
  const airframeMultiplier = airframeStats.multiplier || 1;
  moduleStats.airAttack *= airframeMultiplier;
  moduleStats.airDefense *= airframeMultiplier;
  moduleStats.agility *= airframeMultiplier;

  // Engine contribution
  const thrust = engineStats.thrust || 0;
  const weight = (airframeStats.baseWeight || 0) + moduleStats.weight;
  const thrustToWeight = thrust / Math.max(weight, 1);

  // Calculate derived stats
  const baseSpeed = airframeStats.baseSpeed || 0;
  const engineSpeedBonus = engineStats.speedBonus || 0;
  const maxSpeed = Math.round(baseSpeed + engineSpeedBonus + thrustToWeight * 200);

  return {
    // Air combat
    airAttack: Math.round(moduleStats.airAttack),
    airDefense: Math.round(moduleStats.airDefense),
    agility: Math.round(moduleStats.agility * 10) / 10,
    speed: Math.round(maxSpeed * 0.8), // Cruise speed
    maxSpeed,
    climbRate: Math.round(thrustToWeight * 300),
    ceiling: airframeStats.baseCeiling || 0 + (engineStats.ceilingBonus || 0),
    turnRate: Math.round(moduleStats.agility * 5),
    // Ground/Naval attack
    groundAttack: Math.round(moduleStats.groundAttack),
    navalAttack: Math.round(moduleStats.navalAttack),
    armorPenetration: Math.round(moduleStats.armorPenetration),
    strategicAttack: Math.round(moduleStats.groundAttack * 0.5),
    // Range/Fuel
    range: Math.round(moduleStats.range + airframeStats.baseRange),
    combatRange: Math.round((moduleStats.range + airframeStats.baseRange) * 0.6),
    ferryRange: Math.round((moduleStats.range + airframeStats.baseRange) * 1.5),
    fuelCapacity: Math.round(moduleStats.fuelCapacity + airframeStats.baseFuel),
    // Sensors
    radarRange: Math.round(moduleStats.radarRange),
    radarCrossSection: Math.round(moduleStats.radarCrossSection),
    irstRange: Math.round(moduleStats.irstRange),
    ewRating: Math.round(moduleStats.ewRating),
    detectionRange: Math.round(moduleStats.radarRange + moduleStats.irstRange),
    // Targeting
    targetingAccuracy: Math.round(moduleStats.targetingAccuracy * 10) / 10,
    nightCapability: Math.round(moduleStats.nightCapability),
    // Recon
    reconRange: Math.round(moduleStats.reconRange),
    reconQuality: Math.round(moduleStats.reconQuality),
    // Anti-sub
    subDetection: Math.round(moduleStats.subDetection),
    aswAttack: Math.round(moduleStats.aswAttack),
    // Misc
    reliability: Math.round(moduleStats.reliability),
    cost: Math.round(moduleStats.cost + airframeStats.baseCost + engineStats.cost),
    buildTime: Math.round((moduleStats.cost + airframeStats.baseCost + engineStats.cost) / 10),
    weight,
    emptyWeight: airframeStats.baseWeight || 0,
    maxTakeoffWeight: Math.round(weight * 1.5),
    crew: airframeStats.crew || 1,
    // Carrier ops
    carrierCapable: airframeStats.carrierCapable || false,
    catapultRequired: airframeStats.catapultRequired || false,
    arrestorHook: airframeStats.arrestorHook || false,
    // VTOL
    vtolCapable: airframeStats.vtolCapable || false,
    // Stealth
    stealthLevel: calculateStealthLevel(moduleStats.radarCrossSection, airframeStats.stealthBase || 'none'),
    // Organization
    organization: 30,
    maxOrganization: 30,
    recoveryRate: 0.3,
  };
}

function calculateStealthLevel(rcs: number, base: StealthLevel): StealthLevel {
  if (base === 'very_high' || (base === 'high' && rcs < 1)) return 'very_high';
  if (base === 'high' || (base === 'medium' && rcs < 5)) return 'high';
  if (base === 'medium' || (base === 'low' && rcs < 20)) return 'medium';
  if (base === 'low' || rcs < 50) return 'low';
  return 'none';
}

export const AIRFRAME_STATS: Record<AirframeType, {
  multiplier: number;
  baseSpeed: number;
  baseCeiling: number;
  baseRange: number;
  baseFuel: number;
  baseWeight: number;
  baseCost: number;
  crew: number;
  carrierCapable: boolean;
  catapultRequired: boolean;
  arrestorHook: boolean;
  vtolCapable: boolean;
  stealthBase: StealthLevel;
}> = {
  biplane: {
    multiplier: 0.5,
    baseSpeed: 300,
    baseCeiling: 6000,
    baseRange: 500,
    baseFuel: 500,
    baseWeight: 1000,
    baseCost: 50,
    crew: 1,
    carrierCapable: true,
    catapultRequired: false,
    arrestorHook: true,
    vtolCapable: false,
    stealthBase: 'none',
  },
  monoplane: {
    multiplier: 1.0,
    baseSpeed: 500,
    baseCeiling: 10000,
    baseRange: 1500,
    baseFuel: 1000,
    baseWeight: 3000,
    baseCost: 200,
    crew: 1,
    carrierCapable: true,
    catapultRequired: false,
    arrestorHook: true,
    vtolCapable: false,
    stealthBase: 'none',
  },
  jet_airframe: {
    multiplier: 1.5,
    baseSpeed: 900,
    baseCeiling: 15000,
    baseRange: 2000,
    baseFuel: 3000,
    baseWeight: 8000,
    baseCost: 1000,
    crew: 1,
    carrierCapable: true,
    catapultRequired: true,
    arrestorHook: true,
    vtolCapable: false,
    stealthBase: 'none',
  },
  stealth_airframe: {
    multiplier: 1.3,
    baseSpeed: 1000,
    baseCeiling: 18000,
    baseRange: 2500,
    baseFuel: 4000,
    baseWeight: 12000,
    baseCost: 5000,
    crew: 1,
    carrierCapable: true,
    catapultRequired: true,
    arrestorHook: true,
    vtolCapable: false,
    stealthBase: 'very_high',
  },
  heavy_airframe: {
    multiplier: 1.2,
    baseSpeed: 600,
    baseCeiling: 12000,
    baseRange: 5000,
    baseFuel: 10000,
    baseWeight: 30000,
    baseCost: 2000,
    crew: 5,
    carrierCapable: false,
    catapultRequired: false,
    arrestorHook: false,
    vtolCapable: false,
    stealthBase: 'none',
  },
  transport_airframe: {
    multiplier: 0.8,
    baseSpeed: 400,
    baseCeiling: 8000,
    baseRange: 4000,
    baseFuel: 8000,
    baseWeight: 20000,
    baseCost: 1500,
    crew: 4,
    carrierCapable: false,
    catapultRequired: false,
    arrestorHook: false,
    vtolCapable: false,
    stealthBase: 'none',
  },
  rotary_wing: {
    multiplier: 0.7,
    baseSpeed: 250,
    baseCeiling: 5000,
    baseRange: 500,
    baseFuel: 1000,
    baseWeight: 5000,
    baseCost: 800,
    crew: 2,
    carrierCapable: true,
    catapultRequired: false,
    arrestorHook: false,
    vtolCapable: true,
    stealthBase: 'none',
  },
  vtol_airframe: {
    multiplier: 1.0,
    baseSpeed: 600,
    baseCeiling: 12000,
    baseRange: 1000,
    baseFuel: 2000,
    baseWeight: 8000,
    baseCost: 2000,
    crew: 1,
    carrierCapable: true,
    catapultRequired: false,
    arrestorHook: false,
    vtolCapable: true,
    stealthBase: 'low',
  },
  uav_airframe: {
    multiplier: 0.6,
    baseSpeed: 300,
    baseCeiling: 15000,
    baseRange: 3000,
    baseFuel: 2000,
    baseWeight: 1000,
    baseCost: 100,
    crew: 0,
    carrierCapable: false,
    catapultRequired: false,
    arrestorHook: false,
    vtolCapable: false,
    stealthBase: 'medium',
  },
};

export const ENGINE_STATS: Record<EngineType, {
  thrust: number;
  speedBonus: number;
  ceilingBonus: number;
  fuelConsumption: number;
  cost: number;
  reliability: number;
}> = {
  piston_engine: {
    thrust: 1500,
    speedBonus: 0,
    ceilingBonus: 0,
    fuelConsumption: 0.5,
    cost: 20,
    reliability: 90,
  },
  radial_engine: {
    thrust: 2000,
    speedBonus: 50,
    ceilingBonus: 1000,
    fuelConsumption: 0.6,
    cost: 30,
    reliability: 85,
  },
  inline_engine: {
    thrust: 1800,
    speedBonus: 80,
    ceilingBonus: 2000,
    fuelConsumption: 0.5,
    cost: 35,
    reliability: 80,
  },
  turbojet: {
    thrust: 5000,
    speedBonus: 400,
    ceilingBonus: 5000,
    fuelConsumption: 2.0,
    cost: 200,
    reliability: 70,
  },
  turbofan: {
    thrust: 10000,
    speedBonus: 300,
    ceilingBonus: 8000,
    fuelConsumption: 1.0,
    cost: 500,
    reliability: 85,
  },
  turboprop: {
    thrust: 4000,
    speedBonus: 100,
    ceilingBonus: 3000,
    fuelConsumption: 0.8,
    cost: 150,
    reliability: 90,
  },
  turboshaft: {
    thrust: 3000,
    speedBonus: 50,
    ceilingBonus: 2000,
    fuelConsumption: 0.7,
    cost: 200,
    reliability: 85,
  },
  ramjet: {
    thrust: 15000,
    speedBonus: 1000,
    ceilingBonus: 15000,
    fuelConsumption: 5.0,
    cost: 1000,
    reliability: 50,
  },
  scramjet: {
    thrust: 30000,
    speedBonus: 3000,
    ceilingBonus: 30000,
    fuelConsumption: 10.0,
    cost: 5000,
    reliability: 30,
  },
};

export const AIRCRAFT_TYPES: Record<AircraftType, { description: string; defaultAirframe: AirframeType; defaultRole: AircraftRole }> = {
  fighter: {
    description: 'Air superiority fighter',
    defaultAirframe: 'monoplane',
    defaultRole: 'air_superiority',
  },
  heavy_fighter: {
    description: 'Twin-engine heavy fighter',
    defaultAirframe: 'monoplane',
    defaultRole: 'interception',
  },
  jet_fighter: {
    description: 'Jet-powered fighter',
    defaultAirframe: 'jet_airframe',
    defaultRole: 'air_superiority',
  },
  interceptor: {
    description: 'High-speed interceptor',
    defaultAirframe: 'jet_airframe',
    defaultRole: 'interception',
  },
  cas: {
    description: 'Close air support aircraft',
    defaultAirframe: 'monoplane',
    defaultRole: 'ground_attack',
  },
  naval_bomber: {
    description: 'Naval strike bomber',
    defaultAirframe: 'monoplane',
    defaultRole: 'naval_strike',
  },
  tactical_bomber: {
    description: 'Tactical bomber',
    defaultAirframe: 'monoplane',
    defaultRole: 'tactical_bombing',
  },
  strategic_bomber: {
    description: 'Strategic heavy bomber',
    defaultAirframe: 'heavy_airframe',
    defaultRole: 'strategic_bombing',
  },
  transport: {
    description: 'Transport aircraft',
    defaultAirframe: 'transport_airframe',
    defaultRole: 'transport',
  },
  recon: {
    description: 'Reconnaissance aircraft',
    defaultAirframe: 'monoplane',
    defaultRole: 'reconnaissance',
  },
  flying_boat: {
    description: 'Maritime patrol flying boat',
    defaultAirframe: 'monoplane',
    defaultRole: 'reconnaissance',
  },
  helicopter: {
    description: 'Rotary-wing aircraft',
    defaultAirframe: 'rotary_wing',
    defaultRole: 'anti_sub',
  },
  vtol: {
    description: 'Vertical takeoff and landing aircraft',
    defaultAirframe: 'vtol_airframe',
    defaultRole: 'ground_attack',
  },
  uav: {
    description: 'Unmanned aerial vehicle',
    defaultAirframe: 'uav_airframe',
    defaultRole: 'reconnaissance',
  },
};

export function createAircraftVariant(
  design: AircraftDesign,
  variantName: string,
  modifications: Partial<AircraftDesign>
): AircraftDesign {
  return {
    ...design,
    id: `${design.id}_${variantName}`,
    name: `${design.name} ${variantName}`,
    ...modifications,
    stats: calculateAircraftStats({ ...design, ...modifications }),
  };
}