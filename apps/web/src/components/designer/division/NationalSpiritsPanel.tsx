'use client';

import { useState, useMemo } from 'react';
import { NationalSpirit, SpiritModifiers } from '@generalstaff/shared-types';
import { NATIONAL_SPIRITS } from '@generalstaff/calculation-engine';
import { Badge } from '@generalstaff/ui-components';
import { Checkbox } from '@generalstaff/ui-components';
import { Label } from '@generalstaff/ui-components';
import { cn } from '@generalstaff/ui-components';
import { Tooltip, TooltipProvider } from '@generalstaff/ui-components';

interface NationalSpiritsPanelProps {
  countryId: string;
  selectedSpiritIds: string[];
  onChange: (spiritIds: string[]) => void;
  availableDate?: string;
}

// Map SpiritModifiers keys to display labels
const STAT_LABELS: Record<string, string> = {
  divisionAttack: 'Division Attack',
  divisionDefense: 'Division Defense',
  divisionBreakthrough: 'Division Breakthrough',
  orgGain: 'Organization Gain',
  recoveryRate: 'Recovery Rate',
  maxOrg: 'Max Organization',
  supplyConsumption: 'Supply Consumption',
  planningSpeed: 'Planning Speed',
  maxPlanning: 'Max Planning',
  entrenchment: 'Entrenchment',
  recon: 'Reconnaissance',
  suppression: 'Suppression',
  fuelConsumption: 'Fuel Consumption',
  consumerGoods: 'Consumer Goods',
  factoryOutput: 'Factory Output',
  constructionSpeed: 'Construction Speed',
  researchSpeed: 'Research Speed',
  politicalPowerGain: 'Political Power Gain',
  stability: 'Stability',
  warSupport: 'War Support',
  equipmentCost: 'Equipment Cost',
  equipmentReliability: 'Equipment Reliability',
  recruitablePopulationFactor: 'Recruitable Population',
  manpowerGain: 'Manpower Gain',
  airAttack: 'Air Attack',
  airDefense: 'Air Defense',
  airAgility: 'Air Agility',
  airBombing: 'Air Bombing',
  airRange: 'Air Range',
  airSuperiority: 'Air Superiority',
  navalAttack: 'Naval Attack',
  navalDefense: 'Naval Defense',
  navalSpeed: 'Naval Speed',
  navalRange: 'Naval Range',
  shoreBombardment: 'Shore Bombardment',
  subAttack: 'Sub Attack',
  subDetection: 'Sub Detection',
};

const STAT_LOWER_IS_BETTER: Partial<Record<string, boolean>> = {
  supplyConsumption: true,
  fuelConsumption: true,
  consumerGoods: true,
  equipmentCost: true,
};

function formatModifier(key: string, value: number): string {
  const isPercent = [
    'divisionAttack', 'divisionDefense', 'divisionBreakthrough',
    'orgGain', 'recoveryRate', 'maxOrg',
    'supplyConsumption', 'planningSpeed', 'maxPlanning',
    'entrenchment', 'recon', 'suppression',
    'fuelConsumption', 'consumerGoods', 'factoryOutput',
    'constructionSpeed', 'researchSpeed', 'politicalPowerGain',
    'stability', 'warSupport', 'equipmentCost',
    'equipmentReliability', 'recruitablePopulationFactor',
    'manpowerGain', 'airAttack', 'airDefense', 'airAgility',
    'airBombing', 'airRange', 'airSuperiority',
    'navalAttack', 'navalDefense', 'navalSpeed', 'navalRange',
    'shoreBombardment', 'subAttack', 'subDetection',
  ].includes(key);

  const isLowerBetter = STAT_LOWER_IS_BETTER[key] ?? false;
  const sign = value > 0 ? (isLowerBetter ? '-' : '+') : (isLowerBetter ? '+' : '');
  const absValue = Math.abs(value);
  const formatted = isPercent ? `${absValue}%` : absValue.toFixed(2);

  return `${sign}${formatted}`;
}

function SpiritCard({
  spirit,
  isSelected,
  isAvailable,
  onToggle,
}: {
  spirit: NationalSpirit;
  isSelected: boolean;
  isAvailable: boolean;
  onToggle: (id: string) => void;
}) {
  const modifierEntries = useMemo(() => {
    const mods = spirit.modifiers as SpiritModifiers;
    return Object.entries(mods).filter(([, value]) => value !== 0);
  }, [spirit.modifiers]);

  return (
    <div className={cn(
      'flex items-start gap-2 p-3 rounded-lg border transition-colors',
      isSelected
        ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
        : 'bg-card border-border hover:bg-accent/50',
      !isAvailable && 'opacity-50'
    )}>
      <Checkbox
        id={`spirit-${spirit.id}`}
        checked={isSelected}
        onChange={() => onToggle(spirit.id)}
        disabled={!isAvailable}
        className="mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Label htmlFor={`spirit-${spirit.id}`} className="font-medium cursor-pointer flex-1">
            {spirit.name}
          </Label>
          {!isAvailable && (
            <Badge variant="secondary" className="text-xs">Unavailable</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{spirit.description}</div>
        {modifierEntries.length > 0 && (
          <div className="mt-2 space-y-1">
            {modifierEntries.map(([key, value]) => {
              const numValue = value ?? 0;
              const label = STAT_LABELS[key] || key.replace(/([A-Z])/g, ' $1');
              return (
                <Tooltip
                  key={key}
                  content={<p>{spirit.name} provides {formatModifier(key, numValue)} to {label}</p>}
                  side="right"
                  align="start"
                >
                  <Badge variant="outline" className="text-xs">
                    {label}: {formatModifier(key, numValue)}
                  </Badge>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function NationalSpiritsPanel({
  countryId,
  selectedSpiritIds,
  onChange,
  availableDate,
}: NationalSpiritsPanelProps) {
  const [filter, setFilter] = useState('');

  // Get country-specific spirits
  const countrySpirits = useMemo(() => {
    return NATIONAL_SPIRITS.filter((s: NationalSpirit) => s.countryTag === countryId);
  }, [countryId]);

  // Get generic spirits
  const genericSpirits = useMemo(() =>
    NATIONAL_SPIRITS.filter((s: NationalSpirit) => s.countryTag === 'GENERIC'),
  []);

  const allSpirits = useMemo(() => [...countrySpirits, ...genericSpirits], [countrySpirits, genericSpirits]);

  // Filter by availability date (not currently implemented in data)
  const availableSpirits = useMemo(() => {
    if (!availableDate) return allSpirits;
    // Date filtering would go here if data supported it
    return allSpirits;
  }, [allSpirits, availableDate]);

  const handleToggle = (spiritId: string) => {
    const newSelection = selectedSpiritIds.includes(spiritId)
      ? selectedSpiritIds.filter(id => id !== spiritId)
      : [...selectedSpiritIds, spiritId];
    onChange(newSelection);
  };

  const filteredSpirits = useMemo(() => {
    if (!filter) return availableSpirits;
    const lowerFilter = filter.toLowerCase();
    return availableSpirits.filter((s: NationalSpirit) =>
      s.name.toLowerCase().includes(lowerFilter) ||
      s.description.toLowerCase().includes(lowerFilter)
    );
  }, [availableSpirits, filter]);

  if (availableSpirits.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No national spirits available for this country</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">National Spirits</h3>
          <Badge variant="outline" className="text-xs">
            {selectedSpiritIds.length} selected
          </Badge>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filter spirits..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border rounded bg-background"
          />
        </div>

        <div className="space-y-4">
          {filteredSpirits.map(spirit => (
            <SpiritCard
              key={spirit.id}
              spirit={spirit}
              isSelected={selectedSpiritIds.includes(spirit.id)}
              isAvailable={true}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {selectedSpiritIds.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Active Spirits</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSpiritIds.map(id => {
                const spirit = availableSpirits.find(s => s.id === id);
                return spirit ? (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {spirit.name}
                    <button
                      onClick={() => handleToggle(id)}
                      className="ml-1 hover:text-destructive"
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
    </TooltipProvider>
  );
}

export default NationalSpiritsPanel;