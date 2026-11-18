import { describe, it, expect } from 'vitest';
import {
  calculateAircraftStats,
  AircraftDesign,
  AircraftType,
  AircraftRole,
  AirframeType,
  EngineType,
  AircraftModule,
  ModuleType,
  ModuleSlot,
  ModuleStats,
  AircraftStats,
  StealthLevel,
  AIRCRAFT_TYPES,
  createAircraftVariant,
  AIRFRAME_STATS,
  ENGINE_STATS,
} from './index';

describe('air module', () => {
  const createMinimalModule = (overrides: Partial<AircraftModule> = {}): AircraftModule => ({
    id: 'test-module',
    type: 'gun',
    slot: 'weapon',
    stats: {
      airAttack: 10,
      airDefense: 5,
      agility: 2,
      speed: 0,
      groundAttack: 0,
      navalAttack: 0,
      armorPenetration: 0,
      range: 0,
      fuelCapacity: 0,
      radarRange: 0,
      radarCrossSection: 10,
      irstRange: 0,
      ewRating: 0,
      targetingAccuracy: 0,
      nightCapability: 0,
      reconRange: 0,
      reconQuality: 0,
      subDetection: 0,
      aswAttack: 0,
      reliability: 90,
      cost: 50,
      weight: 100,
    },
    ...overrides,
  });

  const createMinimalDesign = (overrides: Partial<AircraftDesign> = {}): AircraftDesign => ({
    id: 'test-aircraft',
    name: 'Test Fighter',
    countryTag: 'USA',
    year: 1944,
    type: 'fighter',
    role: 'air_superiority',
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [createMinimalModule()],
    stats: calculateAircraftStats({
      id: 'test-aircraft',
      name: 'Test Fighter',
      countryTag: 'USA',
      year: 1944,
      type: 'fighter',
      role: 'air_superiority',
      airframe: 'monoplane',
      engine: 'inline_engine',
      modules: [createMinimalModule()],
    } as AircraftDesign),
    cost: 1000,
    buildTime: 100,
    reliability: 85,
    ...overrides,
  });

  describe('calculateAircraftStats', () => {
    it('should return base stats for minimal design', () => {
      const design = createMinimalDesign();
      const stats = calculateAircraftStats(design);

      expect(stats).toBeDefined();
      expect(stats.airAttack).toBeGreaterThan(0);
      expect(stats.airDefense).toBeGreaterThan(0);
      expect(stats.agility).toBeGreaterThan(0);
      expect(stats.speed).toBeGreaterThan(0);
      expect(stats.maxSpeed).toBeGreaterThan(0);
      expect(stats.climbRate).toBeGreaterThan(0);
      expect(stats.ceiling).toBeGreaterThan(0);
      expect(stats.turnRate).toBeGreaterThan(0);
      expect(stats.range).toBeGreaterThan(0);
      expect(stats.combatRange).toBeGreaterThan(0);
      expect(stats.ferryRange).toBeGreaterThan(0);
      expect(stats.fuelCapacity).toBeGreaterThan(0);
      expect(stats.radarRange).toBeGreaterThanOrEqual(0);
      expect(stats.radarCrossSection).toBeGreaterThan(0);
      expect(stats.reliability).toBeGreaterThan(0);
      expect(stats.cost).toBeGreaterThan(0);
      expect(stats.buildTime).toBeGreaterThan(0);
      expect(stats.weight).toBeGreaterThan(0);
      expect(stats.emptyWeight).toBeGreaterThan(0);
      expect(stats.maxTakeoffWeight).toBeGreaterThan(0);
      expect(stats.crew).toBeGreaterThan(0);
    });

    it('should calculate different stats for different airframes', () => {
      const biplane = calculateAircraftStats(createMinimalDesign({ airframe: 'biplane' }));
      const jet = calculateAircraftStats(createMinimalDesign({ airframe: 'jet_airframe' }));
      const stealth = calculateAircraftStats(createMinimalDesign({ airframe: 'stealth_airframe' }));

      expect(jet.maxSpeed).toBeGreaterThanOrEqual(biplane.maxSpeed);
      expect(jet.ceiling).toBeGreaterThanOrEqual(biplane.ceiling);
      expect(stealth.stealthLevel).toBe('very_high');
    });

    it('should calculate different stats for different engines', () => {
      const piston = calculateAircraftStats(createMinimalDesign({ engine: 'piston_engine' }));
      const turbojet = calculateAircraftStats(createMinimalDesign({ engine: 'turbojet' }));
      const turbofan = calculateAircraftStats(createMinimalDesign({ engine: 'turbofan' }));

      expect(turbojet.maxSpeed).toBeGreaterThanOrEqual(piston.maxSpeed);
      expect(turbofan.maxSpeed).toBeGreaterThanOrEqual(turbojet.maxSpeed);
      // fuelConsumption may not be directly comparable in the current implementation
    });

    it('should aggregate module stats', () => {
      const singleModule = calculateAircraftStats(createMinimalDesign({
        modules: [createMinimalModule({ stats: { ...createMinimalModule().stats, airAttack: 20 } })]
      }));

      const multiModule = calculateAircraftStats(createMinimalDesign({
        modules: [
          createMinimalModule({ stats: { ...createMinimalModule().stats, airAttack: 20 } }),
          createMinimalModule({ stats: { ...createMinimalModule().stats, airAttack: 20 } }),
        ]
      }));

      expect(multiModule.airAttack).toBeGreaterThan(singleModule.airAttack);
    });

    it('should calculate stealth level based on RCS', () => {
      const lowRcs = calculateAircraftStats(createMinimalDesign({
        airframe: 'stealth_airframe',
        modules: [createMinimalModule({ stats: { ...createMinimalModule().stats, radarCrossSection: 0.1 } })]
      }));

      const highRcs = calculateAircraftStats(createMinimalDesign({
        airframe: 'monoplane',
        modules: [createMinimalModule({ stats: { ...createMinimalModule().stats, radarCrossSection: 100 } })]
      }));

      expect(lowRcs.stealthLevel).toBe('very_high');
      expect(highRcs.stealthLevel).toBe('none');
    });

    it('should handle VTOL airframes', () => {
      const vtol = calculateAircraftStats(createMinimalDesign({ airframe: 'vtol_airframe' }));
      const helicopter = calculateAircraftStats(createMinimalDesign({ airframe: 'rotary_wing' }));

      expect(vtol.vtolCapable).toBe(true);
      expect(helicopter.vtolCapable).toBe(true);
    });

    it('should handle carrier capable airframes', () => {
      const carrier = calculateAircraftStats(createMinimalDesign({ airframe: 'monoplane' }));
      const heavy = calculateAircraftStats(createMinimalDesign({ airframe: 'heavy_airframe' }));

      expect(carrier.carrierCapable).toBe(true);
      expect(heavy.carrierCapable).toBe(false);
    });

    it('should calculate weight correctly', () => {
      const design = createMinimalDesign();
      const stats = calculateAircraftStats(design);

      const airframeWeight = AIRFRAME_STATS['monoplane'].baseWeight || 0;
      const moduleWeight = design.modules.reduce((sum, m) => sum + m.stats.weight, 0);

      expect(stats.emptyWeight).toBe(airframeWeight);
      expect(stats.weight).toBe(airframeWeight + moduleWeight);
    });

    it('should calculate cost correctly', () => {
      const design = createMinimalDesign();
      const stats = calculateAircraftStats(design);

      const airframeCost = AIRFRAME_STATS['monoplane'].baseCost || 0;
      const engineCost = ENGINE_STATS['inline_engine'].cost || 0;
      const moduleCost = design.modules.reduce((sum, m) => sum + m.stats.cost, 0);

      expect(stats.cost).toBe(airframeCost + engineCost + moduleCost);
    });

    it('should set organization stats', () => {
      const stats = calculateAircraftStats(createMinimalDesign());

      expect(stats.organization).toBe(30);
      expect(stats.maxOrganization).toBe(30);
      expect(stats.recoveryRate).toBe(0.3);
    });
  });

  describe('AIRCRAFT_TYPES', () => {
    it('should have all aircraft types defined', () => {
      expect(AIRCRAFT_TYPES).toHaveProperty('fighter');
      expect(AIRCRAFT_TYPES).toHaveProperty('heavy_fighter');
      expect(AIRCRAFT_TYPES).toHaveProperty('jet_fighter');
      expect(AIRCRAFT_TYPES).toHaveProperty('interceptor');
      expect(AIRCRAFT_TYPES).toHaveProperty('cas');
      expect(AIRCRAFT_TYPES).toHaveProperty('naval_bomber');
      expect(AIRCRAFT_TYPES).toHaveProperty('tactical_bomber');
      expect(AIRCRAFT_TYPES).toHaveProperty('strategic_bomber');
      expect(AIRCRAFT_TYPES).toHaveProperty('transport');
      expect(AIRCRAFT_TYPES).toHaveProperty('recon');
      expect(AIRCRAFT_TYPES).toHaveProperty('flying_boat');
      expect(AIRCRAFT_TYPES).toHaveProperty('helicopter');
      expect(AIRCRAFT_TYPES).toHaveProperty('vtol');
      expect(AIRCRAFT_TYPES).toHaveProperty('uav');
    });

    it('should have description, defaultAirframe, and defaultRole for each type', () => {
      Object.values(AIRCRAFT_TYPES).forEach(type => {
        expect(type).toHaveProperty('description');
        expect(type).toHaveProperty('defaultAirframe');
        expect(type).toHaveProperty('defaultRole');
        expect(typeof type.description).toBe('string');
        expect(typeof type.defaultAirframe).toBe('string');
        expect(typeof type.defaultRole).toBe('string');
      });
    });
  });

  describe('createAircraftVariant', () => {
    it('should create a variant with modified properties', () => {
      const baseDesign: AircraftDesign = createMinimalDesign();

      const variant = createAircraftVariant(baseDesign, 'Mk II', {
        engine: 'turbojet',
        modules: [
          createMinimalModule({ stats: { ...createMinimalModule().stats, airAttack: 50 } }),
        ],
      });

      expect(variant.id).toBe('test-aircraft_Mk II');
      expect(variant.name).toBe('Test Fighter Mk II');
      expect(variant.engine).toBe('turbojet');
      expect(variant.stats.airAttack).toBeGreaterThan(baseDesign.stats.airAttack);
    });

    it('should preserve unchanged properties', () => {
      const baseDesign: AircraftDesign = createMinimalDesign();

      const variant = createAircraftVariant(baseDesign, 'Variant', {
        name: 'New Name',
      });

      expect(variant.countryTag).toBe('USA');
      expect(variant.year).toBe(1944);
      expect(variant.type).toBe('fighter');
      expect(variant.role).toBe('air_superiority');
      expect(variant.airframe).toBe('monoplane');
    });
  });

  describe('AIRFRAME_STATS', () => {
    it('should have all airframe types', () => {
      expect(AIRFRAME_STATS).toHaveProperty('biplane');
      expect(AIRFRAME_STATS).toHaveProperty('monoplane');
      expect(AIRFRAME_STATS).toHaveProperty('jet_airframe');
      expect(AIRFRAME_STATS).toHaveProperty('stealth_airframe');
      expect(AIRFRAME_STATS).toHaveProperty('heavy_airframe');
      expect(AIRFRAME_STATS).toHaveProperty('transport_airframe');
      expect(AIRFRAME_STATS).toHaveProperty('rotary_wing');
      expect(AIRFRAME_STATS).toHaveProperty('vtol_airframe');
      expect(AIRFRAME_STATS).toHaveProperty('uav_airframe');
    });

    it('should have required properties for each airframe', () => {
      Object.values(AIRFRAME_STATS).forEach(airframe => {
        expect(airframe).toHaveProperty('multiplier');
        expect(airframe).toHaveProperty('baseSpeed');
        expect(airframe).toHaveProperty('baseCeiling');
        expect(airframe).toHaveProperty('baseRange');
        expect(airframe).toHaveProperty('baseFuel');
        expect(airframe).toHaveProperty('baseWeight');
        expect(airframe).toHaveProperty('baseCost');
        expect(airframe).toHaveProperty('crew');
        expect(airframe).toHaveProperty('carrierCapable');
        expect(airframe).toHaveProperty('catapultRequired');
        expect(airframe).toHaveProperty('arrestorHook');
        expect(airframe).toHaveProperty('vtolCapable');
        expect(airframe).toHaveProperty('stealthBase');
      });
    });
  });

  describe('ENGINE_STATS', () => {
    it('should have all engine types', () => {
      expect(ENGINE_STATS).toHaveProperty('piston_engine');
      expect(ENGINE_STATS).toHaveProperty('radial_engine');
      expect(ENGINE_STATS).toHaveProperty('inline_engine');
      expect(ENGINE_STATS).toHaveProperty('turbojet');
      expect(ENGINE_STATS).toHaveProperty('turbofan');
      expect(ENGINE_STATS).toHaveProperty('turboprop');
      expect(ENGINE_STATS).toHaveProperty('turboshaft');
      expect(ENGINE_STATS).toHaveProperty('ramjet');
      expect(ENGINE_STATS).toHaveProperty('scramjet');
    });

    it('should have required properties for each engine', () => {
      Object.values(ENGINE_STATS).forEach(engine => {
        expect(engine).toHaveProperty('thrust');
        expect(engine).toHaveProperty('speedBonus');
        expect(engine).toHaveProperty('ceilingBonus');
        expect(engine).toHaveProperty('fuelConsumption');
        expect(engine).toHaveProperty('cost');
        expect(engine).toHaveProperty('reliability');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle unknown airframe gracefully', () => {
      const stats = calculateAircraftStats(createMinimalDesign({ airframe: 'unknown' as AirframeType }));
      expect(stats).toBeDefined();
    });

    it('should handle unknown engine gracefully', () => {
      const stats = calculateAircraftStats(createMinimalDesign({ engine: 'unknown' as EngineType }));
      expect(stats).toBeDefined();
    });

    it('should handle empty modules', () => {
      const stats = calculateAircraftStats(createMinimalDesign({ modules: [] }));
      expect(stats).toBeDefined();
    });

    it('should handle UAV with zero crew', () => {
      const stats = calculateAircraftStats(createMinimalDesign({ airframe: 'uav_airframe' }));
      expect(stats.crew).toBeGreaterThanOrEqual(0);
    });
  });
});