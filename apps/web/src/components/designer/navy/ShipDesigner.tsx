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
  Anchor,
} from 'lucide-react';
import type { ShipDesign, ShipType, ShipStats, ShipModule, ShipModuleType, ShipModuleSlot } from '@generalstaff/calculation-engine';
import { calculateShipStats, SHIP_TYPES, createShipVariant } from '@generalstaff/calculation-engine';
import { ShipModulePicker } from './ShipModulePicker';
import { ShipStatsPanel } from './ShipStatsPanel';
import { ShipArchetypeSelector, type ArchetypeTemplate } from './ShipArchetypeSelector';
import { ShipCompatibilityMatrix } from './ShipCompatibilityMatrix';
import { ShipSaveLoadShare } from './ShipSaveLoadShare';

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

const DEFAULT_DESIGN: ShipDesign = {
  id: 'new_ship',
  name: 'New Ship Design',
  countryTag: 'GENERIC',
  year: 1942,
  type: 'destroyer',
  hull: 'destroyer_hull',
  modules: [],
  stats: {} as ShipStats,
  cost: 0,
  buildTime: 0,
  reliability: 0,
};

export function ShipDesigner() {
  // Core design state
  const [design, setDesign] = useState<ShipDesign>(DEFAULT_DESIGN);
  const [activeTab, setActiveTab] = useState<'builder' | 'stats' | 'compatibility' | 'archetypes'>('builder');
  const [showArchetypeSelector, setShowArchetypeSelector] = useState(false);

  // Derived stats
  const stats = useMemo(() => calculateShipStats(design), [design]);

  // Validation
  const validationIssues = useMemo(() => {
    const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];

    if (!design.hull) {
      issues.push({ type: 'error', message: 'Hull type is required.' });
      return issues;
    }

    // Speed check for destroyers
    if (design.type === 'destroyer' && stats.speed < 30) {
      issues.push({ type: 'warning', message: 'Destroyers typically need 30+ knots speed.' });
    }

    // Range check for capital ships
    if (['battleship', 'super_battleship', 'battlecruiser'].includes(design.type) && stats.range < 8000) {
      issues.push({ type: 'warning', message: 'Capital ships typically need 8000+ km range.' });
    }

    // Carrier air wing check
    if (['carrier', 'light_carrier', 'escort_carrier'].includes(design.type) && stats.airWingSize < 30) {
      issues.push({ type: 'warning', message: 'Carriers typically need 30+ air wing size.' });
    }

    // Submarine visibility
    if (['submarine', 'nuclear_submarine'].includes(design.type) && stats.subVisibility > 15) {
      issues.push({ type: 'warning', message: 'Submarines should have low sub visibility.' });
    }

    // Armor check for capital ships
    if (['battleship', 'super_battleship'].includes(design.type) && stats.armor < 100) {
      issues.push({ type: 'info', message: 'Capital ships should have heavy armor.' });
    }

    return issues;
  }, [design, stats]);

  const hasErrors = validationIssues.some(i => i.type === 'error');
  const hasWarnings = validationIssues.some(i => i.type === 'warning');

  // Handlers
  const updateDesign = useCallback(<K extends keyof ShipDesign>(key: K, value: ShipDesign[K]) => {
    setDesign((prev: ShipDesign) => ({ ...prev, [key]: value }));
  }, []);

  const handleArchetypeSelect = useCallback((template: ArchetypeTemplate) => {
    setDesign((prev: ShipDesign) => ({
      ...prev,
      hull: template.hull,
      modules: template.modules,
      type: template.type,
      year: template.year,
      name: template.name,
    }));
    setShowArchetypeSelector(false);
    setActiveTab('builder');
  }, []);

  const handleNewDesign = useCallback(() => {
    setDesign({ ...DEFAULT_DESIGN, id: `ship_${Date.now()}`, name: 'New Ship Design' });
    setActiveTab('builder');
  }, []);

  const handleLoadDesign = useCallback((loadedDesign: ShipDesign) => {
    setDesign({ ...loadedDesign, id: `ship_${Date.now()}`, name: loadedDesign.name });
    setActiveTab('builder');
  }, []);

  const handleCreateVariant = useCallback((variantName: string, modifications: Partial<ShipDesign>) => {
    const variant = createShipVariant(design, variantName, modifications);
    setDesign(variant);
    setActiveTab('builder');
  }, [design]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(design, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.name.replace(/\s+/g, '_')}.ship.json`;
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
        alert('Invalid ship design file');
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
        if (shared.type === 'ship_design' && shared.design) {
          handleLoadDesign(shared.design);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        console.error('Failed to load shared design');
      }
    }
  }, [handleLoadDesign]);

  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Anchor className="h-6 w-6 text-primary" />
              Ship Designer
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Design custom ship variants with live stats calculation</p>
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
              min={1900}
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
                placeholder="Ship name"
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                label="Type"
                value={design.type}
                onChange={e => updateDesign('type', e.target.value as ShipType)}
                options={Object.entries(SHIP_TYPES).map(([key, val]) => ({ value: key as ShipType, label: val.description }))}
                className="w-64"
              />
              <Badge variant="secondary" className="text-xs">
                {design.year}
              </Badge>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm">
              <StatCard label="Cost" value={stats.cost.toFixed(0)} unit="IC" color="warning" size="sm" />
              <StatCard label="Displacement" value={(stats.weight / 1000).toFixed(1)} unit="kt" color="primary" size="sm" />
              <StatCard label="Speed" value={stats.speed.toFixed(1)} unit="kn" color="success" size="sm" />
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
                    {SHIP_TYPES[design.type]?.description || design.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShipModulePicker
                  type={design.type}
                  hull={design.hull}
                  modules={design.modules}
                  onHullChange={(v: string) => updateDesign('hull', v as any)}
                  onModulesChange={(v: ShipModule[]) => updateDesign('modules', v)}
                  onTypeChange={(v: string) => updateDesign('type', v as any)}
                />
              </CardContent>
            </Card>

            {/* Quick Variant Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Up-gunned', { modules: [...design.modules, { id: 'main_battery', type: 'main_battery' as ShipModuleType, slot: 'main_battery' as ShipModuleSlot, stats: { attack: 50, defense: 0, range: 10, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 500, weight: 1000 } }] })}>
                  <Zap className="h-3.5 w-3.5 mr-1" /> Up-gunned Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('AA Escort', { modules: [...design.modules, { id: 'aa_battery', type: 'anti_air_battery' as ShipModuleType, slot: 'anti_air' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 5, accuracy: 0, piercing: 0, aaAttack: 80, aswAttack: 0, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 300, weight: 500 } }] })}>
                  <Shield className="h-3.5 w-3.5 mr-1" /> AA Escort Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('ASW', { modules: [...design.modules, { id: 'sonar', type: 'sonar' as ShipModuleType, slot: 'sensors' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 60, subDetection: 100, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.9, cost: 200, weight: 200 } }, { id: 'depth_charges', type: 'depth_charges' as ShipModuleType, slot: 'special' as ShipModuleSlot, stats: { attack: 0, defense: 0, range: 0, accuracy: 0, piercing: 0, aaAttack: 0, aswAttack: 40, subDetection: 0, speed: 0, armor: 0, torpedoProtection: 0, airWingSize: 0, airAttack: 0, airDefense: 0, airAgility: 0, airRange: 0, airNavalAttack: 0, reliability: 0.95, cost: 150, weight: 100 } }] })}>
                  <Target className="h-3.5 w-3.5 mr-1" /> ASW Variant
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleCreateVariant('Modernized', { hull: 'destroyer_hull', year: 1980 })}>
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
                      <ShipArchetypeSelector
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
                <ShipSaveLoadShare
                  design={design}
                  onLoadDesign={handleLoadDesign}
                  onShareDesign={(d, shareId) => {
                    const shareData = { type: 'ship_design', version: 1, design: d, shareId };
                    const encoded = btoa(JSON.stringify(shareData));
                    const url = `${window.location.origin}/ship-designer?share=${encoded}`;
                    navigator.clipboard.writeText(url);
                    alert('Share link copied to clipboard!');
                  }}
                />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="pt-4">
                <ShipStatsPanel design={design} showValidation={true} />
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div className="pt-4">
                <ShipCompatibilityMatrix
                  selectedType={design.type}
                  selectedHull={design.hull}
                  modules={design.modules}
                />
              </div>
            )}

            {activeTab === 'archetypes' && (
              <div className="pt-4">
                <ShipArchetypeSelector
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
                <StatCard label="Naval Attack" value={stats.navalAttack.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Naval Defense" value={stats.navalDefense.toFixed(0)} color="primary" size="sm" />
                <StatCard label="Shore Bombard" value={stats.shoreBombardment.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Torpedo Attack" value={stats.torpedoAttack.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Anti-Air Attack" value={stats.antiAirAttack.toFixed(0)} color="success" size="sm" />
                <StatCard label="Anti-Sub Attack" value={stats.antiSubAttack.toFixed(0)} color="info" size="sm" />
                <StatCard label="Sub Detection" value={stats.subDetection.toFixed(0)} color="info" size="sm" />
                <StatCard label="Speed" value={stats.speed.toFixed(1)} unit="kn" color="success" size="sm" />
                <StatCard label="Range" value={stats.range.toFixed(0)} unit="km" color="primary" size="sm" />
                <StatCard label="Armor" value={stats.armor.toFixed(0)} color="default" size="sm" />
                <StatCard label="Deck Armor" value={stats.deckArmor.toFixed(0)} color="default" size="sm" />
                <StatCard label="Torpedo Protection" value={stats.torpedoProtection.toFixed(0)} color="info" size="sm" />
                <StatCard label="HP" value={stats.hp.toFixed(0)} color="default" size="sm" />
                <StatCard label="Air Wing" value={stats.airWingSize.toFixed(0)} color="primary" size="sm" />
                <StatCard label="Air Attack" value={stats.airAttack.toFixed(0)} color="danger" size="sm" />
                <StatCard label="Air Defense" value={stats.airDefense.toFixed(0)} color="primary" size="sm" />
                <StatCard label="Reliability" value={stats.reliability.toFixed(0)} unit="%" color="info" size="sm" />
                <StatCard label="Cost" value={stats.cost.toFixed(0)} unit="IC" color="warning" size="sm" />
                <StatCard label="Build Time" value={stats.buildTime.toFixed(0)} unit="days" color="default" size="sm" />
                <StatCard label="Crew" value={stats.crew.toString()} color="default" size="sm" />
                <StatCard label="Fuel Consumption" value={stats.fuelConsumption.toFixed(1)} unit="kt/day" color="default" size="sm" />
                <StatCard label="Surface Visibility" value={stats.surfaceVisibility.toFixed(0)} color="default" size="sm" />
                <StatCard label="Sub Visibility" value={stats.subVisibility.toFixed(0)} color="default" size="sm" />
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
                  const shareData = { type: 'ship_design', version: 1, design };
                  const encoded = btoa(JSON.stringify(shareData));
                  const url = `${window.location.origin}/ship-designer?share=${encoded}`;
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

            {/* Hull Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hull Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto" style={{ width: 300, height: 120 }}>
                  <svg width="300" height="120" viewBox="0 0 300 120">
                    {/* Hull silhouette based on type */}
                    {['battleship', 'super_battleship', 'battlecruiser'].includes(design.type) && (
                      <>
                        {/* Main hull */}
                        <path d="M30,60 Q50,40 150,40 Q250,40 270,60 Q250,80 150,80 Q50,80 30,60 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        {/* Superstructure */}
                        <rect x="120" y="25" width="60" height="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        {/* Turrets */}
                        <circle cx="80" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                        <circle cx="220" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                      </>
                    )}
                    {['carrier', 'light_carrier', 'escort_carrier', 'amphibious_assault'].includes(design.type) && (
                      <>
                        {/* Carrier hull */}
                        <path d="M30,60 Q50,45 150,45 Q250,45 270,60 Q250,75 150,75 Q50,75 30,60 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        {/* Flight deck */}
                        <rect x="40" y="35" width="220" height="50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="5,5" />
                        {/* Island */}
                        <rect x="200" y="15" width="40" height="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                      </>
                    )}
                    {['destroyer', 'light_cruiser', 'heavy_cruiser', 'frigate', 'corvette', 'minelayer', 'minesweeper'].includes(design.type) && (
                      <>
                        {/* Cruiser/Destroyer hull */}
                        <path d="M30,60 Q50,45 150,45 Q250,45 270,60 Q250,75 150,75 Q50,75 30,60 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        {/* Superstructure */}
                        <rect x="100" y="25" width="100" height="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        {/* Turrets */}
                        <circle cx="70" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                        <circle cx="230" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                      </>
                    )}
                    {['submarine', 'nuclear_submarine'].includes(design.type) && (
                      <>
                        {/* Submarine hull */}
                        <ellipse cx="150" cy="60" rx="120" ry="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        {/* Sail */}
                        <path d="M130,35 Q140,15 150,15 Q160,15 170,35" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        <rect x="135" y="15" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                      </>
                    )}
                  </svg>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Hull</div>
                      <div className="font-mono font-semibold">{design.hull.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-mono font-semibold">{design.type.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Displacement</div>
                      <div className="font-mono font-semibold">{(stats.weight / 1000).toFixed(1)} kt</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-muted-foreground">Speed</div>
                      <div className="font-mono font-semibold">{stats.speed.toFixed(1)} kn</div>
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

export default ShipDesigner;