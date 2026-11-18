'use client';

import { Card, CardHeader, CardTitle, CardContent, Tooltip, TooltipProvider, Badge, cn, StatCard } from '@generalstaff/ui-components';
import type { ShipStats, ShipDesign } from '@generalstaff/calculation-engine';
import { SHIP_TYPES, calculateShipStats } from '@generalstaff/calculation-engine';
import { Info, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const STAT_CATEGORIES = {
  'Surface Combat': [
    { key: 'navalAttack', label: 'Naval Attack', unit: '', higherBetter: true },
    { key: 'navalDefense', label: 'Naval Defense', unit: '', higherBetter: true },
    { key: 'shoreBombardment', label: 'Shore Bombardment', unit: '', higherBetter: true },
    { key: 'torpedoAttack', label: 'Torpedo Attack', unit: '', higherBetter: true },
  ],
  'Anti-Air / Anti-Sub': [
    { key: 'antiAirAttack', label: 'Anti-Air Attack', unit: '', higherBetter: true },
    { key: 'antiSubAttack', label: 'Anti-Sub Attack', unit: '', higherBetter: true },
    { key: 'subDetection', label: 'Sub Detection', unit: '', higherBetter: true },
  ],
  'Speed & Range': [
    { key: 'speed', label: 'Speed', unit: 'kn', higherBetter: true },
    { key: 'range', label: 'Range', unit: 'km', higherBetter: true },
  ],
  'Armor & Protection': [
    { key: 'armor', label: 'Belt Armor', unit: 'mm', higherBetter: true },
    { key: 'deckArmor', label: 'Deck Armor', unit: 'mm', higherBetter: true },
    { key: 'torpedoProtection', label: 'Torpedo Protection', unit: '%', higherBetter: true },
    { key: 'hp', label: 'Hit Points', unit: '', higherBetter: true },
  ],
  'Aviation': [
    { key: 'airWingSize', label: 'Air Wing Size', unit: 'planes', higherBetter: true },
    { key: 'airAttack', label: 'Air Attack', unit: '', higherBetter: true },
    { key: 'airDefense', label: 'Air Defense', unit: '', higherBetter: true },
    { key: 'airAgility', label: 'Air Agility', unit: '', higherBetter: true },
    { key: 'airRange', label: 'Air Range', unit: 'km', higherBetter: true },
    { key: 'airNavalAttack', label: 'Air Naval Attack', unit: '', higherBetter: true },
  ],
  'Survivability': [
    { key: 'reliability', label: 'Reliability', unit: '%', higherBetter: true },
    { key: 'surfaceVisibility', label: 'Surface Visibility', unit: '', higherBetter: false },
    { key: 'subVisibility', label: 'Sub Visibility', unit: '', higherBetter: false },
  ],
  'Economy & Logistics': [
    { key: 'cost', label: 'Production Cost', unit: 'IC', higherBetter: false },
    { key: 'buildTime', label: 'Build Time', unit: 'days', higherBetter: false },
    { key: 'weight', label: 'Displacement', unit: 'tons', higherBetter: false },
    { key: 'crew', label: 'Crew', unit: '', higherBetter: false },
    { key: 'fuelConsumption', label: 'Fuel Consumption', unit: 'kt/day', higherBetter: false },
    { key: 'supplyConsumption', label: 'Supply Consumption', unit: '', higherBetter: false },
  ],
};

function formatStatValue(key: string, value: number): string {
  if (key === 'reliability') return value.toFixed(0);
  if (key === 'speed') return value.toFixed(1);
  if (key === 'range') return value.toFixed(0);
  if (key === 'weight') return (value / 1000).toFixed(1) + 'k';
  if (key === 'cost' || key === 'buildTime' || key === 'crew' || key === 'navalAttack' || key === 'navalDefense' || key === 'shoreBombardment' || key === 'torpedoAttack' || key === 'antiAirAttack' || key === 'antiSubAttack' || key === 'subDetection' || key === 'armor' || key === 'deckArmor' || key === 'torpedoProtection' || key === 'hp' || key === 'airWingSize' || key === 'airAttack' || key === 'airDefense' || key === 'airAgility' || key === 'airRange' || key === 'airNavalAttack' || key === 'surfaceVisibility' || key === 'subVisibility') return value.toFixed(0);
  if (key === 'fuelConsumption' || key === 'supplyConsumption') return value.toFixed(1);
  return value.toFixed(1);
}

function getStatColor(key: string, value: number, _higherBetter: boolean): string {
  if (key === 'surfaceVisibility' || key === 'subVisibility') {
    if (value < 10) return 'text-green-500';
    if (value < 25) return 'text-blue-500';
    if (value < 50) return 'text-yellow-500';
    return 'text-red-500';
  }
  if (key === 'torpedoProtection') {
    if (value >= 50) return 'text-green-500';
    if (value >= 30) return 'text-blue-500';
    if (value >= 15) return 'text-yellow-500';
    return 'text-gray-500';
  }
  if (key === 'armor' || key === 'deckArmor') {
    if (value >= 200) return 'text-green-500';
    if (value >= 100) return 'text-blue-500';
    if (value >= 50) return 'text-yellow-500';
    return 'text-gray-500';
  }
  return 'text-primary';
}

export function ShipStatsPanel({ design, showValidation = true }: { design: ShipDesign; showValidation?: boolean }) {
  const stats = calculateShipStats(design);
  const typeInfo = SHIP_TYPES[design.type];

  const validationIssues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];

  // Speed check for destroyers
  if (design.type === 'destroyer' && stats.speed < 30) {
    validationIssues.push({ type: 'warning', message: 'Destroyers typically need 30+ knots speed.' });
  }

  // Range check for capital ships
  if (['battleship', 'super_battleship', 'battlecruiser'].includes(design.type) && stats.range < 8000) {
    validationIssues.push({ type: 'warning', message: 'Capital ships typically need 8000+ km range.' });
  }

  // Carrier air wing check
  if (['carrier', 'light_carrier', 'escort_carrier'].includes(design.type) && stats.airWingSize < 30) {
    validationIssues.push({ type: 'warning', message: 'Carriers typically need 30+ air wing size.' });
  }

  // Submarine visibility
  if (['submarine', 'nuclear_submarine'].includes(design.type) && stats.subVisibility > 15) {
    validationIssues.push({ type: 'warning', message: 'Submarines should have low sub visibility.' });
  }

  // Armor check for capital ships
  if (['battleship', 'super_battleship'].includes(design.type) && stats.armor < 100) {
    validationIssues.push({ type: 'info', message: 'Capital ships should have heavy armor.' });
  }

  const allValid = validationIssues.filter(i => i.type === 'error').length === 0;
  const hasErrors = validationIssues.some(i => i.type === 'error');
  const badgeVariant: 'success' | 'destructive' | 'warning' = allValid ? 'success' : hasErrors ? 'destructive' : 'warning';
  const badgeLabel = allValid ? 'Valid Design' : 'Issues Found';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Type Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ship Statistics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {typeInfo?.description || 'Custom Design'} · {design.year}
                </p>
              </div>
              <Badge variant={badgeVariant as 'success' | 'destructive' | 'warning'}>
                {badgeLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Key Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Surface Combat"
                value={stats.navalAttack.toFixed(0)}
                unit={`AT / DF: ${stats.navalDefense.toFixed(0)}`}
                color="danger"
                size="sm"
              />
              <StatCard
                label="Anti-Air / ASW"
                value={stats.antiAirAttack.toFixed(0)}
                unit={`AA / ASW: ${stats.antiSubAttack.toFixed(0)}`}
                color="success"
                size="sm"
              />
              <StatCard
                label="Performance"
                value={stats.speed.toFixed(1)}
                unit={`kn / Range: ${stats.range.toFixed(0)}km`}
                color="primary"
                size="sm"
              />
              <StatCard
                label="Cost"
                value={stats.cost.toFixed(0)}
                unit={`IC / Crew: ${stats.crew}`}
                color="warning"
                size="sm"
              />
            </div>

            {/* Detailed Stat Categories */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(STAT_CATEGORIES).map(([category, statDefs]) => (
                <Card key={category} className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {statDefs.map(({ key, label, unit, higherBetter }) => {
                        const value = stats[key as keyof ShipStats];
                        if (value === undefined) return null;

                        const displayValue = formatStatValue(key, value);
                        const color = getStatColor(key, value, higherBetter);

                        return (
                          <div key={key} className="flex items-center justify-between gap-4">
                            <Tooltip content={<span className="text-xs">{label}</span>} side="right">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                                {label}
                              </span>
                            </Tooltip>
                            <div className="flex items-center gap-2 text-right min-w-[100px]">
                              <span className={cn('font-mono font-semibold text-sm', color)}>
                                {displayValue}
                              </span>
                              {unit && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{unit}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Validation Issues */}
            {showValidation && validationIssues.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Design Analysis</h4>
                {validationIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-2 p-3 rounded-lg text-sm',
                      issue.type === 'error' && 'bg-red-500/10 text-red-500 border border-red-500/20',
                      issue.type === 'warning' && 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
                      issue.type === 'info' && 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    )}
                  >
                    {issue.type === 'error' && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {issue.type === 'warning' && <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {issue.type === 'info' && <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            )}

            {showValidation && validationIssues.length === 0 && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">No design issues detected. This ship design is well-balanced for its role.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}