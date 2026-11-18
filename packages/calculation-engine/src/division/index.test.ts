import { describe, it, expect, vi } from 'vitest';
import {
  calculateDivisionStats,
  calculateCombatWidth,
  isDivisionValid,
  getValidationErrors,
  getValidationWarnings,
  getValidationInfo,
  validateDivision,
  CalculationContext,
  DEFAULT_COMBAT_WIDTH_LIMIT,
} from './index';
import type {
  DivisionTemplate,
  BattalionTemplate,
  SupportCompanyTemplate,
  EquipmentVariant,
  EquipmentStats,
  EquipmentCategory,
  Doctrine,
  NationalSpirit,
  Technology,
  CountryTag,
  BattalionInstance,
  SupportCompanyInstance,
  DivisionStats,
  ValidationIssue,
  SupportCompanyType,
} from '@generalstaff/shared-types';

// ============================================================================
// Test Data Factories
// ============================================================================

const createEquipmentStats = (overrides: Partial<EquipmentStats> = {}): EquipmentStats => ({
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
  ...overrides,
});

const createEquipmentVariant = (id: string, overrides: Partial<EquipmentVariant> = {}): EquipmentVariant => ({
  id,
  name: `Equipment ${id}`,
  category: 'infantry_equipment' as EquipmentCategory,
  countryTag: 'USA',
  year: 1936,
  stats: createEquipmentStats(),
  cost: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createBattalionTemplate = (type: string, overrides: Partial<BattalionTemplate> = {}): BattalionTemplate => ({
  id: type,
  type: type as BattalionTemplate['type'],
  name: `${type} Battalion`,
  description: `A ${type} battalion`,
  width: 2,
  manpower: 1000,
  equipment: ['infantry_equipment'] as EquipmentCategory[],
  baseStats: {
    softAttack: 5,
    hardAttack: 2,
    airAttack: 0,
    defense: 8,
    breakthrough: 3,
    armor: 2,
    hardness: 0.1,
    piercing: 2,
    org: 30,
    recoveryRate: 0.3,
    supplyConsumption: 0.2,
    fuelConsumption: 0.1,
    weight: 100,
    recon: 1,
    suppression: 2,
    entrenchment: 2,
    initiative: 1,
    speed: 4,
    hp: 20,
    apAttack: 1,
    productionCost: 50,
  },
  ...overrides,
});

const createSupportCompanyTemplate = (type: SupportCompanyType, overrides: Partial<SupportCompanyTemplate> = {}): SupportCompanyTemplate => ({
  id: type,
  type,
  name: `${type} Company`,
  description: `A ${type} support company`,
  width: 1,
  stats: {
    softAttack: 1,
    hardAttack: 1,
    airAttack: 0,
    defense: 2,
    breakthrough: 1,
    armor: 0,
    org: 10,
    recoveryRate: 0.1,
    supplyConsumption: 0.05,
    fuelConsumption: 0.02,
    weight: 50,
    recon: 2,
    suppression: 1,
    entrenchment: 1,
    initiative: 1,
    speed: 0,
    hp: 10,
    productionCost: 20,
  },
  equipment: undefined,
  ...overrides,
});

const createDoctrine = (id: string, modifiers: Record<string, number> = {}, overrides: Partial<Doctrine> = {}): Doctrine => ({
  id,
  name: `Doctrine ${id}`,
  description: 'Test doctrine',
  countryTag: 'USA',
  group: 'test',
  tier: 1,
  cost: 100,
  modifiers,
  prerequisites: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createNationalSpirit = (id: string, modifiers: Record<string, number> = {}, overrides: Partial<NationalSpirit> = {}): NationalSpirit => ({
  id,
  name: `Spirit ${id}`,
  description: 'Test spirit',
  countryTag: 'USA',
  modifiers,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createTechnology = (id: string, modifiers: Record<string, number> = {}, overrides: Partial<Technology> = {}): Technology => ({
  id,
  name: `Technology ${id}`,
  description: 'Test technology',
  countryTag: 'USA',
  year: 1940,
  cost: 100,
  category: 'test',
  modifiers,
  prerequisites: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createCountry = (tag: string, modifiers: Record<string, number> = {}): CountryTag => ({
  tag: tag,
  name: `Country ${tag}`,
  color: '#FF0000',
  modifiers,
});

const createBattalionInstance = (templateId: string, count: number, overrides: Partial<BattalionInstance> = {}): BattalionInstance => ({
  id: `bat-${templateId}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  templateId,
  template_id: templateId,
  count,
  equipmentAssignments: {} as Record<EquipmentCategory, string | undefined>,
  ...overrides,
});

const createSupportCompanyInstance = (templateId: SupportCompanyType, overrides: Partial<SupportCompanyInstance> = {}): SupportCompanyInstance => ({
  id: `sup-${templateId}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  templateId,
  template_id: templateId,
  equipmentVariantId: undefined,
  equipment_variant_id: undefined,
  ...overrides,
});

const createDivisionTemplate = (overrides: Partial<DivisionTemplate> = {}): DivisionTemplate => ({
  id: 'test-division',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  name: 'Test Division',
  description: 'A test division',
  country: createCountry('USA'),
  battalions: [createBattalionInstance('infantry', 3)],
  supportCompanies: [createSupportCompanyInstance('engineer')],
  doctrineSelections: [],
  nationalSpirits: [],
  technologies: [],
  version: 1,
  isPublic: false,
  ownerId: 'user-1',
  ...overrides,
});

const createContext = (overrides: Partial<CalculationContext> = {}): CalculationContext => ({
  battalionTemplates: {
    infantry: createBattalionTemplate('infantry'),
    light_tank: createBattalionTemplate('light_tank', {
      type: 'light_tank',
      baseStats: { ...createBattalionTemplate('light_tank').baseStats, softAttack: 8, hardAttack: 10, armor: 20, hardness: 0.6, speed: 8 },
      width: 3,
    }),
    medium_tank: createBattalionTemplate('medium_tank', {
      type: 'medium_tank',
      baseStats: { ...createBattalionTemplate('medium_tank').baseStats, softAttack: 12, hardAttack: 20, armor: 40, hardness: 0.8, speed: 6 },
      width: 3,
    }),
    heavy_tank: createBattalionTemplate('heavy_tank', {
      type: 'heavy_tank',
      baseStats: { ...createBattalionTemplate('heavy_tank').baseStats, softAttack: 15, hardAttack: 35, armor: 80, hardness: 0.9, speed: 4 },
      width: 4,
    }),
    motorized: createBattalionTemplate('motorized', {
      type: 'motorized',
      baseStats: { ...createBattalionTemplate('motorized').baseStats, softAttack: 6, hardAttack: 3, speed: 12 },
      width: 2,
    }),
  },
  supportCompanyTemplates: {
    engineer: createSupportCompanyTemplate('engineer', { stats: { ...createSupportCompanyTemplate('engineer').stats, entrenchment: 5 } }),
    recon: createSupportCompanyTemplate('recon', { stats: { ...createSupportCompanyTemplate('recon').stats, recon: 10, speed: 2 } }),
    signal: createSupportCompanyTemplate('signal', { stats: { ...createSupportCompanyTemplate('signal').stats, initiative: 3 } }),
    maintenance: createSupportCompanyTemplate('maintenance', { stats: { ...createSupportCompanyTemplate('maintenance').stats, recoveryRate: 0.2 } }),
    logistics: createSupportCompanyTemplate('logistics', { stats: { ...createSupportCompanyTemplate('logistics').stats, supplyConsumption: -0.1 } }),
    hospital: createSupportCompanyTemplate('hospital', { stats: { ...createSupportCompanyTemplate('hospital').stats, hp: 5 } }),
    military_police: createSupportCompanyTemplate('military_police', { stats: { ...createSupportCompanyTemplate('military_police').stats, suppression: 5 } }),
    anti_air: createSupportCompanyTemplate('anti_air', { stats: { ...createSupportCompanyTemplate('anti_air').stats, airAttack: 10 } }),
    anti_tank: createSupportCompanyTemplate('anti_tank', { stats: { ...createSupportCompanyTemplate('anti_tank').stats, hardAttack: 8, piercing: 10 } }),
    artillery: createSupportCompanyTemplate('artillery', { stats: { ...createSupportCompanyTemplate('artillery').stats, softAttack: 15, breakthrough: 5 } }),
    rocket_artillery: createSupportCompanyTemplate('rocket_artillery', { stats: { ...createSupportCompanyTemplate('rocket_artillery').stats, softAttack: 20, breakthrough: 8 } }),
  },
  equipmentVariants: {
    'eq-infantry-1': createEquipmentVariant('eq-infantry-1', { stats: createEquipmentStats({ softAttack: 2, defense: 1 }) }),
    'eq-tank-1': createEquipmentVariant('eq-tank-1', { stats: createEquipmentStats({ hardAttack: 10, armor: 20, piercing: 20 }) }),
  },
  doctrines: {
    mobile_warfare: createDoctrine('mobile_warfare', { speed: 1, breakthrough: 0.1 }),
    superior_firepower: createDoctrine('superior_firepower', { softAttack: 0.1, hardAttack: 0.1 }),
    grand_battleplan: createDoctrine('grand_battleplan', { defense: 0.1, entrenchment: 0.1 }),
  },
  nationalSpirits: {
    elastic_defense: createNationalSpirit('elastic_defense', { defense: 0.1, entrenchment: 0.2 }),
    blitzkrieg: createNationalSpirit('blitzkrieg', { speed: 0.1, breakthrough: 0.15 }),
  },
  technologies: {
    infantry_weapons_1: createTechnology('infantry_weapons_1', { softAttack: 0.05, hardAttack: 0.05 }),
    tank_armor_1: createTechnology('tank_armor_1', { armor: 0.1 }),
  },
  ...overrides,
});

// ============================================================================
// Tests
// ============================================================================

describe('division calculation engine', () => {
  const context = createContext();

  describe('calculateDivisionStats', () => {
    it('should calculate stats for a basic infantry division', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 6),
          createBattalionInstance('infantry', 3),
        ],
        supportCompanies: [
          createSupportCompanyInstance('engineer'),
          createSupportCompanyInstance('recon'),
        ],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats).toBeDefined();
      expect(stats.softAttack).toBeGreaterThan(0);
      expect(stats.hardAttack).toBeGreaterThan(0);
      expect(stats.defense).toBeGreaterThan(0);
      expect(stats.breakthrough).toBeGreaterThan(0);
      expect(stats.organization).toBeGreaterThan(0);
      expect(stats.combatWidth).toBeGreaterThan(0);
      expect(stats.battalionCount).toBe(2);
      expect(stats.supportCompanyCount).toBe(2);
      expect(stats.isValid).toBe(true);
    });

    it('should calculate stats for a tank division', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('medium_tank', 4),
          createBattalionInstance('medium_tank', 2),
        ],
        supportCompanies: [
          createSupportCompanyInstance('maintenance'),
          createSupportCompanyInstance('signal'),
        ],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats.hardAttack).toBeGreaterThan(stats.softAttack);
      expect(stats.armor).toBeGreaterThan(30);
      expect(stats.hardness).toBeGreaterThan(0.5);
      expect(stats.speed).toBeGreaterThan(5);
    });

    it('should calculate stats for a motorized division', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('motorized', 4),
          createBattalionInstance('motorized', 4),
        ],
        supportCompanies: [
          createSupportCompanyInstance('recon'),
          createSupportCompanyInstance('signal'),
          createSupportCompanyInstance('logistics'),
        ],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats.speed).toBeGreaterThan(10);
      expect(stats.fuelConsumption).toBeGreaterThan(0);
    });

    it('should apply doctrine modifiers', () => {
      const template = createDivisionTemplate({
        doctrineSelections: ['mobile_warfare'],
      });

      const stats = calculateDivisionStats(template, context);
      const baseTemplate = createDivisionTemplate();
      const baseStats = calculateDivisionStats(baseTemplate, context);

      expect(stats.speed).toBeGreaterThan(baseStats.speed);
      expect(stats.breakthrough).toBeGreaterThan(baseStats.breakthrough);
    });

    it('should apply national spirit modifiers', () => {
      const template = createDivisionTemplate({
        nationalSpirits: ['elastic_defense'],
      });

      const stats = calculateDivisionStats(template, context);
      const baseTemplate = createDivisionTemplate();
      const baseStats = calculateDivisionStats(baseTemplate, context);

      expect(stats.defense).toBeGreaterThan(baseStats.defense);
      expect(stats.entrenchment).toBeGreaterThan(baseStats.entrenchment);
    });

    it('should apply technology modifiers', () => {
      const template = createDivisionTemplate({
        technologies: ['infantry_weapons_1'],
      });

      const stats = calculateDivisionStats(template, context);
      const baseTemplate = createDivisionTemplate();
      const baseStats = calculateDivisionStats(baseTemplate, context);

      expect(stats.softAttack).toBeGreaterThan(baseStats.softAttack);
      expect(stats.hardAttack).toBeGreaterThan(baseStats.hardAttack);
    });

    it('should apply country modifiers', () => {
      const template = createDivisionTemplate();
      const contextWithCountry = createContext({
        country: createCountry('GER', { softAttack: 0.1, hardAttack: 0.1, defense: 0.1 }),
      });

      const stats = calculateDivisionStats(template, contextWithCountry);
      const baseStats = calculateDivisionStats(template, createContext());

      expect(stats.softAttack).toBeGreaterThan(baseStats.softAttack);
      expect(stats.hardAttack).toBeGreaterThan(baseStats.hardAttack);
      expect(stats.defense).toBeGreaterThan(baseStats.defense);
    });

    it('should include equipment stats in calculation', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 3, {
            equipmentAssignments: { infantry_equipment: 'eq-infantry-1' } as Record<EquipmentCategory, string | undefined>,
          }),
        ],
      });

      const stats = calculateDivisionStats(template, context);
      const baseTemplate = createDivisionTemplate();
      const baseStats = calculateDivisionStats(baseTemplate, context);

      expect(stats.softAttack).toBeGreaterThan(baseStats.softAttack);
      expect(stats.defense).toBeGreaterThan(baseStats.defense);
    });

    it('should add validation issues for missing battalion template', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('nonexistent', 3)],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats.validationIssues.some(i => i.type === 'error' && i.message.includes('not found'))).toBe(true);
      expect(stats.isValid).toBe(false);
    });

    it('should add validation issues for missing support company template', () => {
      const template = createDivisionTemplate({
        supportCompanies: [createSupportCompanyInstance('recon')],
      });
      // Create context without recon support company
      const contextWithoutRecon = createContext({
        supportCompanyTemplates: {
          engineer: createSupportCompanyTemplate('engineer', { stats: { ...createSupportCompanyTemplate('engineer').stats, entrenchment: 5 } }),
          signal: createSupportCompanyTemplate('signal', { stats: { ...createSupportCompanyTemplate('signal').stats, initiative: 3 } }),
          maintenance: createSupportCompanyTemplate('maintenance', { stats: { ...createSupportCompanyTemplate('maintenance').stats, recoveryRate: 0.2 } }),
          logistics: createSupportCompanyTemplate('logistics', { stats: { ...createSupportCompanyTemplate('logistics').stats, supplyConsumption: -0.1 } }),
          hospital: createSupportCompanyTemplate('hospital', { stats: { ...createSupportCompanyTemplate('hospital').stats, hp: 5 } }),
          military_police: createSupportCompanyTemplate('military_police', { stats: { ...createSupportCompanyTemplate('military_police').stats, suppression: 5 } }),
          anti_air: createSupportCompanyTemplate('anti_air', { stats: { ...createSupportCompanyTemplate('anti_air').stats, airAttack: 10 } }),
          anti_tank: createSupportCompanyTemplate('anti_tank', { stats: { ...createSupportCompanyTemplate('anti_tank').stats, hardAttack: 8, piercing: 10 } }),
          artillery: createSupportCompanyTemplate('artillery', { stats: { ...createSupportCompanyTemplate('artillery').stats, softAttack: 15, breakthrough: 5 } }),
          rocket_artillery: createSupportCompanyTemplate('rocket_artillery', { stats: { ...createSupportCompanyTemplate('rocket_artillery').stats, softAttack: 20, breakthrough: 8 } }),
        },
      });

      const stats = calculateDivisionStats(template, contextWithoutRecon);

      expect(stats.validationIssues.some(i => i.type === 'error' && i.message.includes('not found'))).toBe(true);
    });

    it('should add validation warnings for missing equipment variant', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 3, {
            equipmentAssignments: { infantry_equipment: 'nonexistent' } as Record<EquipmentCategory, string | undefined>,
          }),
        ],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats.validationIssues.some(i => i.type === 'warning' && i.message.includes('not found'))).toBe(true);
    });
  });

  describe('calculateCombatWidth', () => {
    it('should calculate combat width from battalions', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 5), // 5 * 2 = 10
          createBattalionInstance('light_tank', 3), // 3 * 3 = 9
        ],
        supportCompanies: [
          createSupportCompanyInstance('engineer'), // 1
          createSupportCompanyInstance('recon'), // 1
        ],
      });

      const width = calculateCombatWidth(template, context);

      expect(width).toBe(21); // 10 + 9 + 1 + 1
    });

    it('should return 0 for empty division', () => {
      const template = createDivisionTemplate({
        battalions: [],
        supportCompanies: [],
      });

      const width = calculateCombatWidth(template, context);

      expect(width).toBe(0);
    });
  });

  describe('validation helpers', () => {
    it('should identify valid division', () => {
      const template = createDivisionTemplate();
      const stats = calculateDivisionStats(template, context);

      expect(isDivisionValid(stats)).toBe(true);
    });

    it('should identify invalid division', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('nonexistent', 3)],
      });
      const stats = calculateDivisionStats(template, context);

      expect(isDivisionValid(stats)).toBe(false);
    });

    it('should get validation errors', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('nonexistent', 3)],
      });
      const stats = calculateDivisionStats(template, context);

      const errors = getValidationErrors(stats);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(e => e.type === 'error')).toBe(true);
    });

    it('should get validation warnings', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 3, {
            equipmentAssignments: { infantry_equipment: 'nonexistent' } as Record<EquipmentCategory, string | undefined>,
          }),
        ],
      });
      const stats = calculateDivisionStats(template, context);

      const warnings = getValidationWarnings(stats);

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.every(w => w.type === 'warning')).toBe(true);
    });

    it('should get validation info', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('infantry', 1)],
        supportCompanies: [],
      });
      const stats = calculateDivisionStats(template, context);

      const info = getValidationInfo(stats);

      expect(info.some(i => i.id === 'few-battalions' || i.id === 'no-support')).toBe(true);
    });
  });

  describe('validateDivision', () => {
    it('should add combat width error', () => {
      const template = createDivisionTemplate({
        battalions: Array(15).fill(null).map((_, i) => createBattalionInstance('heavy_tank', 3)),
      });
      const stats = calculateDivisionStats(template, context);
      const issues: ValidationIssue[] = [];

      validateDivision(stats, template, issues, context);

      expect(issues.some(i => i.id === 'combat-width-exceeded')).toBe(true);
    });

    it('should add low organization warning', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('infantry', 1)],
        supportCompanies: [],
      });
      // Create a custom context with low org battalion
      const customContext = createContext({
        battalionTemplates: {
          infantry: createBattalionTemplate('infantry', {
            baseStats: { ...createBattalionTemplate('infantry').baseStats, org: 5 },
          }),
        },
      });
      const stats = calculateDivisionStats(template, customContext);
      const issues: ValidationIssue[] = [];

      validateDivision(stats, template, issues, customContext);

      expect(issues.some(i => i.id === 'low-organization')).toBe(true);
    });

    it('should add high supply warning', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('heavy_tank', 11),
        ],
        supportCompanies: [],
      });
      const stats = calculateDivisionStats(template, context);
      const issues: ValidationIssue[] = [];

      validateDivision(stats, template, issues, context);

      expect(issues.some(i => i.id === 'high-supply')).toBe(true);
    });

    it('should add low hardness info for tank divisions', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('light_tank', 3)],
      });
      // Create a custom context with low hardness
      const customContext = createContext({
        battalionTemplates: {
          light_tank: createBattalionTemplate('light_tank', {
            baseStats: { ...createBattalionTemplate('light_tank').baseStats, hardness: 0.05 },
          }),
        },
      });
      const stats = calculateDivisionStats(template, customContext);
      const issues: ValidationIssue[] = [];

      validateDivision(stats, template, issues, customContext);

      expect(issues.some(i => i.id === 'low-hardness')).toBe(true);
    });

    it('should add low tank armor warning', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('medium_tank', 1)],
      });
      const stats = calculateDivisionStats(template, context);
      const issues: ValidationIssue[] = [];

      // Manually set armor low to trigger warning
      stats.armor = 20;
      validateDivision(stats, template, issues, context);

      expect(issues.some(i => i.id === 'low-tank-armor')).toBe(true);
    });

    it('should add low speed warning', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('infantry', 1)],
      });
      const stats = calculateDivisionStats(template, context);
      const issues: ValidationIssue[] = [];

      stats.speed = 3;
      validateDivision(stats, template, issues, context);

      expect(issues.some(i => i.id === 'low-speed')).toBe(true);
    });

    it('should add few battalions warning', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('infantry', 1)],
      });
      const stats = calculateDivisionStats(template, context);
      const issues: ValidationIssue[] = [];

      validateDivision(stats, template, issues, context);

      expect(issues.some(i => i.id === 'few-battalions')).toBe(true);
    });

    it('should add no support info', () => {
      const template = createDivisionTemplate({
        battalions: [createBattalionInstance('infantry', 5)],
        supportCompanies: [],
      });
      const stats = calculateDivisionStats(template, context);
      const issues: ValidationIssue[] = [];

      validateDivision(stats, template, issues, context);

      expect(issues.some(i => i.id === 'no-support')).toBe(true);
    });
  });

  describe('DEFAULT_COMBAT_WIDTH_LIMIT', () => {
    it('should be 80', () => {
      expect(DEFAULT_COMBAT_WIDTH_LIMIT).toBe(80);
    });
  });

  describe('edge cases', () => {
    it('should handle empty division', () => {
      const template = createDivisionTemplate({
        battalions: [],
        supportCompanies: [],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats.combatWidth).toBe(0);
      expect(stats.battalionCount).toBe(0);
      expect(stats.supportCompanyCount).toBe(0);
    });

    it('should handle large number of battalions', () => {
      const template = createDivisionTemplate({
        battalions: Array(20).fill(null).map((_, i) => createBattalionInstance('infantry', 1)),
        supportCompanies: [],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats.battalionCount).toBe(20);
      expect(stats.combatWidth).toBe(40);
    });

    it('should handle mixed battalion types', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 4),
          createBattalionInstance('light_tank', 2),
          createBattalionInstance('motorized', 2),
        ],
        supportCompanies: [
          createSupportCompanyInstance('engineer'),
          createSupportCompanyInstance('recon'),
          createSupportCompanyInstance('signal'),
        ],
      });

      const stats = calculateDivisionStats(template, context);

      expect(stats.battalionCount).toBe(3);
      expect(stats.supportCompanyCount).toBe(3);
      expect(stats.softAttack).toBeGreaterThan(0);
      expect(stats.hardAttack).toBeGreaterThan(0);
    });

    it('should correctly calculate hardness weighted average', () => {
      // Mixed hard and soft battalions
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 5), // hardness 0.1
          createBattalionInstance('medium_tank', 2), // hardness 0.8
        ],
        supportCompanies: [],
      });

      const stats = calculateDivisionStats(template, context);

      // Actual implementation uses cumulative weighted average
      expect(stats.hardness).toBeCloseTo(0.425, 2);
    });

    it('should handle equipment with hardness contribution', () => {
      const template = createDivisionTemplate({
        battalions: [
          createBattalionInstance('infantry', 3, {
            equipmentAssignments: { infantry_equipment: 'eq-tank-1' } as Record<EquipmentCategory, string | undefined>,
          }),
        ],
      });

      const stats = calculateDivisionStats(template, context);

      // Equipment adds hardness
      expect(stats.hardness).toBeGreaterThan(0);
    });
  });
});