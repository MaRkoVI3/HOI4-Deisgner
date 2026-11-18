'use client';

import { Select, Card, CardHeader, CardTitle, CardContent, Badge, TooltipProvider } from '@generalstaff/ui-components';
import type { AircraftType, AircraftRole, AirframeType, AircraftEngineType, AircraftModule } from '@generalstaff/calculation-engine';

interface ModuleOption {
  value: string;
  label: string;
  description?: string;
  compatibleTypes?: AircraftType[];
  compatibleRoles?: AircraftRole[];
}

const AIRFRAME_OPTIONS: ModuleOption[] = [
  { value: 'biplane', label: 'Biplane', description: 'Early design, high maneuverability, low speed', compatibleTypes: ['fighter', 'heavy_fighter', 'cas', 'naval_bomber', 'tactical_bomber', 'recon', 'flying_boat'] },
  { value: 'monoplane', label: 'Monoplane', description: 'Standard WWII design, good balance', compatibleTypes: ['fighter', 'heavy_fighter', 'cas', 'naval_bomber', 'tactical_bomber', 'strategic_bomber', 'recon', 'flying_boat'] },
  { value: 'jet_airframe', label: 'Jet Airframe', description: 'High speed, good climb rate', compatibleTypes: ['jet_fighter', 'interceptor', 'cas', 'naval_bomber', 'vtol'] },
  { value: 'stealth_airframe', label: 'Stealth Airframe', description: 'Low radar cross-section, modern', compatibleTypes: ['jet_fighter', 'interceptor', 'uav'] },
  { value: 'heavy_airframe', label: 'Heavy Airframe', description: 'Large payload, long range', compatibleTypes: ['strategic_bomber', 'transport'] },
  { value: 'transport_airframe', label: 'Transport Airframe', description: 'Optimized for cargo/passengers', compatibleTypes: ['transport'] },
  { value: 'rotary_wing', label: 'Rotary Wing', description: 'Helicopter airframe, VTOL capable', compatibleTypes: ['helicopter'] },
  { value: 'vtol_airframe', label: 'VTOL Airframe', description: 'Vertical takeoff capability', compatibleTypes: ['vtol'] },
  { value: 'uav_airframe', label: 'UAV Airframe', description: 'Unmanned, long endurance', compatibleTypes: ['uav'] },
];

const ENGINE_OPTIONS: ModuleOption[] = [
  { value: 'piston_engine', label: 'Piston Engine', description: 'Reliable, good power-to-weight, WWII era', compatibleTypes: ['fighter', 'heavy_fighter', 'cas', 'naval_bomber', 'tactical_bomber', 'recon', 'flying_boat'] },
  { value: 'radial_engine', label: 'Radial Engine', description: 'Air-cooled, rugged, high power', compatibleTypes: ['fighter', 'heavy_fighter', 'cas', 'naval_bomber', 'tactical_bomber', 'strategic_bomber', 'transport', 'recon', 'flying_boat'] },
  { value: 'inline_engine', label: 'Inline Engine', description: 'Streamlined, high altitude performance', compatibleTypes: ['fighter', 'heavy_fighter', 'cas', 'interceptor', 'recon'] },
  { value: 'turboprop', label: 'Turboprop', description: 'Efficient at medium speeds, long range', compatibleTypes: ['transport', 'recon', 'cas', 'helicopter', 'flying_boat'] },
  { value: 'turbojet', label: 'Turbojet', description: 'High speed, poor efficiency at low speed', compatibleTypes: ['jet_fighter', 'interceptor', 'cas', 'naval_bomber', 'vtol'] },
  { value: 'turbofan', label: 'Turbofan', description: 'Best balance of speed and efficiency', compatibleTypes: ['jet_fighter', 'interceptor', 'cas', 'naval_bomber', 'strategic_bomber', 'transport', 'vtol', 'uav'] },
  { value: 'turboshaft', label: 'Turboshaft', description: 'For helicopters, high torque', compatibleTypes: ['helicopter'] },
  { value: 'ramjet', label: 'Ramjet', description: 'Extreme speed, requires boost to start', compatibleTypes: ['interceptor', 'uav'] },
  { value: 'scramjet', label: 'Scramjet', description: 'Hypersonic, experimental', compatibleTypes: ['uav'] },
];

const AIRCRAFT_TYPE_OPTIONS: ModuleOption[] = [
  { value: 'fighter', label: 'Fighter', description: 'Air superiority, interception' },
  { value: 'heavy_fighter', label: 'Heavy Fighter', description: 'Twin-engine, long range escort' },
  { value: 'jet_fighter', label: 'Jet Fighter', description: 'Post-WWII jet fighter' },
  { value: 'interceptor', label: 'Interceptor', description: 'High speed, rapid climb' },
  { value: 'cas', label: 'Close Air Support', description: 'Ground attack, tank busting' },
  { value: 'naval_bomber', label: 'Naval Bomber', description: 'Anti-ship, torpedo bomber' },
  { value: 'tactical_bomber', label: 'Tactical Bomber', description: 'Battlefield interdiction' },
  { value: 'strategic_bomber', label: 'Strategic Bomber', description: 'Long range, heavy payload' },
  { value: 'transport', label: 'Transport', description: 'Cargo, troop transport, tanker' },
  { value: 'recon', label: 'Reconnaissance', description: 'Surveillance, photo/ELINT' },
  { value: 'flying_boat', label: 'Flying Boat', description: 'Maritime patrol, water ops' },
  { value: 'helicopter', label: 'Helicopter', description: 'VTOL, anti-sub, transport' },
  { value: 'vtol', label: 'VTOL', description: 'Vertical takeoff, carrier ops' },
  { value: 'uav', label: 'UAV', description: 'Unmanned, long endurance' },
];

const ROLE_OPTIONS: ModuleOption[] = [
  { value: 'air_superiority', label: 'Air Superiority', description: 'Dominate enemy airspace', compatibleTypes: ['fighter', 'heavy_fighter', 'jet_fighter'] },
  { value: 'interception', label: 'Interception', description: 'High speed, climb to intercept bombers', compatibleTypes: ['interceptor', 'jet_fighter', 'heavy_fighter'] },
  { value: 'ground_attack', label: 'Ground Attack', description: 'Close air support, anti-tank', compatibleTypes: ['cas', 'jet_fighter', 'heavy_fighter', 'vtol', 'helicopter'] },
  { value: 'naval_strike', label: 'Naval Strike', description: 'Anti-ship, maritime patrol', compatibleTypes: ['naval_bomber', 'cas', 'helicopter', 'flying_boat'] },
  { value: 'strategic_bombing', label: 'Strategic Bombing', description: 'Long range, heavy payload', compatibleTypes: ['strategic_bomber'] },
  { value: 'tactical_bombing', label: 'Tactical Bombing', description: 'Battlefield interdiction', compatibleTypes: ['tactical_bomber', 'cas', 'jet_fighter'] },
  { value: 'reconnaissance', label: 'Reconnaissance', description: 'Photo/ELINT/SIGINT', compatibleTypes: ['recon', 'flying_boat', 'uav', 'jet_fighter'] },
  { value: 'transport', label: 'Transport', description: 'Cargo, paratroop, tanker', compatibleTypes: ['transport'] },
  { value: 'anti_sub', label: 'Anti-Submarine', description: 'ASW patrol, sonobuoys', compatibleTypes: ['helicopter', 'flying_boat', 'uav'] },
  { value: 'aew', label: 'AEW&C', description: 'Airborne early warning', compatibleTypes: ['transport', 'uav'] },
  { value: 'tanker', label: 'Aerial Refueling', description: 'Extend range of other aircraft', compatibleTypes: ['transport'] },
  { value: 'trainer', label: 'Trainer', description: 'Pilot training', compatibleTypes: ['jet_fighter', 'transport'] },
];

interface AircraftModulePickerProps {
  type: AircraftType;
  role: AircraftRole;
  airframe: AirframeType;
  engine: AircraftEngineType;
  modules: AircraftModule[];
  onTypeChange: (value: AircraftType) => void;
  onRoleChange: (value: AircraftRole) => void;
  onAirframeChange: (value: AirframeType) => void;
  onEngineChange: (value: AircraftEngineType) => void;
}

export function AircraftModulePicker({
  type,
  role,
  airframe,
  engine,
  modules,
  onTypeChange,
  onRoleChange,
  onAirframeChange,
  onEngineChange,
}: AircraftModulePickerProps) {
  const filteredAirframes = AIRFRAME_OPTIONS.filter(opt => !opt.compatibleTypes || opt.compatibleTypes.includes(type));
  const filteredEngines = ENGINE_OPTIONS.filter(opt => !opt.compatibleTypes || opt.compatibleTypes.includes(type));
  const filteredRoles = ROLE_OPTIONS.filter(opt => !opt.compatibleTypes || opt.compatibleTypes.includes(type));

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Aircraft Type Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">1</Badge>
              Aircraft Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as AircraftType)}
              placeholder="Select aircraft type..."
              options={AIRCRAFT_TYPE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {AIRCRAFT_TYPE_OPTIONS.find(o => o.value === type)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Role Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">2</Badge>
              Primary Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as AircraftRole)}
              placeholder="Select role..."
              options={filteredRoles.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {filteredRoles.find(r => r.value === role)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Airframe Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">3</Badge>
              Airframe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={airframe}
              onChange={(e) => onAirframeChange(e.target.value as AirframeType)}
              placeholder="Select airframe..."
              options={filteredAirframes.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {filteredAirframes.find(a => a.value === airframe)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Engine Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">4</Badge>
              Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={engine}
              onChange={(e) => onEngineChange(e.target.value as AircraftEngineType)}
              placeholder="Select engine..."
              options={filteredEngines.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {filteredEngines.find(e => e.value === engine)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">5</Badge>
              Modules & Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{modules.length} modules</Badge>
              </div>
              {modules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No additional modules equipped. Select airframe and engine first.
                </p>
              ) : (
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div
                      key={module.id || index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">{module.type}</Badge>
                        <Badge variant="outline" className="text-xs">{module.slot}</Badge>
                        <span className="text-sm font-medium">{module.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}