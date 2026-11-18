'use client';

import { SupportCompanyInstance, SupportCompanyType, EquipmentCategory } from '@generalstaff/shared-types';
import { SUPPORT_COMPANY_TEMPLATES } from '@generalstaff/calculation-engine';
import { Button } from '@generalstaff/ui-components';
import { Badge } from '@generalstaff/ui-components';
import { Checkbox } from '@generalstaff/ui-components';
import { Label } from '@generalstaff/ui-components';
import { cn } from '@generalstaff/ui-components';

interface SupportCompanySelectorProps {
  selectedCompanies: SupportCompanyInstance[];
  onChange: (companies: SupportCompanyInstance[]) => void;
  availableEquipment: Map<EquipmentCategory, Array<{ id: string; name: string }>>;
  onEquipmentClick: (supportCompanyType: string) => void;
}

const supportCompanyCategories: Record<string, SupportCompanyType[]> = {
  'Engineering': ['engineer', 'maintenance'],
  'Reconnaissance': ['recon'],
  'Logistics': ['logistics', 'signal'],
  'Support': ['military_police', 'hospital'],
  'Combat': ['anti_air', 'anti_tank', 'artillery'],
};

export function SupportCompanySelector({
  selectedCompanies,
  onChange,
  availableEquipment,
  onEquipmentClick,
}: SupportCompanySelectorProps) {
  const handleToggle = (templateId: SupportCompanyType) => {
    const isSelected = selectedCompanies.some(c => c.templateId === templateId);
    let newCompanies: SupportCompanyInstance[];

    if (isSelected) {
      newCompanies = selectedCompanies.filter(c => c.templateId !== templateId);
    } else {
      const template = SUPPORT_COMPANY_TEMPLATES[templateId];
      if (!template) return;
      const newCompany: SupportCompanyInstance = {
        id: crypto.randomUUID(),
        templateId,
        equipmentVariantId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newCompanies = [...selectedCompanies, newCompany];
    }
    onChange(newCompanies);
  };

  const handleEquipmentClick = (templateId: SupportCompanyType) => {
    onEquipmentClick(templateId);
  };

  const templatesArray = Object.values(SUPPORT_COMPANY_TEMPLATES);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Support Companies</h3>
        <Badge variant="outline" className="text-xs">
          {selectedCompanies.length} / 5
        </Badge>
      </div>

      {Object.entries(supportCompanyCategories).map(([category, companyTypes]) => {
        const templates = templatesArray.filter(t => companyTypes.includes(t.type));
        if (templates.length === 0) return null;

        return (
          <div key={category} className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">{category}</h4>
            <div className="space-y-2">
              {templates.map(template => {
                const isSelected = selectedCompanies.some(c => c.templateId === template.type);
                const selectedCompany = selectedCompanies.find(c => c.templateId === template.type);
                const equipmentCategory = template.equipment;
                const hasEquipment = equipmentCategory && availableEquipment.has(equipmentCategory);
                const equipmentOptions = hasEquipment ? availableEquipment.get(equipmentCategory!) : [];

                return (
                  <div
                    key={template.type}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      isSelected
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-card border-border hover:bg-accent/50'
                    )}
                  >
                    <Checkbox
                      id={`support-${template.type}`}
                      checked={isSelected}
                      onChange={() => handleToggle(template.type)}
                    />
                    <Label htmlFor={`support-${template.type}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Width: {template.width} • {template.stats.softAttack ? `Soft Attack: +${template.stats.softAttack}` : ''}
                        {template.stats.hardAttack ? ` Hard Attack: +${template.stats.hardAttack}` : ''}
                        {template.stats.recon ? ` Recon: +${template.stats.recon}` : ''}
                        {template.stats.entrenchment ? ` Entrenchment: +${template.stats.entrenchment}` : ''}
                        {template.stats.breakthrough ? ` Breakthrough: +${template.stats.breakthrough}` : ''}
                      </div>
                    </Label>
                    {hasEquipment && equipmentOptions && equipmentOptions.length > 0 && isSelected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEquipmentClick(template.type)}
                        className="flex-shrink-0"
                      >
                        Equipment
                      </Button>
                    )}
                    {isSelected && selectedCompany?.equipmentVariantId && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {equipmentOptions?.find(e => e.id === selectedCompany.equipmentVariantId)?.name || selectedCompany.equipmentVariantId}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedCompanies.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Selected Support Companies</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCompanies.map(company => {
              const template = SUPPORT_COMPANY_TEMPLATES[company.templateId];
              return template ? (
                <Badge key={company.templateId} variant="secondary" className="gap-1">
                  {template.name}
                  <button
                    onClick={() => handleToggle(template.type)}
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
  );
}