'use client';

import * as React from 'react';
import { useDivisionDesignerStore } from '@/store/divisionDesignerStore';
import { calculateDivisionStats, type CalculationContext } from '@generalstaff/calculation-engine';
import { BATTALION_TEMPLATES } from '@/data/battalionTemplates';
import { SUPPORT_COMPANY_TEMPLATES } from '@/data/supportCompanyTemplates';
import { Progress } from '@generalstaff/ui-components';
import { STAT_DEFINITIONS } from '@generalstaff/shared-types';

const STAT_GROUPS = {
  'Combat': ['softAttack', 'hardAttack', 'airAttack', 'defense', 'breakthrough', 'armor', 'piercing', 'hardness'] as const,
  'Mobility': ['speed', 'maxSpeed', 'recon'] as const,
  'Logistics': ['supplyConsumption', 'fuelConsumption', 'weight'] as const,
  'Durability': ['hp', 'organization', 'recoveryRate', 'entrenchment'] as const,
  'Other': ['initiative', 'combatWidth'] as const,
};

type StatKey = keyof typeof STAT_DEFINITIONS;

export function StatsPanel() {
  const { template, selectedDoctrine, selectedNationalSpirits, combatWidthBudget } = useDivisionDesignerStore();

  const stats = React.useMemo(() => {
    if (!template) return null;

    // Build context with the templates - convert arrays to Records
    const battalionTemplatesRecord = Object.fromEntries(BATTALION_TEMPLATES.map(t => [t.type, t]));
    const supportCompanyTemplatesRecord = Object.fromEntries(SUPPORT_COMPANY_TEMPLATES.map(t => [t.type, t]));

    const context: CalculationContext = {
      battalionTemplates: battalionTemplatesRecord,
      supportCompanyTemplates: supportCompanyTemplatesRecord,
      equipmentVariants: {},
      doctrines: {},
      nationalSpirits: {},
      technologies: {},
      country: template.country ? { tag: template.country.tag, name: template.country.name, color: template.country.color } : undefined,
    };

    // Update template with selected doctrines and spirits
    const updatedTemplate = {
      ...template,
      doctrineSelections: selectedDoctrine ? [selectedDoctrine.id] : [],
      nationalSpirits: selectedNationalSpirits.map(s => s.id),
    };

    return calculateDivisionStats(updatedTemplate, context);
  }, [template, selectedDoctrine, selectedNationalSpirits]);

  if (!stats) {
    return <div className="text-center py-8 text-muted-foreground">No division template selected</div>;
  }

  const combatWidth = stats.combatWidth;
  const widthPercentage = combatWidthBudget > 0 ? (combatWidth / combatWidthBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Combat Width</span>
          <span className="font-medium">{combatWidth} / {combatWidthBudget}</span>
        </div>
        <Progress value={Math.min(widthPercentage, 100)} className="h-3" />
        {widthPercentage > 100 && (
          <p className="text-xs text-destructive mt-1">Exceeds budget by {combatWidth - combatWidthBudget}</p>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(STAT_GROUPS).map(([groupName, statKeys]) => (
          <div key={groupName} className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{groupName}</h4>
            <div className="grid grid-cols-2 gap-2">
              {statKeys.map((key) => {
                const definition = STAT_DEFINITIONS[key as StatKey];
                const value = stats[key as keyof typeof stats] as number;
                if (definition === undefined || value === undefined) return null;

                const formattedValue = definition.format(value);
                const isPercentage = definition.unit === '%';
                const displayValue = isPercentage ? `${formattedValue}` : formattedValue;

                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{definition.label}</span>
                    <span className="font-mono font-medium">{displayValue}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}