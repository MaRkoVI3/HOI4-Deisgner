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
  Plane,
} from 'lucide-react';
import type { AircraftDesign, AircraftRole, AircraftType, AircraftStats, AircraftModuleType, AircraftModuleSlot, AircraftEngineType } from '@generalstaff/calculation-engine';
import { calculateAircraftStats, AIRCRAFT_TYPES, createAircraftVariant } from '@generalstaff/calculation-engine';
import { AircraftModulePicker } from './AircraftModulePicker';
import { AircraftStatsPanel } from './AircraftStatsPanel';
import { AircraftArchetypeSelector, type ArchetypeTemplate } from './AircraftArchetypeSelector';
import { AircraftCompatibilityMatrix } from './AircraftCompatibilityMatrix';
import { AircraftSaveLoadShare } from './AircraftSaveLoadShare';

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

const DEFAULT_DESIGN: AircraftDesign = {
  id: 'new_aircraft',
  name: 'New Aircraft Design',
  countryTag: 'GENERIC',
  year: 1942,
  type: 'fighter',
  role: 'air_superiority',
  airframe: 'monoplane',
  engine: 'inline_engine' as AircraftEngineType,
  modules: [],
  stats: {} as AircraftStats,
  cost: 0,
  buildTime: 0,
  reliability: 0,
};

export function AircraftDesigner() {
  // Core design state
  const [design, setDesign] = useState<AircraftDesign>(DEFAULT_DESIGN);
  const [activeTab, setActiveTab] = useState<'builder' | 'stats' | 'compatibility' | 'archetypes'>('builder');
  const [showArchetypeSelector, setShowArchetypeSelector] = useState(false);

  // Derived stats
  const stats = useMemo(() => calculateAircraftStats(design), [design]);

  // Validation
  const validationIssues = useMemo(() => {
    const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];

    if (!design.airframe || !design.engine) {
      issues.push({ type: 'error', message: 'Airframe and engine are required.' });
      return issues;
    }

    // Thrust-to-weight check (using airAttack as proxy for engine power)
    const thrust = stats.airAttack + stats.airDefense;
    const weight = stats.weight || 1;
    const thrustToWeight = thrust / Math.max(weight, 1);

    if (thrustToWeight < 0.3) {
      issues.push({ type: 'warning', message: `Low thrust-to-weight ratio (${thrustToWeight.toFixed(2)}). Performance will be limited.` });
    } else if (thrustToWeight > 1.2) {
      issues.push({ type: 'info', message: `Excellent thrust-to-weight ratio (${thrustToWeight.toFixed(2)}).` });
    }

    // Range check for strategic bombers
    if (design.role === 'strategic_bombing' && stats.range < 3000) {
      issues.push({ type: 'warning', message: 'Strategic bombers typically need 3000+ km range.' });
    }

    // Carrier capability check
    if (design.type === 'fighter' && !stats.carrierCapable && design.year >= 1940) {
      issues.push({ type: 'info', message: 'Consider carrier-capable variant for naval operations.' });
    }

    // Stealth check for modern aircraft
    if (design.year >= 1980 && stats.stealthLevel === 'none') {
      issues.push({ type: 'info', message: 'Modern aircraft should consider stealth features.' });
    }

    return issues;
  }, [design, stats]);

  const hasErrors = validationIssues.some(i => i.type === 'error');
  const hasWarnings = validationIssues.some(i => i.type === 'warning');

  // Handlers
  const updateDesign = useCallback(<K extends keyof AircraftDesign>(key: K, value: AircraftDesign[K]) => {
    setDesign((prev: AircraftDesign) => ({ ...prev, [key]: value }));
  }, []);

  const handleArchetypeSelect = useCallback((template: ArchetypeTemplate) => {
    setDesign((prev: AircraftDesign) => ({
      ...prev,
      airframe: template.airframe,
      engine: template.engine as AircraftEngineType,
      modules: template.modules,
      type: template.type,
      role: template.role,
      year: template.year,
      name: template.name,
    }));
    setShowArchetypeSelector(false);
    setActiveTab('builder');
  }, []);

  const handleNewDesign = useCallback(() => {
    setDesign({ ...DEFAULT_DESIGN, id: `aircraft_${Date.now()}`, name: 'New Aircraft Design' });
    setActiveTab('builder');
  }, []);

  const handleLoadDesign = useCallback((loadedDesign: AircraftDesign) => {
    setDesign({ ...loadedDesign, id: `aircraft_${Date.now()}`, name: loadedDesign.name, engine: loadedDesign.engine as AircraftEngineType });
    setActiveTab('builder');
  }, []);

  const handleCreateVariant = useCallback((variantName: string, modifications: Partial<AircraftDesign>) => {
    const variant = createAircraftVariant(design, variantName, modifications);
    setDesign(variant);
    setActiveTab('builder');
  }, [design]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(design, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.name.replace(/\s+/g, '_')}.aircraft.json`;
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
        alert('Invalid aircraft design file');
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
        if (shared.type === 'aircraft_design' && shared.design) {
          handleLoadDesign(shared.design);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        console.error('Failed to load shared design');
      }
    }
  }, [handleLoadDesign]);

  const currentDesignForCompat = {
    type: design.type,
    airframe: design.airframe,
    engine: design.engine as AircraftEngineType,
    role: design.role,
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              Aircraft Designer
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Design custom aircraft variants with live stats calculation</p>
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
              min={1910}
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
                placeholder="Aircraft name"
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                label="Type"
                value={design.type}
                onChange={e => updateDesign('type', e.target.value as AircraftType)}
                options={Object.entries(AIRCRAFT_TYPES).map(([key, val]) => ({ value: key as AircraftType, label: val.description }))}
                className="w-56"
              />
              <Select
                label="Role"
                value={design.role}
                onChange={e => updateDesign('role', e.target.value as AircraftRole)}
                options={[
                  { value: 'air_superiority', label: 'Air Superiority' },
                  { value: 'interception', label: 'Interception' },
                  { value: 'ground_attack', label: 'Ground Attack' },
                  { value: 'naval_strike', label: 'Naval Strike' },
                  { value: 'strategic_bombing', label: 'Strategic Bombing' },
                  { value: 'tactical_bombing', label: 'Tactical Bombing' },
                  { value: 'reconnaissance', label: 'Reconnaissance' },
                  { value: 'transport', label: 'Transport' },
                  { value: 'anti_sub', label: 'Anti-Submarine' },
                  { value: 'aew', label: 'AEW&C' },
                  { value: 'tanker', label: 'Tanker' },
                  { value: 'trainer', label: 'Trainer' },
                ]}
                className="w-56"
              />
              <Badge variant="secondary" className="text-xs">
                {design.year}
              </Badge>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm">
              <StatCard label="Cost" value={stats.cost.toFixed(0)} unit="IC" color="warning" size="sm" />
              <StatCard label="Weight" value={(stats.weight / 1000).toFixed(1)} unit="t" color="primary" size="sm" />
              <StatCard label="Max Speed" value={stats.maxSpeed.toFixed(0)} unit="km/h" color="success" size="sm" />
              <StatCard label="Range" value={stats.range.toFixed(0)} unit="km" color="info" size="sm" />
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
                    {AIRCRAFT_TYPES[design.type]?.description || design.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AircraftModulePicker
                  type={design.type}
                  role={design.role}
                  airframe={design.airframe}
                  engine={design.engine}
                  modules={design.modules}
                  onAirframeChange={(v: string) => updateDesign('airframe', v as any)}
                  onEngineChange={(v: string) => updateDesign('engine', v as any)}
                  onTypeChange={(v: string) => updateDesign('type', v as any)}
                  onRoleChange={(v: string) => updateDesign('role', v as any)}
                />
              </CardContent>
            </Card>

            {/* Quick Variant Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Up-engined', { engine: 'turbofan' })}>
                  <Zap className="h-3.5 w-3.5 mr-1" /> Up-engine Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Stealth', { airframe: 'stealth_airframe', modules: [...design.modules, { id: 'stealth', type: 'stealth_coating' as AircraftModuleType, slot: 'protection' as AircraftModuleSlot, stats: { airAttack: 0, airDefense: 0, agility: 0, speed: 0, range: 0, groundAttack: 0, navalAttack: 0, armorPenetration: 0, fuelCapacity: 0, radarRange: 0, radarCrossSection: -50, irstRange: 0, ewRating: 0, targetingAccuracy: 0, nightCapability: 0, reconRange: 0, reconQuality: 0, subDetection: 0, aswAttack: 0, reliability: 0.95, cost: 500, weight: 100 } }] })}>
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Stealth Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Recon', { role: 'reconnaissance', modules: [...design.modules, { id: 'recon', type: 'recon_pod' as AircraftModuleType, slot: 'recon' as AircraftModuleSlot, stats: { airAttack: 0, airDefense: 0, agility: 0, speed: 0, range: 300, groundAttack: 0, navalAttack: 0, armorPenetration: 0, fuelCapacity: 0, radarRange: 300, radarCrossSection: 0, irstRange: 0, ewRating: 80, targetingAccuracy: 0, nightCapability: 0, reconRange: 300, reconQuality: 80, subDetection: 0, aswAttack: 0, reliability: 0.9, cost: 200, weight: 50 } }] })}>
                  <Target className="h-3.5 w-3.5 mr-1" /> Recon Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Modernized', { airframe: 'jet_airframe', engine: 'turbofan', year: 1980 })}>
                  <Shield className="h-3.5 w-3.5 mr-1" /> Modernize
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
                      <AircraftArchetypeSelector
                        selectedType={design.type}
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
                <AircraftSaveLoadShare
                  currentDesign={design}
                  onLoadDesign={handleLoadDesign}
                  onNewDesign={handleNewDesign}
                />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="pt-4">
                <AircraftStatsPanel design={design} showValidation={true} />
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div className="pt-4">
                <AircraftCompatibilityMatrix currentDesign={currentDesignForCompat} />
              </div>
            )}

            {activeTab === 'archetypes' && (
              <div className="pt-4">
                <AircraftArchetypeSelector
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
                <StatCard label="Air Attack" value={stats.airAttack.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Air Defense" value={stats.airDefense.toFixed(0)} color="primary" size="sm" />
                <StatCard label="Agility" value={stats.agility.toFixed(1)} color="success" size="sm" />
                <StatCard label="Max Speed" value={stats.maxSpeed.toFixed(0)} unit="km/h" color="success" size="sm" />
                <StatCard label="Climb Rate" value={stats.climbRate.toFixed(0)} unit="m/min" color="info" size="sm" />
                <StatCard label="Ceiling" value={stats.ceiling.toFixed(0)} unit="m" color="info" size="sm" />
                <StatCard label="Turn Rate" value={stats.turnRate.toFixed(0)} unit="°/s" color="warning" size="sm" />
                <StatCard label="Ground Attack" value={stats.groundAttack.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Naval Attack" value={stats.navalAttack.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Range" value={stats.range.toFixed(0)} unit="km" color="primary" size="sm" />
                <StatCard label="Combat Range" value={stats.combatRange.toFixed(0)} unit="km" color="primary" size="sm" />
                <StatCard label="Radar Range" value={stats.radarRange.toFixed(0)} unit="km" color="info" size="sm" />
                <StatCard label="RCS" value={stats.radarCrossSection.toFixed(1)} unit="m²" color={stats.stealthLevel !== 'none' ? 'success' : 'default'} size="sm" />
                <StatCard label="Stealth" value={stats.stealthLevel.replace('_', ' ')} color={stats.stealthLevel !== 'none' ? 'success' : 'default'} size="sm" />
                <StatCard label="Reliability" value={stats.reliability.toFixed(0)} unit="%" color="info" size="sm" />
                <StatCard label="Cost" value={stats.cost.toFixed(0)} unit="IC" color="warning" size="sm" />
                <StatCard label="Build Time" value={stats.buildTime.toFixed(0)} unit="days" color="default" size="sm" />
                <StatCard label="Crew" value={stats.crew.toString()} color="default" size="sm" />
                <StatCard label="Carrier Capable" value={stats.carrierCapable ? 'Yes' : 'No'} color={stats.carrierCapable ? 'success' : 'default'} size="sm" />
                <StatCard label="VTOL" value={stats.vtolCapable ? 'Yes' : 'No'} color={stats.vtolCapable ? 'success' : 'default'} size="sm" />
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
                  const shareData = { type: 'aircraft_design', version: 1, design };
                  const encoded = btoa(JSON.stringify(shareData));
                  const url = `${window.location.origin}/aircraft-designer?share=${encoded}`;
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

            {/* Airframe Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Airframe Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto" style={{ width: 300, height: 120 }}>
                  <svg width="300" height="120" viewBox="0 0 300 120">
                    {/* Fuselage */}
                    <ellipse cx="150" cy="60" rx="120" ry="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    {/* Wings */}
                    <polygon points="150,45 50,75 80,75 150,45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    <polygon points="150,75 50,45 80,45 150,75" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    {/* Tail */}
                    <polygon points="270,60 300,40 300,80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    {/* Engine pods (if jet) */}
                    {['jet_airframe', 'stealth_airframe', 'vtol_airframe'].includes(design.airframe) && (
                      <>
                        <ellipse cx="80" cy="60" rx="15" ry="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                        <ellipse cx="80" cy="60" rx="15" ry="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" style={{ transform: 'translateY(30px)' }} />
                      </>
                    )}
                  </svg>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Airframe</div>
                      <div className="font-mono font-semibold">{design.airframe.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Engine</div>
                      <div className="font-mono font-semibold">{design.engine.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-mono font-semibold">{design.type.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Role</div>
                      <div className="font-mono font-semibold">{design.role.replace(/_/g, ' ')}</div>
                    </div>
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

export default AircraftDesigner;