'use client';

import * as React from 'react';
import { CountrySelector } from './CountrySelector';
import { DoctrineSelector } from './DoctrineSelector';
import { BattalionEditor } from './BattalionEditor';
import { SupportCompanyEditor } from './SupportCompanyEditor';
import { DivisionStatsPanel } from './DivisionStatsPanel';
import { ValidationPanel } from './ValidationPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@generalstaff/ui-components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@generalstaff/ui-components';
import type { CountryTag, BattalionTemplate, SupportCompanyTemplate, DivisionTemplate, BattalionInstance, SupportCompanyInstance } from '@generalstaff/shared-types';

interface DivisionDesignerProps {
  template: DivisionTemplate | null;
  battalions: BattalionInstance[];
  supportCompanies: SupportCompanyInstance[];
  availableCountries: CountryTag[];
  availableBattalions: BattalionTemplate[];
  availableSupportCompanies: SupportCompanyTemplate[];
  combatWidthBudget: number;
  onCombatWidthBudgetChange: (budget: number) => void;
  onAddBattalion: (templateId: string) => void;
  onRemoveBattalion: (index: number) => void;
  onUpdateBattalionCount: (index: number, count: number) => void;
  onAddSupportCompany: (templateId: string) => void;
  onRemoveSupportCompany: (index: number) => void;
  onCountryChange: (countryTag: string) => void;
  selectedCountry: string;
}

export function DivisionDesigner({
  template,
  battalions,
  supportCompanies,
  availableCountries,
  availableBattalions,
  availableSupportCompanies,
  combatWidthBudget,
  onCombatWidthBudgetChange,
  onAddBattalion,
  onRemoveBattalion,
  onUpdateBattalionCount,
  onAddSupportCompany,
  onRemoveSupportCompany,
  onCountryChange,
  selectedCountry,
}: DivisionDesignerProps) {
  const [activeTab, setActiveTab] = React.useState<'battalions' | 'support' | 'doctrine'>('battalions');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Division Designer</h2>
          <p className="text-muted-foreground">Create and optimize your division templates</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Combat Width Budget:</label>
          <input
            type="number"
            value={combatWidthBudget}
            onChange={(e) => onCombatWidthBudgetChange(Number(e.target.value))}
            min={1}
            max={100}
            className="w-24 h-8 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs className="space-y-4">
            <TabsList>
              <TabsTrigger
                value="battalions"
                data-state={activeTab === 'battalions' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('battalions')}
              >
                Battalions
              </TabsTrigger>
              <TabsTrigger
                value="support"
                data-state={activeTab === 'support' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('support')}
              >
                Support Companies
              </TabsTrigger>
              <TabsTrigger
                value="doctrine"
                data-state={activeTab === 'doctrine' ? 'active' : 'inactive'}
                onClick={() => setActiveTab('doctrine')}
              >
                Doctrine & Spirits
              </TabsTrigger>
            </TabsList>

            {activeTab === 'battalions' && (
              <TabsContent>
                <Card>
                  <CardHeader>
                    <CardTitle>Battalions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BattalionEditor
                      battalions={battalions}
                      availableBattalions={availableBattalions}
                      onAddBattalion={onAddBattalion}
                      onRemoveBattalion={onRemoveBattalion}
                      onUpdateBattalionCount={onUpdateBattalionCount}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {activeTab === 'support' && (
              <TabsContent>
                <Card>
                  <CardHeader>
                    <CardTitle>Support Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SupportCompanyEditor
                      supportCompanies={supportCompanies}
                      availableSupportCompanies={availableSupportCompanies}
                      onAddSupportCompany={onAddSupportCompany}
                      onRemoveSupportCompany={onRemoveSupportCompany}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {activeTab === 'doctrine' && (
              <TabsContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Doctrine</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DoctrineSelector countryId={selectedCountry} selectedDoctrineIds={template?.doctrineSelections || []} onChange={() => {}} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>National Spirits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">National spirits selection coming soon</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Country</CardTitle>
            </CardHeader>
            <CardContent>
              <CountrySelector value={selectedCountry} onChange={onCountryChange} countries={availableCountries} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Division Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <DivisionStatsPanel template={template} combatWidthBudget={combatWidthBudget} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationPanel template={template} combatWidthBudget={combatWidthBudget} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}