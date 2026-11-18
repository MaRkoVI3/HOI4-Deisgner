'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge, cn, Tooltip, TooltipProvider } from '@generalstaff/ui-components';
import type { AircraftType, AircraftRole, AirframeType, AircraftEngineType } from '@generalstaff/calculation-engine';
import { Check, X, Minus, Info } from 'lucide-react';

const AIRFRAME_TYPES: AirframeType[] = [
  'biplane',
  'monoplane',
  'jet_airframe',
  'stealth_airframe',
  'heavy_airframe',
  'transport_airframe',
  'rotary_wing',
  'vtol_airframe',
  'uav_airframe',
];

const ENGINE_TYPES: AircraftEngineType[] = [
  'piston_engine',
  'radial_engine',
  'inline_engine',
  'turboprop',
  'turbojet',
  'turbofan',
  'turboshaft',
  'ramjet',
  'scramjet',
];

const AIRCRAFT_TYPES: AircraftType[] = [
  'fighter',
  'heavy_fighter',
  'jet_fighter',
  'interceptor',
  'cas',
  'naval_bomber',
  'tactical_bomber',
  'strategic_bomber',
  'transport',
  'recon',
  'flying_boat',
  'helicopter',
  'vtol',
  'uav',
];

const ROLES: AircraftRole[] = [
  'air_superiority',
  'interception',
  'ground_attack',
  'naval_strike',
  'strategic_bombing',
  'tactical_bombing',
  'reconnaissance',
  'transport',
  'anti_sub',
  'aew',
  'tanker',
  'trainer',
];

const MODULE_LABELS: Record<string, string> = {
  biplane: 'Biplane',
  monoplane: 'Monoplane',
  jet_airframe: 'Jet Airframe',
  stealth_airframe: 'Stealth Airframe',
  heavy_airframe: 'Heavy Airframe',
  transport_airframe: 'Transport Airframe',
  rotary_wing: 'Rotary Wing',
  vtol_airframe: 'VTOL Airframe',
  uav_airframe: 'UAV Airframe',
  piston_engine: 'Piston Engine',
  radial_engine: 'Radial Engine',
  inline_engine: 'Inline Engine',
  turboprop: 'Turboprop',
  turbojet: 'Turbojet',
  turbofan: 'Turbofan',
  turboshaft: 'Turboshaft',
  ramjet: 'Ramjet',
  scramjet: 'Scramjet',
  fighter: 'Fighter',
  heavy_fighter: 'Heavy Fighter',
  jet_fighter: 'Jet Fighter',
  interceptor: 'Interceptor',
  cas: 'CAS',
  naval_bomber: 'Naval Bomber',
  tactical_bomber: 'Tactical Bomber',
  strategic_bomber: 'Strategic Bomber',
  transport: 'Transport',
  recon: 'Recon',
  flying_boat: 'Flying Boat',
  helicopter: 'Helicopter',
  vtol: 'VTOL',
  uav: 'UAV',
  air_superiority: 'Air Superiority',
  interception: 'Interception',
  ground_attack: 'Ground Attack',
  naval_strike: 'Naval Strike',
  strategic_bombing: 'Strategic Bombing',
  tactical_bombing: 'Tactical Bombing',
  reconnaissance: 'Reconnaissance',
  anti_sub: 'Anti-Sub',
  aew: 'AEW&C',
  tanker: 'Tanker',
  trainer: 'Trainer',
};

const AIRFRAME_COMPAT: Record<AircraftType, Partial<Record<AirframeType, 'optimal' | 'compatible' | 'incompatible'>>> = {
  fighter: { biplane: 'compatible', monoplane: 'optimal' },
  heavy_fighter: { monoplane: 'optimal' },
  jet_fighter: { jet_airframe: 'optimal', stealth_airframe: 'optimal' },
  interceptor: { monoplane: 'compatible', jet_airframe: 'optimal' },
  cas: { monoplane: 'optimal', jet_airframe: 'optimal' },
  naval_bomber: { monoplane: 'optimal', jet_airframe: 'compatible' },
  tactical_bomber: { monoplane: 'optimal', jet_airframe: 'optimal', heavy_airframe: 'compatible' },
  strategic_bomber: { heavy_airframe: 'optimal', stealth_airframe: 'optimal' },
  transport: { transport_airframe: 'optimal', heavy_airframe: 'compatible' },
  recon: { monoplane: 'compatible', jet_airframe: 'optimal', stealth_airframe: 'optimal' },
  flying_boat: { monoplane: 'optimal' },
  helicopter: { rotary_wing: 'optimal' },
  vtol: { vtol_airframe: 'optimal' },
  uav: { uav_airframe: 'optimal' },
};

const ENGINE_COMPAT: Record<AircraftType, Partial<Record<AircraftEngineType, 'optimal' | 'compatible' | 'incompatible'>>> = {
  fighter: { piston_engine: 'compatible', radial_engine: 'compatible', inline_engine: 'optimal' },
  heavy_fighter: { radial_engine: 'optimal', inline_engine: 'compatible' },
  jet_fighter: { turbojet: 'optimal', turbofan: 'optimal' },
  interceptor: { inline_engine: 'compatible', turbojet: 'optimal', turbofan: 'compatible' },
  cas: { radial_engine: 'compatible', inline_engine: 'optimal', turbofan: 'optimal', turboprop: 'compatible' },
  naval_bomber: { radial_engine: 'optimal', turbofan: 'compatible', turbojet: 'compatible' },
  tactical_bomber: { radial_engine: 'compatible', turbojet: 'optimal', turbofan: 'optimal' },
  strategic_bomber: { radial_engine: 'compatible', turbojet: 'optimal', turbofan: 'optimal', turboprop: 'compatible' },
  transport: { radial_engine: 'compatible', turboprop: 'optimal', turbofan: 'optimal', turbojet: 'compatible' },
  recon: { inline_engine: 'optimal', turbojet: 'optimal', turbofan: 'optimal', ramjet: 'compatible' },
  flying_boat: { radial_engine: 'optimal', turboprop: 'compatible' },
  helicopter: { turboshaft: 'optimal', turboprop: 'compatible' },
  vtol: { turbofan: 'optimal', turbojet: 'compatible' },
  uav: { turbofan: 'optimal', turboprop: 'compatible', turbojet: 'compatible', ramjet: 'compatible', scramjet: 'compatible' },
};

const ROLE_AIRFRAME_COMPAT: Record<AircraftRole, Partial<Record<AirframeType, 'optimal' | 'compatible' | 'incompatible'>>> = {
  air_superiority: { monoplane: 'compatible', jet_airframe: 'optimal', stealth_airframe: 'optimal' },
  interception: { monoplane: 'compatible', jet_airframe: 'optimal', stealth_airframe: 'compatible' },
  ground_attack: { monoplane: 'optimal', jet_airframe: 'optimal', vtol_airframe: 'compatible', rotary_wing: 'compatible' },
  naval_strike: { monoplane: 'optimal', jet_airframe: 'compatible', rotary_wing: 'compatible' },
  strategic_bombing: { heavy_airframe: 'optimal', stealth_airframe: 'optimal' },
  tactical_bombing: { monoplane: 'optimal', jet_airframe: 'optimal', heavy_airframe: 'compatible' },
  reconnaissance: { monoplane: 'compatible', jet_airframe: 'optimal', stealth_airframe: 'optimal', uav_airframe: 'optimal' },
  transport: { transport_airframe: 'optimal', heavy_airframe: 'compatible' },
  anti_sub: { rotary_wing: 'optimal', monoplane: 'compatible', uav_airframe: 'compatible' },
  aew: { transport_airframe: 'optimal', uav_airframe: 'compatible' },
  tanker: { transport_airframe: 'optimal' },
  trainer: { monoplane: 'optimal', jet_airframe: 'compatible', uav_airframe: 'compatible' },
};

const ROLE_ENGINE_COMPAT: Record<AircraftRole, Partial<Record<AircraftEngineType, 'optimal' | 'compatible' | 'incompatible'>>> = {
  air_superiority: { inline_engine: 'compatible', turbojet: 'optimal', turbofan: 'optimal' },
  interception: { inline_engine: 'compatible', turbojet: 'optimal', turbofan: 'compatible' },
  ground_attack: { radial_engine: 'compatible', inline_engine: 'optimal', turbofan: 'optimal', turboprop: 'compatible' },
  naval_strike: { radial_engine: 'compatible', turbofan: 'compatible', turbojet: 'compatible', turboshaft: 'compatible' },
  strategic_bombing: { radial_engine: 'compatible', turbojet: 'optimal', turbofan: 'optimal', turboprop: 'compatible' },
  tactical_bombing: { radial_engine: 'compatible', turbojet: 'optimal', turbofan: 'optimal' },
  reconnaissance: { inline_engine: 'optimal', turbojet: 'optimal', turbofan: 'optimal', ramjet: 'compatible' },
  transport: { radial_engine: 'compatible', turboprop: 'optimal', turbofan: 'optimal', turbojet: 'compatible' },
  anti_sub: { turboshaft: 'optimal', turboprop: 'compatible', turbofan: 'compatible' },
  aew: { turbofan: 'optimal', turbojet: 'compatible' },
  tanker: { turbofan: 'optimal', turbojet: 'compatible' },
  trainer: { piston_engine: 'compatible', turbofan: 'optimal', turbojet: 'compatible' },
};

type MatrixCategory = 'airframes' | 'engines';

const CATEGORIES: { key: MatrixCategory; label: string; types: (AirframeType | AircraftEngineType)[] }[] = [
  {
    key: 'airframes',
    label: 'Airframes',
    types: AIRFRAME_TYPES,
  },
  {
    key: 'engines',
    label: 'Engines',
    types: ENGINE_TYPES,
  },
];

function CompatibilityCell({ status, current }: { status: 'optimal' | 'compatible' | 'incompatible' | undefined; current?: boolean }) {
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

interface AircraftCompatibilityMatrixProps {
  currentDesign: {
    type: AircraftType;
    role: AircraftRole;
    airframe: AirframeType;
    engine: AircraftEngineType;
  };
}

export function AircraftCompatibilityMatrix({ currentDesign }: AircraftCompatibilityMatrixProps) {
  const compatAirframe = AIRFRAME_COMPAT[currentDesign.type] || {};
  const compatEngine = ENGINE_COMPAT[currentDesign.type] || {};
  const compatRoleAirframe = ROLE_AIRFRAME_COMPAT[currentDesign.role] || {};
  const compatRoleEngine = ROLE_ENGINE_COMPAT[currentDesign.role] || {};

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Compatibility Matrix</CardTitle>
            <Badge variant="outline" className="text-xs">
              {MODULE_LABELS[currentDesign.type]} / {MODULE_LABELS[currentDesign.role]}
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
                        <th className="w-40 text-left text-xs font-medium text-muted-foreground pb-2">
                          Type / Role
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
                      {AIRCRAFT_TYPES.map(type => {
                        const typeAirframeCompat = AIRFRAME_COMPAT[type] || {};
                        const typeEngineCompat = ENGINE_COMPAT[type] || {};
                        const isCurrentType = type === currentDesign.type;

                        return (
                          <tr key={type} className={cn(isCurrentType && 'bg-primary/5')}>
                            <td className="w-40 text-left text-xs font-medium text-gray-900 dark:text-gray-100">
                              {isCurrentType && <span className="inline-flex items-center gap-1 mr-1"><Info className="w-3 h-3 text-primary" /> </span>}
                              {MODULE_LABELS[type]}
                            </td>
                            {types.map(moduleType => {
                              const status = key === 'airframes' ? typeAirframeCompat[moduleType as AirframeType] : typeEngineCompat[moduleType as AircraftEngineType];
                              return (
                                <td key={moduleType} className="text-center">
                                  <CompatibilityCell
                                    status={status}
                                    current={isCurrentType && currentDesign[key === 'airframes' ? 'airframe' : 'engine'] === moduleType}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {ROLES.map(role => {
                        const roleAirframeCompat = ROLE_AIRFRAME_COMPAT[role] || {};
                        const roleEngineCompat = ROLE_ENGINE_COMPAT[role] || {};
                        const isCurrentRole = role === currentDesign.role;

                        return (
                          <tr key={role} className={cn(isCurrentRole && 'bg-primary/5')}>
                            <td className="w-40 text-left text-xs font-medium text-gray-900 dark:text-gray-100">
                              {isCurrentRole && <span className="inline-flex items-center gap-1 mr-1"><Info className="w-3 h-3 text-primary" /> </span>}
                              {MODULE_LABELS[role]}
                            </td>
                            {types.map(moduleType => {
                              const status = key === 'airframes' ? roleAirframeCompat[moduleType as AirframeType] : roleEngineCompat[moduleType as AircraftEngineType];
                              return (
                                <td key={moduleType} className="text-center">
                                  <CompatibilityCell
                                    status={status}
                                    current={isCurrentRole && currentDesign[key === 'airframes' ? 'airframe' : 'engine'] === moduleType}
                                  />
                                </td>
                              );
                            })}
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
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Airframe:</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.airframe]}</span>
                  <CompatibilityCell status={compatAirframe[currentDesign.airframe]} current />
                </div>
                <div>
                  <span className="text-muted-foreground">Engine:</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.engine]}</span>
                  <CompatibilityCell status={compatEngine[currentDesign.engine]} current />
                </div>
                <div>
                  <span className="text-muted-foreground">Airframe (Role):</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.airframe]}</span>
                  <CompatibilityCell status={compatRoleAirframe[currentDesign.airframe]} current />
                </div>
                <div>
                  <span className="text-muted-foreground">Engine (Role):</span>
                  <span className="font-medium ml-1">{MODULE_LABELS[currentDesign.engine]}</span>
                  <CompatibilityCell status={compatRoleEngine[currentDesign.engine]} current />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}