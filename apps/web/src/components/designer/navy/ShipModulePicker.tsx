'use client';

import { Select, Card, CardHeader, CardTitle, CardContent, Badge, TooltipProvider } from '@generalstaff/ui-components';
import type { ShipType, HullType, ShipModule } from '@generalstaff/calculation-engine';

interface ModuleOption {
  value: string;
  label: string;
  description?: string;
  compatibleTypes?: ShipType[];
}

const HULL_OPTIONS: ModuleOption[] = [
  { value: 'destroyer_hull', label: 'Destroyer Hull', description: 'Fast, light, good for escort', compatibleTypes: ['destroyer', 'frigate'] },
  { value: 'cruiser_hull', label: 'Cruiser Hull', description: 'Balanced, versatile', compatibleTypes: ['light_cruiser', 'heavy_cruiser', 'minelayer'] },
  { value: 'battlecruiser_hull', label: 'Battlecruiser Hull', description: 'Fast capital ship', compatibleTypes: ['battlecruiser'] },
  { value: 'battleship_hull', label: 'Battleship Hull', description: 'Heavy armor, big guns', compatibleTypes: ['battleship'] },
  { value: 'super_battleship_hull', label: 'Super Battleship Hull', description: 'Ultimate capital ship', compatibleTypes: ['super_battleship'] },
  { value: 'carrier_hull', label: 'Carrier Hull', description: 'Aviation facilities', compatibleTypes: ['carrier', 'light_carrier', 'escort_carrier', 'amphibious_assault'] },
  { value: 'submarine_hull', label: 'Submarine Hull', description: 'Submersible, stealthy', compatibleTypes: ['submarine'] },
  { value: 'nuclear_submarine_hull', label: 'Nuclear Sub Hull', description: 'Unlimited range, fast underwater', compatibleTypes: ['nuclear_submarine'] },
  { value: 'frigate_hull', label: 'Frigate Hull', description: 'Modern escort', compatibleTypes: ['frigate', 'minesweeper'] },
  { value: 'corvette_hull', label: 'Corvette Hull', description: 'Small patrol ship', compatibleTypes: ['corvette'] },
];

const SHIP_TYPE_OPTIONS: ModuleOption[] = [
  { value: 'destroyer', label: 'Destroyer', description: 'Fast escort and patrol ship' },
  { value: 'light_cruiser', label: 'Light Cruiser', description: 'Screening and trade protection' },
  { value: 'heavy_cruiser', label: 'Heavy Cruiser', description: 'Larger guns, more armor' },
  { value: 'battlecruiser', label: 'Battlecruiser', description: 'Fast capital ship with battleship guns' },
  { value: 'battleship', label: 'Battleship', description: 'Main line of battle ship' },
  { value: 'super_battleship', label: 'Super Battleship', description: 'Ultimate capital ship' },
  { value: 'carrier', label: 'Fleet Carrier', description: 'Full-size aircraft carrier' },
  { value: 'light_carrier', label: 'Light Carrier', description: 'Smaller aircraft carrier' },
  { value: 'escort_carrier', label: 'Escort Carrier', description: 'Small escort carrier' },
  { value: 'submarine', label: 'Submarine', description: 'Diesel-electric attack submarine' },
  { value: 'nuclear_submarine', label: 'Nuclear Submarine', description: 'Nuclear-powered attack/ballistic sub' },
  { value: 'frigate', label: 'Frigate', description: 'Modern escort frigate' },
  { value: 'corvette', label: 'Corvette', description: 'Small patrol corvette' },
  { value: 'amphibious_assault', label: 'Amphibious Assault', description: 'Marine landing ship' },
  { value: 'minelayer', label: 'Minelayer', description: 'Minelaying vessel' },
  { value: 'minesweeper', label: 'Minesweeper', description: 'Minesweeping vessel' },
];

interface ShipModulePickerProps {
  type: ShipType;
  hull: HullType;
  modules: ShipModule[];
  onTypeChange: (value: ShipType) => void;
  onHullChange: (value: HullType) => void;
  onModulesChange: (modules: ShipModule[]) => void;
}

export function ShipModulePicker({
  type,
  hull,
  modules,
  onTypeChange,
  onHullChange,
  onModulesChange: _onModulesChange,
}: ShipModulePickerProps) {
  const filteredHulls = HULL_OPTIONS.filter(opt => !opt.compatibleTypes || opt.compatibleTypes.includes(type));

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Ship Type Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">1</Badge>
              Ship Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as ShipType)}
              placeholder="Select ship type..."
              options={SHIP_TYPE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {SHIP_TYPE_OPTIONS.find(o => o.value === type)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Hull Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">2</Badge>
              Hull
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={hull}
              onChange={(e) => onHullChange(e.target.value as HullType)}
              placeholder="Select hull..."
              options={filteredHulls.map(opt => ({ value: opt.value, label: opt.label }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {filteredHulls.find(h => h.value === hull)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">3</Badge>
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
                  No additional modules equipped. Select hull first.
                </p>
              ) : (
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div
                      key={module.id || index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">{module.type.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline" className="text-xs">{module.slot.replace(/_/g, ' ')}</Badge>
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