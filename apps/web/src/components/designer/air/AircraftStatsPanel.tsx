'use client';

import { Card, CardHeader, CardTitle, CardContent, Tooltip, TooltipProvider, Badge, cn, StatCard } from '@generalstaff/ui-components';
import type { AircraftStats, AircraftDesign } from '@generalstaff/calculation-engine';
import { AIRCRAFT_TYPES, calculateAircraftStats } from '@generalstaff/calculation-engine';
import { Info, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const STAT_CATEGORIES = {
  'Air Combat': [
    { key: 'airAttack', label: 'Air Attack', unit: '', higherBetter: true },
    { key: 'airDefense', label: 'Air Defense', unit: '', higherBetter: true },
    { key: 'agility', label: 'Agility', unit: '', higherBetter: true },
    { key: 'speed', label: 'Cruise Speed', unit: 'km/h', higherBetter: true },
    { key: 'maxSpeed', label: 'Max Speed', unit: 'km/h', higherBetter: true },
    { key: 'climbRate', label: 'Climb Rate', unit: 'm/min', higherBetter: true },
    { key: 'ceiling', label: 'Service Ceiling', unit: 'm', higherBetter: true },
    { key: 'turnRate', label: 'Turn Rate', unit: '°/s', higherBetter: true },
  ],
  'Ground/Naval Attack': [
    { key: 'groundAttack', label: 'Ground Attack', unit: '', higherBetter: true },
    { key: 'navalAttack', label: 'Naval Attack', unit: '', higherBetter: true },
    { key: 'armorPenetration', label: 'Armor Penetration', unit: 'mm', higherBetter: true },
    { key: 'strategicAttack', label: 'Strategic Attack', unit: '', higherBetter: true },
  ],
  'Range & Fuel': [
    { key: 'range', label: 'Ferry Range', unit: 'km', higherBetter: true },
    { key: 'combatRange', label: 'Combat Range', unit: 'km', higherBetter: true },
    { key: 'ferryRange', label: 'Ferry Range (max)', unit: 'km', higherBetter: true },
    { key: 'fuelCapacity', label: 'Fuel Capacity', unit: 'kg', higherBetter: true },
  ],
  'Sensors & EW': [
    { key: 'radarRange', label: 'Radar Range', unit: 'km', higherBetter: true },
    { key: 'radarCrossSection', label: 'Radar Cross-Section', unit: 'm²', higherBetter: false },
    { key: 'irstRange', label: 'IRST Range', unit: 'km', higherBetter: true },
    { key: 'ewRating', label: 'EW Rating', unit: '', higherBetter: true },
    { key: 'detectionRange', label: 'Detection Range', unit: 'km', higherBetter: true },
    { key: 'targetingAccuracy', label: 'Targeting Accuracy', unit: '', higherBetter: true },
    { key: 'nightCapability', label: 'Night Capability', unit: '', higherBetter: true },
  ],
  'Reconnaissance': [
    { key: 'reconRange', label: 'Recon Range', unit: 'km', higherBetter: true },
    { key: 'reconQuality', label: 'Recon Quality', unit: '', higherBetter: true },
  ],
  'Anti-Submarine': [
    { key: 'subDetection', label: 'Sub Detection', unit: '', higherBetter: true },
    { key: 'aswAttack', label: 'ASW Attack', unit: '', higherBetter: true },
  ],
  'Survivability': [
    { key: 'reliability', label: 'Reliability', unit: '%', higherBetter: true },
    { key: 'stealthLevel', label: 'Stealth Level', unit: '', higherBetter: true },
  ],
  'Economy & Logistics': [
    { key: 'cost', label: 'Production Cost', unit: 'IC', higherBetter: false },
    { key: 'buildTime', label: 'Build Time', unit: 'days', higherBetter: false },
    { key: 'weight', label: 'Weight', unit: 'kg', higherBetter: false },
    { key: 'emptyWeight', label: 'Empty Weight', unit: 'kg', higherBetter: false },
    { key: 'maxTakeoffWeight', label: 'Max Takeoff Weight', unit: 'kg', higherBetter: false },
    { key: 'crew', label: 'Crew', unit: '', higherBetter: false },
    { key: 'carrierCapable', label: 'Carrier Capable', unit: '', higherBetter: true },
    { key: 'catapultRequired', label: 'Catapult Required', unit: '', higherBetter: false },
    { key: 'arrestorHook', label: 'Arrestor Hook', unit: '', higherBetter: true },
    { key: 'vtolCapable', label: 'VTOL Capable', unit: '', higherBetter: true },
  ],
};

const STEALTH_ORDER: Record<string, number> = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3, 'very_high': 4 };

function formatStatValue(key: string, value: number | string | boolean): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'reliability') return value.toFixed(0);
  if (key === 'stealthLevel') return String(value).replace(/_/g, ' ');
  if (key === 'radarCrossSection') return value.toFixed(1);
  if (key === 'weight' || key === 'emptyWeight' || key === 'maxTakeoffWeight' || key === 'fuelCapacity') return (value / 1000).toFixed(1) + 't';
  if (key === 'cost' || key === 'buildTime' || key === 'crew' || key === 'airAttack' || key === 'airDefense' || key === 'groundAttack' || key === 'navalAttack' || key === 'armorPenetration' || key === 'strategicAttack') return value.toFixed(0);
  if (key === 'speed' || key === 'maxSpeed' || key === 'climbRate' || key === 'ceiling' || key === 'turnRate' || key === 'range' || key === 'combatRange' || key === 'ferryRange' || key === 'radarRange' || key === 'detectionRange') return value.toFixed(0);
  if (key === 'targetingAccuracy' || key === 'nightCapability' || key === 'reconQuality') return value.toFixed(1);
  if (key === 'reconRange' || key === 'irstRange' || key === 'ewRating') return value.toFixed(0);
  return value.toFixed(1);
}

function getStatColor(key: string, value: number | string | boolean, _higherBetter: boolean): string {
  if (typeof value === 'string') return 'text-primary';
  if (typeof value === 'boolean') return value ? 'text-green-500' : 'text-gray-500';
  if (key === 'stealthLevel') {
    const level = STEALTH_ORDER[String(value)] ?? 0;
    if (level >= 3) return 'text-green-500';
    if (level >= 2) return 'text-blue-500';
    if (level >= 1) return 'text-yellow-500';
    return 'text-gray-500';
  }
  if (key === 'radarCrossSection') {
    if (value < 1) return 'text-green-500';
    if (value < 10) return 'text-blue-500';
    if (value < 50) return 'text-yellow-500';
    return 'text-gray-500';
  }
  return 'text-primary';
}

export function AircraftStatsPanel({ design, showValidation = true }: { design: AircraftDesign; showValidation?: boolean }) {
  const stats = calculateAircraftStats(design);
  const typeInfo = AIRCRAFT_TYPES[design.type];

  const validationIssues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];

  // Thrust-to-weight check
  const thrust = stats.airAttack + stats.airDefense; // proxy
  const weight = stats.weight / 1000;
  const thrustToWeight = thrust / Math.max(weight, 1);

  if (thrustToWeight < 0.3) {
    validationIssues.push({ type: 'warning', message: `Low thrust-to-weight ratio (${thrustToWeight.toFixed(2)}). Performance will be limited.` });
  } else if (thrustToWeight > 1.2) {
    validationIssues.push({ type: 'info', message: `Excellent thrust-to-weight ratio (${thrustToWeight.toFixed(2)}).` });
  }

  // Range check for strategic bombers
  if (design.role === 'strategic_bombing' && stats.range < 3000) {
    validationIssues.push({ type: 'warning', message: 'Strategic bombers typically need 3000+ km range.' });
  }

  // Carrier capability check
  if (design.type === 'fighter' && !stats.carrierCapable && design.year >= 1940) {
    validationIssues.push({ type: 'info', message: 'Consider carrier-capable variant for naval operations.' });
  }

  // Stealth check for modern aircraft
  if (design.year >= 1980 && stats.stealthLevel === 'none') {
    validationIssues.push({ type: 'info', message: 'Modern aircraft should consider stealth features.' });
  }

  // Weight check
  if (stats.weight > 50000) {
    validationIssues.push({ type: 'warning', message: `Weight (${(stats.weight/1000).toFixed(0)}t) is very high. May limit operational bases.` });
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
                <CardTitle className="text-lg">Aircraft Statistics</CardTitle>
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
                label="Air Combat"
                value={stats.airAttack.toFixed(0)}
                unit={`AT / DF: ${stats.airDefense.toFixed(0)}`}
                color="danger"
                size="sm"
              />
              <StatCard
                label="Performance"
                value={stats.maxSpeed.toFixed(0)}
                unit={`km/h / Ceil: ${(stats.ceiling/1000).toFixed(0)}k ft`}
                color="success"
                size="sm"
              />
              <StatCard
                label="Range"
                value={stats.range.toFixed(0)}
                unit={`km / Combat: ${stats.combatRange.toFixed(0)}km`}
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
                        const value = stats[key as keyof AircraftStats];
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
                  <span className="text-sm font-medium">No design issues detected. This aircraft design is well-balanced for its role.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}