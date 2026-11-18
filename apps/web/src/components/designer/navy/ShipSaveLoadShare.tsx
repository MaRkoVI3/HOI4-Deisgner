'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Textarea, Alert } from '@generalstaff/ui-components';
import type { ShipDesign, ShipType } from '@generalstaff/calculation-engine';
import { Download, Upload, Copy, Share2, Trash2, FileText, Save, FolderOpen, CheckCircle } from 'lucide-react';

interface SavedShipDesign extends ShipDesign {
  savedAt: string;
  isPublic: boolean;
  shareId?: string;
  description?: string;
}

const STORAGE_KEY = 'generalstaff-ship-designs';

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function exportDesign(design: SavedShipDesign): void {
  const dataStr = JSON.stringify(design, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${design.name.replace(/\s+/g, '-').toLowerCase()}-${design.savedAt.split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDesign(file: File): Promise<SavedShipDesign> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const design = JSON.parse(e.target?.result as string);
        resolve(design);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

interface ShipSaveLoadShareProps {
  design: ShipDesign;
  onLoadDesign: (design: ShipDesign) => void;
  onShareDesign: (design: ShipDesign, shareId: string) => void;
}

export function ShipSaveLoadShare({
  design,
  onLoadDesign,
  onShareDesign,
}: ShipSaveLoadShareProps) {
  const [savedDesigns, setSavedDesigns] = useState<SavedShipDesign[]>([]);
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'share'>('save');
  const [saveName, setSaveName] = useState(design.name);
  const [saveDescription, setSaveDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load saved designs from localStorage on mount
  const loadSavedDesigns = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedDesigns(parsed);
      }
    } catch {
      setSavedDesigns([]);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize on mount
  useEffect(() => {
    loadSavedDesigns();
  }, [loadSavedDesigns]);

  // Update saveName when design.name changes
  useEffect(() => {
    setSaveName(design.name);
  }, [design.name]);

  const handleSave = () => {
    if (!saveName.trim()) {
      showToast('Please enter a name for the design', 'error');
      return;
    }

    const savedDesign: SavedShipDesign = {
      ...design,
      name: saveName.trim(),
      description: saveDescription.trim() || undefined,
      savedAt: new Date().toISOString(),
      isPublic,
      shareId: generateShareId(),
    };

    const updated = [savedDesign, ...savedDesigns.filter(d => d.name !== saveName.trim())].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedDesigns(updated);
    setSaveDescription('');
    setIsPublic(false);
    showToast(`Design "${saveName}" saved successfully!`, 'success');
  };

  const handleLoad = (savedDesign: SavedShipDesign) => {
    const { savedAt: _savedAt, isPublic: _isPublic, shareId: _shareId, description: _description, ...designToLoad } = savedDesign;
    onLoadDesign(designToLoad);
    setActiveTab('save');
    showToast(`Loaded "${savedDesign.name}"`, 'success');
  };

  const handleDelete = (savedDesign: SavedShipDesign) => {
    const updated = savedDesigns.filter(d => d.shareId !== savedDesign.shareId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedDesigns(updated);
    showToast(`Deleted "${savedDesign.name}"`, 'success');
  };

  const handleExport = () => {
    const exportDesignData: SavedShipDesign = {
      ...design,
      name: saveName.trim() || design.name,
      description: saveDescription.trim() || undefined,
      savedAt: new Date().toISOString(),
      isPublic: false,
      shareId: generateShareId(),
    };
    exportDesign(exportDesignData);
    showToast('Design exported successfully!', 'success');
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file first');
      return;
    }

    try {
      const imported = await importDesign(importFile);
      const { savedAt: _savedAt, isPublic: _isPublic, shareId: _shareId, description: _description, ...designToLoad } = imported;
      onLoadDesign(designToLoad);
      setImportFile(null);
      setImportError(null);
      setImportSuccess(`Imported "${imported.name}" successfully!`);
      setActiveTab('save');
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import design');
    }
  };

  const handleShare = () => {
    const shareDesign: SavedShipDesign = {
      ...design,
      name: saveName.trim() || design.name,
      description: saveDescription.trim() || undefined,
      savedAt: new Date().toISOString(),
      isPublic: true,
      shareId: generateShareId(),
    };

    const updated = [shareDesign, ...savedDesigns].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedDesigns(updated);

    const url = `${window.location.origin}${window.location.pathname}?ship=${shareDesign.shareId}`;
    setShareUrl(url);
    onShareDesign(shareDesign, shareDesign.shareId!);
    showToast('Share link created!', 'success');
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const typeLabels: Record<ShipType, string> = {
    destroyer: 'Destroyer',
    light_cruiser: 'Light Cruiser',
    heavy_cruiser: 'Heavy Cruiser',
    battlecruiser: 'Battlecruiser',
    battleship: 'Battleship',
    super_battleship: 'Super Battleship',
    carrier: 'Fleet Carrier',
    light_carrier: 'Light Carrier',
    escort_carrier: 'Escort Carrier',
    submarine: 'Submarine',
    nuclear_submarine: 'Nuclear Submarine',
    frigate: 'Frigate',
    corvette: 'Corvette',
    amphibious_assault: 'Amphibious Assault',
    minelayer: 'Minelayer',
    minesweeper: 'Minesweeper',
  };

  // Custom Tabs implementation since ui-components Tabs is simpler
  const renderTabs = () => (
    <div className="space-y-4">
      <div className="flex border-b border-border" role="tablist">
        {(['save', 'load', 'share'] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {tab === 'save' && <Save className="w-4 h-4 mr-1 inline" />}
            {tab === 'load' && <FolderOpen className="w-4 h-4 mr-1 inline" />}
            {tab === 'share' && <Share2 className="w-4 h-4 mr-1 inline" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'save' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Design Name</label>
              <Input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="My Ship Design"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={saveDescription}
                onChange={e => setSaveDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              <label htmlFor="isPublic" className="text-sm">Public (shareable)</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
              <Button onClick={handleExport} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'load' && (
        <div className="space-y-4">
          {/* Import File */}
          <div className="p-4 border border-border/50 rounded-lg bg-muted/30">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import from File
            </h4>
            <div className="space-y-3">
              <Input
                type="file"
                accept=".json"
                onChange={e => {
                  const file = e.target.files?.[0];
                  setImportFile(file || null);
                  setImportError(null);
                }}
                className="w-full"
              />
              {importError && (
                <Alert variant="destructive" title={importError} className="p-3" />
              )}
              {importSuccess && (
                <Alert variant="success" title={importSuccess} className="p-3" />
              )}
              <Button onClick={handleImport} disabled={!importFile} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Import Design
              </Button>
            </div>
          </div>

          {/* Saved Designs */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Saved Designs ({savedDesigns.length})
            </h4>
            {savedDesigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-border/50 rounded-lg">
                <p className="mb-2">No saved designs yet</p>
                <p className="text-xs">Save a design or import from file</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {savedDesigns.map(savedDesign => (
                  <div
                    key={savedDesign.shareId}
                    className="p-3 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {savedDesign.name}
                          </h5>
                          <Badge variant={typeLabels[savedDesign.type] ? 'secondary' : 'outline'} className="text-xs">
                            {typeLabels[savedDesign.type] || savedDesign.type}
                          </Badge>
                          {savedDesign.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              <Share2 className="w-3 h-3 mr-1" /> Public
                            </Badge>
                          )}
                        </div>
                        {savedDesign.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {savedDesign.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Hull: {savedDesign.hull.replace(/_/g, ' ')}</span>
                          <span>Year: {savedDesign.year}</span>
                          <span>Saved: {formatDate(savedDesign.savedAt)}</span>
                          <span>Modules: {savedDesign.modules.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoad(savedDesign)}
                          className="h-8 px-3"
                        >
                          <FolderOpen className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(savedDesign)}
                          className="h-8 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Share Name</label>
              <Input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="My Ship Design"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={saveDescription}
                onChange={e => setSaveDescription(e.target.value)}
                placeholder="Optional description for shared design..."
                rows={3}
                className="mt-1"
              />
            </div>
            <Button onClick={handleShare} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Create Share Link
            </Button>

            {shareUrl && (
              <div className="space-y-3 p-4 bg-muted/30 border border-border/50 rounded-lg">
                <h5 className="text-sm font-medium">Share Link</h5>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 text-sm font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyShare}
                    className="h-9"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view and load this design.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Save / Load / Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        {toast && (
          <Alert
            variant={toast.type === 'success' ? 'success' : 'destructive'}
            title={toast.message}
            className="mb-4"
          />
        )}

        {renderTabs()}
      </CardContent>
    </Card>
  );
}