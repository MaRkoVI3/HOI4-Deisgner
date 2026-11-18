// ============================================================================
// GeneralStaff — Shared Types
// Common types used across all packages
// ============================================================================

// Base entity types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// User & Auth
export interface User extends BaseEntity {
  email: string;
  username: string;
  avatarUrl?: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

// Country
export interface CountryTag {
  tag: string;
  name: string;
  color: string;
  flagUrl?: string;
  modifiers?: Record<string, number>;
}

export interface Country extends CountryTag {
  ideologies: string[];
  modifiers: Record<string, number>;
}

// Equipment
export type EquipmentCategory =
  | 'infantry_equipment'
  | 'support_equipment'
  | 'artillery_equipment'
  | 'armor_equipment'
  | 'motorized_equipment'
  | 'mechanized_equipment'
  | 'anti_air_equipment'
  | 'anti_tank_equipment'
  | 'rocket_artillery_equipment'
  | 'small_arms'
  | 'support'
  | 'artillery'
  | 'anti_tank'
  | 'anti_air'
  | 'rocket_artillery'
  | 'light_tank'
  | 'medium_tank'
  | 'heavy_tank'
  | 'motorized'
  | 'mechanized'
  | 'recon'
  | 'engineer'
  | 'military_police';

export interface EquipmentVariant extends BaseEntity {
  name: string;
  category: EquipmentCategory;
  countryTag: string;
  year: number;
  stats: EquipmentStats;
  cost: number;
  productionCost?: number;
  buildTime?: number;
}

// Internal calculation types
export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  countryTag: string;
  year: number;
  stats: EquipmentStats;
  cost: number;
  productionCost?: number;
  buildTime?: number;
}

// Type aliases for backward compatibility
export type SupportCompany = SupportCompanyInstance;
export type Battalion = BattalionInstance;

export interface EquipmentStats {
  softAttack: number;
  hardAttack: number;
  airAttack: number;
  defense: number;
  breakthrough: number;
  armor: number;
  piercing: number;
  reliability: number;
  ap?: number;
  recon?: number;
  entrenchment?: number;
  initiative?: number;
  suppression?: number;
  weight?: number;
  fuelConsumption?: number;
  organization?: number;
  recoveryRate?: number;
  supplyConsumption?: number;
  hp?: number;
  speed?: number;
  maxSpeed?: number;
  apAttack?: number;
  productionCost?: number;
  hardness?: number;
}

// Battalion
export interface BattalionTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  width: number;
  manpower: number;
  equipment: EquipmentCategory[];
  baseStats: BattalionStats;
  icon?: string;
}

export interface BattalionStats {
  hp: number;
  org: number;
  recoveryRate: number;
  recon: number;
  suppression: number;
  weight: number;
  supplyConsumption: number;
  softAttack: number;
  hardAttack: number;
  airAttack: number;
  defense: number;
  breakthrough: number;
  armor: number;
  hardness: number;
  apAttack: number;
  initiative: number;
  entrenchment: number;
  speed: number;
  fuelConsumption: number;
  productionCost?: number;
  piercing: number;
}

export interface BattalionInstance extends BaseEntity {
  templateId: string;
  template_id?: string;
  count: number;
  equipmentAssignments: Record<EquipmentCategory, string | undefined>;
  equipment_assignments?: Record<EquipmentCategory, string | undefined>;
  customName?: string;
}

// Support Company
export type SupportCompanyType =
  | 'recon'
  | 'engineer'
  | 'maintenance'
  | 'logistics'
  | 'signal'
  | 'hospital'
  | 'military_police'
  | 'anti_air'
  | 'anti_tank'
  | 'artillery'
  | 'rocket_artillery';

export interface SupportCompanyTemplate {
  id: SupportCompanyType;
  type: SupportCompanyType;
  name: string;
  description: string;
  width: number;
  equipment?: EquipmentCategory;
  stats: SupportCompanyStats;
  icon?: string;
}

export interface SupportCompanyStats {
  hp?: number;
  org?: number;
  recoveryRate?: number;
  recon?: number;
  suppression?: number;
  weight?: number;
  supplyConsumption?: number;
  softAttack?: number;
  hardAttack?: number;
  airAttack?: number;
  airDefense?: number;
  defense?: number;
  breakthrough?: number;
  armor?: number;
  hardness?: number;
  initiative?: number;
  entrenchment?: number;
  speed?: number;
  fuelConsumption?: number;
  reliability?: number;
  experienceLossFactor?: number;
  productionCost?: number;
  apAttack?: number;
  planningSpeed?: number;
  maxPlanning?: number;
  piercing?: number;
}

export interface SupportCompanyInstance extends BaseEntity {
  templateId: SupportCompanyType;
  template_id?: SupportCompanyType;
  equipmentVariantId?: string;
  equipment_variant_id?: string;
}

// Doctrine
export interface Doctrine extends BaseEntity {
  id: string;
  name: string;
  description: string;
  countryTag: string;
  group: string;
  tier: number;
  cost: number;
  modifiers: DoctrineModifiers;
  bonuses?: DoctrineBonus[];
  prerequisites: string[];
  mutuallyExclusive?: string[];
  icon?: string;
}

export interface DoctrineModifiers {
  // Battalion modifiers
  infantryAttack?: number;
  infantryDefense?: number;
  infantryBreakthrough?: number;
  armorAttack?: number;
  armorDefense?: number;
  armorBreakthrough?: number;
  artilleryAttack?: number;
  artilleryDefense?: number;
  // Support modifiers
  supportAttack?: number;
  supportDefense?: number;
  // General
  orgGain?: number;
  recoveryRate?: number;
  maxOrg?: number;
  supplyConsumption?: number;
  divisionAttack?: number;
  divisionDefense?: number;
  divisionBreakthrough?: number;
  planningSpeed?: number;
  maxPlanning?: number;
  entrenchment?: number;
  recon?: number;
  suppression?: number;
  fuelConsumption?: number;
  [key: string]: number | undefined;
}

// Backward compatibility aliases
export interface DoctrineBonus {
  name: string;
  description: string;
  modifiers: DoctrineModifier[];
}

export interface DoctrineModifier {
  stat: string;
  value: number;
  isPercentage: boolean;
}

export interface DoctrineSelection extends BaseEntity {
  doctrineId: string;
}

// National Spirit
export interface NationalSpirit extends BaseEntity {
  id: string;
  name: string;
  description: string;
  countryTag: string;
  modifiers: SpiritModifiers | SpiritModifier[];
  category?: string;
  icon?: string;
}

export interface SpiritModifiers {
  // Country level
  consumerGoods?: number;
  factoryOutput?: number;
  constructionSpeed?: number;
  researchSpeed?: number;
  politicalPowerGain?: number;
  stability?: number;
  warSupport?: number;
  // Military
  divisionAttack?: number;
  divisionDefense?: number;
  divisionBreakthrough?: number;
  orgGain?: number;
  recoveryRate?: number;
  maxOrg?: number;
  supplyConsumption?: number;
  planningSpeed?: number;
  maxPlanning?: number;
  entrenchment?: number;
  recon?: number;
  suppression?: number;
  fuelConsumption?: number;
  // Equipment
  equipmentCost?: number;
  equipmentReliability?: number;
  // Manpower
  recruitablePopulationFactor?: number;
  manpowerGain?: number;
  // Air
  airAttack?: number;
  airDefense?: number;
  airAgility?: number;
  airBombing?: number;
  airRange?: number;
  airSuperiority?: number;
  // Navy
  navalAttack?: number;
  navalDefense?: number;
  navalSpeed?: number;
  navalRange?: number;
  shoreBombardment?: number;
  subAttack?: number;
  subDetection?: number;
  [key: string]: number | undefined;
}

// Backward compatibility aliases
export type NationalSpiritModifiers = SpiritModifiers;

export interface SpiritModifier {
  stat: string;
  value: number;
  isPercentage: boolean;
}

export interface NationalSpiritInstance extends BaseEntity {
  spiritId: string;
}

// Technology
export interface Technology extends BaseEntity {
  id: string;
  name: string;
  description: string;
  countryTag?: string;
  year: number;
  cost: number;
  category: string;
  modifiers: TechnologyModifiers;
  prerequisites: string[];
  unlocks?: string[];
  icon?: string;
}

export interface TechnologyModifiers {
  // Equipment
  infantryEquipment?: EquipmentStatModifiers;
  supportEquipment?: EquipmentStatModifiers;
  artilleryEquipment?: EquipmentStatModifiers;
  armorEquipment?: EquipmentStatModifiers;
  motorizedEquipment?: EquipmentStatModifiers;
  mechanizedEquipment?: EquipmentStatModifiers;
  antiAirEquipment?: EquipmentStatModifiers;
  antiTankEquipment?: EquipmentStatModifiers;
  rocketArtilleryEquipment?: EquipmentStatModifiers;
  // General
  divisionAttack?: number;
  divisionDefense?: number;
  divisionBreakthrough?: number;
  orgGain?: number;
  recoveryRate?: number;
  maxOrg?: number;
  supplyConsumption?: number;
  planningSpeed?: number;
  maxPlanning?: number;
  entrenchment?: number;
  recon?: number;
  suppression?: number;
  fuelConsumption?: number;
  [key: string]: any;
}

export interface EquipmentStatModifiers {
  softAttack?: number;
  hardAttack?: number;
  airAttack?: number;
  defense?: number;
  breakthrough?: number;
  armor?: number;
  piercing?: number;
  reliability?: number;
  ap?: number;
  recon?: number;
  entrenchment?: number;
  initiative?: number;
  suppression?: number;
  weight?: number;
  fuelConsumption?: number;
  cost?: number;
}

export interface TechnologyInstance extends BaseEntity {
  technologyId: string;
}

// Division
export interface DivisionTemplate extends BaseEntity {
  name: string;
  description: string;
  country?: CountryTag;
  battalions: BattalionInstance[];
  supportCompanies: SupportCompanyInstance[];
  doctrineSelections: string[];
  nationalSpirits: string[];
  technologies: string[];
  version: number;
  isPublic: boolean;
  ownerId: string;
  statsSnapshot?: DivisionStats;
  combatWidth?: number;
}

export interface DivisionStats {
  // Combat stats
  softAttack: number;
  hardAttack: number;
  airAttack: number;
  defense: number;
  breakthrough: number;
  armor: number;
  hardness: number;
  piercing: number;

  // Organization
  organization: number;
  maxOrganization: number;
  recoveryRate: number;

  // Supply & Logistics
  supplyConsumption: number;
  fuelConsumption: number;
  weight: number;

  // Combat width
  combatWidth: number;

  // Special
  recon: number;
  suppression: number;
  entrenchment: number;
  initiative: number;
  speed: number;
  maxSpeed: number;
  hp: number;
  apAttack: number;

  // Manpower
  manpower: number;

  // Cost
  productionCost: number;
  icCost: number;

  // Meta
  battalionCount: number;
  supportCompanyCount: number;

  // Validation
  isValid: boolean;
  validationIssues: ValidationIssue[];
}

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  autoFix?: () => void;
}

export interface Division extends BaseEntity {
  name: string;
  description: string;
  country: CountryTag;
  battalions: BattalionInstance[];
  supportCompanies: SupportCompanyInstance[];
  doctrines: DoctrineSelection[];
  spirits: NationalSpiritInstance[];
  technologies: TechnologyInstance[];
  version: number;
  isPublic: boolean;
  ownerId: string;
  owner?: User;
  stats?: DivisionStats;
}

export interface DivisionListResponse extends PaginatedResponse<Division> {}

// Share
export interface ShareLink extends BaseEntity {
  slug: string;
  divisionId: string;
  expiresAt: string;
  viewCount: number;
  division?: Division;
}

// Analysis
export interface Analysis extends BaseEntity {
  divisionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: AnalysisResults;
  error?: string;
}

export interface AnalysisResults {
  overallScore: number;
  categoryScores: {
    offense: number;
    defense: number;
    mobility: number;
    logistics: number;
    costEfficiency: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  matchups: MatchupAnalysis[];
}

export interface MatchupAnalysis {
  enemyType: string;
  winRate: number;
  avgCombatDuration: number;
  keyFactors: string[];
}

// Static data
export interface StaticDataResponse {
  data: any[];
}

// Stat Definitions
export interface StatDefinition {
  key: keyof DivisionStats | string;
  label: string;
  unit: string;
  description: string;
  lowerIsBetter: boolean;
  format: (value: number) => string;
}

export const STAT_DEFINITIONS: Record<keyof DivisionStats | string, StatDefinition> = {
  hp: { key: 'hp', label: 'HP', unit: '', description: 'Hit points of the division', lowerIsBetter: false, format: (v) => v.toFixed(0) },
  organization: { key: 'organization', label: 'Org', unit: '', description: 'Organization level', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  maxOrganization: { key: 'maxOrganization', label: 'Max Org', unit: '', description: 'Maximum organization', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  recoveryRate: { key: 'recoveryRate', label: 'Recovery', unit: '/hr', description: 'Organization recovery rate per hour', lowerIsBetter: false, format: (v) => v.toFixed(2) },
  reconnaissance: { key: 'reconnaissance', label: 'Recon', unit: '', description: 'Reconnaissance value', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  recon: { key: 'recon', label: 'Recon', unit: '', description: 'Reconnaissance value', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  weight: { key: 'weight', label: 'Weight', unit: 'k', description: 'Total weight in kilotons', lowerIsBetter: true, format: (v) => (v / 1000).toFixed(1) },
  supplyUse: { key: 'supplyUse', label: 'Supply', unit: '/day', description: 'Daily supply consumption', lowerIsBetter: true, format: (v) => v.toFixed(1) },
  supplyConsumption: { key: 'supplyConsumption', label: 'Supply', unit: '/day', description: 'Daily supply consumption', lowerIsBetter: true, format: (v) => v.toFixed(1) },
  fuelUse: { key: 'fuelUse', label: 'Fuel', unit: '/day', description: 'Daily fuel consumption', lowerIsBetter: true, format: (v) => v.toFixed(1) },
  fuelConsumption: { key: 'fuelConsumption', label: 'Fuel', unit: '/day', description: 'Daily fuel consumption', lowerIsBetter: true, format: (v) => v.toFixed(1) },
  speed: { key: 'speed', label: 'Speed', unit: 'km/h', description: 'Maximum speed', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  defense: { key: 'defense', label: 'Defense', unit: '', description: 'Defense value', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  breakthrough: { key: 'breakthrough', label: 'Breakthrough', unit: '', description: 'Breakthrough value', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  softAttack: { key: 'softAttack', label: 'Soft Attack', unit: '', description: 'Attack against soft targets', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  hardAttack: { key: 'hardAttack', label: 'Hard Attack', unit: '', description: 'Attack against armored targets', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  airAttack: { key: 'airAttack', label: 'Air Attack', unit: '', description: 'Attack against air targets', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  armor: { key: 'armor', label: 'Armor', unit: '', description: 'Armor value', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  piercing: { key: 'piercing', label: 'Piercing', unit: '', description: 'Armor piercing value', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  hardness: { key: 'hardness', label: 'Hardness', unit: '%', description: 'Percentage of hard attack used', lowerIsBetter: false, format: (v) => (v * 100).toFixed(1) },
  entrenchment: { key: 'entrenchment', label: 'Entrenchment', unit: '', description: 'Entrenchment bonus', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  initiative: { key: 'initiative', label: 'Initiative', unit: '', description: 'Combat initiative', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  maxSpeed: { key: 'maxSpeed', label: 'Max Speed', unit: 'km/h', description: 'Maximum strategic speed', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  combatWidth: { key: 'combatWidth', label: 'Combat Width', unit: '', description: 'Combat width of the division', lowerIsBetter: false, format: (v) => v.toFixed(0) },
  suppression: { key: 'suppression', label: 'Suppression', unit: '', description: 'Suppression value', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  apAttack: { key: 'apAttack', label: 'AP Attack', unit: '', description: 'Armor piercing attack', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  manpower: { key: 'manpower', label: 'Manpower', unit: '', description: 'Manpower required', lowerIsBetter: true, format: (v) => v.toFixed(0) },
  productionCost: { key: 'productionCost', label: 'Prod Cost', unit: 'IC', description: 'Production cost in IC', lowerIsBetter: true, format: (v) => v.toFixed(0) },
  icCost: { key: 'icCost', label: 'IC Cost', unit: 'IC', description: 'Industrial capacity cost', lowerIsBetter: true, format: (v) => v.toFixed(0) },
  battalionCount: { key: 'battalionCount', label: 'Battalions', unit: '', description: 'Number of battalions', lowerIsBetter: false, format: (v) => v.toFixed(0) },
  supportCompanyCount: { key: 'supportCompanyCount', label: 'Support', unit: '', description: 'Number of support companies', lowerIsBetter: false, format: (v) => v.toFixed(0) },
  isValid: { key: 'isValid', label: 'Valid', unit: '', description: 'Whether the division is valid', lowerIsBetter: false, format: (v) => v ? 'Yes' : 'No' },
};

// API Error
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, any>;
}

