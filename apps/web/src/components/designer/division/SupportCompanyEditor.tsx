'use client';

import { Card, Badge, Select, Button } from '@generalstaff/ui-components';
import { Trash2, Check } from 'lucide-react';
import type { SupportCompanyTemplate, SupportCompanyInstance } from '@generalstaff/shared-types';

interface SupportCompanyEditorProps {
  supportCompanies: SupportCompanyInstance[];
  availableSupportCompanies: SupportCompanyTemplate[];
  onAddSupportCompany: (templateId: string) => void;
  onRemoveSupportCompany: (index: number) => void;
}

export function SupportCompanyEditor({
  supportCompanies,
  availableSupportCompanies,
  onAddSupportCompany,
  onRemoveSupportCompany,
}: SupportCompanyEditorProps) {
  const addOptions = availableSupportCompanies
    .filter(s => !supportCompanies.some(existing => existing.templateId === s.type))
    .map(support => ({
      value: support.type,
      label: `${support.type} - ${support.name}`,
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Add Support Company:</label>
        <Select
          placeholder="Select support company"
          options={addOptions}
          onChange={(e) => {
            const value = e.target.value;
            if (value) onAddSupportCompany(value);
          }}
          disabled={supportCompanies.length >= 5 || addOptions.length === 0}
        />
      </div>

      {supportCompanies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No support companies added. Select a support company type above to add one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {supportCompanies.map((support, index) => {
            const template = availableSupportCompanies.find(s => s.type === support.templateId);
            return (
              <Card key={`${support.templateId}-${index}`} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{template?.type || 'unknown'}</Badge>
                      <span className="font-medium text-sm">{template?.name || support.templateId}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">+1 Combat Width</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveSupportCompany(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Support Companies: {supportCompanies.length} / 5 | Combat Width: {supportCompanies.length}
      </div>
    </div>
  );
}