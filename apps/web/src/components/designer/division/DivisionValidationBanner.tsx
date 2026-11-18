import { DivisionTemplate, DivisionStats, EquipmentCategory } from '@generalstaff/shared-types';
import { BATTALION_TEMPLATES, SUPPORT_COMPANY_TEMPLATES } from '@generalstaff/calculation-engine';
import { Button } from '@generalstaff/ui-components';
import { cn } from '@generalstaff/ui-components';

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  autoFix?: () => void;
  autoFixLabel?: string;
}

interface DivisionValidationBannerProps {
  template: DivisionTemplate;
  stats: DivisionStats | null;
  combatWidthBudget: number;
  onAutoFix: (fix: () => void) => void;
  dismissedIssues: Set<string>;
  onDismiss: (issueId: string) => void;
}

export function DivisionValidationBanner({
  template,
  stats,
  combatWidthBudget,
  onAutoFix,
  dismissedIssues,
  onDismiss,
}: DivisionValidationBannerProps) {
  const issues = useValidationChecks(template, stats, combatWidthBudget);
  const visibleIssues = issues.filter(i => !dismissedIssues.has(i.id));
  const errors = visibleIssues.filter(i => i.type === 'error');
  const warnings = visibleIssues.filter(i => i.type === 'warning');
  const infos = visibleIssues.filter(i => i.type === 'info');

  if (visibleIssues.length === 0) {
    return (
      <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
        <span className="flex-shrink-0">✓</span>
        <span>No validation issues found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {errors.map(issue => (
        <IssueBadge key={issue.id} issue={issue} variant="destructive" onAutoFix={onAutoFix} onDismiss={onDismiss} />
      ))}
      {warnings.map(issue => (
        <IssueBadge key={issue.id} issue={issue} variant="warning" onAutoFix={onAutoFix} onDismiss={onDismiss} />
      ))}
      {infos.map(issue => (
        <IssueBadge key={issue.id} issue={issue} variant="secondary" onAutoFix={onAutoFix} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function IssueBadge({
  issue,
  variant,
  onAutoFix,
  onDismiss,
}: {
  issue: ValidationIssue;
  variant: 'destructive' | 'warning' | 'secondary';
  onAutoFix: (fix: () => void) => void;
  onDismiss: (issueId: string) => void;
}) {
  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border', {
      'bg-destructive/10 border-destructive/30': variant === 'destructive',
      'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700': variant === 'warning',
      'bg-secondary/10 border-border': variant === 'secondary',
    })}>
      <span className="text-sm flex-1">{issue.message}</span>
      {issue.autoFix && issue.autoFixLabel && (
        <Button variant="ghost" size="sm" onClick={() => onAutoFix(issue.autoFix!)} className="h-6 px-2">
          {issue.autoFixLabel}
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onDismiss(issue.id)} className="h-6 w-6 opacity-50 hover:opacity-100">
        ✕
      </Button>
    </div>
  );
}

function useValidationChecks(
  template: DivisionTemplate,
  stats: DivisionStats | null,
  combatWidthBudget: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check combat width - BATTALION_TEMPLATES is a Record<string, BattalionTemplate>
  const battalionTemplates = Object.values(BATTALION_TEMPLATES);
  const supportCompanyTemplates = Object.values(SUPPORT_COMPANY_TEMPLATES);

  let totalCombatWidth = template.battalions.reduce((sum, b) => {
    const bt = battalionTemplates.find(t => t.type === b.templateId);
    return sum + (bt?.width ?? 0) * b.count;
  }, 0);
  template.supportCompanies.forEach(sc => {
    const st = supportCompanyTemplates.find(t => t.type === sc.templateId);
    if (st) totalCombatWidth += st.width;
  });

  if (totalCombatWidth > combatWidthBudget) {
    issues.push({
      id: 'combat-width-over',
      type: 'error',
      message: `Combat width ${totalCombatWidth} exceeds budget ${combatWidthBudget}`,
      autoFix: () => {
        // Could auto-remove last battalion or reduce count
        console.log('Auto-fix: reduce battalion counts to fit budget');
      },
      autoFixLabel: 'Fix',
    });
  } else if (totalCombatWidth === 0) {
    issues.push({
      id: 'no-battalions',
      type: 'error',
      message: 'No battalions in division',
    });
  }

  // Check for empty battalion slots
  template.battalions.forEach((b, idx) => {
    const bt = battalionTemplates.find(t => t.type === b.templateId);
    if (bt && bt.equipment.length > 0) {
      const unassigned = bt.equipment.filter((slot: EquipmentCategory) => !b.equipmentAssignments?.[slot]);
      if (unassigned.length > 0) {
        issues.push({
          id: `unassigned-equip-${idx}`,
          type: 'warning',
          message: `${bt.name} has ${unassigned.length} unassigned equipment slot(s)`,
        });
      }
    }
  });

  // Check for support companies
  if (template.supportCompanies.length === 0) {
    issues.push({
      id: 'no-support',
      type: 'info',
      message: 'No support companies added (Engineers, Recon, etc.)',
    });
  }

  // Check doctrine
  if (template.doctrineSelections.length === 0) {
    issues.push({
      id: 'no-doctrine',
      type: 'info',
      message: 'No doctrines selected',
    });
  }

  // Check stats if available
  if (stats) {
    if (stats.organization < 30) {
      issues.push({
        id: 'low-org',
        type: 'warning',
        message: `Low organization: ${stats.organization.toFixed(1)}`,
      });
    }
    if (stats.hardness < 10 && template.battalions.some(b => {
      const bt = battalionTemplates.find(t => t.type === b.templateId);
      return bt?.type === 'tank' || bt?.type === 'modern_tank' || bt?.type === 'light_tank' || bt?.type === 'medium_tank' || bt?.type === 'heavy_tank' || bt?.type === 'super_heavy_tank';
    })) {
      issues.push({
        id: 'low-hardness',
        type: 'warning',
        message: `Low hardness (${stats.hardness.toFixed(1)}%) for tank division`,
      });
    }
    if (stats.piercing < 10 && template.battalions.some(b => {
      const bt = battalionTemplates.find(t => t.type === b.templateId);
      return bt?.type === 'anti_tank' || bt?.type === 'tank_destroyer';
    })) {
      issues.push({
        id: 'low-piercing',
        type: 'warning',
        message: `Low piercing (${stats.piercing.toFixed(1)}) for anti-tank division`,
      });
    }
  }

  return issues;
}