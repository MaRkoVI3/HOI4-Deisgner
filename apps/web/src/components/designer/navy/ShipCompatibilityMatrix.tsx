'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '@generalstaff/ui-components';
import type { ShipType, HullType, ShipModuleType, ShipModuleSlot } from '@generalstaff/calculation-engine';
import { Check, X, HelpCircle } from 'lucide-react';

const HULL_COMPATIBILITY: Record<ShipType, HullType[]> = {
  destroyer: ['destroyer_hull'],
  light_cruiser: ['cruiser_hull'],
  heavy_cruiser: ['cruiser_hull'],
  battlecruiser: ['battlecruiser_hull'],
  battleship: ['battleship_hull'],
  super_battleship: ['super_battleship_hull'],
  carrier: ['carrier_hull'],
  light_carrier: ['carrier_hull'],
  escort_carrier: ['carrier_hull'],
  submarine: ['submarine_hull'],
  nuclear_submarine: ['nuclear_submarine_hull'],
  frigate: ['frigate_hull'],
  corvette: ['corvette_hull'],
  amphibious_assault: ['carrier_hull'],
  minelayer: ['cruiser_hull', 'destroyer_hull'],
  minesweeper: ['frigate_hull', 'corvette_hull'],
};

const MODULE_SLOTS_BY_TYPE: Record<ShipType, ShipModuleSlot[]> = {
  destroyer: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control'],
  light_cruiser: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  heavy_cruiser: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  battlecruiser: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  battleship: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  super_battleship: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  carrier: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  light_carrier: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  escort_carrier: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  submarine: ['torpedo', 'main_battery', 'anti_air', 'sensors', 'propulsion', 'damage_control', 'special'],
  nuclear_submarine: ['torpedo', 'main_battery', 'anti_air', 'sensors', 'propulsion', 'damage_control', 'special'],
  frigate: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation'],
  corvette: ['main_battery', 'secondary_battery', 'torpedo', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control'],
  amphibious_assault: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'aviation', 'special'],
  minelayer: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'special'],
  minesweeper: ['main_battery', 'secondary_battery', 'anti_air', 'fire_control', 'sensors', 'armor', 'protection', 'propulsion', 'damage_control', 'special'],
};

const MODULE_TYPES_BY_SLOT: Record<ShipModuleSlot, ShipModuleType[]> = {
  main_battery: ['main_battery'],
  secondary_battery: ['secondary_battery'],
  torpedo: ['torpedo_tubes'],
  anti_air: ['anti_air_battery'],
  fire_control: ['fire_control'],
  sensors: ['radar', 'sonar'],
  armor: ['armor_belt', 'deck_armor'],
  protection: ['deck_armor', 'torpedo_protection'],
  propulsion: ['engine'],
  damage_control: ['damage_control'],
  aviation: ['air_wing', 'catapult', 'arrestor_gear'],
  special: ['minelaying', 'minesweeping'],
};

const SLOT_LABELS: Record<ShipModuleSlot, string> = {
  main_battery: 'Main Battery',
  secondary_battery: 'Secondary Battery',
  torpedo: 'Torpedo Tubes',
  anti_air: 'Anti-Air',
  fire_control: 'Fire Control',
  sensors: 'Sensors',
  armor: 'Armor',
  protection: 'Protection',
  propulsion: 'Propulsion',
  damage_control: 'Damage Control',
  aviation: 'Aviation',
  special: 'Special',
};

const MODULE_TYPE_LABELS: Record<ShipModuleType, string> = {
  main_battery: 'Main Battery',
  secondary_battery: 'Secondary Battery',
  torpedo_tubes: 'Torpedo Tubes',
  anti_air_battery: 'Anti-Air Battery',
  fire_control: 'Fire Control',
  radar: 'Radar',
  sonar: 'Sonar',
  armor_belt: 'Armor Belt',
  deck_armor: 'Deck Armor',
  torpedo_protection: 'Torpedo Protection',
  engine: 'Engine',
  damage_control: 'Damage Control',
  air_wing: 'Air Wing',
  catapult: 'Catapult',
  arrestor_gear: 'Arrestor Gear',
  minelaying: 'Minelaying',
  minesweeping: 'Minesweeping',
  depth_charges: 'Depth Charges',
};

interface ShipCompatibilityMatrixProps {
  selectedType: ShipType;
  selectedHull: HullType;
  modules: Array<{ id: string; type: ShipModuleType; slot: ShipModuleSlot }>;
}

export function ShipCompatibilityMatrix({
  selectedType,
  selectedHull,
  modules,
}: ShipCompatibilityMatrixProps) {
  const compatibleHulls = HULL_COMPATIBILITY[selectedType] || [];
  const availableSlots = MODULE_SLOTS_BY_TYPE[selectedType] || [];
  const occupiedSlots = new Set(modules.map(m => m.slot));

  const isHullCompatible = compatibleHulls.includes(selectedHull);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Compatibility Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Hull Compatibility */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Hull Compatibility</h4>
            <div className="flex flex-wrap gap-2">
              {compatibleHulls.map(hull => {
                const isSelected = hull === selectedHull;
                const isCompatible = isHullCompatible || isSelected;
                return (
                  <Badge
                    key={hull}
                    variant={isSelected ? 'success' : 'outline'}
                    className={cn(
                      'text-xs capitalize',
                      isSelected && 'font-medium',
                      !isCompatible && 'text-muted-foreground border-muted-foreground/50'
                    )}
                  >
                    {hull.replace(/_/g, ' ')} {isSelected && '(selected)'}
                  </Badge>
                );
              })}
              {!isHullCompatible && (
                <Badge variant="destructive" className="text-xs">
                  Current hull incompatible
                </Badge>
              )}
            </div>
          </div>

          {/* Module Slots */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Available Module Slots
              <Badge variant="secondary" className="ml-2 text-xs">{availableSlots.length}</Badge>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableSlots.map(slot => {
                const occupied = occupiedSlots.has(slot);
                const moduleInSlot = modules.find(m => m.slot === slot);
                const moduleTypes = MODULE_TYPES_BY_SLOT[slot] || [];

                return (
                  <div
                    key={slot}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      occupied
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-muted/30 border-border/50 hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {SLOT_LABELS[slot] || slot}
                      </span>
                      {occupied && (
                        <Badge variant="success" className="text-xs">
                          Equipped
                        </Badge>
                      )}
                    </div>
                    {occupied ? (
                      <div className="text-sm">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {MODULE_TYPE_LABELS[moduleInSlot!.type] || moduleInSlot!.type}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {moduleTypes.slice(0, 3).map(type => (
                          <Badge
                            key={type}
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 capitalize"
                          >
                            {MODULE_TYPE_LABELS[type] || type}
                          </Badge>
                        ))}
                        {moduleTypes.length > 3 && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
                            +{moduleTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Compatibility Details */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Module Compatibility</h4>
            <div className="space-y-2">
              {availableSlots.map(slot => {
                const moduleTypes = MODULE_TYPES_BY_SLOT[slot] || [];
                const occupied = modules.find(m => m.slot === slot);

                return (
                  <div key={slot} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {SLOT_LABELS[slot] || slot}
                      </span>
                      {occupied && (
                        <Badge variant="success" className="text-xs">Equipped</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {moduleTypes.map(type => (
                        <Badge
                          key={type}
                          variant={
                            occupied && occupied.type === type
                              ? 'success'
                              : 'outline'
                          }
                          className={cn(
                            'text-[10px] h-5 px-2 capitalize',
                            occupied && occupied.type !== type && 'text-muted-foreground/50'
                          )}
                        >
                          {MODULE_TYPE_LABELS[type] || type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warnings */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Validation</h4>
            <div className="space-y-2">
              {!isHullCompatible && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span className="text-sm text-red-500">
                    Selected hull <strong>{selectedHull.replace(/_/g, ' ')}</strong> is not compatible with {selectedType.replace(/_/g, ' ')}. Stats may be inaccurate.
                  </span>
                </div>
              )}

              {availableSlots.filter(s => !occupiedSlots.has(s)).map(slot => (
                <div key={slot} className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                  <span className="text-sm text-yellow-500">
                    Slot <strong>{SLOT_LABELS[slot] || slot}</strong> is empty. Consider adding a module.
                  </span>
                </div>
              ))}

              {isHullCompatible && availableSlots.every(s => occupiedSlots.has(s)) && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Check className="w-4 h-4 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">
                    All slots filled and hull is compatible. Good design!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}