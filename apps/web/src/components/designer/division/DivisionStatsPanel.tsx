'use client';

import { cn } from '@generalstaff/ui-components';
import {
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tooltip,
  TooltipProvider,
} from '@generalstaff/ui-components';
import type { DivisionStats, DivisionTemplate } from '@generalstaff/shared-types';
import { calculateDivisionStats, type CalculationContext } from '@generalstaff/calculation-engine';
import { BATTALION_TEMPLATES } from '@/data/battalionTemplates';
import { SUPPORT_COMPANY_TEMPLATES } from '@/data/supportCompanyTemplates';
import { DOCTRINES } from '@generalstaff/calculation-engine';
import { NATIONAL_SPIRITS } from '@generalstaff/calculation-engine';
import { EQUIPMENT_VARIANTS } from '@generalstaff/calculation-engine';

interface DivisionStatsPanelProps {
  template: DivisionTemplate | null;
  combatWidthBudget: number;
}

export function DivisionStatsPanel({ template, combatWidthBudget }: DivisionStatsPanelProps) {
  if (!template) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No division selected
        </CardContent>
      </Card>
    );
  }

  // Build context with the templates - convert arrays to Records
  const battalionTemplatesRecord = Object.fromEntries(BATTALION_TEMPLATES.map(t => [t.id, t]));
  const supportCompanyTemplatesRecord = Object.fromEntries(SUPPORT_COMPANY_TEMPLATES.map(t => [t.id, t]));
  const equipmentVariantsRecord = Object.fromEntries(EQUIPMENT_VARIANTS.map(e => [e.id, e]));

  const context: CalculationContext = {
    battalionTemplates: battalionTemplatesRecord,
    supportCompanyTemplates: supportCompanyTemplatesRecord,
    equipmentVariants: equipmentVariantsRecord,
    doctrines: Object.fromEntries(DOCTRINES.map(d => [d.id, d])),
    nationalSpirits: Object.fromEntries(NATIONAL_SPIRITS.map(s => [s.id, s])),
    technologies: {},
    country: template.country,
  };

  // The template is already in the correct format for calculateDivisionStats
  const stats = calculateDivisionStats(template, context);
  const combatWidthUsage = (stats.combatWidth / combatWidthBudget) * 100;
  const isOverBudget = stats.combatWidth > combatWidthBudget;

  const statCategories = {
    'Combat': ['softAttack', 'hardAttack', 'airAttack', 'defense', 'breakthrough', 'armor', 'hardness', 'piercing'],
    'Organization': ['organization', 'maxOrganization', 'recoveryRate'],
    'Logistics': ['supplyConsumption', 'fuelConsumption', 'weight'],
    'Special': ['recon', 'suppression', 'entrenchment', 'initiative', 'speed', 'hp', 'apAttack'],
    'Meta': ['manpower', 'productionCost', 'icCost', 'battalionCount', 'supportCompanyCount'],
  };

  const formatStatValue = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Division Statistics</CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className={cn('font-medium', isOverBudget ? 'text-red-500' : 'text-green-500')}>
                    {stats.combatWidth} / {combatWidthBudget}
                  </span>
                  <span className="text-muted-foreground ml-1">Combat Width</span>
                </div>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isOverBudget ? 'bg-red-500' : 'bg-green-500'
                    )}
                    style={{ width: `${Math.min(combatWidthUsage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(statCategories).map(([category, keys]) => (
                <Card key={category} className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-3 py-1.5 text-left font-medium text-muted-foreground uppercase">Stat</th>
                            <th className="px-3 py-1.5 text-right font-medium text-muted-foreground uppercase">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keys.map((key) => {
                            const value = stats[key as keyof DivisionStats];
                            if (value === undefined) return null;

                            return (
                              <tr key={key} className="border-b border-border/50">
                                <td className="px-3 py-1.5">
                                  <Tooltip
                                    content={<span>{key}</span>}
                                    side="right"
                                  >
                                    <span className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                  </Tooltip>
                                </td>
                                <td className="px-3 py-1.5 text-right font-mono text-sm">
                                  {formatStatValue(value as number)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {stats.validationIssues && stats.validationIssues.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Validation Issues</h4>
                {stats.validationIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg text-sm',
                      issue.type === 'error' && 'bg-red-500/10 text-red-500 border border-red-500/20',
                      issue.type === 'warning' && 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
                      issue.type === 'info' && 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    )}
                  >
                    {issue.type === 'error' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    {issue.type === 'warning' && <HelpCircle className="w-4 h-4 flex-shrink-0" />}
                    {issue.type === 'info' && <Info className="w-4 h-4 flex-shrink-0" />}
                    <span>{issue.message}</span>
                    {issue.autoFix && (
                      <button
                        onClick={issue.autoFix}
                        className="ml-auto text-xs underline hover:text-primary"
                      >
                        Auto-fix
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}