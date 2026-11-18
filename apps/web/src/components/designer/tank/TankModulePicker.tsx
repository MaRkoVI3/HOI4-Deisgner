'use client';

import { Select, Card, CardHeader, CardTitle, CardContent, Badge, TooltipProvider } from '@generalstaff/ui-components';
import type { TankRole, ChassisType, GunType, EngineType, SuspensionType, ArmorLayout } from '@generalstaff/calculation-engine';
import { cn } from '@generalstaff/ui-components';

interface ModuleOption {
  value: string;
  label: string;
  description?: string;
  compatibleRoles?: TankRole[];
  compatibleChassis?: ChassisType[];
}

const CHASSIS_OPTIONS: ModuleOption[] = [
  { value: 'light_tank_chassis', label: 'Light Tank Chassis', description: 'Fast, lightly armored chassis for reconnaissance', compatibleRoles: ['light_tank', 'anti_air_tank'] },
  { value: 'medium_tank_chassis', label: 'Medium Tank Chassis', description: 'Balanced chassis for main battle tanks', compatibleRoles: ['medium_tank', 'tank_destroyer', 'spg'] },
  { value: 'heavy_tank_chassis', label: 'Heavy Tank Chassis', description: 'Heavily armored chassis for breakthrough', compatibleRoles: ['heavy_tank'] },
  { value: 'modern_tank_chassis', label: 'Modern Tank Chassis', description: 'Advanced composite armor chassis', compatibleRoles: ['modern_tank'] },
  { value: 'super_heavy_tank_chassis', label: 'Super Heavy Tank Chassis', description: 'Massive chassis for super heavy breakthrough tanks', compatibleRoles: ['super_heavy_tank'] },
];

const GUN_OPTIONS: ModuleOption[] = [
  { value: 'small_caliber_gun', label: 'Small Caliber Gun (37-45mm)', description: 'High rate of fire, good vs infantry/light armor', compatibleRoles: ['light_tank', 'anti_air_tank'] },
  { value: 'medium_caliber_gun', label: 'Medium Caliber Gun (75-85mm)', description: 'Balanced anti-tank and HE performance', compatibleRoles: ['medium_tank', 'tank_destroyer', 'spg'] },
  { value: 'large_caliber_gun', label: 'Large Caliber Gun (100-122mm)', description: 'High penetration and HE power', compatibleRoles: ['heavy_tank', 'tank_destroyer', 'spg'] },
  { value: 'super_heavy_gun', label: 'Super Heavy Gun (150mm+)', description: 'Maximum penetration for heavy breakthrough', compatibleRoles: ['super_heavy_tank', 'tank_destroyer'] },
  { value: 'smoothbore_gun', label: 'Smoothbore Gun (120-125mm)', description: 'Modern APFSDS, high velocity', compatibleRoles: ['modern_tank'] },
  { value: 'auto_cannon', label: 'Autocannon (20-30mm)', description: 'Very high ROF, anti-air/light armor', compatibleRoles: ['light_tank', 'anti_air_tank'] },
  { value: 'rocket_launcher', label: 'Rocket Launcher', description: 'High HE, indirect fire capability', compatibleRoles: ['spg'] },
];

const ENGINE_OPTIONS: ModuleOption[] = [
  { value: 'petrol_engine', label: 'Petrol Engine', description: 'Lower power, higher fuel consumption' },
  { value: 'diesel_engine', label: 'Diesel Engine', description: 'Good power, efficient, reliable' },
  { value: 'multifuel_engine', label: 'Multifuel Engine', description: 'Versatile fuel, good power' },
  { value: 'gas_turbine', label: 'Gas Turbine', description: 'Highest power, high fuel consumption' },
];

const SUSPENSION_OPTIONS: ModuleOption[] = [
  { value: 'leaf_spring', label: 'Leaf Spring', description: 'Simple, reliable, basic performance' },
  { value: 'torsion_bar', label: 'Torsion Bar', description: 'Standard WWII/Cold War suspension' },
  { value: 'hydro_pneumatic', label: 'Hydro-pneumatic', description: 'Adjustable ride height, good cross-country' },
  { value: 'active_suspension', label: 'Active Suspension', description: 'Computer-controlled, best performance' },
];

const ARMOR_PRESETS: ModuleOption[] = [
  { value: 'light', label: 'Light Armor', description: '30/20/15/10 mm (Front/Side/Rear/Top)' },
  { value: 'balanced', label: 'Balanced Armor', description: '80/50/30/20 mm' },
  { value: 'heavy_front', label: 'Heavy Frontal', description: '150/80/50/30 mm' },
  { value: 'all_around', label: 'All-Around Protection', description: '100/80/60/40 mm' },
  { value: 'custom', label: 'Custom Layout', description: 'Manually configure each face' },
];

const ARMOR_PRESET_VALUES: Record<string, ArmorLayout> = {
  light: { front: 30, side: 20, rear: 15, top: 10 },
  balanced: { front: 80, side: 50, rear: 30, top: 20 },
  heavy_front: { front: 150, side: 80, rear: 50, top: 30 },
  all_around: { front: 100, side: 80, rear: 60, top: 40 },
};

interface TankModulePickerProps {
  role: TankRole;
  chassis: ChassisType;
  gun: GunType;
  engine: EngineType;
  suspension: SuspensionType;
  armorLayout: ArmorLayout;
  onChassisChange: (value: ChassisType) => void;
  onGunChange: (value: GunType) => void;
  onEngineChange: (value: EngineType) => void;
  onSuspensionChange: (value: SuspensionType) => void;
  onArmorLayoutChange: (layout: ArmorLayout) => void;
  onArmorPresetChange: (preset: string) => void;
}

export function TankModulePicker({
  role,
  chassis,
  gun,
  engine,
  suspension,
  armorLayout,
  onChassisChange,
  onGunChange,
  onEngineChange,
  onSuspensionChange,
  onArmorLayoutChange,
  onArmorPresetChange,
}: TankModulePickerProps) {
  const filteredChassis = CHASSIS_OPTIONS.filter(opt => !opt.compatibleRoles || opt.compatibleRoles.includes(role));
  const filteredGuns = GUN_OPTIONS.filter(opt => !opt.compatibleRoles || opt.compatibleRoles.includes(role));

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Chassis Selector */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">1</Badge>
                Chassis
              </CardTitle>
              <Badge variant="outline" className="text-xs">{role.replace('_', ' ').toUpperCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={chassis}
              onChange={(e) => onChassisChange(e.target.value as ChassisType)}
              placeholder="Select chassis..."
              options={filteredChassis.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {filteredChassis.find(c => c.value === chassis)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Gun Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">2</Badge>
              Main Gun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={gun}
              onChange={(e) => onGunChange(e.target.value as GunType)}
              placeholder="Select gun..."
              options={filteredGuns.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {filteredGuns.find(g => g.value === gun)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Engine Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">3</Badge>
              Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={engine}
              onChange={(e) => onEngineChange(e.target.value as EngineType)}
              placeholder="Select engine..."
              options={ENGINE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {ENGINE_OPTIONS.find(e => e.value === engine)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Suspension Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">4</Badge>
              Suspension
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={suspension}
              onChange={(e) => onSuspensionChange(e.target.value as SuspensionType)}
              placeholder="Select suspension..."
              options={SUSPENSION_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {SUSPENSION_OPTIONS.find(s => s.value === suspension)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Armor Layout */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">5</Badge>
              Armor Layout (mm)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Armor Presets */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {ARMOR_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      onArmorPresetChange(preset.value);
                      if (preset.value !== 'custom') {
                        onArmorLayoutChange(ARMOR_PRESET_VALUES[preset.value]);
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md border transition-all',
                      armorLayout === ARMOR_PRESET_VALUES[preset.value]
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary/50'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Armor Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Front</label>
                <input
                  type="number"
                  value={armorLayout.front}
                  onChange={(e) => onArmorLayoutChange({ ...armorLayout, front: Number(e.target.value) })}
                  min={0}
                  max={1000}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Side</label>
                <input
                  type="number"
                  value={armorLayout.side}
                  onChange={(e) => onArmorLayoutChange({ ...armorLayout, side: Number(e.target.value) })}
                  min={0}
                  max={1000}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Rear</label>
                <input
                  type="number"
                  value={armorLayout.rear}
                  onChange={(e) => onArmorLayoutChange({ ...armorLayout, rear: Number(e.target.value) })}
                  min={0}
                  max={1000}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Top</label>
                <input
                  type="number"
                  value={armorLayout.top}
                  onChange={(e) => onArmorLayoutChange({ ...armorLayout, top: Number(e.target.value) })}
                  min={0}
                  max={1000}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Armor Visualization */}
            <div className="relative">
              <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
                {/* Tank silhouette */}
                <rect x="20" y="40" width="160" height="40" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" rx="2" />
                <rect x="5" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <rect x="180" y="50" width="15" height="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                {/* Armor indicators */}
                <line x1="20" y1="35" x2="20" y2="85" stroke="currentColor" strokeWidth={Math.max(1, armorLayout.front / 50)} opacity="0.6" />
                <line x1="180" y1="35" x2="180" y2="85" stroke="currentColor" strokeWidth={Math.max(1, armorLayout.rear / 50)} opacity="0.6" />
                <line x1="100" y1="35" x2="100" y2="40" stroke="currentColor" strokeWidth={Math.max(1, armorLayout.top / 50)} opacity="0.6" />
              </svg>
              <div className="flex justify-center gap-8 mt-2 text-xs text-muted-foreground">
                <span>F: {armorLayout.front}mm</span>
                <span>S: {armorLayout.side}mm</span>
                <span>R: {armorLayout.rear}mm</span>
                <span>T: {armorLayout.top}mm</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}