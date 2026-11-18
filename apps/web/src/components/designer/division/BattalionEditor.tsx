'use client';

import { Card, Button, Badge, Select } from '@generalstaff/ui-components';
import { Plus, Minus, Trash2, GripVertical } from 'lucide-react';
import type { BattalionTemplate, BattalionInstance } from '@generalstaff/shared-types';

interface BattalionEditorProps {
  battalions: BattalionInstance[];
  availableBattalions: BattalionTemplate[];
  onAddBattalion: (templateId: string) => void;
  onRemoveBattalion: (index: number) => void;
  onUpdateBattalionCount: (index: number, count: number) => void;
}

export function BattalionEditor({
  battalions,
  availableBattalions,
  onAddBattalion,
  onRemoveBattalion,
  onUpdateBattalionCount,
}: BattalionEditorProps) {
  const addOptions = availableBattalions
    .filter(b => !battalions.some(existing => existing.templateId === b.type))
    .map(battalion => ({
      value: battalion.type,
      label: `${battalion.type} - ${battalion.name}`,
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Add Battalion:</label>
        <Select
          placeholder="Select battalion type"
          options={addOptions}
          value=""
          onChange={(e) => {
            const value = e.target.value;
            if (value) onAddBattalion(value);
          }}
        />
      </div>

      {battalions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No battalions added yet. Select a battalion type above to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {battalions.map((battalion, index) => {
            const template = availableBattalions.find(t => t.type === battalion.templateId);
            return (
              <Card key={`${battalion.templateId}-${index}`} className="flex items-center gap-4 p-4">
                <GripVertical className="text-muted-foreground cursor-grab h-5 w-5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{template?.type || 'unknown'}</Badge>
                    <span className="font-medium text-sm">{template?.name || battalion.templateId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateBattalionCount(index, battalion.count - 1)}
                    disabled={battalion.count <= 1}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{battalion.count}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateBattalionCount(index, battalion.count + 1)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {battalion.count * (template?.width || 2)} width
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveBattalion(index)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Total Combat Width: {battalions.reduce((sum, b) => sum + b.count * (availableBattalions.find(t => t.type === b.templateId)?.width || 2), 0)}
      </div>
    </div>
  );
}