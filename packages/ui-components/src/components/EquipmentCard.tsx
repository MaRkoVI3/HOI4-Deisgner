// ============================================================================
// EquipmentCard Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from './Badge';
import { StatRow } from './StatCard';

export interface EquipmentCardProps {
  name: string;
  type: string;
  archetype: string;
  year: number;
  country: string;
  cost: { ic: number; manpower: number };
  stats: {
    softAttack: number;
    hardAttack: number;
    armor: number;
    piercing: number;
    defense: number;
    breakthrough: number;
    organization: number;
    maxSpeed: number;
    reliability: number;
    weight: number;
    supplyConsumption: number;
    fuelConsumption: number;
  };
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const TYPE_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  infantry: 'default',
  artillery: 'warning',
  armor: 'destructive',
  support: 'info',
  special: 'secondary',
};

export const EquipmentCard = React.forwardRef<HTMLDivElement, EquipmentCardProps>(
  (
    {
      name,
      type,
      archetype,
      year,
      country,
      cost,
      stats,
      selected = false,
      onClick,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl border bg-white dark:bg-gray-800',
          'transition-all duration-200',
          'hover:shadow-lg',
          selected
            ? 'border-primary-500 ring-2 ring-primary-500/20'
            : 'border-gray-200 dark:border-gray-700',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {name}
                </h3>
                <Badge variant="outline" size="sm">
                  {year}
                </Badge>
                <Badge
                  variant="outline"
                  size="sm"
                  className="capitalize"
                >
                  {archetype.replace('_', ' ')}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {country} · {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
            </div>
            <Badge
              variant={TYPE_COLORS[type] || 'default'}
              size="sm"
              className="whitespace-nowrap"
            >
              {type}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <StatRow label="IC" value={cost.ic} />
            <StatRow label="MP" value={cost.manpower} />
            <StatRow label="Soft Atk" value={stats.softAttack} color="danger" />
            <StatRow label="Hard Atk" value={stats.hardAttack} color="danger" />
            <StatRow label="Armor" value={stats.armor} color="primary" />
            <StatRow label="Piercing" value={stats.piercing} color="warning" />
            <StatRow label="Defense" value={stats.defense} color="success" />
            <StatRow label="Break." value={stats.breakthrough} color="warning" />
            <StatRow label="Org" value={stats.organization} color="info" />
            <StatRow label="Speed" value={stats.maxSpeed} unit="km/h" />
            <StatRow label="Rel." value={stats.reliability} color="success" />
            <StatRow label="Weight" value={stats.weight} unit="t" />
            <StatRow label="Supply" value={stats.supplyConsumption.toFixed(1)} color="danger" />
            <StatRow label="Fuel" value={stats.fuelConsumption.toFixed(1)} color="danger" />
          </div>
        </div>

        {selected && (
          <div className="absolute inset-0 border-2 border-primary-500 rounded-xl pointer-events-none" />
        )}
      </div>
    );
  }
);

EquipmentCard.displayName = 'EquipmentCard';