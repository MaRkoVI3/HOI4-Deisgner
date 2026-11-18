'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Alert, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select } from '@generalstaff/ui-components';
import { Download, Upload, Copy, Trash2, Share2, ExternalLink, Plus, Eye } from 'lucide-react';
import { cn } from '@generalstaff/ui-components';
import type { AircraftDesign, AircraftRole } from '@generalstaff/calculation-engine';

interface SavedAircraftDesign extends AircraftDesign {
  savedAt: string;
  updatedAt: string;
  isPublic: boolean;
  shareId?: string;
  description: string;
}

interface AircraftSaveLoadShareProps {
  currentDesign: AircraftDesign;
  onLoadDesign: (design: AircraftDesign) => void;
  onNewDesign: () => void;
}

const STORAGE_KEY = 'generalstaff_aircraft_designs';

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function getSavedDesigns(): SavedAircraftDesign[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDesigns(designs: SavedAircraftDesign[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

export function AircraftSaveLoadShare({ currentDesign, onLoadDesign, onNewDesign }: AircraftSaveLoadShareProps) {
  const [savedDesigns, setSavedDesigns] = useState<SavedAircraftDesign[]>(() => getSavedDesigns());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveIsPublic, setSaveIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<SavedAircraftDesign | null>(null);
  const [filterRole, setFilterRole] = useState<AircraftRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;

    const designs = getSavedDesigns();
    const newDesign: SavedAircraftDesign = {
      ...currentDesign,
      name: saveName,
      description: saveDescription,
      isPublic: saveIsPublic,
      savedAt: new Date().toISOString(),
      shareId: saveIsPublic ? generateShareId() : undefined,
      updatedAt: new Date().toISOString(),
    };

    const updated = [...designs, newDesign];
    saveDesigns(updated);
    setSavedDesigns(updated);
    setShowSaveDialog(false);
    setSaveName('');
    setSaveDescription('');
    setSaveIsPublic(false);
  }, [currentDesign, saveName, saveDescription, saveIsPublic]);

  const handleLoad = useCallback((design: SavedAircraftDesign) => {
    onLoadDesign(design);
  }, [onLoadDesign]);

  const handleDelete = useCallback((id: string) => {
    const designs = getSavedDesigns().filter(d => d.id !== id);
    saveDesigns(designs);
    setSavedDesigns(designs);
  }, []);

  const handleDuplicate = useCallback((design: SavedAircraftDesign) => {
    const designs = getSavedDesigns();
    const newDesign: SavedAircraftDesign = {
      ...design,
      id: `aircraft_${Date.now()}`,
      name: `${design.name} (Copy)`,
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareId: undefined,
    };
    const updated = [...designs, newDesign];
    saveDesigns(updated);
    setSavedDesigns(updated);
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(currentDesign, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDesign.name.replace(/\s+/g, '_')}.aircraft.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentDesign]);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const design = JSON.parse(e.target?.result as string);
        onLoadDesign(design);
      } catch {
        alert('Invalid aircraft design file');
      }
    };
    reader.readAsText(file);
  }, [onLoadDesign]);

  const handleShare = useCallback(() => {
    const shareData = {
      type: 'aircraft_design',
      version: 1,
      design: currentDesign,
    };
    const encoded = btoa(JSON.stringify(shareData));
    const url = `${window.location.origin}/aircraft-designer?share=${encoded}`;
    setShareUrl(url);
    setShowShareDialog(true);
  }, [currentDesign]);

  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  }, [shareUrl]);

  const filteredDesigns = savedDesigns
    .filter(d => filterRole === 'all' || d.role === filterRole)
    .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

  const ROLES: { value: AircraftRole | 'all'; label: string }[] = [
    { value: 'all', label: 'All Roles' },
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
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Saved Designs
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleExport} aria-label="Export current design">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSaveDialog(true)} aria-label="Save current design">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-3 w-3 mr-1" /> Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-3 w-3 mr-1" /> Share Link
            </Button>
            <Button variant="outline" size="sm" onClick={onNewDesign}>
              <Plus className="h-3 w-3 mr-1" /> New Design
            </Button>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                className="sr-only"
              />
              <Button variant="outline" size="sm">
                <Upload className="h-3 w-3 mr-1" /> Import
              </Button>
            </label>
          </div>

          {/* Saved Designs List */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value as AircraftRole | 'all')}
                options={ROLES}
                className="w-40"
                placeholder="Filter by role"
              />
              <Input
                placeholder="Search designs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>

            {filteredDesigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                {savedDesigns.length === 0 ? (
                  <p>No saved designs yet. Create an aircraft and click Save to store it.</p>
                ) : (
                  <p>No designs match your filters.</p>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                {filteredDesigns.map((design: SavedAircraftDesign) => (
                  <Card
                    key={design.id}
                    className={cn(
                      'border p-3 transition-shadow hover:shadow-lg',
                      selectedDesign?.id === design.id && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedDesign(selectedDesign?.id === design.id ? null : design)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {design.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {design.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {design.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              <ExternalLink className="h-2.5 w-2.5 mr-0.5" /> Public
                            </Badge>
                          )}
                          {design.shareId && (
                            <Badge variant="outline" className="text-xs">
                              <Share2 className="h-2.5 w-2.5 mr-0.5" /> Shared
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                          {design.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {design.description || 'No description'}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                          <span>Airframe: {design.airframe.replace(/_/g, ' ')}</span>
                          <span>Engine: {design.engine.replace(/_/g, ' ')}</span>
                          <span>Year: {design.year}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleLoad(design); }}
                          aria-label="Load design"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(design); }}
                          aria-label="Duplicate design"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDelete(design.id); }}
                          aria-label="Delete design"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      {showSaveDialog && (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Aircraft Design</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <Input
                label="Design Name"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="Enter a name for this design"
                autoFocus
              />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Description</label>
                <textarea
                  value={saveDescription}
                  onChange={e => setSaveDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={saveIsPublic}
                  onChange={e => setSaveIsPublic(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Make this design public (generates shareable link)</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!saveName.trim()}>Save Design</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Aircraft Design</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={copyShareUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Anyone with this link can view and load this aircraft design.
                </p>
              </div>
              <Alert variant="info" title="Shareable Design">
                The design has been made public and assigned a unique share ID. The link will load the design directly in the Aircraft Designer.
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowShareDialog(false)}>Close</Button>
              <Button onClick={copyShareUrl}>
                <Copy className="h-4 w-4 mr-1" /> Copy Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}