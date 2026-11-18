'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge, cn, Tooltip, TooltipProvider } from '@generalstaff/ui-components';
import type { TankRole, ChassisType, GunType, EngineType, SuspensionType } from '@generalstaff/calculation-engine';
import { Check, X, Minus, Info } from 'lucide-react';

const CHASSIS_TYPES: ChassisType[] = [
  'light_tank_chassis',
  'medium_tank_chassis',
  'heavy_tank_chassis',
  'modern_tank_chassis',
  'super_heavy_tank_chassis',
];

const GUN_TYPES: GunType[] = [
  'small_caliber_gun',
  'medium_caliber_gun',
  'large_caliber_gun',
  'super_heavy_gun',
  'smoothbore_gun',
  'auto_cannon',
  'rocket_launcher',
];

const ENGINE_TYPES: EngineType[] = [
  'petrol_engine',
  'diesel_engine',
  'multifuel_engine',
  'gas_turbine',
];

const SUSPENSION_TYPES: SuspensionType[] = [
  'leaf_spring',
  'torsion_bar',
  'hydro_pneumatic',
  'active_suspension',
];

const ROLES: TankRole[] = [
  'light_tank',
  'medium_tank',
  'heavy_tank',
  'tank_destroyer',
  'spg',
  'anti_air_tank',
  'modern_tank',
  'super_heavy_tank',
];

// Compatibility matrix: role -> allowed modules
const COMPATIBILITY: Record<TankRole, {
  chassis: Partial<Record<ChassisType, 'optimal' | 'compatible' | 'incompatible'>>;
  guns: Partial<Record<GunType, 'optimal' | 'compatible' | 'incompatible'>>;
  engines: Partial<Record<EngineType, 'optimal' | 'compatible' | 'incompatible'>>;
  suspension: Partial<Record<SuspensionType, 'optimal' | 'compatible' | 'incompatible'>>;
}> = {
  light_tank: {
    chassis: { light_tank_chassis: 'optimal', medium_tank_chassis: 'compatible' },
    guns: { small_caliber_gun: 'optimal', auto_cannon: 'optimal', medium_caliber_gun: 'compatible' },
    engines: { petrol_engine: 'compatible', diesel_engine: 'optimal', gas_turbine: 'compatible', multifuel_engine: 'compatible' },
    suspension: { leaf_spring: 'compatible', torsion_bar: 'optimal', hydro_pneumatic: 'optimal', active_suspension: 'compatible' },
  },
  medium_tank: {
    chassis: { medium_tank_chassis: 'optimal', heavy_tank_chassis: 'compatible', modern_tank_chassis: 'compatible' },
    guns: { medium_caliber_gun: 'optimal', large_caliber_gun: 'compatible', smoothbore_gun: 'compatible' },
    engines: { diesel_engine: 'optimal', multifuel_engine: 'optimal', gas_turbine: 'compatible', petrol_engine: 'compatible' },
    suspension: { torsion_bar: 'optimal', hydro_pneumatic: 'optimal', active_suspension: 'compatible', leaf_spring: 'compatible' },
  },
  heavy_tank: {
    chassis: { heavy_tank_chassis: 'optimal', super_heavy_tank_chassis: 'compatible' },
    guns: { large_caliber_gun: 'optimal', super_heavy_gun: 'compatible', medium_caliber_gun: 'compatible' },
    engines: { diesel_engine: 'optimal', multifuel_engine: 'compatible', gas_turbine: 'compatible' },
    suspension: { torsion_bar: 'optimal', hydro_pneumatic: 'optimal', active_suspension: 'compatible' },
  },
  tank_destroyer: {
    chassis: { medium_tank_chassis: 'optimal', heavy_tank_chassis: 'compatible', light_tank_chassis: 'compatible' },
    guns: { medium_caliber_gun: 'optimal', large_caliber_gun: 'optimal', super_heavy_gun: 'compatible', smoothbore_gun: 'compatible' },
    engines: { diesel_engine: 'optimal', multifuel_engine: 'optimal', gas_turbine: 'compatible' },
    suspension: { torsion_bar: 'optimal', hydro_pneumatic: 'optimal', active_suspension: 'compatible' },
  },
  spg: {
    chassis: { medium_tank_chassis: 'optimal', heavy_tank_chassis: 'compatible', light_tank_chassis: 'compatible', modern_tank_chassis: 'compatible' },
    guns: { large_caliber_gun: 'optimal', super_heavy_gun: 'optimal', rocket_launcher: 'optimal', smoothbore_gun: 'compatible', medium_caliber_gun: 'compatible' },
    engines: { diesel_engine: 'optimal', multifuel_engine: 'compatible', gas_turbine: 'compatible' },
    suspension: { torsion_bar: 'optimal', hydro_pneumatic: 'compatible', active_suspension: 'compatible' },
  },
  anti_air_tank: {
    chassis: { light_tank_chassis: 'optimal', medium_tank_chassis: 'compatible' },
    guns: { auto_cannon: 'optimal', small_caliber_gun: 'compatible', medium_caliber_gun: 'incompatible' },
    engines: { petrol_engine: 'compatible', diesel_engine: 'optimal', gas_turbine: 'compatible', multifuel_engine: 'compatible' },
    suspension: { leaf_spring: 'compatible', torsion_bar: 'optimal', hydro_pneumatic: 'optimal', active_suspension: 'compatible' },
  },
  modern_tank: {
    chassis: { modern_tank_chassis: 'optimal', heavy_tank_chassis: 'compatible' },
    guns: { smoothbore_gun: 'optimal', large_caliber_gun: 'compatible' },
    engines: { gas_turbine: 'optimal', multifuel_engine: 'optimal', diesel_engine: 'compatible' },
    suspension: { hydro_pneumatic: 'optimal', active_suspension: 'optimal', torsion_bar: 'compatible' },
  },
  super_heavy_tank: {
    chassis: { super_heavy_tank_chassis: 'optimal' },
    guns: { super_heavy_gun: 'optimal', smoothbore_gun: 'compatible', large_caliber_gun: 'compatible' },
    engines: { diesel_engine: 'compatible', multifuel_engine: 'compatible', gas_turbine: 'compatible' },
    suspension: { torsion_bar: 'optimal', hydro_pneumatic: 'compatible', active_suspension: 'compatible' },
  },
};

const MODULE_LABELS: Record<string, string> = {
  light_tank_chassis: 'Light Chassis',
  medium_tank_chassis: 'Medium Chassis',
  heavy_tank_chassis: 'Heavy Chassis',
  modern_tank_chassis: 'Modern Chassis',
  super_heavy_tank_chassis: 'Super Heavy Chassis',
  small_caliber_gun: 'Small Caliber',
  medium_caliber_gun: 'Medium Caliber',
  large_caliber_gun: 'Large Caliber',
  super_heavy_gun: 'Super Heavy Gun',
  smoothbore_gun: 'Smoothbore',
  auto_cannon: 'Autocannon',
  rocket_launcher: 'Rocket Launcher',
  petrol_engine: 'Petrol',
  diesel_engine: 'Diesel',
  multifuel_engine: 'Multifuel',
  gas_turbine: 'Gas Turbine',
  leaf_spring: 'Leaf Spring',
  torsion_bar: 'Torsion Bar',
  hydro_pneumatic: 'Hydro-pneumatic',
  active_suspension: 'Active Susp.',
};

type MatrixCategory = 'chassis' | 'guns' | 'engines' | 'suspension';

const CATEGORIES: { key: MatrixCategory; label: string; types: string[] }[] = [
  { key: 'chassis', label: 'Chassis', types: CHASSIS_TYPES },
  { key: 'guns', label: 'Guns', types: GUN_TYPES },
  { key: 'engines', label: 'Engines', types: ENGINE_TYPES },
  { key: 'suspension', label: 'Suspension', types: SUSPENSION_TYPES },
];

interface CompatibilityCellProps {
  status: 'optimal' | 'compatible' | 'incompatible' | undefined;
  current?: boolean;
}

function CompatibilityCell({ status, current }: CompatibilityCellProps) {
  if (!status) return (
    <div className="w-10 h-10 flex items-center justify-center">
      <Minus className="w-5 h-5 text-muted-foreground/30" />
    </div>
  );

  const baseClasses = 'w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all';
  const statusClasses = {
    optimal: 'bg-green-500/20 border-green-500 text-green-500',
    compatible: 'bg-blue-500/20 border-blue-500 text-blue-500',
    incompatible: 'bg-red-500/20 border-red-500 text-red-500',
  };

  const icons = {
    optimal: <Check className="w-5 h-5" />,
    compatible: <Minus className="w-5 h-5" />,
    incompatible: <X className="w-5 h-5" />,
  };

  return (
    <Tooltip content={
      <div className="text-xs">
        <span className="capitalize">{status}</span>
        {current && ' (Current)'}
      </div>
    } side="top">
      <div className={cn(baseClasses, statusClasses[status], current && 'ring-2 ring-offset-2 ring-primary')}>
        {icons[status]}
      </div>
    </Tooltip>
  );
}

interface TankCompatibilityMatrixProps {
  currentDesign: {
    role: TankRole;
    chassis: ChassisType;
    gun: GunType;
    engine: EngineType;
    suspension: SuspensionType;
  };
}

export function TankCompatibilityMatrix({ currentDesign }: TankCompatibilityMatrixProps) {
  const compat = COMPATIBILITY[currentDesign.role];

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Compatibility Matrix</CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentDesign.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {CATEGORIES.map(({ key, label, types }) => (
              <div key={key} className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {label}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="w-32 text-left text-xs font-medium text-muted-foreground pb-2">
                          Role / Module
                        </th>
                        {types.map(type => (
                          <th key={type} className="w-10 text-center text-xs font-medium text-muted-foreground pb-2">
                            <div className="rotate-90 origin-center -translate-y-2 whitespace-nowrap">
                              {MODULE_LABELS[type] || type}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ROLES.map(role => {
                        const roleCompat = COMPATIBILITY[role];
                        const categoryCompat = roleCompat[key as MatrixCategory] as Partial<Record<string, 'optimal' | 'compatible' | 'incompatible'>>;
                        const isCurrentRole = role === currentDesign.role;

                        return (
                          <tr key={role} className={cn(isCurrentRole && 'bg-primary/5')}>
                            <td className="w-32 text-left text-xs font-medium text-gray-900 dark:text-gray-100">
                              {isCurrentRole && <span className="inline-flex items-center gap-1 mr-1"><Info className="w-3 h-3 text-primary" /> </span>}
                              {role.replace('_', ' ').toUpperCase()}
                            </td>
                            {types.map(type => (
                              <td key={type} className="text-center">
                                <CompatibilityCell
                                  status={categoryCompat[type]}
                                  current={isCurrentRole && currentDesign[key as keyof typeof currentDesign] === type}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-green-500 bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-xs text-muted-foreground">Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center">
                  <Minus className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs text-muted-foreground">Compatible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-red-500 bg-red-500/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-xs text-muted-foreground">Incompatible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-gray-400 bg-gray-400/10 flex items-center justify-center">
                  <Minus className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-xs text-muted-foreground">Not Rated</span>
              </div>
            </div>

            {/* Current Selection Summary */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Current Selection
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Chassis:</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.chassis]}</span>
                  <CompatibilityCell status={compat.chassis[currentDesign.chassis]} current />
                </div>
                <div>
                  <span className="text-muted-foreground">Gun:</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.gun]}</span>
                  <CompatibilityCell status={compat.guns[currentDesign.gun]} current />
                </div>
                <div>
                  <span className="text-muted-foreground">Engine:</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.engine]}</span>
                  <CompatibilityCell status={compat.engines[currentDesign.engine]} current />
                </div>
                <div>
                  <span className="text-muted-foreground">Suspension:</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.suspension]}</span>
                  <CompatibilityCell status={compat.suspension[currentDesign.suspension]} current />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}