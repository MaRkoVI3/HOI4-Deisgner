'use client';

import * as React from 'react';
import { Alert } from '@generalstaff/ui-components';
import { Badge } from '@generalstaff/ui-components';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { DivisionTemplate } from '@generalstaff/shared-types';
import { BATTALION_TEMPLATES, SUPPORT_COMPANY_TEMPLATES } from '@generalstaff/calculation-engine';

interface ValidationPanelProps {
  template: DivisionTemplate | null;
  combatWidthBudget: number;
}

export function ValidationPanel({ template, combatWidthBudget }: ValidationPanelProps) {
  const errors = React.useMemo(() => {
    const errs: string[] = [];
    if (!template) return errs;

    // Check combat width - BATTALION_TEMPLATES is a Record<string, BattalionTemplate>
    const battalionTemplates = Object.values(BATTALION_TEMPLATES);
    const supportCompanyTemplates = Object.values(SUPPORT_COMPANY_TEMPLATES);

    const totalCombatWidth = template.battalions.reduce((sum, b) => {
      const bt = battalionTemplates.find(t => t.type === b.templateId);
      return sum + (bt?.width || 2) * b.count;
    }, 0) + template.supportCompanies.reduce((sum, sc) => {
      const sct = supportCompanyTemplates.find(t => t.type === sc.templateId);
      return sum + (sct?.width || 0);
    }, 0);

    if (totalCombatWidth > combatWidthBudget) {
      errs.push(`Combat width (${totalCombatWidth}) exceeds budget (${combatWidthBudget})`);
    }

    // Check for empty division
    if (template.battalions.length === 0) {
      errs.push('Division must have at least one battalion');
    }

    // Check support company limit
    if (template.supportCompanies.length > 5) {
      errs.push('Cannot have more than 5 support companies');
    }

    return errs;
  }, [template, combatWidthBudget]);

  const warnings = React.useMemo(() => {
    const warns: string[] = [];
    if (!template) return warns;

    // Check for empty division
    if (template.battalions.length > 0 && template.battalions.length < 3) {
      warns.push('Consider adding more battalions for a balanced division');
    }

    if (template.supportCompanies.length === 0) {
      warns.push('No support companies added - consider adding Engineer or Recon');
    }

    const battalionTemplates = Object.values(BATTALION_TEMPLATES);
    const supportCompanyTemplates = Object.values(SUPPORT_COMPANY_TEMPLATES);

    const totalCombatWidth = template.battalions.reduce((sum, b) => {
      const bt = battalionTemplates.find(t => t.type === b.templateId);
      return sum + (bt?.width || 2) * b.count;
    }, 0) + template.supportCompanies.reduce((sum, sc) => {
      const sct = supportCompanyTemplates.find(t => t.type === sc.templateId);
      return sum + (sct?.width || 0);
    }, 0);

    if (totalCombatWidth < combatWidthBudget * 0.8) {
      warns.push(`Combat width (${totalCombatWidth}) is significantly under budget (${combatWidthBudget})`);
    }

    const hasEngineer = template.battalions.some(b => {
      const bt = battalionTemplates.find(t => t.type === b.templateId);
      return bt?.type === 'engineer';
    }) || template.supportCompanies.some(s => s.templateId === 'engineer');
    if (!hasEngineer) {
      warns.push('No engineer support - division will have reduced entrenchment and attack on forts/river crossings');
    }

    const hasRecon = template.battalions.some(b => {
      const bt = battalionTemplates.find(t => t.type === b.templateId);
      return bt?.type === 'recon';
    }) || template.supportCompanies.some(s => s.templateId === 'recon');
    if (!hasRecon) {
      warns.push('No reconnaissance - division will have reduced reconnaissance stat');
    }

    return warns;
  }, [template, combatWidthBudget]);

  const infos = React.useMemo(() => {
    const infos: string[] = [];
    if (!template) return infos;

    const battalionTemplates = Object.values(BATTALION_TEMPLATES);
    const supportCompanyTemplates = Object.values(SUPPORT_COMPANY_TEMPLATES);

    const totalCombatWidth = template.battalions.reduce((sum, b) => {
      const bt = battalionTemplates.find(t => t.type === b.templateId);
      return sum + (bt?.width || 2) * b.count;
    }, 0) + template.supportCompanies.reduce((sum, sc) => {
      const sct = supportCompanyTemplates.find(t => t.type === sc.templateId);
      return sum + (sct?.width || 0);
    }, 0);

    infos.push(`Total Battalions: ${template.battalions.length}`);
    infos.push(`Support Companies: ${template.supportCompanies.length}`);
    infos.push(`Combat Width: ${totalCombatWidth} / ${combatWidthBudget}`);

    return infos;
  }, [template, combatWidthBudget]);

  if (!template) {
    return (
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <div>Select or create a division template to see validation results</div>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Errors</h4>
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <div>{error}</div>
            </Alert>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Warnings</h4>
          {warnings.map((warning, index) => (
            <Alert key={index} variant="warning" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <div>{warning}</div>
            </Alert>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Information</h4>
        {infos.map((info, index) => (
          <Badge key={index} variant="outline" className="text-xs justify-start gap-2 w-full">
            <Info className="h-3 w-3" />
            {info}
          </Badge>
        ))}
      </div>

      {errors.length === 0 && warnings.length === 0 && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <div>No validation issues found!</div>
        </Alert>
      )}
    </div>
  );
}