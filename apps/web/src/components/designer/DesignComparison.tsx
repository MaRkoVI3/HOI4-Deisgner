'use client';

import * as React from 'react';
import { Download, FileText, ChevronDown, ChevronUp, X, Plus } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Tooltip, TooltipProvider, Badge, cn, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Input, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, ScrollArea } from '@generalstaff/ui-components';
import type { DivisionTemplate, DivisionStats } from '@generalstaff/shared-types';
import type { ShipDesign, ShipStats } from '@generalstaff/calculation-engine';
import type { TankDesign, TankStats } from '@generalstaff/calculation-engine';
import type { AircraftDesign, AircraftStats } from '@generalstaff/calculation-engine';

export type DesignerType = 'division' | 'tank' | 'aircraft' | 'ship';

export interface DesignComparisonProps {
  designerType: DesignerType;
  designs: ComparisonDesign[];
  onDesignsChange?: (designs: ComparisonDesign[]) => void;
  maxDesigns?: number;
}

export interface ComparisonDesign {
  id: string;
  name: string;
  type: DesignerType;
  design: DivisionTemplate | ShipDesign | TankDesign | AircraftDesign;
  stats: DivisionStats | ShipStats | TankStats | AircraftStats;
  color?: string;
}

const DESIGNER_TYPE_LABELS: Record<DesignerType, string> = {
  division: 'Division',
  tank: 'Tank',
  aircraft: 'Aircraft',
  ship: 'Ship',
};

const DESIGNER_TYPE_ICONS: Record<DesignerType, React.ReactNode> = {
  division: <span className="text-blue-500">🛡️</span>,
  tank: <span className="text-green-500">🔧</span>,
  aircraft: <span className="text-purple-500">✈️</span>,
  ship: <span className="text-cyan-500">⚓</span>,
};

const DEFAULT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-yellow-500',
];

// Stat categories for each designer type
const DIVISION_STAT_CATEGORIES = {
  'Combat': [
    { key: 'softAttack', label: 'Soft Attack', higherBetter: true },
    { key: 'hardAttack', label: 'Hard Attack', higherBetter: true },
    { key: 'airAttack', label: 'Air Attack', higherBetter: true },
    { key: 'defense', label: 'Defense', higherBetter: true },
    { key: 'breakthrough', label: 'Breakthrough', higherBetter: true },
    { key: 'armor', label: 'Armor', higherBetter: true },
    { key: 'hardness', label: 'Hardness %', higherBetter: true, format: (v: number) => (v * 100).toFixed(1) },
    { key: 'piercing', label: 'Piercing', higherBetter: true },
  ],
  'Organization': [
    { key: 'organization', label: 'Organization', higherBetter: true },
    { key: 'maxOrganization', label: 'Max Organization', higherBetter: true },
    { key: 'recoveryRate', label: 'Recovery Rate', higherBetter: true, format: (v: number) => v.toFixed(2) },
  ],
  'Logistics': [
    { key: 'supplyConsumption', label: 'Supply/Day', higherBetter: false },
    { key: 'fuelConsumption', label: 'Fuel/Day', higherBetter: false },
    { key: 'weight', label: 'Weight (k tons)', higherBetter: false, format: (v: number) => (v / 1000).toFixed(1) },
  ],
  'Special': [
    { key: 'recon', label: 'Recon', higherBetter: true },
    { key: 'suppression', label: 'Suppression', higherBetter: true },
    { key: 'entrenchment', label: 'Entrenchment', higherBetter: true },
    { key: 'initiative', label: 'Initiative', higherBetter: true },
    { key: 'speed', label: 'Speed (km/h)', higherBetter: true },
    { key: 'hp', label: 'HP', higherBetter: true },
    { key: 'apAttack', label: 'AP Attack', higherBetter: true },
  ],
  'Meta': [
    { key: 'manpower', label: 'Manpower', higherBetter: false },
    { key: 'productionCost', label: 'Prod Cost (IC)', higherBetter: false },
    { key: 'icCost', label: 'IC Cost', higherBetter: false },
    { key: 'battalionCount', label: 'Battalions', higherBetter: false },
    { key: 'supportCompanyCount', label: 'Support Cos', higherBetter: false },
    { key: 'combatWidth', label: 'Combat Width', higherBetter: false },
  ],
};

const TANK_STAT_CATEGORIES = {
  'Firepower': [
    { key: 'piercing', label: 'Penetration (mm)', higherBetter: true },
    { key: 'hardAttack', label: 'Anti-Tank Attack', higherBetter: true },
    { key: 'softAttack', label: 'Anti-Infantry Attack', higherBetter: true },
    { key: 'fireRate', label: 'Rate of Fire (RPM)', higherBetter: true },
    { key: 'ammoCapacity', label: 'Ammo Capacity', higherBetter: true },
    { key: 'gunDepression', label: 'Gun Depression (°)', higherBetter: true },
    { key: 'gunElevation', label: 'Gun Elevation (°)', higherBetter: true },
    { key: 'traverseSpeed', label: 'Traverse Speed (°/s)', higherBetter: true },
  ],
  'Protection': [
    { key: 'armor', label: 'Max Armor (mm)', higherBetter: true },
    { key: 'hp', label: 'Hit Points', higherBetter: true },
    { key: 'reliability', label: 'Reliability %', higherBetter: true, format: (v: number) => (v * 100).toFixed(0) },
  ],
  'Mobility': [
    { key: 'speed', label: 'Max Speed (km/h)', higherBetter: true },
    { key: 'weight', label: 'Weight (tons)', higherBetter: false },
    { key: 'fuelConsumption', label: 'Fuel/100km', higherBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'horsepower', label: 'Horsepower', higherBetter: true },
  ],
  'Systems': [
    { key: 'optics', label: 'Optics', higherBetter: true },
    { key: 'stabilization', label: 'Stabilization', higherBetter: true, format: (v: string) => v },
    { key: 'crew', label: 'Crew', higherBetter: false },
  ],
  'Economy': [
    { key: 'productionCost', label: 'Prod Cost (IC)', higherBetter: false },
    { key: 'complexity', label: 'Complexity', higherBetter: false },
  ],
};

const AIRCRAFT_STAT_CATEGORIES = {
  'Air Combat': [
    { key: 'airAttack', label: 'Air Attack', higherBetter: true },
    { key: 'airDefense', label: 'Air Defense', higherBetter: true },
    { key: 'agility', label: 'Agility', higherBetter: true },
    { key: 'speed', label: 'Cruise Speed (km/h)', higherBetter: true },
    { key: 'maxSpeed', label: 'Max Speed (km/h)', higherBetter: true },
    { key: 'climbRate', label: 'Climb Rate (m/min)', higherBetter: true },
    { key: 'ceiling', label: 'Service Ceiling (m)', higherBetter: true },
    { key: 'turnRate', label: 'Turn Rate (°/s)', higherBetter: true },
  ],
  'Ground/Naval Attack': [
    { key: 'groundAttack', label: 'Ground Attack', higherBetter: true },
    { key: 'navalAttack', label: 'Naval Attack', higherBetter: true },
    { key: 'armorPenetration', label: 'Armor Penetration (mm)', higherBetter: true },
    { key: 'strategicAttack', label: 'Strategic Attack', higherBetter: true },
  ],
  'Range & Fuel': [
    { key: 'range', label: 'Ferry Range (km)', higherBetter: true },
    { key: 'combatRange', label: 'Combat Range (km)', higherBetter: true },
    { key: 'ferryRange', label: 'Ferry Range Max (km)', higherBetter: true },
    { key: 'fuelCapacity', label: 'Fuel Capacity (t)', higherBetter: true, format: (v: number) => (v / 1000).toFixed(1) },
  ],
  'Sensors & EW': [
    { key: 'radarRange', label: 'Radar Range (km)', higherBetter: true },
    { key: 'radarCrossSection', label: 'Radar Cross-Section (m²)', higherBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'irstRange', label: 'IRST Range (km)', higherBetter: true },
    { key: 'ewRating', label: 'EW Rating', higherBetter: true },
    { key: 'detectionRange', label: 'Detection Range (km)', higherBetter: true },
    { key: 'targetingAccuracy', label: 'Targeting Accuracy', higherBetter: true, format: (v: number) => v.toFixed(1) },
    { key: 'nightCapability', label: 'Night Capability', higherBetter: true, format: (v: number) => v.toFixed(1) },
  ],
  'Reconnaissance': [
    { key: 'reconRange', label: 'Recon Range (km)', higherBetter: true },
    { key: 'reconQuality', label: 'Recon Quality', higherBetter: true, format: (v: number) => v.toFixed(1) },
  ],
  'Anti-Submarine': [
    { key: 'subDetection', label: 'Sub Detection', higherBetter: true },
    { key: 'aswAttack', label: 'ASW Attack', higherBetter: true },
  ],
  'Survivability': [
    { key: 'reliability', label: 'Reliability %', higherBetter: true },
    { key: 'stealthLevel', label: 'Stealth Level', higherBetter: true, format: (v: string) => v.replace(/_/g, ' ') },
  ],
  'Economy & Logistics': [
    { key: 'cost', label: 'Prod Cost (IC)', higherBetter: false },
    { key: 'buildTime', label: 'Build Time (days)', higherBetter: false },
    { key: 'weight', label: 'Weight (t)', higherBetter: false, format: (v: number) => (v / 1000).toFixed(1) },
    { key: 'emptyWeight', label: 'Empty Weight (t)', higherBetter: false, format: (v: number) => (v / 1000).toFixed(1) },
    { key: 'maxTakeoffWeight', label: 'Max Takeoff (t)', higherBetter: false, format: (v: number) => (v / 1000).toFixed(1) },
    { key: 'crew', label: 'Crew', higherBetter: false },
    { key: 'carrierCapable', label: 'Carrier Capable', higherBetter: true, format: (v: boolean) => v ? 'Yes' : 'No' },
    { key: 'catapultRequired', label: 'Catapult Required', higherBetter: false, format: (v: boolean) => v ? 'Yes' : 'No' },
    { key: 'arrestorHook', label: 'Arrestor Hook', higherBetter: true, format: (v: boolean) => v ? 'Yes' : 'No' },
    { key: 'vtolCapable', label: 'VTOL Capable', higherBetter: true, format: (v: boolean) => v ? 'Yes' : 'No' },
  ],
};

const SHIP_STAT_CATEGORIES = {
  'Surface Combat': [
    { key: 'navalAttack', label: 'Naval Attack', higherBetter: true },
    { key: 'navalDefense', label: 'Naval Defense', higherBetter: true },
    { key: 'shoreBombardment', label: 'Shore Bombardment', higherBetter: true },
    { key: 'torpedoAttack', label: 'Torpedo Attack', higherBetter: true },
  ],
  'Anti-Air / Anti-Sub': [
    { key: 'antiAirAttack', label: 'Anti-Air Attack', higherBetter: true },
    { key: 'antiSubAttack', label: 'Anti-Sub Attack', higherBetter: true },
    { key: 'subDetection', label: 'Sub Detection', higherBetter: true },
  ],
  'Speed & Range': [
    { key: 'speed', label: 'Speed (kn)', higherBetter: true, format: (v: number) => v.toFixed(1) },
    { key: 'range', label: 'Range (km)', higherBetter: true },
  ],
  'Armor & Protection': [
    { key: 'armor', label: 'Belt Armor (mm)', higherBetter: true },
    { key: 'deckArmor', label: 'Deck Armor (mm)', higherBetter: true },
    { key: 'torpedoProtection', label: 'Torpedo Protection %', higherBetter: true },
    { key: 'hp', label: 'Hit Points', higherBetter: true },
  ],
  'Aviation': [
    { key: 'airWingSize', label: 'Air Wing Size', higherBetter: true },
    { key: 'airAttack', label: 'Air Attack', higherBetter: true },
    { key: 'airDefense', label: 'Air Defense', higherBetter: true },
    { key: 'airAgility', label: 'Air Agility', higherBetter: true },
    { key: 'airRange', label: 'Air Range (km)', higherBetter: true },
    { key: 'airNavalAttack', label: 'Air Naval Attack', higherBetter: true },
  ],
  'Survivability': [
    { key: 'reliability', label: 'Reliability %', higherBetter: true },
    { key: 'surfaceVisibility', label: 'Surface Visibility', higherBetter: false },
    { key: 'subVisibility', label: 'Sub Visibility', higherBetter: false },
  ],
  'Economy & Logistics': [
    { key: 'cost', label: 'Prod Cost (IC)', higherBetter: false },
    { key: 'buildTime', label: 'Build Time (days)', higherBetter: false },
    { key: 'weight', label: 'Displacement (k tons)', higherBetter: false, format: (v: number) => (v / 1000).toFixed(1) },
    { key: 'crew', label: 'Crew', higherBetter: false },
    { key: 'fuelConsumption', label: 'Fuel (kt/day)', higherBetter: false, format: (v: number) => v.toFixed(1) },
    { key: 'supplyConsumption', label: 'Supply', higherBetter: false },
  ],
};

interface StatDef {
  key: string;
  label: string;
  higherBetter: boolean;
  format?: (v: any) => string;
}

function getStatCategories(designerType: DesignerType): Record<string, StatDef[]> {
  switch (designerType) {
    case 'division':
      return DIVISION_STAT_CATEGORIES;
    case 'tank':
      return TANK_STAT_CATEGORIES;
    case 'aircraft':
      return AIRCRAFT_STAT_CATEGORIES;
    case 'ship':
      return SHIP_STAT_CATEGORIES;
  }
}

function getStatValue(stats: Record<string, any>, key: string, format?: (v: any) => string): string | number {
  const value = stats[key];
  if (value === undefined || value === null) return '—';
  if (format) return format(value);
  if (typeof value === 'number') {
    if (key.includes('Rate') || key.includes('ratio') || key.includes('hardness') || key.includes('reliability')) {
      return value.toFixed(2);
    }
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return value;
  return String(value);
}

function compareValues(a: number | string | boolean, b: number | string | boolean, higherBetter: boolean): 'better' | 'worse' | 'equal' {
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    if (a === b) return 'equal';
    return higherBetter ? (a ? 'better' : 'worse') : (a ? 'worse' : 'better');
  }
  if (typeof a === 'string' || typeof b === 'string') return 'equal';
  const numA = Number(a);
  const numB = Number(b);
  if (isNaN(numA) || isNaN(numB)) return 'equal';
  if (numA === numB) return 'equal';
  return higherBetter ? (numA > numB ? 'better' : 'worse') : (numA < numB ? 'better' : 'worse');
}

export function DesignComparison({
  designerType,
  designs,
  onDesignsChange,
  maxDesigns = 8
}: DesignComparisonProps) {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [showOnlyDifferences, setShowOnlyDifferences] = React.useState(false);
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  const statCategories = getStatCategories(designerType);

  // Calculate comparison data
  const comparisonData = React.useMemo(() => {
    const categories = Object.keys(statCategories);
    const result: Record<string, any[]> = {};

    categories.forEach(category => {
      const stats = statCategories[category as keyof typeof statCategories];
      const rows: any[] = [];

      stats.forEach(stat => {
        const values = designs.map(d => getStatValue(d.stats as Record<string, any>, stat.key, stat.format));
        const numericValues = designs.map(d => {
          const v = (d.stats as Record<string, any>)[stat.key];
          return typeof v === 'number' ? v : NaN;
        });

        // Check if all values are the same (for "show only differences")
        const allSame = numericValues.every(v => v === numericValues[0]) ||
                       values.every(v => v === values[0]);

        if (showOnlyDifferences && allSame) return;

        const comparisons = designs.map((d, i) => {
          const value = (d.stats as Record<string, any>)[stat.key];
          if (i === 0) return { value, comparison: 'equal' as const };
          const comp = compareValues(value, (designs[0].stats as Record<string, any>)[stat.key], stat.higherBetter);
          return { value, comparison: comp };
        });

        rows.push({
          key: stat.key,
          label: stat.label,
          values: comparisons,
          higherBetter: stat.higherBetter,
        });
      });

      if (rows.length > 0) {
        result[category] = rows;
      }
    });

    return result;
  }, [designs, statCategories, showOnlyDifferences]);

  const handleAddDesign = () => {
    setShowAddDialog(true);
  };

  const handleRemoveDesign = (index: number) => {
    const newDesigns = designs.filter((_, i) => i !== index);
    onDesignsChange?.(newDesigns);
  };

  const handleExport = (format: 'csv' | 'json') => {
    const categories = Object.keys(statCategories);
    const headers = ['Category', 'Stat', ...designs.map(d => d.name)];
    const rows: string[][] = [headers];

    categories.forEach(category => {
      const stats = statCategories[category as keyof typeof statCategories];
      stats.forEach(stat => {
        const row = [category, stat.label, ...designs.map(d => String(getStatValue(d.stats, stat.key, stat.format)))];
        rows.push(row);
      });
    });

    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'csv') {
      content = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      mimeType = 'text/csv';
      filename = `${designerType}-comparison-${Date.now()}.csv`;
    } else {
      const data = designs.map(d => {
        const design = d.design as any;
        return {
          name: d.name,
          type: design.type || design.role || 'division',
          year: design.year || new Date().getFullYear(),
          countryTag: design.countryTag || design.country?.tag || '',
          stats: d.stats,
        };
      });
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      filename = `${designerType}-comparison-${Date.now()}.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  if (designs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">{DESIGNER_TYPE_ICONS[designerType]}</div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No {DESIGNER_TYPE_LABELS[designerType]} Designs to Compare
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add up to {maxDesigns} designs to compare their statistics side by side
          </p>
          <Button onClick={handleAddDesign} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Design
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl">{DESIGNER_TYPE_ICONS[designerType]}</div>
            <div>
              <h2 className="text-2xl font-bold">
                {DESIGNER_TYPE_LABELS[designerType]} Comparison
              </h2>
              <p className="text-sm text-muted-foreground">
                {designs.length} of {maxDesigns} designs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-differences"
                checked={showOnlyDifferences}
                onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="show-differences" className="text-sm text-muted-foreground cursor-pointer">
                Show only differences
              </label>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {designs.length < maxDesigns && (
              <Button variant="outline" size="sm" onClick={handleAddDesign}>
                <Plus className="w-4 h-4 mr-2" />
                Add Design
              </Button>
            )}
          </div>
        </div>

        {/* Design selector chips */}
        <div className="flex flex-wrap items-center gap-2">
          {designs.map((design, index) => (
            <div
              key={design.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm"
              style={{ borderColor: design.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: design.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
              />
              <span className="font-medium truncate max-w-[150px]">{design.name}</span>
              {designs.length > 1 && (
                <Tooltip content="Remove design">
                  <button
                    onClick={() => handleRemoveDesign(index)}
                    className="ml-1 p-0.5 hover:bg-accent rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </Tooltip>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-48 sticky left-0 z-10 bg-white dark:bg-gray-900">
                      Category / Stat
                    </th>
                    {designs.map((design, index) => (
                      <th
                        key={design.id}
                        className="px-4 py-3 text-center text-sm font-medium text-muted-foreground sticky top-0 z-10 bg-white dark:bg-gray-900 min-w-[120px]"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: design.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                          />
                          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[100px]">
                            {design.name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(comparisonData).map(([category, rows]) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => toggleCategory(category)}>
                          <div className="flex items-center gap-2">
                            {expandedCategories.has(category) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4 rotate-90" />
                            )}
                            <span>{category}</span>
                            <Badge variant="secondary" className="ml-2">
                              {rows.length}
                            </Badge>
                          </div>
                        </td>
                        {designs.map(() => (
                          <td key={Math.random()} className="px-4 py-2 text-center text-sm text-muted-foreground" />
                        ))}
                      </tr>
                      {expandedCategories.has(category) && rows.map((row, rowIndex) => (
                        <tr
                          key={row.key}
                          className={rowIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/30' : ''}
                        >
                          <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 sticky left-0 z-10 bg-white dark:bg-gray-900 border-r dark:border-gray-700 w-48">
                            <Tooltip content={<span className="text-xs">{row.label}</span>} side="right">
                              {row.label}
                            </Tooltip>
                          </td>
                          {row.values.map((val: any, designIndex: number) => {
                            const isFirst = designIndex === 0;
                            const comparison = val.comparison;

                            let comparisonClass = '';
                            let comparisonIcon = null;

                            if (!isFirst) {
                              if (comparison === 'better') {
                                comparisonClass = 'text-green-600 dark:text-green-400';
                                comparisonIcon = <ChevronUp className="w-3 h-3 inline-block ml-1" />;
                              } else if (comparison === 'worse') {
                                comparisonClass = 'text-red-600 dark:text-red-400';
                                comparisonIcon = <ChevronDown className="w-3 h-3 inline-block ml-1" />;
                              }
                            }

                            const designColor = designs[designIndex].color || DEFAULT_COLORS[designIndex % DEFAULT_COLORS.length];

                            return (
                              <td
                                key={designs[designIndex].id}
                                className="px-4 py-2 text-center text-sm font-mono"
                              >
                                <div className={cn('flex items-center justify-center gap-1', comparisonClass)}>
                                  <span
                                    className="font-semibold"
                                    style={{ color: isFirst ? 'inherit' : designColor }}
                                  >
                                    {val.value}
                                  </span>
                                  {comparisonIcon}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {Object.keys(comparisonData).length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {showOnlyDifferences ? (
                  <>
                    <p className="font-medium mb-1">All designs have identical stats</p>
                    <p className="text-sm">Uncheck Show only differences to see all stats</p>
                  </>
                ) : (
                  <p>No stats available for comparison</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {designs.map((design, index) => {
            const d = design.design as any;
            const type = d.type || d.role || 'division';
            const year = d.year || new Date().getFullYear();
            const countryTag = d.countryTag || d.country?.tag || '';
            return (
              <Card key={design.id} className="border-l-4" style={{ borderLeftColor: design.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {design.name}
                    </CardTitle>
                    <Badge variant="secondary" style={{ backgroundColor: design.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}>
                      {DESIGNER_TYPE_LABELS[designerType]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-mono">{type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year</span>
                      <span className="font-mono">{year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-mono">{countryTag}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Design Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleAddDesign}>
              <Plus className="w-4 h-4 mr-2" />
              Add Design
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {DESIGNER_TYPE_LABELS[designerType]} to Comparison</DialogTitle>
              <DialogDescription>
                Select a design to add to the comparison table
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Helper component for adding designs to comparison
export function DesignComparisonPicker({
  designerType,
  availableDesigns,
  selectedDesigns,
  onSelectionChange,
}: {
  designerType: DesignerType;
  availableDesigns: Array<{ id: string; name: string; type: string; year: number; countryTag: string }>;
  selectedDesigns: ComparisonDesign[];
  onSelectionChange: (designs: ComparisonDesign[]) => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredDesigns = availableDesigns.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (design: typeof availableDesigns[0]) => {
    if (selectedDesigns.some(s => s.id === design.id)) {
      onSelectionChange(selectedDesigns.filter(s => s.id !== design.id));
    } else {
      onSelectionChange([
        ...selectedDesigns,
        {
          id: design.id,
          name: design.name,
          type: designerType,
          design: design as any,
          stats: {} as any, // Would need to calculate stats
          color: DEFAULT_COLORS[selectedDesigns.length % DEFAULT_COLORS.length],
        },
      ]);
    }
  };

  return (
    <Dialog>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add {DESIGNER_TYPE_LABELS[designerType]} to Comparison</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {filteredDesigns.map(design => (
                <div
                  key={design.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    selectedDesigns.some(s => s.id === design.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                  onClick={() => handleToggle(design)}
                >
                  <div className="flex items-center gap-3">
                    {selectedDesigns.some(s => s.id === design.id) && (
                      <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{design.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {design.type} · {design.year} · {design.countryTag}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDesigns.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No designs found</p>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {}}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DesignComparison;