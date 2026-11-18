'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Input,
  Badge,
  Tooltip,
  TooltipProvider,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  cn,
} from '@generalstaff/ui-components';
import {
  Plus,
  Trash2,
  Download,
  BarChart2,
  Radar,
  Activity,
  FileText,
  Eye,
  EyeOff,
  Box,
  Anchor,
  Plane,
} from 'lucide-react';
import type {
  DivisionTemplate,
  DivisionStats,
  CountryTag,
  EquipmentCategory,
} from '@generalstaff/shared-types';
import {
  calculateDivisionStats,
  calculateTankStats,
  calculateAircraftStats,
  calculateShipStats,
  BATTALION_TEMPLATES,
  SUPPORT_COMPANY_TEMPLATES,
  EQUIPMENT_VARIANTS,
  DOCTRINES,
  NATIONAL_SPIRITS,
  TANK_ROLES,
  AIRCRAFT_TYPES,
  SHIP_TYPES,
  type TankDesign,
  type AircraftDesign,
  type ShipDesign,
  type TankStats,
  type AircraftStats,
  type ShipStats,
  type CalculationContext,
} from '@generalstaff/calculation-engine';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RadarComponent,
  LineChart,
  Line,
  Cell,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

type DesignType = 'division' | 'tank' | 'air' | 'navy';

interface ComparisonItem<T> {
  id: string;
  name: string;
  design: T;
  stats: DivisionStats | TankStats | AircraftStats | ShipStats;
  color: string;
  visible: boolean;
}

interface StatDef {
  key: string;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
  format: (value: number) => string;
}

// Chart color palette
const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

const COUNTRIES: CountryTag[] = [
  { tag: 'GER', name: 'Germany', color: '#000000' },
  { tag: 'SOV', name: 'Soviet Union', color: '#CC0000' },
  { tag: 'USA', name: 'United States', color: '#002868' },
  { tag: 'ENG', name: 'United Kingdom', color: '#00247D' },
  { tag: 'FRA', name: 'France', color: '#0055A4' },
  { tag: 'JPN', name: 'Japan', color: '#BC002D' },
  { tag: 'ITA', name: 'Italy', color: '#009246' },
];

// Empty equipment assignments helper
const emptyEquipmentAssignments: Record<EquipmentCategory, string | undefined> = {
  infantry_equipment: undefined,
  support_equipment: undefined,
  artillery_equipment: undefined,
  armor_equipment: undefined,
  motorized_equipment: undefined,
  mechanized_equipment: undefined,
  anti_air_equipment: undefined,
  anti_tank_equipment: undefined,
  rocket_artillery_equipment: undefined,
  small_arms: undefined,
  support: undefined,
  artillery: undefined,
  anti_tank: undefined,
  anti_air: undefined,
  rocket_artillery: undefined,
  light_tank: undefined,
  medium_tank: undefined,
  heavy_tank: undefined,
  motorized: undefined,
  mechanized: undefined,
  recon: undefined,
  engineer: undefined,
  military_police: undefined,
};

// Mock designs for demonstration
const createMockDivision = (name: string, country: string = 'GER'): DivisionTemplate => ({
  id: `div_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  description: '',
  country: COUNTRIES.find(c => c.tag === country) || { tag: country, name: country, color: '#000000' },
  battalions: [
    { id: '1', templateId: 'inf_1936', count: 7, equipmentAssignments: { ...emptyEquipmentAssignments }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', templateId: 'art_1936', count: 2, equipmentAssignments: { ...emptyEquipmentAssignments }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  supportCompanies: [
    { id: '1', templateId: 'engineer', equipmentVariantId: 'eng_1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', templateId: 'recon', equipmentVariantId: 'rec_1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  doctrineSelections: [],
  nationalSpirits: [],
  technologies: [],
  version: 1,
  isPublic: false,
  ownerId: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createMockTank = (name: string, role: TankDesign['role'] = 'medium_tank'): TankDesign => ({
  id: `tank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  countryTag: 'GER',
  year: 1936,
  role,
  chassis: TANK_ROLES[role].defaultChassis,
  gun: 'medium_caliber_gun',
  armorLayout: { front: 50, side: 30, rear: 20, top: 15 },
  engine: 'diesel_engine',
  suspension: 'torsion_bar',
  stats: calculateTankStats({
    chassis: TANK_ROLES[role].defaultChassis,
    gun: 'medium_caliber_gun',
    armorLayout: { front: 50, side: 30, rear: 20, top: 15 },
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
  }),
  cost: 400,
  reliability: 80,
  productionCost: 400,
});

const createMockAircraft = (name: string, type: AircraftDesign['type'] = 'fighter'): AircraftDesign => ({
  id: `air_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  countryTag: 'GER',
  year: 1936,
  type,
  role: AIRCRAFT_TYPES[type].defaultRole,
  airframe: AIRCRAFT_TYPES[type].defaultAirframe,
  engine: 'inline_engine',
  modules: [],
  stats: calculateAircraftStats({
    id: '',
    name: '',
    countryTag: 'GER',
    year: 1936,
    type,
    role: AIRCRAFT_TYPES[type].defaultRole,
    airframe: AIRCRAFT_TYPES[type].defaultAirframe,
    engine: 'inline_engine',
    modules: [],
    stats: {} as AircraftStats,
    cost: 0,
    buildTime: 0,
    reliability: 0,
  }),
  cost: 200,
  buildTime: 100,
  reliability: 85,
});

const createMockShip = (name: string, type: ShipDesign['type'] = 'heavy_cruiser'): ShipDesign => ({
  id: `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  countryTag: 'GER',
  year: 1936,
  type,
  hull: SHIP_TYPES[type].defaultHull,
  modules: [],
  stats: calculateShipStats({
    id: '',
    name: '',
    countryTag: 'GER',
    year: 1936,
    type,
    hull: SHIP_TYPES[type].defaultHull,
    modules: [],
    stats: {} as ShipStats,
    cost: 0,
    buildTime: 0,
    reliability: 0,
  }),
  cost: 5000,
  buildTime: 500,
  reliability: 85,
});

// ============================================================================
// Analysis Component
// ============================================================================

export default function Analysis() {
  // Active design type tab
  const [activeDesignType, setActiveDesignType] = useState<DesignType>('division');

  // Comparison items for each type
  const [divisionComparisons, setDivisionComparisons] = useState<ComparisonItem<DivisionTemplate>[]>([
    { id: '1', name: 'Standard Infantry', design: createMockDivision('Standard Infantry'), stats: {} as DivisionStats, color: CHART_COLORS[0], visible: true },
    { id: '2', name: 'Armored Division', design: createMockDivision('Armored Division', 'GER'), stats: {} as DivisionStats, color: CHART_COLORS[1], visible: true },
  ]);

  const [tankComparisons, setTankComparisons] = useState<ComparisonItem<TankDesign>[]>([
    { id: '1', name: 'Medium Tank I', design: createMockTank('Medium Tank I', 'medium_tank'), stats: {} as TankStats, color: CHART_COLORS[0], visible: true },
    { id: '2', name: 'Heavy Tank I', design: createMockTank('Heavy Tank I', 'heavy_tank'), stats: {} as TankStats, color: CHART_COLORS[1], visible: true },
  ]);

  const [airComparisons, setAirComparisons] = useState<ComparisonItem<AircraftDesign>[]>([
    { id: '1', name: 'Fighter I', design: createMockAircraft('Fighter I', 'fighter'), stats: {} as AircraftStats, color: CHART_COLORS[0], visible: true },
    { id: '2', name: 'CAS I', design: createMockAircraft('CAS I', 'cas'), stats: {} as AircraftStats, color: CHART_COLORS[1], visible: true },
  ]);

  const [navyComparisons, setNavyComparisons] = useState<ComparisonItem<ShipDesign>[]>([
    { id: '1', name: 'Heavy Cruiser', design: createMockShip('Heavy Cruiser', 'heavy_cruiser'), stats: {} as ShipStats, color: CHART_COLORS[0], visible: true },
    { id: '2', name: 'Battleship', design: createMockShip('Battleship', 'battleship'), stats: {} as ShipStats, color: CHART_COLORS[1], visible: true },
  ]);

  // Chart type
  const [chartType, setChartType] = useState<'bar' | 'radar' | 'line'>('bar');

  // Show values toggle
  const [showValues, setShowValues] = useState(true);

  // Calculation context for divisions
  const divisionContext: CalculationContext = useMemo(() => ({
    battalionTemplates: Object.fromEntries(Object.values(BATTALION_TEMPLATES).map(t => [t.type, t])),
    supportCompanyTemplates: Object.fromEntries(Object.values(SUPPORT_COMPANY_TEMPLATES).map(t => [t.type, t])),
    equipmentVariants: Object.fromEntries(EQUIPMENT_VARIANTS.map(e => [e.id, e])),
    doctrines: Object.fromEntries(DOCTRINES.map(d => [d.id, d])),
    nationalSpirits: Object.fromEntries(NATIONAL_SPIRITS.map(s => [s.id, s])),
    technologies: {},
    country: COUNTRIES[0],
  }), []);

  // Calculate stats for all comparisons
  const calculatedDivisions = useMemo(() =>
    divisionComparisons.map(item => ({
      ...item,
      stats: calculateDivisionStats(item.design, divisionContext),
    }))
  , [divisionComparisons, divisionContext]);

  const calculatedTanks = useMemo(() =>
    tankComparisons.map(item => ({
      ...item,
      stats: calculateTankStats(item.design),
    }))
  , [tankComparisons]);

  const calculatedAir = useMemo(() =>
    airComparisons.map(item => ({
      ...item,
      stats: calculateAircraftStats(item.design),
    }))
  , [airComparisons]);

  const calculatedNavy = useMemo(() =>
    navyComparisons.map(item => ({
      ...item,
      stats: calculateShipStats(item.design),
    }))
  , [navyComparisons]);

  // Get current comparisons based on active tab
  const currentComparisons = useMemo(() => {
    switch (activeDesignType) {
      case 'division': return calculatedDivisions;
      case 'tank': return calculatedTanks;
      case 'air': return calculatedAir;
      case 'navy': return calculatedNavy;
    }
  }, [activeDesignType, calculatedDivisions, calculatedTanks, calculatedAir, calculatedNavy]);

  const visibleComparisons = currentComparisons.filter(c => c.visible);

  // Stat definitions for each type
  const divisionStatKeys: StatDef[] = [
    { key: 'softAttack', label: 'Soft Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'hardAttack', label: 'Hard Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'airAttack', label: 'Air Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'defense', label: 'Defense', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'breakthrough', label: 'Breakthrough', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'armor', label: 'Armor', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'piercing', label: 'Piercing', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'organization', label: 'Organization', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'hp', label: 'HP', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'recon', label: 'Recon', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'suppression', label: 'Suppression', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'speed', label: 'Speed', unit: 'km/h', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'combatWidth', label: 'Combat Width', unit: '', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'supplyConsumption', label: 'Supply', unit: '/day', lowerIsBetter: true, format: (v: number) => v.toFixed(1) },
    { key: 'fuelConsumption', label: 'Fuel', unit: '/day', lowerIsBetter: true, format: (v: number) => v.toFixed(1) },
    { key: 'icCost', label: 'IC Cost', unit: 'IC', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'manpower', label: 'Manpower', unit: '', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
  ];

  const tankStatKeys: StatDef[] = [
    { key: 'hp', label: 'HP', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'armor', label: 'Armor', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'piercing', label: 'Piercing', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'softAttack', label: 'Soft Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'hardAttack', label: 'Hard Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'airAttack', label: 'Air Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'defense', label: 'Defense', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'breakthrough', label: 'Breakthrough', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'speed', label: 'Speed', unit: 'km/h', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'reliability', label: 'Reliability', unit: '%', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'weight', label: 'Weight', unit: 't', lowerIsBetter: true, format: (v: number) => v.toFixed(1) },
    { key: 'fuelConsumption', label: 'Fuel/day', unit: '', lowerIsBetter: true, format: (v: number) => v.toFixed(1) },
    { key: 'productionCost', label: 'Cost', unit: 'IC', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'crew', label: 'Crew', unit: '', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'ammoCapacity', label: 'Ammo', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'fireRate', label: 'Fire Rate', unit: '/min', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
  ];

  const airStatKeys: StatDef[] = [
    { key: 'airAttack', label: 'Air Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'airDefense', label: 'Air Defense', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'agility', label: 'Agility', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'speed', label: 'Cruise Speed', unit: 'km/h', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'maxSpeed', label: 'Max Speed', unit: 'km/h', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'climbRate', label: 'Climb Rate', unit: 'm/min', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'ceiling', label: 'Ceiling', unit: 'm', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'turnRate', label: 'Turn Rate', unit: '°/s', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'groundAttack', label: 'Ground Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'navalAttack', label: 'Naval Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'armorPenetration', label: 'Armor Pen.', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'strategicAttack', label: 'Strategic Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'range', label: 'Range', unit: 'km', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'combatRange', label: 'Combat Range', unit: 'km', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'radarRange', label: 'Radar Range', unit: 'km', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'radarCrossSection', label: 'RCS', unit: 'm²', lowerIsBetter: true, format: (v: number) => v.toFixed(1) },
    { key: 'reliability', label: 'Reliability', unit: '%', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'cost', label: 'Cost', unit: 'IC', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'weight', label: 'Weight', unit: 'kg', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
  ];

  const navyStatKeys: StatDef[] = [
    { key: 'navalAttack', label: 'Naval Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'navalDefense', label: 'Naval Defense', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'shoreBombardment', label: 'Shore Bombard', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'torpedoAttack', label: 'Torpedo Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'antiAirAttack', label: 'AA Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'antiSubAttack', label: 'ASW Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'subDetection', label: 'Sub Detection', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'speed', label: 'Speed', unit: 'kn', lowerIsBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'range', label: 'Range', unit: 'km', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'armor', label: 'Armor', unit: 'mm', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'deckArmor', label: 'Deck Armor', unit: 'mm', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'torpedoProtection', label: 'Torpedo Prot.', unit: '%', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'hp', label: 'HP', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'airWingSize', label: 'Air Wing', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'airAttack', label: 'Air Attack', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'airDefense', label: 'Air Defense', unit: '', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'reliability', label: 'Reliability', unit: '%', lowerIsBetter: false, format: (v: number) => v.toFixed(0) },
    { key: 'cost', label: 'Cost', unit: 'IC', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'buildTime', label: 'Build Time', unit: 'days', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'weight', label: 'Displacement', unit: 'kt', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
    { key: 'crew', label: 'Crew', unit: '', lowerIsBetter: true, format: (v: number) => v.toFixed(0) },
  ];

  // Get stat keys for current type
  const currentStatKeys = useMemo((): StatDef[] => {
    switch (activeDesignType) {
      case 'division': return divisionStatKeys;
      case 'tank': return tankStatKeys;
      case 'air': return airStatKeys;
      case 'navy': return navyStatKeys;
    }
  }, [activeDesignType]);

  // Generate comparison data for charts
  const chartData = useMemo(() => {
    return currentStatKeys.map(statDef => {
      const values = visibleComparisons.map(item => ({
        name: item.name,
        value: (item.stats as unknown as Record<string, number>)[statDef.key] ?? 0,
        color: item.color,
        fullName: item.name,
      }));
      return {
        stat: statDef.key,
        label: statDef.label,
        unit: statDef.unit,
        lowerIsBetter: statDef.lowerIsBetter,
        format: statDef.format,
        values,
      };
    });
  }, [currentStatKeys, visibleComparisons]);

  // Handlers
  const addComparison = useCallback((type: DesignType) => {
    const newId = Date.now().toString();
    const colorIndex = (type === 'division' ? divisionComparisons.length :
      type === 'tank' ? tankComparisons.length :
      type === 'air' ? airComparisons.length :
      navyComparisons.length) % CHART_COLORS.length;

    const newItem: ComparisonItem<DivisionTemplate | TankDesign | AircraftDesign | ShipDesign> = {
      id: newId,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} ${newId.slice(-4)}`,
      design: type === 'division' ? createMockDivision(`New Division ${newId.slice(-4)}`) :
        type === 'tank' ? createMockTank(`New Tank ${newId.slice(-4)}`) :
        type === 'air' ? createMockAircraft(`New Aircraft ${newId.slice(-4)}`) :
        createMockShip(`New Ship ${newId.slice(-4)}`),
      stats: {} as DivisionStats | TankStats | AircraftStats | ShipStats,
      color: CHART_COLORS[colorIndex],
      visible: true,
    };

    switch (type) {
      case 'division':
        setDivisionComparisons(prev => [...prev, newItem as ComparisonItem<DivisionTemplate>]);
        break;
      case 'tank':
        setTankComparisons(prev => [...prev, newItem as ComparisonItem<TankDesign>]);
        break;
      case 'air':
        setAirComparisons(prev => [...prev, newItem as ComparisonItem<AircraftDesign>]);
        break;
      case 'navy':
        setNavyComparisons(prev => [...prev, newItem as ComparisonItem<ShipDesign>]);
        break;
    }
  }, [divisionComparisons.length, tankComparisons.length, airComparisons.length, navyComparisons.length]);

  const removeComparison = useCallback((type: DesignType, id: string) => {
    switch (type) {
      case 'division':
        setDivisionComparisons(prev => prev.filter((c: ComparisonItem<DivisionTemplate>) => c.id !== id));
        break;
      case 'tank':
        setTankComparisons(prev => prev.filter((c: ComparisonItem<TankDesign>) => c.id !== id));
        break;
      case 'air':
        setAirComparisons(prev => prev.filter((c: ComparisonItem<AircraftDesign>) => c.id !== id));
        break;
      case 'navy':
        setNavyComparisons(prev => prev.filter((c: ComparisonItem<ShipDesign>) => c.id !== id));
        break;
    }
  }, []);

  const toggleVisibility = useCallback((type: DesignType, id: string) => {
    switch (type) {
      case 'division':
        setDivisionComparisons(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
        break;
      case 'tank':
        setTankComparisons(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
        break;
      case 'air':
        setAirComparisons(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
        break;
      case 'navy':
        setNavyComparisons(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
        break;
    }
  }, []);

  const updateComparisonName = useCallback((type: DesignType, id: string, name: string) => {
    switch (type) {
      case 'division':
        setDivisionComparisons(prev => prev.map(c => c.id === id ? { ...c, name } : c));
        break;
      case 'tank':
        setTankComparisons(prev => prev.map(c => c.id === id ? { ...c, name } : c));
        break;
      case 'air':
        setAirComparisons(prev => prev.map(c => c.id === id ? { ...c, name } : c));
        break;
      case 'navy':
        setNavyComparisons(prev => prev.map(c => c.id === id ? { ...c, name } : c));
        break;
    }
  }, []);

  // Export functions
  const exportJSON = useCallback(() => {
    const exportData = {
      type: activeDesignType,
      timestamp: new Date().toISOString(),
      comparisons: visibleComparisons.map(item => ({
        name: item.name,
        design: item.design,
        stats: item.stats,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${activeDesignType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeDesignType, visibleComparisons]);

  const exportCSV = useCallback(() => {
    // Create CSV with stats as rows and designs as columns
    const headers = ['Stat', 'Unit', ...visibleComparisons.map(c => c.name)];
    const rows = currentStatKeys.map(statDef => [
      statDef.label,
      statDef.unit,
      ...visibleComparisons.map(c => statDef.format((c.stats as unknown as Record<string, number>)[statDef.key] ?? 0)),
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${activeDesignType}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeDesignType, visibleComparisons, currentStatKeys]);

  // Current comparisons for the active type (for adding/removing)
  const currentComparisonList = useMemo(() => {
    switch (activeDesignType) {
      case 'division': return divisionComparisons;
      case 'tank': return tankComparisons;
      case 'air': return airComparisons;
      case 'navy': return navyComparisons;
    }
  }, [activeDesignType, divisionComparisons, tankComparisons, airComparisons, navyComparisons]);

  const designTypeIcons = {
    division: BarChart2,
    tank: Box,
    air: Plane,
    navy: Anchor,
  };

  const designTypeLabels = {
    division: 'Division',
    tank: 'Tank',
    air: 'Air',
    navy: 'Navy',
  };

  // Tooltip formatters for recharts
  const makeTooltipFormatter = (statLabel: string, format: (v: number) => string) =>
    (value: unknown, _name: unknown, _item: unknown, _index: unknown, _payload: unknown) => {
      if (value === undefined || value === null) return ['', ''];
      if (typeof value === 'number') {
        return [format(value), statLabel] as [string, string];
      }
      return [String(value), statLabel] as [string, string];
    };

  const labelFormatter = (_label: React.ReactNode): string => String(_label);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analysis & Comparison</h1>
            <p className="text-gray-500 dark:text-gray-400">Compare multiple designs side-by-side with interactive charts</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportCSV}>
              <FileText className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <Button variant="outline" onClick={exportJSON}>
              <Download className="h-4 w-4 mr-1" /> Export JSON
            </Button>
          </div>
        </div>

        {/* Design Type Tabs */}
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-4 h-12 bg-muted p-1 rounded-lg m-4" role="tablist">
              {(['division', 'tank', 'air', 'navy'] as DesignType[]).map(type => {
                const Icon = designTypeIcons[type];
                const isActive = activeDesignType === type;
                return (
                  <button
                    key={type}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${type}`}
                    id={`tab-${type}`}
                    onClick={() => setActiveDesignType(type)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {designTypeLabels[type]}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comparison List & Chart Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Comparison Items */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Designs to Compare
                <Button variant="ghost" size="sm" onClick={() => addComparison(activeDesignType)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {currentComparisonList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No designs added. Click + to add a design.</p>
                  </div>
                ) : (
                  currentComparisonList.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                        item.visible ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'opacity-50 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                        style={{ borderColor: item.color, backgroundColor: item.visible ? item.color : 'transparent' }}
                      />
                      <Input
                        value={item.name}
                        onChange={e => updateComparisonName(activeDesignType, item.id, e.target.value)}
                        className="flex-1 min-w-0 text-sm"
                        placeholder="Design name"
                      />
                      <Tooltip content={item.visible ? 'Hide' : 'Show'}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0"
                          onClick={() => toggleVisibility(activeDesignType, item.id)}
                          aria-label={item.visible ? 'Hide' : 'Show'}
                        >
                          {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </Tooltip>
                      <Tooltip content="Remove">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeComparison(activeDesignType, item.id)}
                          aria-label="Remove"
                          disabled={currentComparisonList.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  ))
                )}
              </div>

              {currentComparisonList.length > 0 && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {visibleComparisons.length} of {currentComparisonList.length} designs visible
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Charts */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chart Type Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chart Type:</span>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      {(['bar', 'radar', 'line'] as const).map(type => (
                        <Button
                          key={type}
                          variant={chartType === type ? 'default' : 'ghost'}
                          size="sm"
                          className="gap-1"
                          onClick={() => setChartType(type)}
                        >
                          {type === 'bar' && <BarChart2 className="h-4 w-4" />}
                          {type === 'radar' && <Radar className="h-4 w-4" />}
                          {type === 'line' && <Activity className="h-4 w-4" />}
                          <span className="hidden sm:inline">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </Button>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showValues}
                        onChange={e => setShowValues(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      Show Values
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{visibleComparisons.length} designs selected</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData.map(statData => (
                <Card key={statData.stat} className="min-h-[300px]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{statData.label}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {statData.values.map(v => statData.format(v.value)).join(' vs ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px]">
                      {chartType === 'bar' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statData.values}
                            layout="vertical"
                            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                            <XAxis type="number" tickFormatter={statData.format} />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                            <RechartsTooltip
                              formatter={makeTooltipFormatter(statData.label, statData.format) as any}
                              labelFormatter={labelFormatter}
                            />
                            <Legend />
                            <Bar
                              dataKey="value"
                              name={statData.label}
                              radius={[0, 4, 4, 0]}
                              maxBarSize={40}
                            >
                              {statData.values.map((entry, entryIndex) => (
                                <Cell key={entryIndex} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      {chartType === 'radar' && statData.values.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={100}
                            data={statData.values.map(v => ({ name: v.name, value: v.value }))}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis
                              angle={90}
                              tickFormatter={statData.format}
                              domain={[0, 'dataMax']}
                              tick={{ fontSize: 10 }}
                            />
                            <RechartsTooltip
                              formatter={makeTooltipFormatter(statData.label, statData.format) as any}
                            />
                            <Legend />
                            {statData.values.map((entry, entryIndex) => (
                              <RadarComponent
                                key={entryIndex}
                                dataKey="value"
                                name={entry.name}
                                stroke={entry.color}
                                fill={entry.color}
                                fillOpacity={0.1}
                                strokeWidth={2}
                                dot={false}
                              />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      )}

                      {chartType === 'line' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={statData.values}
                            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              type="number"
                              tickFormatter={statData.format}
                              tick={{ fontSize: 11 }}
                            />
                            <RechartsTooltip
                              formatter={makeTooltipFormatter(statData.label, statData.format) as any}
                              labelFormatter={labelFormatter}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name={statData.label}
                              stroke={statData.values[0]?.color || CHART_COLORS[0]}
                              strokeWidth={3}
                              dot={true}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {showValues && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {statData.values.map((entry, entryIndex) => (
                          <Badge
                            key={entryIndex}
                            variant="secondary"
                            className="gap-1"
                            style={{ borderColor: entry.color }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}: {statData.format(entry.value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {chartData.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-500 dark:text-gray-400">
                    <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No stats available for comparison.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Stat Comparison Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left pb-2 font-medium text-gray-500 dark:text-gray-400 w-48">Stat</th>
                    <th className="text-left pb-2 font-medium text-gray-500 dark:text-gray-400 w-24">Unit</th>
                    {visibleComparisons.map(item => (
                      <th
                        key={item.id}
                        className="text-right pb-2 font-medium text-gray-500 dark:text-gray-400 w-32"
                        style={{ color: item.color }}
                      >
                        {item.name}
                      </th>
                    ))}
                    <th className="text-left pb-2 font-medium text-gray-500 dark:text-gray-400 w-32">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStatKeys.map(statDef => {
                    const values = visibleComparisons.map(item => ({
                      name: item.name,
                      value: (item.stats as unknown as Record<string, number>)[statDef.key] ?? 0,
                      color: item.color,
                    }));

                    // Find best value
                    const bestValue = statDef.lowerIsBetter
                      ? Math.min(...values.map(v => v.value))
                      : Math.max(...values.map(v => v.value));
                    const bestNames = values
                      .filter(v => v.value === bestValue)
                      .map(v => v.name)
                      .join(', ');

                    return (
                      <tr key={statDef.key} className="border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{statDef.label}</td>
                        <td className="py-2 text-gray-500 dark:text-gray-400">{statDef.unit}</td>
                        {values.map(entry => (
                          <td
                            key={entry.name}
                            className="py-2 text-right font-mono font-semibold"
                            style={{ color: entry.color }}
                          >
                            {statDef.format(entry.value)}
                          </td>
                        ))}
                        <td className="py-2 text-sm text-green-600 dark:text-green-400 font-medium">
                          {bestNames} ({statDef.format(bestValue)})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visibleComparisons.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Add designs to compare to see the detailed table.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}