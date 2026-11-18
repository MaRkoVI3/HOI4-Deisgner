'use client';

import * as React from 'react';
import { DOCTRINES } from '@generalstaff/calculation-engine';
import { Badge } from '@generalstaff/ui-components';
import { Checkbox } from '@generalstaff/ui-components';
import { Label } from '@generalstaff/ui-components';
import { cn } from '@generalstaff/ui-components';

interface DoctrineSelectorProps {
  countryId: string;
  selectedDoctrineIds: string[];
  onChange: (doctrineIds: string[]) => void;
}

const doctrineGroups = {
  land: ['superior_firepower', 'grand_battleplan', 'mobile_warfare', 'mass_assault', 'deep_battle', 'human_wave', 'combined_arms', 'imperial_defense', 'continuous_front'],
  air: ['air_superiority', 'strategic_destruction', 'close_air_support', 'naval_aviation'],
  naval: ['base_strike', 'trade_interdiction', 'fleet_in_being', 'carrier_group'],
  support: ['integrated_support', 'logistics_wizardry'],
} as const;

export function DoctrineSelector({
  countryId,
  selectedDoctrineIds,
  onChange,
}: DoctrineSelectorProps) {
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    land: true,
    air: false,
    naval: false,
    support: false,
  });

  // Filter available doctrines for this country
  const allDoctrines = DOCTRINES.filter(d =>
    d.countryTag === 'GENERIC' || d.countryTag === countryId
  );

  const handleToggle = (doctrineId: string) => {
    const newSelection = selectedDoctrineIds.includes(doctrineId)
      ? selectedDoctrineIds.filter(id => id !== doctrineId)
      : [...selectedDoctrineIds, doctrineId];
    onChange(newSelection);
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Doctrines</h3>
        <Badge variant="outline" className="text-xs">
          {selectedDoctrineIds.length} selected
        </Badge>
      </div>

      {(Object.keys(doctrineGroups) as Array<keyof typeof doctrineGroups>).map(group => {
        const groupDoctrines = allDoctrines.filter(d =>
          (doctrineGroups[group] as readonly string[]).includes(d.id as any)
        );
        if (groupDoctrines.length === 0) return null;

        return (
          <div key={group} className="mb-4">
            <button
              type="button"
              className={cn(
                'w-full justify-between text-left p-2 rounded hover:bg-accent transition-colors',
                'text-sm font-medium'
              )}
              onClick={() => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }))}
            >
              <span className="font-medium capitalize">{group}</span>
              <span className={cn(
                'transition-transform',
                expandedGroups[group] && 'rotate-180'
              )}>
                ▼
              </span>
            </button>

            {expandedGroups[group] && (
              <div className="ml-2 mt-2 space-y-2 border-l-2 border-border pl-3">
                {groupDoctrines.map(doctrine => (
                  <div key={doctrine.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`doctrine-${doctrine.id}`}
                      checked={selectedDoctrineIds.includes(doctrine.id)}
                      onChange={() => handleToggle(doctrine.id)}
                    />
                    <Label htmlFor={`doctrine-${doctrine.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{doctrine.name}</div>
                      <div className="text-xs text-muted-foreground">{doctrine.description}</div>
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {doctrine.group}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {selectedDoctrineIds.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Active Doctrines</h4>
          <div className="flex flex-wrap gap-2">
            {selectedDoctrineIds.map(id => {
              const doctrine = DOCTRINES.find(d => d.id === id);
              return doctrine ? (
                <Badge key={id} variant="secondary" className="gap-1">
                  {doctrine.name}
                  <button
                    type="button"
                    onClick={() => handleToggle(id)}
                    className="ml-1 hover:text-destructive text-xs"
                  >
                    ✕
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}