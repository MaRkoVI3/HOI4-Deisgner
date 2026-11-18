// ============================================================================
// DivisionCard Component
// ============================================================================

import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from './Badge';
import { StatCard } from './StatCard';
import { StatRow } from './StatCard';

export interface DivisionCardProps {
  name: string;
  country: string;
  combatWidth: number;
  cost: { ic: number; manpower: number };
  stats: {
    softAttack: number;
    hardAttack: number;
    armor: number;
    piercing: number;
    defense: number;
    breakthrough: number;
    organization: number;
    hp: number;
    recon: number;
    suppression: number;
    weight: number;
    supplyUse: number;
    fuelUse: number;
    hardness: number;
  };
  regiments: Array<{ type: string; count: number; equipmentName: string }>;
  supportCompanies: Array<{ type: string; equipmentName: string }>;
  validation?: { valid: boolean; errors: string[]; warnings: string[] };
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const TYPE_ICONS: Record<string, string> = {
  infantry: '👟',
  artillery: '💣',
  armor: '🚀',
  special: '⭐',
};

export const DivisionCard = React.forwardRef<HTMLDivElement, DivisionCardProps>(
  (
    {
      name,
      country,
      combatWidth,
      cost,
      stats,
      regiments,
      supportCompanies,
      validation,
      selected = false,
      onClick,
      className,
    },
    ref
  ) => {
    const widthPercent = Math.min(100, (combatWidth / 80) * 100);
    const widthColor = combatWidth > 80 ? 'bg-red-500' : combatWidth > 60 ? 'bg-yellow-500' : 'bg-green-500';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border bg-white dark:bg-gray-800',
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
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{country}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={combatWidth > 80 ? 'destructive' : combatWidth > 60 ? 'warning' : 'success'}>
                {combatWidth} Width
              </Badge>
              {validation && !validation.valid && (
                <Badge variant="destructive" dot>Invalid</Badge>
              )}
              {validation && validation.valid && validation.warnings && validation.warnings.length > 0 && (
                <Badge variant="warning" dot>Warnings</Badge>
              )}
            </div>
          </div>

          {/* Combat Width Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Combat Width</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {combatWidth} / 80
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', widthColor)}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard
              label="Cost"
              value={cost.ic.toLocaleString()}
              unit="IC"
              size="sm"
            >
              <span className="text-xs text-gray-500">{cost.manpower.toLocaleString()} MP</span>
            </StatCard>
            <StatCard
              label="Org"
              value={stats.organization.toFixed(1)}
              color="info"
              size="sm"
            />
            <StatCard
              label="HP"
              value={Math.round(stats.hp).toLocaleString()}
              color="success"
              size="sm"
            />
          </div>

          {/* Combat Stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 mb-4">
            <StatRow label="Soft Atk" value={stats.softAttack.toFixed(1)} color="danger" />
            <StatRow label="Hard Atk" value={stats.hardAttack.toFixed(1)} color="danger" />
            <StatRow label="Armor" value={stats.armor.toFixed(1)} color="primary" />
            <StatRow label="Piercing" value={stats.piercing.toFixed(1)} color="warning" />
            <StatRow label="Defense" value={stats.defense.toFixed(1)} color="success" />
            <StatRow label="Break." value={stats.breakthrough.toFixed(1)} color="warning" />
          </div>

          {/* Support Stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 mb-4">
            <StatRow label="Recon" value={stats.recon.toFixed(1)} color="info" />
            <StatRow label="Supp." value={stats.suppression.toFixed(1)} />
            <StatRow label="Weight" value={stats.weight.toFixed(1)} unit="t" />
            <StatRow label="Supply" value={stats.supplyUse.toFixed(2)} color="danger" />
            <StatRow label="Fuel" value={stats.fuelUse.toFixed(2)} color="danger" />
            <StatRow label="Hardness" value={Math.round(stats.hardness * 100)} unit="%" />
          </div>

          {/* Regiments */}
          <div className="border-t dark:border-gray-700 pt-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Regiments ({regiments.reduce((sum, r) => sum + r.count, 0)} battalions)
            </h4>
            <div className="flex flex-wrap gap-2">
              {regiments.map((regiment, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="gap-1"
                >
                  <span>{TYPE_ICONS[regiment.type] || '📦'}</span>
                  <span>{regiment.count}x {regiment.equipmentName}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Support Companies */}
          {supportCompanies.length > 0 && (
            <div className="border-t dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Support Companies
              </h4>
              <div className="flex flex-wrap gap-2">
                {supportCompanies.map((support, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="gap-1"
                  >
                    <span>🔧</span>
                    <span>{support.equipmentName}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validation && validation.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Errors:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DivisionCard.displayName = 'DivisionCard';