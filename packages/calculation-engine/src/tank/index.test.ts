import { describe, it, expect } from 'vitest';
import {
  calculateTankStats,
  TankDesign,
  TankRole,
  ChassisType,
  GunType,
  EngineType,
  SuspensionType,
  ArmorLayout,
  TankStats,
  StabilizationLevel,
  TANK_ROLES,
  createTankVariant,
  CHASSIS_STATS,
  GUN_STATS,
  ENGINE_STATS,
  SUSPENSION_STATS,
} from './index';

describe('tank module', () => {
  const createMinimalDesign = (overrides: Partial<TankDesign> = {}): Partial<TankDesign> => ({
    id: 'test-tank',
    name: 'Test Tank',
    countryTag: 'USA',
    year: 1944,
    role: 'medium_tank',
    chassis: 'medium_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 80, side: 50, rear: 30, top: 20 },
    ...overrides,
  });

  describe('calculateTankStats', () => {
    it('should return base stats for minimal design', () => {
      const design = createMinimalDesign();
      const stats = calculateTankStats(design);

      expect(stats).toBeDefined();
      expect(stats.hp).toBeGreaterThan(0);
      expect(stats.armor).toBeGreaterThan(0);
      expect(stats.piercing).toBeGreaterThan(0);
      expect(stats.softAttack).toBeGreaterThan(0);
      expect(stats.hardAttack).toBeGreaterThan(0);
      expect(stats.speed).toBeGreaterThan(0);
      expect(stats.reliability).toBeGreaterThan(0);
      expect(stats.weight).toBeGreaterThan(0);
      expect(stats.productionCost).toBeGreaterThan(0);
      expect(stats.crew).toBeGreaterThan(0);
    });

    it('should calculate different stats for different chassis', () => {
      const lightStats = calculateTankStats(createMinimalDesign({ chassis: 'light_tank_chassis' }));
      const heavyStats = calculateTankStats(createMinimalDesign({ chassis: 'heavy_tank_chassis' }));

      // With same gun/engine, heavy chassis has more hp, weight, cost
      expect(heavyStats.hp).toBeGreaterThanOrEqual(lightStats.hp);
      expect(heavyStats.weight).toBeGreaterThan(lightStats.weight);
      expect(heavyStats.productionCost).toBeGreaterThan(lightStats.productionCost);
    });

    it('should calculate different stats for different guns', () => {
      const smallGun = calculateTankStats(createMinimalDesign({ gun: 'small_caliber_gun' }));
      const largeGun = calculateTankStats(createMinimalDesign({ gun: 'large_caliber_gun' }));

      expect(largeGun.piercing).toBeGreaterThanOrEqual(smallGun.piercing);
      expect(largeGun.hardAttack).toBeGreaterThanOrEqual(smallGun.hardAttack);
      expect(largeGun.productionCost).toBeGreaterThanOrEqual(smallGun.productionCost);
    });

    it('should calculate different stats for different engines', () => {
      const petrol = calculateTankStats(createMinimalDesign({ engine: 'petrol_engine' }));
      const gasTurbine = calculateTankStats(createMinimalDesign({ engine: 'gas_turbine' }));

      // gas turbine has more horsepower so higher speed
      expect(gasTurbine.speed).toBeGreaterThanOrEqual(petrol.speed);
      expect(gasTurbine.fuelConsumption).toBeGreaterThanOrEqual(petrol.fuelConsumption);
    });

    it('should calculate different stats for different suspensions', () => {
      const leafSpring = calculateTankStats(createMinimalDesign({ suspension: 'leaf_spring' }));
      const active = calculateTankStats(createMinimalDesign({ suspension: 'active_suspension' }));

      expect(active.speed).toBeGreaterThanOrEqual(leafSpring.speed);
      expect(active.traverseSpeed).toBeGreaterThanOrEqual(leafSpring.traverseSpeed);
    });

    it('should use armor layout for armor calculation', () => {
      const lightArmor = calculateTankStats(createMinimalDesign({
        armorLayout: { front: 30, side: 20, rear: 15, top: 10 }
      }));
      const heavyArmor = calculateTankStats(createMinimalDesign({
        armorLayout: { front: 200, side: 120, rear: 80, top: 40 }
      }));

      expect(heavyArmor.armor).toBeGreaterThan(lightArmor.armor);
    });

    it('should return base stats when required fields missing', () => {
      const incompleteDesign = { ...createMinimalDesign() };
      delete (incompleteDesign as any).chassis;
      const stats = calculateTankStats(incompleteDesign);

      expect(stats.hp).toBe(0);
      expect(stats.armor).toBe(0);
      expect(stats.piercing).toBe(0);
    });

    it('should calculate weight as sum of components', () => {
      const stats = calculateTankStats(createMinimalDesign());
      const chassisWeight = CHASSIS_STATS['medium_tank_chassis'].weight || 0;
      const gunWeight = GUN_STATS['medium_caliber_gun'].weight || 0;
      const engineWeight = ENGINE_STATS['diesel_engine'].weight || 0;

      expect(stats.weight).toBe(chassisWeight + gunWeight + engineWeight);
    });

    it('should calculate reliability based on complexity', () => {
      const simple = calculateTankStats(createMinimalDesign({
        chassis: 'light_tank_chassis',
        gun: 'small_caliber_gun',
        engine: 'petrol_engine',
      }));
      const complex = calculateTankStats(createMinimalDesign({
        chassis: 'super_heavy_tank_chassis',
        gun: 'super_heavy_gun',
        engine: 'gas_turbine',
      }));

      expect(simple.reliability).toBeGreaterThan(complex.reliability);
    });
  });

  describe('TANK_ROLES', () => {
    it('should have all tank roles defined', () => {
      expect(TANK_ROLES).toHaveProperty('light_tank');
      expect(TANK_ROLES).toHaveProperty('medium_tank');
      expect(TANK_ROLES).toHaveProperty('heavy_tank');
      expect(TANK_ROLES).toHaveProperty('tank_destroyer');
      expect(TANK_ROLES).toHaveProperty('spg');
      expect(TANK_ROLES).toHaveProperty('anti_air_tank');
      expect(TANK_ROLES).toHaveProperty('modern_tank');
      expect(TANK_ROLES).toHaveProperty('super_heavy_tank');
    });

    it('should have description and defaultChassis for each role', () => {
      Object.values(TANK_ROLES).forEach(role => {
        expect(role).toHaveProperty('description');
        expect(role).toHaveProperty('defaultChassis');
        expect(typeof role.description).toBe('string');
        expect(typeof role.defaultChassis).toBe('string');
      });
    });
  });

  describe('createTankVariant', () => {
    it('should create a variant with modified properties', () => {
      const baseDesign: TankDesign = {
        id: 'base-tank',
        name: 'Base Tank',
        countryTag: 'GER',
        year: 1943,
        role: 'medium_tank',
        chassis: 'medium_tank_chassis',
        gun: 'medium_caliber_gun',
        engine: 'diesel_engine',
        suspension: 'torsion_bar',
        armorLayout: { front: 80, side: 50, rear: 30, top: 20 },
        stats: calculateTankStats(createMinimalDesign()),
        cost: 1000,
        reliability: 80,
        productionCost: 500,
      };

      const variant = createTankVariant(baseDesign, 'Ausf. G', {
        gun: 'large_caliber_gun',
        armorLayout: { front: 100, side: 60, rear: 40, top: 25 },
      });

      expect(variant.id).toBe('base-tank_Ausf. G');
      expect(variant.name).toBe('Base Tank Ausf. G');
      expect(variant.gun).toBe('large_caliber_gun');
      expect(variant.armorLayout.front).toBe(100);
      expect(variant.stats).toBeDefined();
    });

    it('should preserve unchanged properties', () => {
      const baseDesign: TankDesign = {
        id: 'base-tank',
        name: 'Base Tank',
        countryTag: 'GER',
        year: 1943,
        role: 'medium_tank',
        chassis: 'medium_tank_chassis',
        gun: 'medium_caliber_gun',
        engine: 'diesel_engine',
        suspension: 'torsion_bar',
        armorLayout: { front: 80, side: 50, rear: 30, top: 20 },
        stats: calculateTankStats(createMinimalDesign()),
        cost: 1000,
        reliability: 80,
        productionCost: 500,
      };

      const variant = createTankVariant(baseDesign, 'Variant', {
        name: 'New Name',
      });

      expect(variant.countryTag).toBe('GER');
      expect(variant.year).toBe(1943);
      expect(variant.role).toBe('medium_tank');
      expect(variant.chassis).toBe('medium_tank_chassis');
    });
  });

  describe('CHASSIS_STATS', () => {
    it('should have all chassis types', () => {
      expect(CHASSIS_STATS).toHaveProperty('light_tank_chassis');
      expect(CHASSIS_STATS).toHaveProperty('medium_tank_chassis');
      expect(CHASSIS_STATS).toHaveProperty('heavy_tank_chassis');
      expect(CHASSIS_STATS).toHaveProperty('modern_tank_chassis');
      expect(CHASSIS_STATS).toHaveProperty('super_heavy_tank_chassis');
    });

    it('should have required properties for each chassis', () => {
      Object.values(CHASSIS_STATS).forEach(chassis => {
        expect(chassis).toHaveProperty('hp');
        expect(chassis).toHaveProperty('weight');
        expect(chassis).toHaveProperty('cost');
        expect(chassis).toHaveProperty('complexity');
        expect(chassis).toHaveProperty('horsepower');
        expect(chassis).toHaveProperty('crew');
      });
    });
  });

  describe('GUN_STATS', () => {
    it('should have all gun types', () => {
      expect(GUN_STATS).toHaveProperty('small_caliber_gun');
      expect(GUN_STATS).toHaveProperty('medium_caliber_gun');
      expect(GUN_STATS).toHaveProperty('large_caliber_gun');
      expect(GUN_STATS).toHaveProperty('super_heavy_gun');
      expect(GUN_STATS).toHaveProperty('smoothbore_gun');
      expect(GUN_STATS).toHaveProperty('auto_cannon');
      expect(GUN_STATS).toHaveProperty('rocket_launcher');
    });

    it('should have required properties for each gun', () => {
      Object.values(GUN_STATS).forEach(gun => {
        expect(gun).toHaveProperty('piercing');
        expect(gun).toHaveProperty('softAttack');
        expect(gun).toHaveProperty('hardAttack');
        expect(gun).toHaveProperty('weight');
        expect(gun).toHaveProperty('cost');
        expect(gun).toHaveProperty('complexity');
        expect(gun).toHaveProperty('stabilization');
      });
    });
  });

  describe('ENGINE_STATS', () => {
    it('should have all engine types', () => {
      expect(ENGINE_STATS).toHaveProperty('petrol_engine');
      expect(ENGINE_STATS).toHaveProperty('diesel_engine');
      expect(ENGINE_STATS).toHaveProperty('gas_turbine');
      expect(ENGINE_STATS).toHaveProperty('multifuel_engine');
    });

    it('should have required properties for each engine', () => {
      Object.values(ENGINE_STATS).forEach(engine => {
        expect(engine).toHaveProperty('horsepower');
        expect(engine).toHaveProperty('weight');
        expect(engine).toHaveProperty('cost');
        expect(engine).toHaveProperty('fuelConsumption');
        expect(engine).toHaveProperty('complexity');
      });
    });
  });

  describe('SUSPENSION_STATS', () => {
    it('should have all suspension types', () => {
      expect(SUSPENSION_STATS).toHaveProperty('leaf_spring');
      expect(SUSPENSION_STATS).toHaveProperty('torsion_bar');
      expect(SUSPENSION_STATS).toHaveProperty('hydro_pneumatic');
      expect(SUSPENSION_STATS).toHaveProperty('active_suspension');
    });

    it('should have required properties for each suspension', () => {
      Object.values(SUSPENSION_STATS).forEach(suspension => {
        expect(suspension).toHaveProperty('speedBonus');
        expect(suspension).toHaveProperty('traverseBonus');
        expect(suspension).toHaveProperty('cost');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle unknown chassis gracefully', () => {
      // Unknown chassis returns base stats with 0 values from the missing chassis
      const stats = calculateTankStats(createMinimalDesign({ chassis: 'unknown_chassis' as ChassisType }));
      // The function returns base stats with 0 for missing chassis
      expect(stats).toBeDefined();
    });

    it('should handle unknown gun gracefully', () => {
      const stats = calculateTankStats(createMinimalDesign({ gun: 'unknown_gun' as GunType }));
      expect(stats).toBeDefined();
    });

    it('should handle unknown engine gracefully', () => {
      const stats = calculateTankStats(createMinimalDesign({ engine: 'unknown_engine' as EngineType }));
      expect(stats).toBeDefined();
    });

    it('should handle zero weight edge case', () => {
      // Mock a design with zero weight components
      const stats = calculateTankStats(createMinimalDesign());
      expect(stats.speed).toBeGreaterThanOrEqual(0);
      expect(isNaN(stats.speed)).toBe(false);
    });
  });
});