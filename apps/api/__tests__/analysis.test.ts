import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateRuleBasedAnalysis, summarizeDivision, generateCacheKey } from '../src/services/analysis';
import type { Division, DivisionStats, Country, BattalionInstance, SupportCompanyInstance } from '@generalstaff/shared-types';

// ============================================================================
// Test Utilities
// ============================================================================

const createTestDivision = (overrides: Partial<Division> = {}): Division => {
  const baseCountry: Country = {
    tag: 'USA',
    name: 'United States',
    color: '#002868',
    flagUrl: 'https://flags.example.com/usa.svg',
    modifiers: { softAttack: 0.1, hardness: 0.05 },
  };

  const baseBattalions: BattalionInstance[] = [
    {
      id: 'bat-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: 'infantry',
      template_id: 'infantry',
      count: 6,
      equipmentAssignments: { 'slot-1': 'eq-1' },
      equipment_assignments: { 'slot-1': 'eq-1' },
      customName: 'Infantry Battalion',
    },
    {
      id: 'bat-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: 'artillery',
      template_id: 'artillery',
      count: 2,
      equipmentAssignments: { 'slot-1': 'eq-2' },
      equipment_assignments: { 'slot-1': 'eq-2' },
      customName: 'Artillery Battalion',
    },
  ];

  const baseSupportCompanies: SupportCompanyInstance[] = [
    {
      id: 'sup-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: 'engineer',
      template_id: 'engineer',
      equipmentVariantId: 'eng-variant-1',
      equipment_variant_id: 'eng-variant-1',
    },
    {
      id: 'sup-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: 'signal',
      template_id: 'signal',
      equipmentVariantId: 'sig-variant-1',
      equipment_variant_id: 'sig-variant-1',
    },
  ];

  const baseStats: DivisionStats = {
    softAttack: 120.5,
    hardAttack: 45.2,
    airAttack: 10.0,
    defense: 85.3,
    breakthrough: 35.1,
    armor: 15.0,
    hardness: 0.35,
    piercing: 25.0,
    organization: 75.0,
    maxOrganization: 80.0,
    recoveryRate: 0.3,
    supplyConsumption: 2.5,
    fuelConsumption: 1.8,
    weight: 15000,
    combatWidth: 20,
    recon: 15.0,
    suppression: 8.0,
    entrenchment: 5.0,
    initiative: 1.2,
    speed: 4.5,
    maxSpeed: 5.0,
    hp: 120.0,
    apAttack: 12.0,
    manpower: 12000,
    productionCost: 5000,
    icCost: 250,
    battalionCount: 8,
    supportCompanyCount: 2,
    isValid: true,
    validationIssues: [],
  };

  return {
    id: 'test-division-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Test Division',
    description: 'A test division for integration tests',
    country: baseCountry,
    battalions: baseBattalions,
    supportCompanies: baseSupportCompanies,
    doctrines: [
      { id: 'doc-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), doctrineId: 'mobile_warfare' },
    ],
    spirits: [
      { id: 'spi-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), spiritId: 'elastic_defense' },
    ],
    technologies: [
      { id: 'tech-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), technologyId: 'infantry_weapons_1' },
    ],
    version: 1,
    isPublic: false,
    ownerId: 'user-123',
    stats: baseStats,
    combatWidth: 20,
    ...overrides,
  };
};

// ============================================================================
// Unit Tests for Analysis Service Functions
// ============================================================================

describe('Analysis Service - Unit Tests', () => {
  const testDivision = createTestDivision();

  describe('generateCacheKey', () => {
    it('should generate a deterministic cache key', () => {
      const key1 = generateCacheKey(testDivision);
      const key2 = generateCacheKey(testDivision);
      expect(key1).toBe(key2);
      expect(key1.length).toBeGreaterThan(0);
    });

    it('should generate different keys for different divisions', () => {
      const division2 = createTestDivision({ name: 'Different Division' });
      const key1 = generateCacheKey(testDivision);
      const key2 = generateCacheKey(division2);
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different versions', () => {
      const division2 = createTestDivision({ version: 2 });
      const key1 = generateCacheKey(testDivision);
      const key2 = generateCacheKey(division2);
      expect(key1).not.toBe(key2);
    });
  });

  describe('summarizeDivision', () => {
    it('should create a summary with all required fields', () => {
      const summary = summarizeDivision(testDivision);

      expect(summary.name).toBe('Test Division');
      expect(summary.country).toBe('United States');
      expect(summary.combatWidth).toBe(20);
      expect(summary.stats).toBeDefined();
      expect(summary.battalions).toHaveLength(2);
      expect(summary.supportCompanies).toHaveLength(2);
      expect(summary.doctrines).toContain('mobile_warfare');
      expect(summary.nationalSpirits).toContain('elastic_defense');
    });

    it('should handle missing stats gracefully', () => {
      const divisionWithoutStats = createTestDivision({ stats: undefined });
      const summary = summarizeDivision(divisionWithoutStats);

      expect(summary.stats).toBeDefined();
      expect(summary.stats.softAttack).toBe(0);
      expect(summary.stats.organization).toBe(0);
    });
  });

  describe('calculateRuleBasedAnalysis', () => {
    it('should return complete analysis results', () => {
      const summary = summarizeDivision(testDivision);
      const results = calculateRuleBasedAnalysis(summary);

      expect(results).toBeDefined();
      expect(results.overallScore).toBeGreaterThanOrEqual(0);
      expect(results.overallScore).toBeLessThanOrEqual(100);
      expect(results.categoryScores).toBeDefined();
      expect(results.categoryScores.offense).toBeGreaterThanOrEqual(0);
      expect(results.categoryScores.defense).toBeGreaterThanOrEqual(0);
      expect(results.categoryScores.mobility).toBeGreaterThanOrEqual(0);
      expect(results.categoryScores.logistics).toBeGreaterThanOrEqual(0);
      expect(results.categoryScores.costEfficiency).toBeGreaterThanOrEqual(0);
      expect(results.strengths).toBeInstanceOf(Array);
      expect(results.weaknesses).toBeInstanceOf(Array);
      expect(results.recommendations).toBeInstanceOf(Array);
      expect(results.matchups).toBeInstanceOf(Array);
      expect(results.matchups).toHaveLength(6);
    });

    it('should give high scores to well-rounded divisions', () => {
      const strongDivision = createTestDivision({
        stats: {
          ...testDivision.stats!,
          softAttack: 200,
          hardAttack: 100,
          defense: 150,
          breakthrough: 80,
          armor: 80,
          hardness: 0.7,
          piercing: 60,
          organization: 45,
          speed: 8,
          supplyConsumption: 1.5,
          fuelConsumption: 5,
          icCost: 200,
        },
      });

      const summary = summarizeDivision(strongDivision);
      const results = calculateRuleBasedAnalysis(summary);

      expect(results.overallScore).toBeGreaterThan(70);
      expect(results.categoryScores.offense).toBeGreaterThan(70);
      expect(results.categoryScores.defense).toBeGreaterThan(70);
    });

    it('should identify low org as weakness', () => {
      const lowOrgDivision = createTestDivision({
        stats: { ...testDivision.stats!, organization: 20 },
      });

      const summary = summarizeDivision(lowOrgDivision);
      const results = calculateRuleBasedAnalysis(summary);

      expect(results.weaknesses.some(w => w.includes('organization'))).toBe(true);
      expect(results.recommendations.some(r => r.includes('organization'))).toBe(true);
    });

    it('should identify armor without piercing as weakness', () => {
      const armorNoPiercing = createTestDivision({
        stats: { ...testDivision.stats!, armor: 80, piercing: 10 },
      });

      const summary = summarizeDivision(armorNoPiercing);
      const results = calculateRuleBasedAnalysis(summary);

      expect(results.weaknesses.some(w => w.includes('Armor') && w.includes('piercing'))).toBe(true);
    });

    it('should recommend standard combat widths', () => {
      const nonStandardCw = createTestDivision({
        stats: { ...testDivision.stats!, combatWidth: 30 },
        combatWidth: 30,
      });

      const summary = summarizeDivision(nonStandardCw);
      const results = calculateRuleBasedAnalysis(summary);

      expect(results.weaknesses.some(w => w.includes('combat width'))).toBe(true);
      expect(results.recommendations.some(r => r.includes('20/27/40'))).toBe(true);
    });

    it('should recommend signal company when missing', () => {
      const noSignal = createTestDivision({
        supportCompanies: [
          {
            id: 'sup-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            templateId: 'engineer',
            template_id: 'engineer',
          },
        ],
      });

      const summary = summarizeDivision(noSignal);
      const results = calculateRuleBasedAnalysis(summary);

      expect(results.recommendations.some(r => r.includes('signal'))).toBe(true);
    });

    it('should recommend engineer company when missing', () => {
      const noEngineer = createTestDivision({
        supportCompanies: [
          {
            id: 'sup-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            templateId: 'signal',
            template_id: 'signal',
          },
        ],
      });

      const summary = summarizeDivision(noEngineer);
      const results = calculateRuleBasedAnalysis(summary);

      expect(results.recommendations.some(r => r.includes('engineer'))).toBe(true);
    });
  });
});

// ============================================================================
// Edge Case Tests
// ============================================================================

describe('Analysis Edge Cases', () => {
  const testDivision = createTestDivision();

  it('should handle division with no support companies', () => {
    const noSupport = createTestDivision({ supportCompanies: [] });
    const summary = summarizeDivision(noSupport);
    const results = calculateRuleBasedAnalysis(summary);

    expect(results).toBeDefined();
    expect(results.recommendations.some(r => r.includes('signal'))).toBe(true);
    expect(results.recommendations.some(r => r.includes('engineer'))).toBe(true);
  });

  it('should handle division with no doctrines', () => {
    const noDoctrines = createTestDivision({ doctrines: [] });
    const summary = summarizeDivision(noDoctrines);
    const results = calculateRuleBasedAnalysis(summary);

    expect(results).toBeDefined();
  });

  it('should handle division with no spirits', () => {
    const noSpirits = createTestDivision({ spirits: [] });
    const summary = summarizeDivision(noSpirits);
    const results = calculateRuleBasedAnalysis(summary);

    expect(results).toBeDefined();
  });

  it('should handle division with no technologies', () => {
    const noTechs = createTestDivision({ technologies: [] });
    const summary = summarizeDivision(noTechs);
    const results = calculateRuleBasedAnalysis(summary);

    expect(results).toBeDefined();
  });

  it('should handle zero stats gracefully', () => {
    const zeroStats = createTestDivision({
      stats: {
        ...testDivision.stats!,
        softAttack: 0,
        hardAttack: 0,
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
        speed: 0,
        icCost: 1,
      },
    });

    const summary = summarizeDivision(zeroStats);
    const results = calculateRuleBasedAnalysis(summary);

    expect(results.overallScore).toBeLessThanOrEqual(50);
    expect(results.weaknesses.length).toBeGreaterThan(0);
  });
});