'use client';

import { useState } from 'react';
import { DivisionTemplate, CountryTag } from '@generalstaff/shared-types';
import { Button } from '@generalstaff/ui-components';
import { cn } from '@generalstaff/ui-components';

interface DivisionToolbarProps {
  template: DivisionTemplate;
  divisionId: string | null;
  isDirty: boolean;
  combatWidthBudget: 20 | 40 | 80;
  onBudgetChange: (budget: 20 | 40 | 80) => void;
  onSave: () => Promise<void>;
  onLoad: (divisionId: string) => void;
  onNew: () => void;
  onAnalyze: () => Promise<void>;
  onShare: () => Promise<void>;
  onExportJson: () => void;
  onExportPng: () => void;
  availableCountries: CountryTag[];
  versions: Array<{ id: string; version: number; createdAt: string; statsSnapshot?: unknown }>;
}

export function DivisionToolbar({
  template,
  divisionId,
  isDirty,
  combatWidthBudget,
  onBudgetChange,
  onSave,
  onLoad,
  onNew,
  onAnalyze,
  onShare,
  onExportJson,
  onExportPng,
  availableCountries,
  versions,
}: DivisionToolbarProps) {
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const handleSave = async () => {
    await onSave();
  };

  const handleLoad = () => {
    if (versions.length > 0) {
      setShowLoadDialog(true);
    } else {
      onLoad('');
    }
  };

  const handleCountryChange = (countryTag: string) => {
    const country = availableCountries.find((c) => c.tag === countryTag);
    if (country) {
      console.log('Country changed to:', countryTag);
    }
    setShowCountryDropdown(false);
  };

  return (
    <div className={cn('flex flex-col gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40', 'lg:flex-row lg:items-center lg:justify-between')}>
      {/* Title & Country */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Division Designer</h1>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="w-40 lg:w-auto"
          >
            {template.country?.name || 'Select Country'}
          </Button>
          {showCountryDropdown && (
            <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-md border bg-popover p-1 shadow-md">
              {availableCountries.map((country) => (
                <button
                  key={country.tag}
                  onClick={() => handleCountryChange(country.tag)}
                  className={cn('w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent', template.country?.tag === country.tag && 'bg-accent')}
                >
                  <span className="w-6 h-3 rounded" style={{ backgroundColor: country.color }} />
                  {country.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Combat Width Budget */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Combat Width:</span>
        <select
          value={combatWidthBudget}
          onChange={(e) => onBudgetChange(Number(e.target.value) as 20 | 40 | 80)}
          className="px-2 py-1 text-sm border rounded bg-background"
        >
          <option value={20}>20</option>
          <option value={40}>40</option>
          <option value={80}>80</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onNew}>
          New
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLoad} disabled={versions.length === 0}>
          Load
        </Button>
        <Button variant="ghost" size="sm" onClick={onAnalyze} disabled={!divisionId}>
          Analyze
        </Button>
        <Button variant="ghost" size="sm" onClick={onShare} disabled={!divisionId}>
          Share
        </Button>
        <Button variant="ghost" size="sm" onClick={onExportJson}>
          Export JSON
        </Button>
        <Button variant="ghost" size="sm" onClick={onExportPng}>
          Export PNG
        </Button>
        <Button
          variant={isDirty ? 'default' : 'outline'}
          size="sm"
          onClick={handleSave}
          disabled={!isDirty}
        >
          {isDirty ? 'Save Changes' : 'Saved'}
        </Button>
      </div>

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Load Division</h2>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded bg-input"
            >
              <option value="">Select a division...</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version} - {new Date(v.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => { onLoad(selectedVersion); setShowLoadDialog(false); }} disabled={!selectedVersion}>
                Load
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}