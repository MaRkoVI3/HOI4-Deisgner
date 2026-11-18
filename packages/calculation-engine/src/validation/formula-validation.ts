/**
 * Formula Validation Harness
 *
 * Validates calculation engine formulas against known HOI4 reference values
 * to ensure accuracy of division, tank, air, and navy calculations.
 */

import {
  calculateDivisionStats,
  CalculationContext,
  BATTALION_TEMPLATES,
  SUPPORT_COMPANY_TEMPLATES,
} from '../index';
import {
  calculateTankStats,
  TankDesign,
  TankStats,
} from '../tank';
import {
  calculateAircraftStats,
  AircraftDesign,
  AircraftStats,
} from '../air';
import {
  calculateShipStats,
  ShipDesign,
  ShipStats,
} from '../navy';
import type {
  DivisionTemplate,
  EquipmentVariant,
  CountryTag,
  DivisionStats,
  EquipmentStats,
  EquipmentCategory,
} from '@generalstaff/shared-types';

// ============================================================================
// Test Data - Known HOI4 Reference Values
// ============================================================================

const TEST_COUNTRIES: CountryTag[] = [
  { tag: 'GER', name: 'Germany', color: '#000000', flagUrl: '', modifiers: { armor: 0.1, hardAttack: 0.1 } },
  { tag: 'SOV', name: 'Soviet Union', color: '#CC0000', flagUrl: '', modifiers: { reliability: 0.1, softAttack: 0.05 } },
  { tag: 'USA', name: 'United States', color: '#002868', flagUrl: '', modifiers: { airAttack: 0.1, logistics: 0.1 } },
  { tag: 'ENG', name: 'United Kingdom', color: '#00247D', flagUrl: '', modifiers: { navalAttack: 0.1, range: 0.1 } },
  { tag: 'JPN', name: 'Japan', color: '#BC002D', flagUrl: '', modifiers: { navalAttack: 0.1, carrierCapable: 0.1 } },
];

// Build context with built-in templates
function buildTestContext(country?: CountryTag): CalculationContext {
  // Create test equipment variants without spreading EQUIPMENT_VARIANTS to avoid type issues
  const equipmentVariants: Record<string, EquipmentVariant> = {
    'infantry_equip_1': {
      id: 'infantry_equip_1',
      createdAt: '1936-01-01T00:00:00Z',
      updatedAt: '1936-01-01T00:00:00Z',
      name: 'Basic Infantry Equipment',
      category: 'infantry_equipment',
      countryTag: 'GENERIC',
      year: 1936,
      stats: { softAttack: 1, hardAttack: 0, defense: 2, hp: 1, weight: 0.5 } as EquipmentStats,
      cost: 1,
    },
    'artillery_equip_1': {
      id: 'artillery_equip_1',
      createdAt: '1936-01-01T00:00:00Z',
      updatedAt: '1936-01-01T00:00:00Z',
      name: 'Basic Artillery',
      category: 'artillery_equipment',
      countryTag: 'GENERIC',
      year: 1936,
      stats: { softAttack: 4, hardAttack: 1, defense: 1, hp: 1, weight: 2 } as EquipmentStats,
      cost: 3,
    },
    'light_tank_equip_1': {
      id: 'light_tank_equip_1',
      createdAt: '1936-01-01T00:00:00Z',
      updatedAt: '1936-01-01T00:00:00Z',
      name: 'Light Tank I',
      category: 'light_tank',
      countryTag: 'GENERIC',
      year: 1934,
      stats: { softAttack: 3, hardAttack: 4, defense: 3, armor: 15, piercing: 20, hp: 30, weight: 5 } as EquipmentStats,
      cost: 40,
    },
    'medium_tank_equip_1': {
      id: 'medium_tank_equip_1',
      createdAt: '1936-01-01T00:00:00Z',
      updatedAt: '1936-01-01T00:00:00Z',
      name: 'Medium Tank I',
      category: 'medium_tank',
      countryTag: 'GENERIC',
      year: 1936,
      stats: { softAttack: 4, hardAttack: 8, defense: 4, armor: 30, piercing: 40, hp: 60, weight: 12 } as EquipmentStats,
      cost: 80,
    },
    'support_equip_1': {
      id: 'support_equip_1',
      createdAt: '1936-01-01T00:00:00Z',
      updatedAt: '1936-01-01T00:00:00Z',
      name: 'Support Equipment',
      category: 'support_equipment',
      countryTag: 'GENERIC',
      year: 1936,
      stats: { hp: 1, weight: 0.5 } as EquipmentStats,
      cost: 1,
    },
    'anti_tank_equip_1': {
      id: 'anti_tank_equip_1',
      createdAt: '1936-01-01T00:00:00Z',
      updatedAt: '1936-01-01T00:00:00Z',
      name: 'Anti-Tank Gun',
      category: 'anti_tank_equipment',
      countryTag: 'GENERIC',
      year: 1936,
      stats: { hardAttack: 6, piercing: 30, weight: 1 } as EquipmentStats,
      cost: 2,
    },
  };

  return {
    battalionTemplates: BATTALION_TEMPLATES,
    supportCompanyTemplates: SUPPORT_COMPANY_TEMPLATES,
    equipmentVariants,
    doctrines: {},
    nationalSpirits: {},
    technologies: {},
    country,
  };
}

// Helper to safely extract numeric value from any type
function getNumericValue(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
  return null;
}

// ============================================================================
// Division Validation Tests
// ============================================================================

interface ValidationResult {
  name: string;
  passed: boolean;
  expected: Partial<DivisionStats>;
  actual: Partial<DivisionStats>;
  tolerance: number;
  details: string[];
}

function validateDivision(name: string, template: DivisionTemplate, context: CalculationContext, expected: Partial<DivisionStats>, tolerance = 0.2): ValidationResult {
  const actual = calculateDivisionStats(template, context);
  const details: string[] = [];
  let passed = true;

  // Use a type that allows any value to avoid TypeScript complaints about non-numeric fields
  const actualRecord = actual as unknown as Record<string, unknown>;

  for (const [key, expectedValue] of Object.entries(expected)) {
    // Skip non-numeric expected values (e.g., validationIssues array, isValid boolean)
    if (typeof expectedValue !== 'number') {
      continue;
    }
    const actualValue = getNumericValue(actualRecord[key]);
    if (actualValue === null) {
      details.push(`${key}: MISSING or non-numeric in actual`);
      passed = false;
      continue;
    }
    const diff = Math.abs(actualValue - expectedValue) / Math.max(Math.abs(expectedValue), 1);
    if (diff > tolerance) {
      details.push(`${key}: expected ~${expectedValue}, got ${actualValue.toFixed(2)} (diff: ${(diff * 100).toFixed(1)}%)`);
      passed = false;
    } else {
      details.push(`${key}: ${actualValue.toFixed(2)} ✓`);
    }
  }

  return { name, passed, expected, actual, tolerance, details };
}

export function runDivisionValidations(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Test 1: 20w Infantry Division (Standard 1936)
  const context = buildTestContext(TEST_COUNTRIES[0]); // Germany
  const infantry20w: DivisionTemplate = {
    id: 'test-infantry-20w',
    createdAt: '1936-01-01T00:00:00Z',
    updatedAt: '1936-01-01T00:00:00Z',
    name: '20w Infantry',
    description: 'Standard 20 width infantry division',
    country: TEST_COUNTRIES[0],
    battalions: [
      { id: 'bat-1', createdAt: '1936-01-01T00:00:00Z', updatedAt: '1936-01-01T00:00:00Z', templateId: 'infantry', count: 9, equipmentAssignments: { infantry_equipment: 'infantry_equip_1' } as Record<EquipmentCategory, string | undefined> },
      { id: 'bat-2', createdAt: '1936-01-01T00:00:00Z', updatedAt: '1936-01-01T00:00:00Z', templateId: 'artillery', count: 1, equipmentAssignments: { artillery_equipment: 'artillery_equip_1' } as Record<EquipmentCategory, string | undefined> },
    ],
    supportCompanies: [
      { id: 'sup-1', createdAt: '1936-01-01T00:00:00Z', updatedAt: '1936-01-01T00:00:00Z', templateId: 'engineer', equipmentVariantId: 'support_equip_1' },
      { id: 'sup-2', createdAt: '1936-01-01T00:00:00Z', updatedAt: '1936-01-01T00:00:00Z', templateId: 'signal', equipmentVariantId: 'support_equip_1' },
    ],
    doctrineSelections: [],
    nationalSpirits: [],
    technologies: [],
    version: 1,
    isPublic: false,
    ownerId: 'test',
    combatWidth: 20,
  };

  results.push(validateDivision('20w Infantry (1936 GER)', infantry20w, context, {
    combatWidth: 20,
    softAttack: 100,
    hardAttack: 10,
    defense: 120,
    breakthrough: 25,
    armor: 0,
    hardness: 0.1,
    organization: 35,
    supplyConsumption: 1.5,
    fuelConsumption: 0.2,
  }));

  // Test 2: 20w Infantry with AT (Anti-tank)
  const infantry20wAT: DivisionTemplate = {
    ...infantry20w,
    id: 'test-infantry-20w-at',
    name: '20w Infantry AT',
    supportCompanies: [
      { id: 'sup-1', createdAt: '1936-01-01T00:00:00Z', updatedAt: '1936-01-01T00:00:00Z', templateId: 'engineer', equipmentVariantId: 'support_equip_1' },
      { id: 'sup-2', createdAt: '1936-01-01T00:00:00Z', updatedAt: '1936-01-01T00:00:00Z', templateId: 'anti_tank', equipmentVariantId: 'anti_tank_equip_1' },
    ],
  };

  results.push(validateDivision('20w Infantry AT (1936 GER)', infantry20wAT, context, {
    combatWidth: 20,
    hardAttack: 20,
    piercing: 25,
  }));

  // Test 3: 40w Tank Division (1940)
  const heavyTank40w: DivisionTemplate = {
    id: 'test-heavy-tank-40w',
    createdAt: '1940-01-01T00:00:00Z',
    updatedAt: '1940-01-01T00:00:00Z',
    name: '40w Medium Tanks',
    description: '40 width medium tank division',
    country: TEST_COUNTRIES[0],
    battalions: [
      { id: 'bat-1', createdAt: '1940-01-01T00:00:00Z', updatedAt: '1940-01-01T00:00:00Z', templateId: 'medium_tank', count: 12, equipmentAssignments: { medium_tank: 'medium_tank_equip_1' } as Record<EquipmentCategory, string | undefined> },
      { id: 'bat-2', createdAt: '1940-01-01T00:00:00Z', updatedAt: '1940-01-01T00:00:00Z', templateId: 'motorized', count: 6, equipmentAssignments: { motorized_equipment: 'medium_tank_equip_1' } as Record<EquipmentCategory, string | undefined> },
    ],
    supportCompanies: [
      { id: 'sup-1', createdAt: '1940-01-01T00:00:00Z', updatedAt: '1940-01-01T00:00:00Z', templateId: 'engineer', equipmentVariantId: 'support_equip_1' },
      { id: 'sup-2', createdAt: '1940-01-01T00:00:00Z', updatedAt: '1940-01-01T00:00:00Z', templateId: 'signal', equipmentVariantId: 'support_equip_1' },
      { id: 'sup-3', createdAt: '1940-01-01T00:01:00Z', updatedAt: '1940-01-01T00:01:00Z', templateId: 'anti_tank', equipmentVariantId: 'anti_tank_equip_1' },
    ],
    doctrineSelections: [],
    nationalSpirits: [],
    technologies: [],
    version: 1,
    isPublic: false,
    ownerId: 'test',
    combatWidth: 40,
  };

  results.push(validateDivision('40w Medium Tanks (1940 GER)', heavyTank40w, context, {
    combatWidth: 40,
    softAttack: 80,
    hardAttack: 160,
    armor: 45,
    hardness: 0.7,
    piercing: 55,
    organization: 30,
  }, 0.3));

  return results;
}

// ============================================================================
// Tank Validation Tests
// ============================================================================

interface TankValidationResult {
  name: string;
  passed: boolean;
  expected: Partial<TankStats>;
  actual: Partial<TankStats>;
  tolerance: number;
  details: string[];
}

function validateTank(name: string, design: TankDesign, expected: Partial<TankStats>, tolerance = 0.25): TankValidationResult {
  const actual = calculateTankStats(design);
  const details: string[] = [];
  let passed = true;

  for (const [key, expectedValue] of Object.entries(expected)) {
    // Skip non-numeric expected values
    if (typeof expectedValue !== 'number') {
      continue;
    }
    const actualValue = getNumericValue((actual as unknown as Record<string, unknown>)[key]);
    if (actualValue === null) {
      details.push(`${key}: MISSING or non-numeric in actual`);
      passed = false;
      continue;
    }
    const diff = Math.abs(actualValue - expectedValue) / Math.max(Math.abs(expectedValue), 1);
    if (diff > tolerance) {
      details.push(`${key}: expected ~${expectedValue}, got ${actualValue} (diff: ${(diff * 100).toFixed(1)}%)`);
      passed = false;
    } else {
      details.push(`${key}: ${actualValue} ✓`);
    }
  }

  return { name, passed, expected, actual, tolerance, details };
}

export function runTankValidations(): TankValidationResult[] {
  const results: TankValidationResult[] = [];

  // Test 1: Panzer III (Medium Tank, 1940)
  const panzerIII: TankDesign = {
    id: 'panzer-iii',
    name: 'Panzer III',
    countryTag: 'GER',
    year: 1940,
    role: 'medium_tank',
    chassis: 'medium_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 50, side: 30, rear: 20, top: 15 },
    stats: {} as TankStats,
    cost: 0,
    reliability: 80,
    productionCost: 0,
  };

  results.push(validateTank('Panzer III (1940)', panzerIII, {
    hp: 180,
    armor: 50,
    piercing: 60,
    softAttack: 12,
    hardAttack: 25,
    speed: 40,
    weight: 28,
    productionCost: 400,
  }, 0.35));

  // Test 2: Tiger I (Heavy Tank, 1942)
  const tigerI: TankDesign = {
    id: 'tiger-i',
    name: 'Tiger I',
    countryTag: 'GER',
    year: 1942,
    role: 'heavy_tank',
    chassis: 'heavy_tank_chassis',
    gun: 'large_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 100, side: 80, rear: 50, top: 25 },
    stats: {} as TankStats,
    cost: 0,
    reliability: 60,
    productionCost: 0,
  };

  results.push(validateTank('Tiger I (1942)', tigerI, {
    hp: 250,
    armor: 100,
    piercing: 100,
    softAttack: 15,
    hardAttack: 45,
    speed: 38,
    weight: 48,
    productionCost: 800,
  }, 0.35));

  // Test 3: T-34 (Medium Tank, 1940)
  const t34: TankDesign = {
    id: 't-34',
    name: 'T-34',
    countryTag: 'SOV',
    year: 1940,
    role: 'medium_tank',
    chassis: 'medium_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 45, side: 45, rear: 40, top: 20 },
    stats: {} as TankStats,
    cost: 0,
    reliability: 85,
    productionCost: 0,
  };

  results.push(validateTank('T-34 (1940)', t34, {
    hp: 180,
    armor: 45,
    piercing: 60,
    softAttack: 12,
    hardAttack: 25,
    speed: 53,
    weight: 28,
    productionCost: 350,
  }, 0.35));

  // Test 4: M4 Sherman (Medium Tank, 1942)
  const sherman: TankDesign = {
    id: 'm4-sherman',
    name: 'M4 Sherman',
    countryTag: 'USA',
    year: 1942,
    role: 'medium_tank',
    chassis: 'medium_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'gas_turbine',
    suspension: 'torsion_bar',
    armorLayout: { front: 75, side: 50, rear: 38, top: 25 },
    stats: {} as TankStats,
    cost: 0,
    reliability: 90,
    productionCost: 0,
  };

  results.push(validateTank('M4 Sherman (1942)', sherman, {
    hp: 180,
    armor: 75,
    piercing: 60,
    softAttack: 12,
    hardAttack: 25,
    speed: 48,
    weight: 28,
    productionCost: 450,
  }, 0.35));

  return results;
}

// ============================================================================
// Air Validation Tests
// ============================================================================

interface AircraftValidationResult {
  name: string;
  passed: boolean;
  expected: Partial<AircraftStats>;
  actual: Partial<AircraftStats>;
  tolerance: number;
  details: string[];
}

function validateAircraft(name: string, design: AircraftDesign, expected: Partial<AircraftStats>, tolerance = 0.3): AircraftValidationResult {
  const actual = calculateAircraftStats(design);
  const details: string[] = [];
  let passed = true;

  for (const [key, expectedValue] of Object.entries(expected)) {
    // Skip non-numeric expected values
    if (typeof expectedValue !== 'number') {
      continue;
    }
    const actualValue = getNumericValue((actual as unknown as Record<string, unknown>)[key]);
    if (actualValue === null) {
      details.push(`${key}: MISSING or non-numeric in actual`);
      passed = false;
      continue;
    }
    const diff = Math.abs(actualValue - expectedValue) / Math.max(Math.abs(expectedValue), 1);
    if (diff > tolerance) {
      details.push(`${key}: expected ~${expectedValue}, got ${actualValue} (diff: ${(diff * 100).toFixed(1)}%)`);
      passed = false;
    } else {
      details.push(`${key}: ${actualValue} ✓`);
    }
  }

  return { name, passed, expected, actual, tolerance, details };
}

export function runAircraftValidations(): AircraftValidationResult[] {
  const results: AircraftValidationResult[] = [];

  // Test 1: Bf 109 E (Fighter, 1939)
  const bf109e: AircraftDesign = {
    id: 'bf-109-e',
    name: 'Bf 109 E',
    countryTag: 'GER',
    year: 1939,
    type: 'fighter',
    role: 'air_superiority',
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [],
    stats: {} as AircraftStats,
    cost: 0,
    buildTime: 0,
    reliability: 85,
  };

  results.push(validateAircraft('Bf 109 E (1939)', bf109e, {
    maxSpeed: 560,
    ceiling: 10000,
    range: 1500,
    airAttack: 0,
    airDefense: 0,
    agility: 0,
    climbRate: 540,
    weight: 3000,
  }, 0.5));

  // Test 2: Spitfire Mk I (Fighter, 1939)
  const spitfire: AircraftDesign = {
    id: 'spitfire-mk1',
    name: 'Spitfire Mk I',
    countryTag: 'ENG',
    year: 1939,
    type: 'fighter',
    role: 'air_superiority',
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [],
    stats: {} as AircraftStats,
    cost: 0,
    buildTime: 0,
    reliability: 85,
  };

  results.push(validateAircraft('Spitfire Mk I (1939)', spitfire, {
    maxSpeed: 560,
    ceiling: 10000,
    range: 1500,
    airAttack: 0,
    airDefense: 0,
    agility: 0,
    climbRate: 540,
    weight: 3000,
  }, 0.5));

  // Test 3: P-51D Mustang (Fighter, 1944)
  const mustang: AircraftDesign = {
    id: 'p51d',
    name: 'P-51D Mustang',
    countryTag: 'USA',
    year: 1944,
    type: 'fighter',
    role: 'air_superiority',
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [],
    stats: {} as AircraftStats,
    cost: 0,
    buildTime: 0,
    reliability: 90,
  };

  results.push(validateAircraft('P-51D Mustang (1944)', mustang, {
    maxSpeed: 560,
    ceiling: 10000,
    range: 1500,
    combatRange: 900,
    airAttack: 0,
    airDefense: 0,
    agility: 0,
    climbRate: 540,
    weight: 3000,
  }, 0.5));

  // Test 4: Ju 87 Stuka (CAS, 1939)
  const stuka: AircraftDesign = {
    id: 'ju87',
    name: 'Ju 87 Stuka',
    countryTag: 'GER',
    year: 1939,
    type: 'cas',
    role: 'ground_attack',
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [],
    stats: {} as AircraftStats,
    cost: 0,
    buildTime: 0,
    reliability: 80,
  };

  results.push(validateAircraft('Ju 87 Stuka (1939)', stuka, {
    maxSpeed: 560,
    ceiling: 10000,
    range: 1500,
    groundAttack: 0,
    navalAttack: 0,
    weight: 3000,
  }, 0.5));

  return results;
}

// ============================================================================
// Navy Validation Tests
// ============================================================================

interface NavyValidationResult {
  name: string;
  passed: boolean;
  expected: Partial<ShipStats>;
  actual: Partial<ShipStats>;
  tolerance: number;
  details: string[];
}

function validateShip(name: string, design: ShipDesign, expected: Partial<ShipStats>, tolerance = 0.3): NavyValidationResult {
  const actual = calculateShipStats(design);
  const details: string[] = [];
  let passed = true;

  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = getNumericValue((actual as unknown as Record<string, unknown>)[key]);
    if (actualValue === null) {
      details.push(`${key}: MISSING or non-numeric in actual`);
      passed = false;
      continue;
    }
    const diff = Math.abs(actualValue - expectedValue) / Math.max(Math.abs(expectedValue), 1);
    if (diff > tolerance) {
      details.push(`${key}: expected ~${expectedValue}, got ${actualValue.toFixed(2)} (diff: ${(diff * 100).toFixed(1)}%)`);
      passed = false;
    } else {
      details.push(`${key}: ${actualValue.toFixed(2)} ✓`);
    }
  }

  return { name, passed, expected, actual, tolerance, details };
}

export function runNavyValidations(): NavyValidationResult[] {
  const results: NavyValidationResult[] = [];

  // Test 1: Fletcher-class Destroyer (1942)
  const fletcher: ShipDesign = {
    id: 'fletcher',
    name: 'Fletcher-class Destroyer',
    countryTag: 'USA',
    year: 1942,
    type: 'destroyer',
    hull: 'destroyer_hull',
    modules: [],
    stats: {} as ShipStats,
    cost: 0,
    buildTime: 0,
    reliability: 90,
  };

  results.push(validateShip('Fletcher-class Destroyer (1942)', fletcher, {
    speed: 35,
    range: 4000,
    navalAttack: 0,
    torpedoAttack: 0,
    antiAirAttack: 0,
    hp: 100,
    armor: 0,
    weight: 0,
    crew: 200,
  }, 0.4));

  // Test 2: Iowa-class Battleship (1944)
  const iowa: ShipDesign = {
    id: 'iowa',
    name: 'Iowa-class Battleship',
    countryTag: 'USA',
    year: 1944,
    type: 'battleship',
    hull: 'battleship_hull',
    modules: [],
    stats: {} as ShipStats,
    cost: 0,
    buildTime: 0,
    reliability: 85,
  };

  results.push(validateShip('Iowa-class Battleship (1944)', iowa, {
    speed: 27,
    range: 12000,
    navalAttack: 0,
    shoreBombardment: 0,
    armor: 150,
    deckArmor: 80,
    hp: 800,
    weight: 0,
    crew: 2000,
  }, 0.4));

  // Test 3: Essex-class Carrier (1943)
  const essex: ShipDesign = {
    id: 'essex',
    name: 'Essex-class Carrier',
    countryTag: 'USA',
    year: 1943,
    type: 'carrier',
    hull: 'carrier_hull',
    modules: [],
    stats: {} as ShipStats,
    cost: 0,
    buildTime: 0,
    reliability: 85,
  };

  results.push(validateShip('Essex-class Carrier (1943)', essex, {
    speed: 30,
    range: 10000,
    airWingSize: 0,
    antiAirAttack: 0,
    hp: 600,
    weight: 0,
    crew: 2500,
  }, 0.4));

  // Test 4: Type VII U-boat (1940)
  const uboat: ShipDesign = {
    id: 'type-vii',
    name: 'Type VII U-boat',
    countryTag: 'GER',
    year: 1940,
    type: 'submarine',
    hull: 'submarine_hull',
    modules: [],
    stats: {} as ShipStats,
    cost: 0,
    buildTime: 0,
    reliability: 80,
  };

  results.push(validateShip('Type VII U-boat (1940)', uboat, {
    speed: 20,
    range: 8000,
    subAttack: 0,
    subVisibility: 5,
    hp: 150,
    weight: 0,
    crew: 80,
  }, 0.4));

  return results;
}

// ============================================================================
// Main Validation Runner
// ============================================================================

export interface AllValidationResults {
  division: ValidationResult[];
  tank: TankValidationResult[];
  aircraft: AircraftValidationResult[];
  navy: NavyValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

export function runAllValidations(): AllValidationResults {
  const division = runDivisionValidations();
  const tank = runTankValidations();
  const aircraft = runAircraftValidations();
  const navy = runNavyValidations();

  const allResults = [...division, ...tank, ...aircraft, ...navy];
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  return {
    division,
    tank,
    aircraft,
    navy,
    summary: {
      total: allResults.length,
      passed,
      failed,
    },
  };
}

export function _printValidationReport(results: AllValidationResults): void {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('           FORMULA VALIDATION REPORT');
  console.log('══════════════════════════════════════════════════════════════\n');

  const categories = [
    { name: 'DIVISION', results: results.division },
    { name: 'TANK', results: results.tank },
    { name: 'AIRCRAFT', results: results.aircraft },
    { name: 'NAVY', results: results.navy },
  ];

  for (const cat of categories) {
    console.log(`\n┌─ ${cat.name} VALIDATION ──────────────────────────────────────`);
    for (const result of cat.results) {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`│ ${status} ${result.name}`);
      for (const detail of result.details) {
        console.log(`│   ${detail}`);
      }
    }
    console.log('└──────────────────────────────────────────────────────────────');
  }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`SUMMARY: ${results.summary.passed}/${results.summary.total} passed, ${results.summary.failed} failed`);
  console.log('══════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const results = runAllValidations();
  _printValidationReport(results);
  process.exit(results.summary.failed > 0 ? 1 : 0);
}