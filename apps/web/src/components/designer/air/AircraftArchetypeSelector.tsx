'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '@generalstaff/ui-components';
import type { AircraftType, AircraftRole, AirframeType, AircraftEngineType, AircraftModule, AircraftModuleType, AircraftModuleSlot } from '@generalstaff/calculation-engine';
import { Zap, Target, Crosshair, Shield, Sparkles, Plane, RotateCcw, Radar } from 'lucide-react';

export interface ArchetypeTemplate {
  id: string;
  name: string;
  type: AircraftType;
  role: AircraftRole;
  description: string;
  year: number;
  airframe: AirframeType;
  engine: AircraftEngineType;
  modules: AircraftModule[];
  tags: string[];
  icon: React.ReactNode;
}

const ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  // Fighters - Air Superiority
  {
    id: 'fighter_early',
    name: 'Early Monoplane Fighter',
    type: 'fighter',
    role: 'air_superiority',
    description: 'Pre-war monoplane fighter with inline engine',
    year: 1938,
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [],
    tags: ['Early War', 'Inline Engine', 'Maneuverable'],
    icon: <Plane className="h-5 w-5" />,
  },
  {
    id: 'fighter_ww2',
    name: 'WWII Air Superiority Fighter',
    type: 'fighter',
    role: 'air_superiority',
    description: 'Main production fighter with radial engine',
    year: 1942,
    airframe: 'monoplane',
    engine: 'radial_engine',
    modules: [],
    tags: ['WWII', 'Mass Production', 'Radial Engine'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'jet_fighter_early',
    name: 'Early Jet Fighter',
    type: 'jet_fighter',
    role: 'air_superiority',
    description: 'First generation jet fighter',
    year: 1945,
    airframe: 'jet_airframe',
    engine: 'turbojet',
    modules: [],
    tags: ['First Jet', 'High Speed', 'Short Range'],
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'jet_fighter_coldwar',
    name: 'Cold War Supersonic Fighter',
    type: 'jet_fighter',
    role: 'air_superiority',
    description: 'Mach 2 capable fighter with radar missiles',
    year: 1960,
    airframe: 'jet_airframe',
    engine: 'turbojet',
    modules: [{ id: 'radar_missile', type: 'missile_air_air' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any }],
    tags: ['Supersonic', 'Radar Missiles', 'All-Weather'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'jet_fighter_modern',
    name: 'Modern 4th Gen Fighter',
    type: 'jet_fighter',
    role: 'air_superiority',
    description: 'Multirole fighter with fly-by-wire and BVR missiles',
    year: 1985,
    airframe: 'jet_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'pulse_doppler', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'bvr_missile', type: 'missile_air_air' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Fly-by-wire', 'BVR', 'Multirole', 'HOTAS'],
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'jet_fighter_stealth',
    name: '5th Gen Stealth Fighter',
    type: 'jet_fighter',
    role: 'air_superiority',
    description: 'Stealth supercruise fighter with AESA radar',
    year: 2005,
    airframe: 'stealth_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'aesa_radar', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'stealth_coating', type: 'stealth_coating' as AircraftModuleType, slot: 'protection' as AircraftModuleSlot, stats: {} as any },
      { id: 'internal_bay', type: 'missile_air_air' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Stealth', 'Supercruise', 'AESA', 'Internal Weapons'],
    icon: <Shield className="h-5 w-5" />,
  },

  // Interceptors
  {
    id: 'interceptor_early',
    name: 'Point Defense Interceptor',
    type: 'interceptor',
    role: 'interception',
    description: 'High climb rate, short range interceptor',
    year: 1940,
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [],
    tags: ['High Climb', 'Point Defense', 'Short Range'],
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'interceptor_jet',
    name: 'Supersonic Interceptor',
    type: 'interceptor',
    role: 'interception',
    description: 'Mach 2+ pure interceptor with afterburner',
    year: 1955,
    airframe: 'jet_airframe',
    engine: 'turbojet',
    modules: [],
    tags: ['Mach 2+', 'Afterburner', 'Quick Reaction'],
    icon: <Crosshair className="h-5 w-5" />,
  },

  // Heavy Fighters
  {
    id: 'heavy_fighter_ww2',
    name: 'WWII Heavy Fighter',
    type: 'heavy_fighter',
    role: 'interception',
    description: 'Twin-engine long-range escort fighter',
    year: 1941,
    airframe: 'monoplane',
    engine: 'radial_engine',
    modules: [],
    tags: ['Twin Engine', 'Long Range', 'Escort'],
    icon: <Shield className="h-5 w-5" />,
  },

  // CAS / Ground Attack
  {
    id: 'cas_ww2',
    name: 'WWII Ground Attack Aircraft',
    type: 'cas',
    role: 'ground_attack',
    description: 'Armored attack plane for close air support',
    year: 1942,
    airframe: 'monoplane',
    engine: 'radial_engine',
    modules: [{ id: 'armor_pilot', type: 'armor' as AircraftModuleType, slot: 'protection' as AircraftModuleSlot, stats: {} as any }],
    tags: ['CAS', 'Armored', 'Cannon Armed'],
    icon: <Crosshair className="h-5 w-5" />,
  },
  {
    id: 'cas_jet',
    name: 'Jet Attack Aircraft',
    type: 'cas',
    role: 'ground_attack',
    description: 'Subsonic jet for battlefield interdiction',
    year: 1965,
    airframe: 'jet_airframe',
    engine: 'turbofan',
    modules: [{ id: 'targeting_pod', type: 'targeting_pod' as AircraftModuleType, slot: 'targeting' as AircraftModuleSlot, stats: {} as any }],
    tags: ['Precision', 'Targeting Pod', 'All-Weather'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'cas_modern',
    name: 'Modern Attack Aircraft',
    type: 'cas',
    role: 'ground_attack',
    description: 'Advanced CAS with precision guided munitions',
    year: 1990,
    airframe: 'jet_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'targeting_pod', type: 'targeting_pod' as AircraftModuleType, slot: 'targeting' as AircraftModuleSlot, stats: {} as any },
      { id: 'pgm', type: 'missile_air_ground' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any },
      { id: 'ew_suite', type: 'ew_suite' as AircraftModuleType, slot: 'ew' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['PGM', 'EW Suite', 'Helmet Cueing', 'Networked'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Naval Bombers
  {
    id: 'naval_bomber_ww2',
    name: 'WWII Torpedo Bomber',
    type: 'naval_bomber',
    role: 'naval_strike',
    description: 'Carrier-based torpedo and dive bomber',
    year: 1941,
    airframe: 'monoplane',
    engine: 'radial_engine',
    modules: [{ id: 'torpedo', type: 'torpedo' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any }],
    tags: ['Carrier', 'Torpedo', 'Dive Bombing'],
    icon: <Plane className="h-5 w-5" />,
  },
  {
    id: 'naval_bomber_modern',
    name: 'Modern Anti-Ship Aircraft',
    type: 'naval_bomber',
    role: 'naval_strike',
    description: 'Sea-skimming anti-ship missile carrier',
    year: 1980,
    airframe: 'jet_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'ashm', type: 'missile_anti_ship' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any },
      { id: 'maritime_radar', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['ASM', 'Sea-Skimming', 'Over-the-Horizon'],
    icon: <Radar className="h-5 w-5" />,
  },

  // Tactical Bombers
  {
    id: 'tactical_bomber_ww2',
    name: 'WWII Tactical Bomber',
    type: 'tactical_bomber',
    role: 'tactical_bombing',
    description: 'Twin-engine medium bomber for battlefield support',
    year: 1940,
    airframe: 'monoplane',
    engine: 'radial_engine',
    modules: [],
    tags: ['Twin Engine', 'Dive Bombing', 'Interdiction'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'tactical_bomber_jet',
    name: 'Jet Tactical Bomber',
    type: 'tactical_bomber',
    role: 'tactical_bombing',
    description: 'Supersonic tactical strike aircraft',
    year: 1965,
    airframe: 'jet_airframe',
    engine: 'turbojet',
    modules: [],
    tags: ['Supersonic', 'Low Level', 'Nuclear/Conventional'],
    icon: <Zap className="h-5 w-5" />,
  },

  // Strategic Bombers
  {
    id: 'strategic_bomber_ww2',
    name: 'WWII Heavy Bomber',
    type: 'strategic_bomber',
    role: 'strategic_bombing',
    description: 'Four-engine heavy bomber for strategic missions',
    year: 1942,
    airframe: 'heavy_airframe',
    engine: 'radial_engine',
    modules: [{ id: 'turret_defense', type: 'gun' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any }],
    tags: ['4-Engine', 'Defensive Turrets', 'Heavy Payload'],
    icon: <Plane className="h-5 w-5" />,
  },
  {
    id: 'strategic_bomber_jet',
    name: 'Jet Strategic Bomber',
    type: 'strategic_bomber',
    role: 'strategic_bombing',
    description: 'High-altitude jet bomber with nuclear capability',
    year: 1955,
    airframe: 'heavy_airframe',
    engine: 'turbojet',
    modules: [],
    tags: ['Nuclear Capable', 'High Altitude', 'Jet Powered'],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'strategic_bomber_modern',
    name: 'Modern Stealth Bomber',
    type: 'strategic_bomber',
    role: 'strategic_bombing',
    description: 'Flying wing stealth bomber with precision strike',
    year: 1995,
    airframe: 'stealth_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'stealth_shape', type: 'stealth_coating' as AircraftModuleType, slot: 'protection' as AircraftModuleSlot, stats: {} as any },
      { id: 'precision_nav', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Stealth', 'Precision', 'Global Reach'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Reconnaissance
  {
    id: 'recon_ww2',
    name: 'WWII Photo Reconnaissance',
    type: 'recon',
    role: 'reconnaissance',
    description: 'High-altitude unarmed photo recon aircraft',
    year: 1940,
    airframe: 'monoplane',
    engine: 'inline_engine',
    modules: [{ id: 'cameras', type: 'recon_pod' as AircraftModuleType, slot: 'recon' as AircraftModuleSlot, stats: {} as any }],
    tags: ['High Altitude', 'Photo Recon', 'Unarmed'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'recon_coldwar',
    name: 'Cold War Strategic Recon',
    type: 'recon',
    role: 'reconnaissance',
    description: 'Mach 3+ high-altitude strategic reconnaissance',
    year: 1960,
    airframe: 'jet_airframe',
    engine: 'turbojet',
    modules: [{ id: 'sigint', type: 'ew_suite' as AircraftModuleType, slot: 'ew' as AircraftModuleSlot, stats: {} as any }],
    tags: ['Mach 3+', 'SIGINT', 'Extreme Altitude'],
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'recon_modern',
    name: 'Modern ISR Platform',
    type: 'recon',
    role: 'reconnaissance',
    description: 'Multi-INT ISR with satellite link',
    year: 2000,
    airframe: 'jet_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'sar_radar', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'eo_ir', type: 'irst' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'satcom', type: 'data_link' as AircraftModuleType, slot: 'avionics' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['SAR', 'EO/IR', 'SATCOM', 'Real-time'],
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'aew_modern',
    name: 'AEW&C Aircraft',
    type: 'transport',
    role: 'aew',
    description: 'Airborne early warning and control',
    year: 1980,
    airframe: 'transport_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'rotodome', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'battle_mgmt', type: 'data_link' as AircraftModuleType, slot: 'avionics' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Rotodome', '360° Coverage', 'Battle Management'],
    icon: <Radar className="h-5 w-5" />,
  },

  // Transport
  {
    id: 'transport_ww2',
    name: 'WWII Transport',
    type: 'transport',
    role: 'transport',
    description: 'Twin-engine cargo and paratroop transport',
    year: 1940,
    airframe: 'transport_airframe',
    engine: 'radial_engine',
    modules: [],
    tags: ['Paratroop', 'Cargo', 'Reliable'],
    icon: <Plane className="h-5 w-5" />,
  },
  {
    id: 'transport_modern',
    name: 'Modern Strategic Airlifter',
    type: 'transport',
    role: 'transport',
    description: 'Heavy strategic transport with air-drop capability',
    year: 1985,
    airframe: 'transport_airframe',
    engine: 'turbofan',
    modules: [{ id: 'airdrop', type: 'fuel_tank' as AircraftModuleType, slot: 'fuel' as AircraftModuleSlot, stats: {} as any }],
    tags: ['Strategic', 'Air-drop', 'Outsize Cargo'],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'tanker_modern',
    name: 'Aerial Refueling Tanker',
    type: 'transport',
    role: 'tanker',
    description: 'Boom and drogue refueling tanker',
    year: 1960,
    airframe: 'transport_airframe',
    engine: 'turbofan',
    modules: [{ id: 'refuel_boom', type: 'aerial_refueling' as AircraftModuleType, slot: 'performance' as AircraftModuleSlot, stats: {} as any }],
    tags: ['Boom/Drogue', 'Force Multiplier', 'Global Reach'],
    icon: <Plane className="h-5 w-5" />,
  },

  // Helicopters
  {
    id: 'helicopter_asw',
    name: 'ASW Helicopter',
    type: 'helicopter',
    role: 'anti_sub',
    description: 'Ship-based anti-submarine helicopter',
    year: 1965,
    airframe: 'rotary_wing',
    engine: 'turboshaft',
    modules: [
      { id: 'dipping_sonar', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'torpedo_asw', type: 'depth_charge' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Ship-based', 'Dipping Sonar', 'Torpedo'],
    icon: <RotateCcw className="h-5 w-5" />,
  },
  {
    id: 'helicopter_transport',
    name: 'Transport Helicopter',
    type: 'helicopter',
    role: 'transport',
    description: 'Medium lift utility helicopter',
    year: 1970,
    airframe: 'rotary_wing',
    engine: 'turboshaft',
    modules: [],
    tags: ['Utility', 'Medium Lift', 'VTOL'],
    icon: <RotateCcw className="h-5 w-5" />,
  },

  // Flying Boats
  {
    id: 'flying_boat_patrol',
    name: 'Maritime Patrol Flying Boat',
    type: 'flying_boat',
    role: 'anti_sub',
    description: 'Long-range maritime patrol with sonobuoys',
    year: 1940,
    airframe: 'monoplane',
    engine: 'radial_engine',
    modules: [
      { id: 'magnetic_anomaly', type: 'radar' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'sonobuoys', type: 'depth_charge' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Long Range', 'MAD', 'Sonobuoys', 'ASW'],
    icon: <Radar className="h-5 w-5" />,
  },

  // VTOL
  {
    id: 'vtol_harrier',
    name: 'VTOL Ground Attack',
    type: 'vtol',
    role: 'ground_attack',
    description: 'Vertical takeoff close air support',
    year: 1970,
    airframe: 'vtol_airframe',
    engine: 'turbofan',
    modules: [{ id: 'vectoring', type: 'thrust_vectoring' as AircraftModuleType, slot: 'performance' as AircraftModuleSlot, stats: {} as any }],
    tags: ['VTOL', 'Carrier', 'CAS'],
    icon: <Zap className="h-5 w-5" />,
  },

  // UAVs
  {
    id: 'uav_recon',
    name: 'Reconnaissance UAV',
    type: 'uav',
    role: 'reconnaissance',
    description: 'Long endurance unmanned surveillance',
    year: 1995,
    airframe: 'uav_airframe',
    engine: 'turbofan',
    modules: [
      { id: 'eo_ir', type: 'irst' as AircraftModuleType, slot: 'sensor' as AircraftModuleSlot, stats: {} as any },
      { id: 'satcom', type: 'data_link' as AircraftModuleType, slot: 'avionics' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Unmanned', 'Long Endurance', 'SATCOM'],
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'uav_strike',
    name: 'Strike UAV',
    type: 'uav',
    role: 'ground_attack',
    description: 'Armed UAV for precision strikes',
    year: 2005,
    airframe: 'uav_airframe',
    engine: 'turboprop',
    modules: [
      { id: 'targeting_pod', type: 'targeting_pod' as AircraftModuleType, slot: 'targeting' as AircraftModuleSlot, stats: {} as any },
      { id: 'missile', type: 'missile_air_ground' as AircraftModuleType, slot: 'weapon' as AircraftModuleSlot, stats: {} as any },
    ],
    tags: ['Unmanned', 'Precision Strike', 'Persistent'],
    icon: <Target className="h-5 w-5" />,
  },

  // Trainer
  {
    id: 'trainer_basic',
    name: 'Basic Trainer',
    type: 'transport',
    role: 'trainer',
    description: 'Piston engine primary trainer',
    year: 1940,
    airframe: 'monoplane',
    engine: 'piston_engine',
    modules: [],
    tags: ['Primary', 'Piston', 'Low Cost'],
    icon: <Plane className="h-5 w-5" />,
  },
  {
    id: 'trainer_jet',
    name: 'Advanced Jet Trainer',
    type: 'jet_fighter',
    role: 'trainer',
    description: 'Supersonic lead-in fighter trainer',
    year: 1975,
    airframe: 'jet_airframe',
    engine: 'turbofan',
    modules: [],
    tags: ['Supersonic', 'Lead-in', 'Combat Capable'],
    icon: <Zap className="h-5 w-5" />,
  },
];

interface AircraftArchetypeSelectorProps {
  selectedType?: AircraftType;
  onSelect: (template: ArchetypeTemplate) => void;
  currentDesign?: Partial<ArchetypeTemplate>;
}

export function AircraftArchetypeSelector({ selectedType, onSelect, currentDesign }: AircraftArchetypeSelectorProps) {
  const filteredTemplates = selectedType
    ? ARCHETYPE_TEMPLATES.filter(t => t.type === selectedType)
    : ARCHETYPE_TEMPLATES;

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const key = `${template.type}_${template.role}`;
    if (!acc[key]) acc[key] = { type: template.type, role: template.role, templates: [] };
    acc[key].templates.push(template);
    return acc;
  }, {} as Record<string, { type: AircraftType; role: AircraftRole; templates: ArchetypeTemplate[] }>);

  const isCurrent = (template: ArchetypeTemplate) => {
    if (!currentDesign) return false;
    return (
      currentDesign.airframe === template.airframe &&
      currentDesign.engine === template.engine &&
      currentDesign.type === template.type &&
      currentDesign.role === template.role
    );
  };

  const typeLabels: Record<AircraftType, string> = {
    fighter: 'Fighters',
    heavy_fighter: 'Heavy Fighters',
    jet_fighter: 'Jet Fighters',
    interceptor: 'Interceptors',
    cas: 'Close Air Support',
    naval_bomber: 'Naval Bombers',
    tactical_bomber: 'Tactical Bombers',
    strategic_bomber: 'Strategic Bombers',
    transport: 'Transport / Tanker',
    recon: 'Reconnaissance / AEW',
    flying_boat: 'Flying Boats',
    helicopter: 'Helicopters',
    vtol: 'VTOL',
    uav: 'UAVs',
  };

  const roleLabels: Record<AircraftRole, string> = {
    air_superiority: 'Air Superiority',
    interception: 'Interception',
    ground_attack: 'Ground Attack',
    naval_strike: 'Naval Strike',
    strategic_bombing: 'Strategic Bombing',
    tactical_bombing: 'Tactical Bombing',
    reconnaissance: 'Reconnaissance',
    transport: 'Transport',
    anti_sub: 'Anti-Submarine',
    aew: 'AEW&C',
    tanker: 'Tanker',
    trainer: 'Trainer',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Archetype Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {(Object.values(groupedTemplates)).map(group => {
            const templates = group.templates;
            if (!templates || templates.length === 0) return null;

            return (
              <div key={`${group.type}_${group.role}`} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>{typeLabels[group.type] || group.type} / {roleLabels[group.role] || group.role}</span>
                  <Badge variant="secondary" className="ml-2">{templates.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => onSelect(template)}
                      className={cn(
                        'relative p-3 text-left border rounded-lg transition-all text-sm',
                        'hover:border-primary/50 hover:shadow-md',
                        isCurrent(template)
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-background hover:bg-muted/50'
                      )}
                    >
                      {isCurrent(template) && (
                        <div className="absolute -top-2 -right-2">
                          <Badge variant="success" className="text-xs">Current</Badge>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {template.name}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {template.year}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                        <div className="flex gap-4">
                          <span>Airframe: <span className="font-medium text-gray-900 dark:text-gray-100">{template.airframe.replace(/_/g, ' ')}</span></span>
                          <span>Engine: <span className="font-medium text-gray-900 dark:text-gray-100">{template.engine.replace(/_/g, ' ')}</span></span>
                        </div>
                        <div className="flex gap-4">
                          <span>Type: <span className="font-medium text-gray-900 dark:text-gray-100">{template.type}</span></span>
                          <span>Role: <span className="font-medium text-gray-900 dark:text-gray-100">{template.role.replace(/_/g, ' ')}</span></span>
                        </div>
                        <div className="flex gap-4">
                          <span>Modules: <span className="font-medium text-gray-900 dark:text-gray-100">{template.modules.length}</span></span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates available for this type.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}