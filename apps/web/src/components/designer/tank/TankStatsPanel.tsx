'use client';

import { Card, CardHeader, CardTitle, CardContent, Tooltip, TooltipProvider, Badge, cn, StatCard } from '@generalstaff/ui-components';
import type { TankStats } from '@generalstaff/calculation-engine';
import { TANK_ROLES, calculateTankStats } from '@generalstaff/calculation-engine';
import { Info, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

import type { TankDesign } from '@generalstaff/calculation-engine';

interface TankStatsPanelProps {
  design: TankDesign;
  showValidation?: boolean;
}

const STAT_CATEGORIES = {
  'Firepower': [
    { key: 'piercing', label: 'Penetration', unit: 'mm', higherBetter: true },
    { key: 'hardAttack', label: 'Anti-Tank Attack', unit: '', higherBetter: true },
    { key: 'softAttack', label: 'Anti-Infantry Attack', unit: '', higherBetter: true },
    { key: 'fireRate', label: 'Rate of Fire', unit: 'RPM', higherBetter: true },
    { key: 'ammoCapacity', label: 'Ammo Capacity', unit: 'rounds', higherBetter: true },
    { key: 'gunDepression', label: 'Gun Depression', unit: '°', higherBetter: true },
    { key: 'gunElevation', label: 'Gun Elevation', unit: '°', higherBetter: true },
    { key: 'traverseSpeed', label: 'Traverse Speed', unit: '°/s', higherBetter: true },
  ],
  'Protection': [
    { key: 'armor', label: 'Max Armor (Front)', unit: 'mm', higherBetter: true },
    { key: 'hp', label: 'Hit Points', unit: '', higherBetter: true },
    { key: 'reliability', label: 'Reliability', unit: '%', higherBetter: true },
  ],
  'Mobility': [
    { key: 'speed', label: 'Max Speed', unit: 'km/h', higherBetter: true },
    { key: 'weight', label: 'Weight', unit: 'tons', higherBetter: false },
    { key: 'fuelConsumption', label: 'Fuel Consumption', unit: '/100km', higherBetter: false },
    { key: 'horsepower', label: 'Horsepower', unit: 'hp', higherBetter: true },
  ],
  'Systems': [
    { key: 'optics', label: 'Optics', unit: '', higherBetter: true },
    { key: 'stabilization', label: 'Stabilization', unit: '', higherBetter: true },
    { key: 'crew', label: 'Crew', unit: '', higherBetter: false },
  ],
  'Economy': [
    { key: 'productionCost', label: 'Production Cost', unit: 'IC', higherBetter: false },
    { key: 'complexity', label: 'Complexity', unit: '', higherBetter: false },
  ],
};

const STABILIZATION_ORDER: Record<string, number> = { 'none': 0, 'basic': 1, 'advanced': 2, 'fully_stabilized': 3 };

function formatStatValue(key: string, value: number | string): string {
  if (typeof value === 'string') return value;
  if (key === 'reliability') return (value * 100).toFixed(0);
  if (key === 'stabilization') return String(value);
  if (key === 'fuelConsumption') return value.toFixed(1);
  if (key === 'productionCost' || key === 'weight') return value.toFixed(0);
  return value.toFixed(1);
}

function getStatColor(key: string, value: number | string, _higherBetter: boolean): string {
  if (typeof value === 'string') return 'text-primary';
  if (key === 'stabilization') {
    const level = STABILIZATION_ORDER[String(value)] ?? 0;
    if (level >= 3) return 'text-green-500';
    if (level >= 2) return 'text-blue-500';
    if (level >= 1) return 'text-yellow-500';
    return 'text-gray-500';
  }
  return 'text-primary';
}

export function TankStatsPanel({ design, showValidation = true }: TankStatsPanelProps) {
  // Calculate stats using the calculation engine
  const stats = calculateTankStats(design);
  const roleInfo = TANK_ROLES[design.role];

  // Validation checks
  const validationIssues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];

  // Check weight vs engine power
  if (stats.weight > 0 && design.engine) {
    const hpPerTon = (stats.horsepower || 0) / stats.weight;
    if (hpPerTon < 10) {
      validationIssues.push({ type: 'warning', message: `Low power-to-weight ratio (${hpPerTon.toFixed(1)} hp/ton). Consider a more powerful engine.` });
    } else if (hpPerTon > 25) {
      validationIssues.push({ type: 'info', message: `Excellent power-to-weight ratio (${hpPerTon.toFixed(1)} hp/ton).` });
    }
  }

  // Check armor effectiveness
  if (design.armorLayout.front < 30 && design.role !== 'light_tank' && design.role !== 'anti_air_tank') {
    validationIssues.push({ type: 'warning', message: 'Frontal armor may be insufficient for this role.' });
  }

  // Check gun compatibility
  if (design.role === 'spg' && !['large_caliber_gun', 'super_heavy_gun', 'rocket_launcher'].includes(design.gun)) {
    validationIssues.push({ type: 'warning', message: 'SPGs typically benefit from large caliber guns or rocket launchers for indirect fire.' });
  }

  if (design.role === 'anti_air_tank' && design.gun !== 'auto_cannon' && design.gun !== 'small_caliber_gun') {
    validationIssues.push({ type: 'info', message: 'Anti-air tanks typically use autocannons or small caliber guns for high rate of fire.' });
  }

  // Check stabilization
  if (stats.stabilization === 'none' && design.year >= 1945) {
    validationIssues.push({ type: 'info', message: 'Consider a gun with stabilization for post-WWII designs.' });
  }

  const allValid = validationIssues.filter(i => i.type === 'error').length === 0;
  const hasErrors = validationIssues.some(i => i.type === 'error');
  const badgeVariant: 'success' | 'destructive' | 'warning' = allValid ? 'success' : hasErrors ? 'destructive' : 'warning';
  const badgeLabel = allValid ? 'Valid Design' : 'Issues Found';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Role Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Tank Statistics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {roleInfo?.description || 'Custom Design'} · {design.year}
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
                label="Firepower"
                value={stats.hardAttack.toFixed(1)}
                unit={"AT / HE: " + stats.softAttack.toFixed(1)}
                color="danger"
                size="sm"
              />
              <StatCard
                label="Protection"
                value={stats.armor.toFixed(0)}
                unit={"mm / HP: " + stats.hp.toFixed(0)}
                color="primary"
                size="sm"
              />
              <StatCard
                label="Mobility"
                value={stats.speed.toFixed(0)}
                unit={"km/h / " + stats.weight.toFixed(0) + "t"}
                color="success"
                size="sm"
              />
              <StatCard
                label="Cost"
                value={stats.productionCost.toFixed(0)}
                unit={"IC / Crew: " + stats.crew}
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
                        const value = stats[key as keyof TankStats];
                        if (value === undefined) return null;

                        const displayValue = typeof value === 'string' ? value : formatStatValue(key, value);
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
                  <span className="text-sm font-medium">No design issues detected. This tank design is well-balanced for its role.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}