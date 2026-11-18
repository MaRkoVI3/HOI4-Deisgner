'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '@generalstaff/ui-components';
import type { TankRole, ChassisType, GunType, EngineType, SuspensionType, ArmorLayout } from '@generalstaff/calculation-engine';
import { Shield, Zap, Target, Crosshair, Sparkles, Loader2 } from 'lucide-react';

export interface ArchetypeTemplate {
  id: string;
  name: string;
  role: TankRole;
  description: string;
  year: number;
  chassis: ChassisType;
  gun: GunType;
  engine: EngineType;
  suspension: SuspensionType;
  armorLayout: ArmorLayout;
  tags: string[];
  icon: React.ReactNode;
}

const ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  // Light Tanks
  {
    id: 'light_early',
    name: 'Early Light Tank',
    role: 'light_tank',
    description: 'Fast reconnaissance tank with machine gun armament',
    year: 1934,
    chassis: 'light_tank_chassis',
    gun: 'small_caliber_gun',
    engine: 'petrol_engine',
    suspension: 'leaf_spring',
    armorLayout: { front: 15, side: 10, rear: 8, top: 6 },
    tags: ['Recon', 'Early War', 'Low Cost'],
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'light_late',
    name: 'Late Light Tank',
    role: 'light_tank',
    description: 'Improved light tank with autocannon for anti-air/light armor',
    year: 1942,
    chassis: 'light_tank_chassis',
    gun: 'auto_cannon',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 30, side: 20, rear: 15, top: 10 },
    tags: ['Recon', 'Anti-Air', 'High ROF'],
    icon: <Crosshair className="h-5 w-5" />,
  },
  {
    id: 'light_modern',
    name: 'Modern Light Tank',
    role: 'light_tank',
    description: 'Modern light tank with advanced optics and stabilization',
    year: 1980,
    chassis: 'light_tank_chassis',
    gun: 'auto_cannon',
    engine: 'gas_turbine',
    suspension: 'hydro_pneumatic',
    armorLayout: { front: 50, side: 30, rear: 20, top: 15 },
    tags: ['Recon', 'Modern', 'Stabilized'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Medium Tanks
  {
    id: 'medium_early',
    name: 'Early Medium Tank',
    role: 'medium_tank',
    description: 'Pre-war medium tank with short 75mm gun',
    year: 1936,
    chassis: 'medium_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'petrol_engine',
    suspension: 'leaf_spring',
    armorLayout: { front: 30, side: 20, rear: 15, top: 10 },
    tags: ['Balanced', 'Early War', 'Infantry Support'],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'medium_ww2',
    name: 'WWII Medium Tank',
    role: 'medium_tank',
    description: 'Main battle tank of WWII with long 75mm gun',
    year: 1942,
    chassis: 'medium_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 80, side: 50, rear: 30, top: 20 },
    tags: ['Main Battle', 'WWII', 'Mass Production'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'medium_coldwar',
    name: 'Cold War Medium Tank',
    role: 'medium_tank',
    description: 'Post-war medium with 100mm gun and improved armor',
    year: 1955,
    chassis: 'medium_tank_chassis',
    gun: 'large_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 120, side: 60, rear: 40, top: 30 },
    tags: ['Cold War', 'HEAT Protection', 'NBC'],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'medium_modern',
    name: 'Modern MBT',
    role: 'modern_tank',
    description: 'Modern main battle tank with smoothbore gun and composite armor',
    year: 1980,
    chassis: 'modern_tank_chassis',
    gun: 'smoothbore_gun',
    engine: 'gas_turbine',
    suspension: 'hydro_pneumatic',
    armorLayout: { front: 600, side: 300, rear: 150, top: 50 },
    tags: ['Modern', 'Composite Armor', 'APFSDS', 'Fully Stabilized'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Heavy Tanks
  {
    id: 'heavy_early',
    name: 'Early Heavy Tank',
    role: 'heavy_tank',
    description: 'Breakthrough heavy tank with thick armor',
    year: 1939,
    chassis: 'heavy_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'petrol_engine',
    suspension: 'leaf_spring',
    armorLayout: { front: 100, side: 60, rear: 40, top: 20 },
    tags: ['Breakthrough', 'Heavy Armor', 'Slow'],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'heavy_ww2',
    name: 'WWII Heavy Tank',
    role: 'heavy_tank',
    description: 'Late war heavy with long 88mm/122mm gun',
    year: 1944,
    chassis: 'heavy_tank_chassis',
    gun: 'large_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 180, side: 80, rear: 60, top: 40 },
    tags: ['Breakthrough', 'High Penetration', 'Expensive'],
    icon: <Target className="h-5 w-5" />,
  },

  // Tank Destroyers
  {
    id: 'td_light',
    name: 'Light Tank Destroyer',
    role: 'tank_destroyer',
    description: 'Fast, lightly armored TD with high-velocity gun',
    year: 1940,
    chassis: 'medium_tank_chassis',
    gun: 'medium_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 50, side: 20, rear: 15, top: 10 },
    tags: ['Ambush', 'High Velocity', 'Low Profile'],
    icon: <Crosshair className="h-5 w-5" />,
  },
  {
    id: 'td_heavy',
    name: 'Heavy Tank Destroyer',
    role: 'tank_destroyer',
    description: 'Heavily armored casemate TD with massive gun',
    year: 1944,
    chassis: 'heavy_tank_chassis',
    gun: 'super_heavy_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 250, side: 80, rear: 50, top: 30 },
    tags: ['Assault', 'Maximum Penetration', 'No Turret'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'td_modern',
    name: 'Modern ATGM Carrier',
    role: 'tank_destroyer',
    description: 'Light chassis with anti-tank guided missiles',
    year: 1970,
    chassis: 'light_tank_chassis',
    gun: 'large_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'hydro_pneumatic',
    armorLayout: { front: 30, side: 15, rear: 10, top: 8 },
    tags: ['ATGM', 'Long Range', 'Fire & Forget'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // SPGs
  {
    id: 'spg_light',
    name: 'Light SPG',
    role: 'spg',
    description: 'Mobile howitzer on light chassis',
    year: 1940,
    chassis: 'light_tank_chassis',
    gun: 'large_caliber_gun',
    engine: 'petrol_engine',
    suspension: 'leaf_spring',
    armorLayout: { front: 15, side: 10, rear: 8, top: 6 },
    tags: ['Indirect Fire', 'Mobile', 'Light'],
    icon: <Loader2 className="h-5 w-5" />,
  },
  {
    id: 'spg_medium',
    name: 'Medium SPG',
    role: 'spg',
    description: 'Standard self-propelled howitzer',
    year: 1943,
    chassis: 'medium_tank_chassis',
    gun: 'large_caliber_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 30, side: 20, rear: 15, top: 10 },
    tags: ['Indirect Fire', 'Standard', 'Division Support'],
    icon: <Loader2 className="h-5 w-5" />,
  },
  {
    id: 'spg_heavy',
    name: 'Heavy SPG',
    role: 'spg',
    description: 'Heavy self-propelled gun for siege operations',
    year: 1944,
    chassis: 'heavy_tank_chassis',
    gun: 'super_heavy_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 50, side: 30, rear: 20, top: 15 },
    tags: ['Siege', 'Heavy Caliber', 'Concrete Buster'],
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'spg_modern',
    name: 'Modern SPG',
    role: 'spg',
    description: 'Automated loading SPG with advanced fire control',
    year: 1990,
    chassis: 'modern_tank_chassis',
    gun: 'smoothbore_gun',
    engine: 'gas_turbine',
    suspension: 'active_suspension',
    armorLayout: { front: 80, side: 40, rear: 30, top: 20 },
    tags: ['Automated', 'Precision', 'Rapid Fire'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Anti-Air Tanks
  {
    id: 'aa_early',
    name: 'Early AA Tank',
    role: 'anti_air_tank',
    description: 'Light chassis with quad machine guns',
    year: 1938,
    chassis: 'light_tank_chassis',
    gun: 'small_caliber_gun',
    engine: 'petrol_engine',
    suspension: 'leaf_spring',
    armorLayout: { front: 15, side: 10, rear: 8, top: 6 },
    tags: ['Anti-Air', 'Quad MG', 'Early War'],
    icon: <Crosshair className="h-5 w-5" />,
  },
  {
    id: 'aa_mid',
    name: 'Mid-War AA Tank',
    role: 'anti_air_tank',
    description: 'Dual autocannon on light chassis',
    year: 1943,
    chassis: 'light_tank_chassis',
    gun: 'auto_cannon',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 25, side: 15, rear: 10, top: 8 },
    tags: ['Anti-Air', 'Dual Autocannon', 'Radar'],
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'aa_modern',
    name: 'Modern AA Tank',
    role: 'anti_air_tank',
    description: 'Radar-guided autocannon with missiles',
    year: 1985,
    chassis: 'medium_tank_chassis',
    gun: 'auto_cannon',
    engine: 'gas_turbine',
    suspension: 'hydro_pneumatic',
    armorLayout: { front: 50, side: 30, rear: 20, top: 15 },
    tags: ['Missiles', 'Radar FCS', 'All-Weather'],
    icon: <Sparkles className="h-5 w-5" />,
  },

  // Super Heavy Tanks
  {
    id: 'super_heavy_prototype',
    name: 'Super Heavy Prototype',
    role: 'super_heavy_tank',
    description: 'Experimental 1000+ ton breakthrough tank',
    year: 1945,
    chassis: 'super_heavy_tank_chassis',
    gun: 'super_heavy_gun',
    engine: 'diesel_engine',
    suspension: 'torsion_bar',
    armorLayout: { front: 300, side: 150, rear: 100, top: 50 },
    tags: ['Experimental', 'Maximum Armor', 'Rail Transport Only'],
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'super_heavy_modern',
    name: 'Modern Super Heavy',
    role: 'super_heavy_tank',
    description: 'Conceptual ultra-heavy tank with nuclear power',
    year: 2000,
    chassis: 'super_heavy_tank_chassis',
    gun: 'smoothbore_gun',
    engine: 'multifuel_engine',
    suspension: 'active_suspension',
    armorLayout: { front: 1000, side: 400, rear: 200, top: 100 },
    tags: ['Concept', 'Nuclear Power', 'Active Protection'],
    icon: <Sparkles className="h-5 w-5" />,
  },
];

interface TankArchetypeSelectorProps {
  selectedRole?: TankRole;
  onSelect: (template: ArchetypeTemplate) => void;
  currentDesign?: Partial<ArchetypeTemplate>;
}

export function TankArchetypeSelector({ selectedRole, onSelect, currentDesign }: TankArchetypeSelectorProps) {
  const filteredTemplates = selectedRole
    ? ARCHETYPE_TEMPLATES.filter(t => t.role === selectedRole)
    : ARCHETYPE_TEMPLATES;

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.role]) acc[template.role] = [];
    acc[template.role].push(template);
    return acc;
  }, {} as Record<TankRole, ArchetypeTemplate[]>);

  const isCurrent = (template: ArchetypeTemplate) => {
    if (!currentDesign) return false;
    return (
      currentDesign.chassis === template.chassis &&
      currentDesign.gun === template.gun &&
      currentDesign.engine === template.engine &&
      currentDesign.suspension === template.suspension
    );
  };

  const roleLabels: Record<TankRole, string> = {
    light_tank: 'Light Tanks',
    medium_tank: 'Medium Tanks / MBTs',
    heavy_tank: 'Heavy Tanks',
    tank_destroyer: 'Tank Destroyers',
    spg: 'Self-Propelled Guns',
    anti_air_tank: 'Anti-Air Tanks',
    modern_tank: 'Modern MBTs',
    super_heavy_tank: 'Super Heavy Tanks',
  };

  const roleIcons: Record<TankRole, React.ReactNode> = {
    light_tank: <Zap className="h-4 w-4" />,
    medium_tank: <Target className="h-4 w-4" />,
    heavy_tank: <Shield className="h-4 w-4" />,
    tank_destroyer: <Crosshair className="h-4 w-4" />,
    spg: <Loader2 className="h-4 w-4" />,
    anti_air_tank: <Crosshair className="h-4 w-4" />,
    modern_tank: <Sparkles className="h-4 w-4" />,
    super_heavy_tank: <Shield className="h-4 w-4" />,
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
          {(Object.keys(groupedTemplates) as TankRole[]).map(role => {
            const templates = groupedTemplates[role];
            if (!templates || templates.length === 0) return null;

            return (
              <div key={role} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {roleIcons[role]}
                  <span>{roleLabels[role]}</span>
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
                          <span>Chassis: <span className="font-medium text-gray-900 dark:text-gray-100">{template.chassis.replace(/_/g, ' ')}</span></span>
                          <span>Gun: <span className="font-medium text-gray-900 dark:text-gray-100">{template.gun.replace(/_/g, ' ')}</span></span>
                        </div>
                        <div className="flex gap-4">
                          <span>Engine: <span className="font-medium text-gray-900 dark:text-gray-100">{template.engine.replace(/_/g, ' ')}</span></span>
                          <span>Susp: <span className="font-medium text-gray-900 dark:text-gray-100">{template.suspension.replace(/_/g, ' ')}</span></span>
                        </div>
                        <div className="flex gap-4">
                          <span>Armor: <span className="font-medium text-gray-900 dark:text-gray-100">F:{template.armorLayout.front} S:{template.armorLayout.side} R:{template.armorLayout.rear} T:{template.armorLayout.top}</span></span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No templates available for this role.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}