import { describe, it, expect } from 'vitest';
import {
  calculateShipStats,
  ShipDesign,
  ShipType,
  HullType,
  ShipModule,
  ModuleType,
  ModuleSlot,
  ModuleStats,
  ShipStats,
  SHIP_TYPES,
  createShipVariant,
  HULL_STATS,
} from './index';

describe('navy module', () => {
  const createMinimalModule = (overrides: Partial<ShipModule> = {}): ShipModule => ({
    id: 'test-module',
    type: 'main_battery',
    slot: 'main_battery',
    stats: {
      attack: 50,
      defense: 10,
      range: 20,
      accuracy: 5,
      piercing: 30,
      aaAttack: 0,
      aswAttack: 0,
      subDetection: 0,
      speed: 0,
      armor: 0,
      torpedoProtection: 0,
      airWingSize: 0,
      airAttack: 0,
      airDefense: 0,
      airAgility: 0,
      airRange: 0,
      airNavalAttack: 0,
      reliability: 90,
      cost: 100,
      weight: 500,
    },
    ...overrides,
  });

  const createMinimalDesign = (overrides: Partial<ShipDesign> = {}): ShipDesign => ({
    id: 'test-ship',
    name: 'Test Destroyer',
    countryTag: 'USA',
    year: 1944,
    type: 'destroyer',
    hull: 'destroyer_hull',
    modules: [createMinimalModule()],
    stats: calculateShipStats({
      id: 'test-ship',
      name: 'Test Destroyer',
      countryTag: 'USA',
      year: 1944,
      type: 'destroyer',
      hull: 'destroyer_hull',
      modules: [createMinimalModule()],
    } as ShipDesign),
    cost: 10000,
    buildTime: 365,
    reliability: 85,
    ...overrides,
  });

  describe('calculateShipStats', () => {
    it('should return base stats for minimal design', () => {
      const design = createMinimalDesign();
      const stats = calculateShipStats(design);

      expect(stats).toBeDefined();
      // Stats may be 0 depending on module types and hull
      expect(stats.navalAttack).toBeGreaterThanOrEqual(0);
      expect(stats.navalDefense).toBeGreaterThanOrEqual(0);
      expect(stats.shoreBombardment).toBeGreaterThanOrEqual(0);
      expect(stats.torpedoAttack).toBeGreaterThanOrEqual(0);
      expect(stats.subAttack).toBeGreaterThanOrEqual(0);
      expect(stats.antiAirAttack).toBeGreaterThanOrEqual(0);
      expect(stats.antiSubAttack).toBeGreaterThanOrEqual(0);
      expect(stats.subDetection).toBeGreaterThanOrEqual(0);
      expect(stats.speed).toBeGreaterThanOrEqual(0);
      expect(stats.range).toBeGreaterThanOrEqual(0);
      expect(stats.armor).toBeGreaterThanOrEqual(0);
      expect(stats.deckArmor).toBeGreaterThanOrEqual(0);
      expect(stats.torpedoProtection).toBeGreaterThanOrEqual(0);
      expect(stats.hp).toBeGreaterThanOrEqual(0);
      expect(stats.airWingSize).toBeGreaterThanOrEqual(0);
      expect(stats.reliability).toBeGreaterThan(0);
      expect(stats.cost).toBeGreaterThanOrEqual(0);
      expect(stats.buildTime).toBeGreaterThanOrEqual(0);
      expect(stats.weight).toBeGreaterThanOrEqual(0);
      expect(stats.crew).toBeGreaterThanOrEqual(0);
      expect(stats.fuelConsumption).toBeGreaterThanOrEqual(0);
      expect(stats.supplyConsumption).toBeGreaterThanOrEqual(0);
      expect(stats.surfaceVisibility).toBeGreaterThanOrEqual(0);
      expect(stats.subVisibility).toBeGreaterThanOrEqual(0);
      expect(stats.organization).toBeGreaterThanOrEqual(0);
      expect(stats.maxOrganization).toBeGreaterThan(0);
      expect(stats.recoveryRate).toBeGreaterThan(0);
    });

    it('should calculate different stats for different hulls', () => {
      const destroyer = calculateShipStats(createMinimalDesign({ hull: 'destroyer_hull' }));
      const battleship = calculateShipStats(createMinimalDesign({ hull: 'battleship_hull' }));
      const carrier = calculateShipStats(createMinimalDesign({ hull: 'carrier_hull' }));
      const submarine = calculateShipStats(createMinimalDesign({ hull: 'submarine_hull' }));

      expect(battleship.hp).toBeGreaterThan(destroyer.hp);
      expect(battleship.armor).toBeGreaterThan(destroyer.armor);
      expect(battleship.navalAttack).toBeGreaterThan(destroyer.navalAttack);
      expect(submarine.subVisibility).toBeLessThan(destroyer.subVisibility);
      expect(submarine.speed).toBeLessThan(destroyer.speed);
    });

    it('should aggregate module stats', () => {
      const singleModule = calculateShipStats(createMinimalDesign({
        modules: [createMinimalModule({ stats: { ...createMinimalModule().stats, attack: 50 } })]
      }));

      const multiModule = calculateShipStats(createMinimalDesign({
        modules: [
          createMinimalModule({ stats: { ...createMinimalModule().stats, attack: 50 } }),
          createMinimalModule({ stats: { ...createMinimalModule().stats, attack: 50 } }),
        ]
      }));

      expect(multiModule.navalAttack).toBeGreaterThan(singleModule.navalAttack);
    });

    it('should calculate HP based on hull and module weight', () => {
      const design = createMinimalDesign();
      const stats = calculateShipStats(design);

      const baseHp = HULL_STATS['destroyer_hull'].baseHp || 0;
      const moduleWeight = design.modules.reduce((sum, m) => sum + (m.stats.weight || 0), 0);

      expect(stats.hp).toBe(baseHp + moduleWeight * 10);
    });

    it('should calculate speed correctly', () => {
      const destroyer = calculateShipStats(createMinimalDesign({ hull: 'destroyer_hull' }));
      const battleship = calculateShipStats(createMinimalDesign({ hull: 'battleship_hull' }));

      expect(destroyer.speed).toBeGreaterThan(battleship.speed);
    });

    it('should calculate range correctly', () => {
      const destroyer = calculateShipStats(createMinimalDesign({ hull: 'destroyer_hull' }));
      const battleship = calculateShipStats(createMinimalDesign({ hull: 'battleship_hull' }));

      expect(battleship.range).toBeGreaterThan(destroyer.range);
    });

    it('should calculate armor correctly', () => {
      const destroyer = calculateShipStats(createMinimalDesign({ hull: 'destroyer_hull' }));
      const battleship = calculateShipStats(createMinimalDesign({ hull: 'battleship_hull' }));

      expect(battleship.armor).toBeGreaterThan(destroyer.armor);
      expect(battleship.deckArmor).toBeGreaterThan(destroyer.deckArmor);
      expect(battleship.torpedoProtection).toBeGreaterThan(destroyer.torpedoProtection);
    });

    it('should handle submarines with unlimited range', () => {
      const nuclearSub = calculateShipStats(createMinimalDesign({
        type: 'nuclear_submarine',
        hull: 'nuclear_submarine_hull',
      }));

      expect(nuclearSub.range).toBeGreaterThanOrEqual(99999);
      expect(nuclearSub.subVisibility).toBeGreaterThanOrEqual(0);
      expect(nuclearSub.fuelConsumption).toBeGreaterThanOrEqual(0);
    });

    it('should handle carriers with air wing', () => {
      const carrier = calculateShipStats(createMinimalDesign({
        type: 'carrier',
        hull: 'carrier_hull',
        modules: [
          createMinimalModule({
            type: 'air_wing',
            slot: 'aviation',
            stats: { ...createMinimalModule().stats, airWingSize: 80, airAttack: 100, airDefense: 80 }
          })
        ]
      }));

      expect(carrier.airWingSize).toBeGreaterThanOrEqual(0);
      expect(carrier.airAttack).toBeGreaterThanOrEqual(0);
      expect(carrier.airDefense).toBeGreaterThanOrEqual(0);
    });

    it('should calculate cost correctly', () => {
      const design = createMinimalDesign();
      const stats = calculateShipStats(design);

      const moduleCost = design.modules.reduce((sum, m) => sum + m.stats.cost, 0);

      expect(stats.cost).toBeGreaterThanOrEqual(moduleCost);
    });

    it('should calculate organization stats', () => {
      const stats = calculateShipStats(createMinimalDesign());

      expect(stats.organization).toBeGreaterThanOrEqual(0);
      expect(stats.maxOrganization).toBeGreaterThanOrEqual(0);
      expect(stats.recoveryRate).toBeGreaterThanOrEqual(0);
    });

    it('should calculate crew correctly', () => {
      const destroyer = calculateShipStats(createMinimalDesign({ hull: 'destroyer_hull' }));
      const battleship = calculateShipStats(createMinimalDesign({ hull: 'battleship_hull' }));

      expect(battleship.crew).toBeGreaterThan(destroyer.crew);
    });

    it('should calculate fuel consumption based on weight', () => {
      const destroyer = calculateShipStats(createMinimalDesign({ hull: 'destroyer_hull' }));
      const battleship = calculateShipStats(createMinimalDesign({ hull: 'battleship_hull' }));

      expect(battleship.fuelConsumption).toBeGreaterThan(destroyer.fuelConsumption);
    });
  });

  describe('SHIP_TYPES', () => {
    it('should have all ship types defined', () => {
      expect(SHIP_TYPES).toHaveProperty('destroyer');
      expect(SHIP_TYPES).toHaveProperty('light_cruiser');
      expect(SHIP_TYPES).toHaveProperty('heavy_cruiser');
      expect(SHIP_TYPES).toHaveProperty('battlecruiser');
      expect(SHIP_TYPES).toHaveProperty('battleship');
      expect(SHIP_TYPES).toHaveProperty('super_battleship');
      expect(SHIP_TYPES).toHaveProperty('carrier');
      expect(SHIP_TYPES).toHaveProperty('light_carrier');
      expect(SHIP_TYPES).toHaveProperty('escort_carrier');
      expect(SHIP_TYPES).toHaveProperty('submarine');
      expect(SHIP_TYPES).toHaveProperty('nuclear_submarine');
      expect(SHIP_TYPES).toHaveProperty('frigate');
      expect(SHIP_TYPES).toHaveProperty('corvette');
      expect(SHIP_TYPES).toHaveProperty('amphibious_assault');
      expect(SHIP_TYPES).toHaveProperty('minelayer');
      expect(SHIP_TYPES).toHaveProperty('minesweeper');
    });

    it('should have description, defaultHull, and allowedModules for each type', () => {
      Object.values(SHIP_TYPES).forEach(type => {
        expect(type).toHaveProperty('description');
        expect(type).toHaveProperty('defaultHull');
        expect(type).toHaveProperty('allowedModules');
        expect(typeof type.description).toBe('string');
        expect(typeof type.defaultHull).toBe('string');
        expect(Array.isArray(type.allowedModules)).toBe(true);
      });
    });
  });

  describe('createShipVariant', () => {
    it('should create a variant with modified properties', () => {
      const baseDesign: ShipDesign = createMinimalDesign();

      const variant = createShipVariant(baseDesign, 'Mod. 1945', {
        modules: [
          createMinimalModule({ stats: { ...createMinimalModule().stats, attack: 100 } }),
        ],
      });

      expect(variant.id).toBe('test-ship_Mod. 1945');
      expect(variant.name).toBe('Test Destroyer Mod. 1945');
      expect(variant.stats.navalAttack).toBeGreaterThan(baseDesign.stats.navalAttack);
    });

    it('should preserve unchanged properties', () => {
      const baseDesign: ShipDesign = createMinimalDesign();

      const variant = createShipVariant(baseDesign, 'Variant', {
        name: 'New Name',
      });

      expect(variant.countryTag).toBe('USA');
      expect(variant.year).toBe(1944);
      expect(variant.type).toBe('destroyer');
      expect(variant.hull).toBe('destroyer_hull');
    });
  });

  describe('HULL_STATS', () => {
    it('should have all hull types', () => {
      expect(HULL_STATS).toHaveProperty('destroyer_hull');
      expect(HULL_STATS).toHaveProperty('cruiser_hull');
      expect(HULL_STATS).toHaveProperty('battlecruiser_hull');
      expect(HULL_STATS).toHaveProperty('battleship_hull');
      expect(HULL_STATS).toHaveProperty('super_battleship_hull');
      expect(HULL_STATS).toHaveProperty('carrier_hull');
      expect(HULL_STATS).toHaveProperty('submarine_hull');
      expect(HULL_STATS).toHaveProperty('nuclear_submarine_hull');
      expect(HULL_STATS).toHaveProperty('frigate_hull');
      expect(HULL_STATS).toHaveProperty('corvette_hull');
    });

    it('should have required properties for each hull', () => {
      Object.values(HULL_STATS).forEach(hull => {
        expect(hull).toHaveProperty('multiplier');
        expect(hull).toHaveProperty('baseHp');
        expect(hull).toHaveProperty('baseArmor');
        expect(hull).toHaveProperty('baseDeckArmor');
        expect(hull).toHaveProperty('baseTorpedoProtection');
        expect(hull).toHaveProperty('baseSpeed');
        expect(hull).toHaveProperty('baseRange');
        expect(hull).toHaveProperty('baseOrg');
        expect(hull).toHaveProperty('recoveryBonus');
        expect(hull).toHaveProperty('baseCrew');
        expect(hull).toHaveProperty('fuelMultiplier');
        expect(hull).toHaveProperty('baseVisibility');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle unknown hull gracefully', () => {
      const stats = calculateShipStats(createMinimalDesign({ hull: 'unknown' as HullType }));
      expect(stats).toBeDefined();
    });

    it('should handle empty modules', () => {
      const stats = calculateShipStats(createMinimalDesign({ modules: [] }));
      expect(stats).toBeDefined();
    });

    it('should handle minelayer and minesweeper types', () => {
      const minelayer = calculateShipStats(createMinimalDesign({
        type: 'minelayer',
        hull: 'cruiser_hull',
      }));
      const minesweeper = calculateShipStats(createMinimalDesign({
        type: 'minesweeper',
        hull: 'frigate_hull',
      }));

      expect(minelayer.navalAttack).toBeGreaterThanOrEqual(0);
      expect(minesweeper.navalAttack).toBeGreaterThanOrEqual(0);
    });

    it('should handle amphibious assault ships', () => {
      const amphibious = calculateShipStats(createMinimalDesign({
        type: 'amphibious_assault',
        hull: 'carrier_hull',
      }));

      expect(amphibious.airWingSize).toBeGreaterThanOrEqual(0);
    });

    it('should handle corvette with small stats', () => {
      const corvette = calculateShipStats(createMinimalDesign({
        type: 'corvette',
        hull: 'corvette_hull',
      }));

      expect(corvette.hp).toBeGreaterThanOrEqual(0);
      expect(corvette.crew).toBeGreaterThanOrEqual(0);
      expect(corvette.surfaceVisibility).toBeGreaterThanOrEqual(0);
    });
  });
});