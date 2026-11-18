export { calculateDivisionStats } from './division';
export {
  isDivisionValid,
  getValidationErrors,
  getValidationWarnings,
  getValidationInfo,
  validateDivision,
  calculateCombatWidth,
  type CalculationContext,
} from './division';
export { calculateEquipmentStats } from './equipment';
export { calculateDoctrineBonuses } from './doctrine';
export { calculateNationalSpiritBonuses } from './national-spirit';
export { applyModifiers } from './modifiers';
export { DOCTRINES } from './doctrine/data';
export { SUPPORT_COMPANY_TEMPLATES } from './division/data';
export { BATTALION_TEMPLATES } from './division/data-battalions';
export { EQUIPMENT_VARIANTS } from './equipment/data';
export { NATIONAL_SPIRITS } from './national-spirit/data';
export { STAT_DEFINITIONS } from '@generalstaff/shared-types';

// Tank Designer exports
export {
  calculateTankStats,
  createTankVariant,
  TANK_ROLES,
  type TankDesign,
  type TankRole,
  type ChassisType,
  type GunType,
  type EngineType,
  type SuspensionType,
  type ArmorLayout,
  type TankStats,
  type StabilizationLevel,
} from './tank';

// Air Designer exports
export {
  calculateAircraftStats,
  createAircraftVariant,
  AIRCRAFT_TYPES,
  type AircraftDesign,
  type AircraftType,
  type AircraftRole,
  type AirframeType,
  type EngineType as AircraftEngineType,
  type AircraftModule,
  type ModuleType as AircraftModuleType,
  type ModuleSlot as AircraftModuleSlot,
  type ModuleStats as AircraftModuleStats,
  type AircraftStats,
  type StealthLevel,
} from './air';

// Navy Designer exports
export {
  calculateShipStats,
  createShipVariant,
  SHIP_TYPES,
  type ShipDesign,
  type ShipType,
  type HullType,
  type ShipModule,
  type ModuleType as ShipModuleType,
  type ModuleSlot as ShipModuleSlot,
  type ModuleStats as ShipModuleStats,
  type ShipStats,
} from './navy';