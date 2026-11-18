'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  TooltipProvider,
  Alert,
  StatCard,
  cn,
} from '@generalstaff/ui-components';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  Share2,
  Sparkles,
  Shield,
  Target,
  Zap,
  RotateCcw,
} from 'lucide-react';
import type { TankRole, ArmorLayout, TankDesign, TankStats } from '@generalstaff/calculation-engine';
import { calculateTankStats, TANK_ROLES, createTankVariant } from '@generalstaff/calculation-engine';
import { TankModulePicker } from './TankModulePicker';
import { TankStatsPanel } from './TankStatsPanel';
import { TankArchetypeSelector, type ArchetypeTemplate } from './TankArchetypeSelector';
import { TankCompatibilityMatrix } from './TankCompatibilityMatrix';
import { TankSaveLoadShare } from './TankSaveLoadShare';

const COUNTRIES = [
  { tag: 'GER', name: 'Germany', color: '#000000' },
  { tag: 'SOV', name: 'Soviet Union', color: '#CC0000' },
  { tag: 'USA', name: 'United States', color: '#002868' },
  { tag: 'ENG', name: 'United Kingdom', color: '#00247D' },
  { tag: 'FRA', name: 'France', color: '#0055A4' },
  { tag: 'JPN', name: 'Japan', color: '#BC002D' },
  { tag: 'ITA', name: 'Italy', color: '#009246' },
  { tag: 'POL', name: 'Poland', color: '#DC143C' },
  { tag: 'ROM', name: 'Romania', color: '#FCD116' },
  { tag: 'HUN', name: 'Hungary', color: '#009639' },
  { tag: 'CZE', name: 'Czechoslovakia', color: '#11457E' },
  { tag: 'GENERIC', name: 'Generic', color: '#6B7280' },
];

const DEFAULT_ARMOR_LAYOUT: ArmorLayout = { front: 50, side: 30, rear: 20, top: 15 };

const DEFAULT_DESIGN: TankDesign = {
  id: 'new_tank',
  name: 'New Tank Design',
  description: '',
  countryTag: 'GENERIC',
  year: 1942,
  role: 'medium_tank',
  chassis: 'medium_tank_chassis',
  gun: 'medium_caliber_gun',
  armorLayout: DEFAULT_ARMOR_LAYOUT,
  engine: 'diesel_engine',
  suspension: 'torsion_bar',
  stats: {} as TankStats,
  cost: 0,
  reliability: 0,
  productionCost: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function TankDesigner() {
  // Core design state
  const [design, setDesign] = useState<TankDesign>(DEFAULT_DESIGN);
  const [activeTab, setActiveTab] = useState<'builder' | 'stats' | 'compatibility' | 'archetypes'>('builder');
  const [showArchetypeSelector, setShowArchetypeSelector] = useState(false);

  // Derived stats
  const stats = useMemo(() => calculateTankStats(design), [design]);

  // Validation
  const validationIssues = useMemo(() => {
    const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];

    if (!design.chassis || !design.gun || !design.engine) {
      issues.push({ type: 'error', message: 'Chassis, gun, and engine are required.' });
      return issues;
    }

    // Power-to-weight check
    const hpPerTon = (stats.horsepower || 0) / Math.max(stats.weight, 1);
    if (hpPerTon < 8) {
      issues.push({ type: 'warning', message: `Very low power-to-weight ratio (${hpPerTon.toFixed(1)} hp/ton). Mobility will be severely limited.` });
    } else if (hpPerTon < 12) {
      issues.push({ type: 'warning', message: `Low power-to-weight ratio (${hpPerTon.toFixed(1)} hp/ton). Consider a more powerful engine.` });
    } else if (hpPerTon > 30) {
      issues.push({ type: 'info', message: `Excellent power-to-weight ratio (${hpPerTon.toFixed(1)} hp/ton).` });
    }

    // Armor check
    if (design.armorLayout.front < 20 && design.role !== 'light_tank' && design.role !== 'anti_air_tank' && design.role !== 'spg') {
      issues.push({ type: 'warning', message: 'Frontal armor is very thin for this role.' });
    }

    // Role-specific checks
    if (design.role === 'spg' && !['large_caliber_gun', 'super_heavy_gun', 'rocket_launcher'].includes(design.gun)) {
      issues.push({ type: 'info', message: 'SPGs typically use large caliber guns or rocket launchers for indirect fire.' });
    }

    if (design.role === 'anti_air_tank' && design.gun !== 'auto_cannon' && design.gun !== 'small_caliber_gun') {
      issues.push({ type: 'info', message: 'Anti-air tanks typically use autocannons for high rate of fire.' });
    }

    if (design.role === 'tank_destroyer' && design.gun === 'small_caliber_gun') {
      issues.push({ type: 'warning', message: 'Tank destroyers need higher penetration guns.' });
    }

    if (design.role === 'modern_tank' && design.gun !== 'smoothbore_gun') {
      issues.push({ type: 'info', message: 'Modern MBTs typically use smoothbore guns for APFSDS ammunition.' });
    }

    // Stabilization check
    if (stats.stabilization === 'none' && design.year >= 1960) {
      issues.push({ type: 'info', message: 'Post-1960 designs should consider stabilized guns.' });
    }

    // Weight check for transport
    if (stats.weight > 60) {
      issues.push({ type: 'warning', message: `Weight (${stats.weight.toFixed(0)}t) exceeds standard rail/bridge limits. Strategic mobility limited.` });
    }

    return issues;
  }, [design, stats]);

  const hasErrors = validationIssues.some(i => i.type === 'error');
  const hasWarnings = validationIssues.some(i => i.type === 'warning');

  // Handlers
  const updateDesign = useCallback(<K extends keyof TankDesign>(key: K, value: TankDesign[K]) => {
    setDesign((prev: TankDesign) => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }));
  }, []);

  const handleArchetypeSelect = useCallback((template: ArchetypeTemplate) => {
    setDesign((prev: TankDesign) => ({
      ...prev,
      chassis: template.chassis,
      gun: template.gun,
      engine: template.engine,
      suspension: template.suspension,
      armorLayout: template.armorLayout,
      role: template.role,
      year: template.year,
      name: template.name,
      description: template.description,
      updatedAt: new Date().toISOString(),
    }));
    setShowArchetypeSelector(false);
    setActiveTab('builder');
  }, []);

  const handleNewDesign = useCallback(() => {
    setDesign({ ...DEFAULT_DESIGN, id: `tank_${Date.now()}`, name: 'New Tank Design' });
    setActiveTab('builder');
  }, []);

  const handleLoadDesign = useCallback((loadedDesign: TankDesign) => {
    setDesign({ ...loadedDesign, id: `tank_${Date.now()}`, name: loadedDesign.name });
    setActiveTab('builder');
  }, []);

  const handleCreateVariant = useCallback((variantName: string, modifications: Partial<TankDesign>) => {
    const variant = createTankVariant(design, variantName, modifications);
    setDesign(variant);
    setActiveTab('builder');
  }, [design]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(design, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.name.replace(/\s+/g, '_')}.tank.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [design]);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        handleLoadDesign(imported);
      } catch {
        alert('Invalid tank design file');
      }
    };
    reader.readAsText(file);
  }, [handleLoadDesign]);

  // Check for shared design in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
      try {
        const shared = JSON.parse(atob(shareParam));
        if (shared.type === 'tank_design' && shared.design) {
          handleLoadDesign(shared.design);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        console.error('Failed to load shared design');
      }
    }
  }, [handleLoadDesign]);

  const currentDesignForCompat = {
    role: design.role,
    chassis: design.chassis,
    gun: design.gun,
    engine: design.engine,
    suspension: design.suspension,
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Tank Designer
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Design custom tank variants with live stats calculation</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              label="Country"
              value={design.countryTag}
              onChange={e => updateDesign('countryTag', e.target.value)}
              options={COUNTRIES.map(c => ({ value: c.tag, label: c.name }))}
              className="w-40"
            />
            <Input
              label="Year"
              type="number"
              value={design.year}
              onChange={e => updateDesign('year', Number(e.target.value))}
              min={1915}
              max={2030}
              className="w-28"
            />
          </div>
        </div>

        {/* Design Info Bar */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                label="Design Name"
                value={design.name}
                onChange={e => updateDesign('name', e.target.value)}
                placeholder="Tank name"
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                label="Role"
                value={design.role}
                onChange={e => updateDesign('role', e.target.value as TankRole)}
                options={Object.entries(TANK_ROLES).map(([key, val]: [string, { description: string }]) => ({ value: key as TankRole, label: val.description }))}
                className="w-56"
              />
              <Badge variant="secondary" className="text-xs">
                {design.year}
              </Badge>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm">
              <StatCard label="Cost" value={stats.productionCost.toFixed(0)} unit="IC" color="warning" size="sm" />
              <StatCard label="Weight" value={stats.weight.toFixed(0)} unit="t" color="primary" size="sm" />
              <StatCard label="Speed" value={stats.speed.toFixed(0)} unit="km/h" color="success" size="sm" />
              <StatCard label="HP" value={stats.hp.toFixed(0)} color="danger" size="sm" />
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Module Picker & Archetypes */}
          <div className="lg:col-span-1 space-y-6">
            {/* Module Picker */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Modules
                  <Badge variant="outline" className="text-xs">
                    {TANK_ROLES[design.role]?.description || design.role}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TankModulePicker
                  role={design.role}
                  chassis={design.chassis}
                  gun={design.gun}
                  engine={design.engine}
                  suspension={design.suspension}
                  armorLayout={design.armorLayout}
                  onChassisChange={v => updateDesign('chassis', v)}
                  onGunChange={v => updateDesign('gun', v)}
                  onEngineChange={v => updateDesign('engine', v)}
                  onSuspensionChange={v => updateDesign('suspension', v)}
                  onArmorLayoutChange={v => updateDesign('armorLayout', v)}
                  onArmorPresetChange={() => {}}
                />
              </CardContent>
            </Card>

            {/* Quick Variant Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Upgunned', { gun: 'large_caliber_gun' })}>
                  <Target className="h-3.5 w-3.5 mr-1" /> Up-gun Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Up-Armored', { armorLayout: { ...design.armorLayout, front: design.armorLayout.front * 1.5, side: design.armorLayout.side * 1.5 } })}>
                  <Shield className="h-3.5 w-3.5 mr-1" /> Up-armor Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('High Mobility', { engine: 'gas_turbine', suspension: 'hydro_pneumatic' })}>
                  <Zap className="h-3.5 w-3.5 mr-1" /> High Mobility Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Modernized', { gun: 'smoothbore_gun', engine: 'gas_turbine', suspension: 'active_suspension', year: 1990 })}>
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Modernize
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Stats & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              {(['builder', 'stats', 'compatibility', 'archetypes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'builder' && (
              <div className="space-y-6 pt-4">
                {/* Archetype Selector (collapsible) */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Archetype Templates</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowArchetypeSelector(!showArchetypeSelector)}>
                        <RotateCcw className={cn('h-4 w-4 transition-transform', showArchetypeSelector && 'rotate-180')} />
                      </Button>
                    </div>
                  </CardHeader>
                  {showArchetypeSelector && (
                    <CardContent className="pt-0">
                      <TankArchetypeSelector
                        selectedRole={design.role}
                        onSelect={handleArchetypeSelect}
                        currentDesign={design}
                      />
                    </CardContent>
                  )}
                </Card>

                {/* Validation Summary */}
                {(hasErrors || hasWarnings) && (
                  <Card className={hasErrors ? 'border-red-500/50' : 'border-yellow-500/50'}>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {validationIssues.map((issue, index) => (
                          <Alert
                            key={index}
                            variant={issue.type === 'error' ? 'destructive' : issue.type === 'warning' ? 'warning' : 'info'}
                            title={issue.message}
                            className="text-sm"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Save/Load/Share */}
                <TankSaveLoadShare
                  currentDesign={design}
                  onLoadDesign={handleLoadDesign}
                  onNewDesign={handleNewDesign}
                />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="pt-4">
                <TankStatsPanel design={design} showValidation={true} />
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div className="pt-4">
                <TankCompatibilityMatrix currentDesign={currentDesignForCompat} />
              </div>
            )}

            {activeTab === 'archetypes' && (
              <div className="pt-4">
                <TankArchetypeSelector
                  onSelect={handleArchetypeSelect}
                  currentDesign={design}
                />
              </div>
            )}
          </div>

          {/* Right Panel - Quick Stats & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Key Stats Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatCard label="Penetration" value={stats.piercing.toFixed(0)} unit="mm" color="danger" size="sm" />
                <StatCard label="Anti-Tank" value={stats.hardAttack.toFixed(1)} color="danger" size="sm" />
                <StatCard label="Anti-Infantry" value={stats.softAttack.toFixed(1)} color="warning" size="sm" />
                <StatCard label="Armor (Max)" value={stats.armor.toFixed(0)} unit="mm" color="primary" size="sm" />
                <StatCard label="HP" value={stats.hp.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Speed" value={stats.speed.toFixed(0)} unit="km/h" color="success" size="sm" />
                <StatCard label="Reliability" value={(stats.reliability * 100).toFixed(0)} unit="%" color="info" size="sm" />
                <StatCard label="Crew" value={stats.crew.toString()} color="default" size="sm" />
                <StatCard label="Ammo" value={stats.ammoCapacity.toString()} unit="rds" color="default" size="sm" />
                <StatCard label="ROF" value={stats.fireRate.toFixed(1)} unit="RPM" color="warning" size="sm" />
                <StatCard label="Depression" value={stats.gunDepression.toString()} unit="°" color="info" size="sm" />
                <StatCard label="Stabilization" value={stats.stabilization.replace('_', ' ')} color={stats.stabilization !== 'none' ? 'success' : 'default'} size="sm" />
                <StatCard label="Fuel/100km" value={stats.fuelConsumption.toFixed(1)} color="default" size="sm" />
                <StatCard label="Prod. Cost" value={stats.productionCost.toFixed(0)} unit="IC" color="warning" size="sm" />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" /> Export Design (JSON)
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  const shareData = { type: 'tank_design', version: 1, design };
                  const encoded = btoa(JSON.stringify(shareData));
                  const url = `${window.location.origin}/tank-designer?share=${encoded}`;
                  navigator.clipboard.writeText(url);
                  alert('Share link copied to clipboard!');
                }}>
                  <Share2 className="h-4 w-4 mr-2" /> Copy Share Link
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={handleNewDesign}>
                  <Plus className="h-4 w-4 mr-2" /> New Design
                </Button>
                <label className="w-full">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                    className="sr-only"
                  />
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" /> Import Design
                  </Button>
                </label>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={() => {
                  if (confirm('Delete this design? This cannot be undone.')) {
                    handleNewDesign();
                  }
                }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Design
                </Button>
              </CardContent>
            </Card>

            {/* Armor Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Armor Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto" style={{ width: 280, height: 160 }}>
                  <svg width="280" height="160" viewBox="0 0 280 160">
                    {/* Tank hull */}
                    <rect x="30" y="60" width="220" height="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" rx="3" />
                    {/* Turret */}
                    <ellipse cx="140" cy="50" rx="50" ry="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    {/* Gun */}
                    <rect x="190" y="45" width="60" height="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" rx="1" />

                    {/* Armor thickness indicators */}
                    {/* Front */}
                    <line x1="30" y1="55" x2="30" y2="125" stroke="currentColor" strokeWidth={Math.max(2, design.armorLayout.front / 20)} opacity="0.7" strokeLinecap="round" />
                    {/* Rear */}
                    <line x1="250" y1="55" x2="250" y2="125" stroke="currentColor" strokeWidth={Math.max(2, design.armorLayout.rear / 20)} opacity="0.7" strokeLinecap="round" />
                    {/* Top (turret) */}
                    <line x1="140" y1="25" x2="140" y2="35" stroke="currentColor" strokeWidth={Math.max(2, design.armorLayout.top / 20)} opacity="0.7" strokeLinecap="round" />

                    {/* Side indicator (middle) */}
                    <line x1="140" y1="125" x2="140" y2="135" stroke="currentColor" strokeWidth={Math.max(2, design.armorLayout.side / 20)} opacity="0.7" strokeLinecap="round" />
                  </svg>

                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 flex gap-6 text-xs text-muted-foreground">
                    <span>F: {design.armorLayout.front}mm</span>
                    <span>S: {design.armorLayout.side}mm</span>
                    <span>R: {design.armorLayout.rear}mm</span>
                    <span>T: {design.armorLayout.top}mm</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="text-muted-foreground">Frontal Armor</div>
                    <div className="font-mono font-semibold">{design.armorLayout.front}mm</div>
                    <div className="text-xs text-muted-foreground">Effective: ~{Math.round(design.armorLayout.front * 1.1)}mm (angled)</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="text-muted-foreground">Side Armor</div>
                    <div className="font-mono font-semibold">{design.armorLayout.side}mm</div>
                    <div className="text-xs text-muted-foreground">Effective: ~{Math.round(design.armorLayout.side * 1.05)}mm</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default TankDesigner;