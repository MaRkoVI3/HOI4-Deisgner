import { useState, useMemo } from 'react';
import { DivisionTemplate, BattalionInstance, EquipmentCategory } from '@generalstaff/shared-types';
import { BATTALION_TEMPLATES } from '@/data/battalionTemplates';
import { Button } from '@generalstaff/ui-components';
import { cn } from '@generalstaff/ui-components';
import { BattalionCard } from './BattalionCard';

// Empty equipment assignments helper
export const emptyEquipmentAssignments: Record<EquipmentCategory, string | undefined> = {
  infantry_equipment: undefined,
  support_equipment: undefined,
  artillery_equipment: undefined,
  armor_equipment: undefined,
  motorized_equipment: undefined,
  mechanized_equipment: undefined,
  anti_air_equipment: undefined,
  anti_tank_equipment: undefined,
  rocket_artillery_equipment: undefined,
  small_arms: undefined,
  support: undefined,
  artillery: undefined,
  anti_tank: undefined,
  anti_air: undefined,
  rocket_artillery: undefined,
  light_tank: undefined,
  medium_tank: undefined,
  heavy_tank: undefined,
  motorized: undefined,
  mechanized: undefined,
  recon: undefined,
  engineer: undefined,
  military_police: undefined,
};

interface DivisionTemplateBuilderProps {
  template: DivisionTemplate;
  onBattalionsChange: (battalions: BattalionInstance[]) => void;
  onEquipmentClick: (battalionIndex: number) => void;
  combatWidthBudget: 20 | 40 | 80;
}

export function DivisionTemplateBuilder({
  template,
  onBattalionsChange,
  onEquipmentClick,
  combatWidthBudget,
}: DivisionTemplateBuilderProps) {
  const [showAddBattalion, setShowAddBattalion] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(BATTALION_TEMPLATES.map((t: { type: string }) => t.type));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return BATTALION_TEMPLATES;
    return BATTALION_TEMPLATES.filter((t: { type: string }) => t.type === selectedCategory);
  }, [selectedCategory]);

  const handleAddBattalion = (battalionType: string) => {
    const bt = BATTALION_TEMPLATES.find((t: { type: string }) => t.type === battalionType);
    if (!bt) return;

    const newBattalion: BattalionInstance = {
      id: crypto.randomUUID(),
      templateId: battalionType,
      count: 1,
      equipmentAssignments: { ...emptyEquipmentAssignments },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onBattalionsChange([...template.battalions, newBattalion]);
    setShowAddBattalion(false);
  };

  const handleRemoveBattalion = (index: number) => {
    const newBattalions = template.battalions.filter((_, i) => i !== index);
    onBattalionsChange(newBattalions);
  };

  const handleCountChange = (index: number, count: number) => {
    const newBattalions = [...template.battalions];
    newBattalions[index] = { ...newBattalions[index], count: Math.max(1, count) };
    onBattalionsChange(newBattalions);
  };

  const totalCombatWidth = template.battalions.reduce((sum, b) => {
    const bt = BATTALION_TEMPLATES.find((t: { type: string }) => t.type === b.templateId);
    return sum + (bt?.width ?? 0) * b.count;
  }, 0);

  const widthPercentage = Math.min(100, (totalCombatWidth / combatWidthBudget) * 100);
  const isOverBudget = totalCombatWidth > combatWidthBudget;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-16 z-30">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Division Template</h2>
            <p className="text-sm text-muted-foreground">
              {template.battalions.length} battalion(s) • {totalCombatWidth}/{combatWidthBudget} combat width
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddBattalion(true)}>
              + Add Battalion
            </Button>
          </div>
        </div>

        {/* Combat Width Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Combat Width Usage</span>
            <span className={cn('font-medium', isOverBudget && 'text-destructive')}>
              {totalCombatWidth} / {combatWidthBudget}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all', isOverBudget ? 'bg-destructive' : 'bg-primary')}
              style={{ width: `${widthPercentage}%` }}
            />
          </div>
          {isOverBudget && (
            <p className="text-xs text-destructive mt-1">Exceeds combat width budget!</p>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat: string) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Battalion List */}
      <div className="flex-1 overflow-y-auto p-4">
        {template.battalions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium mb-2">No battalions added</h3>
            <p className="mb-4">Click &quot;Add Battalion&quot; to start building your division</p>
            <Button variant="outline" onClick={() => setShowAddBattalion(true)}>
              + Add Battalion
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {template.battalions.map((battalion, index) => (
              <BattalionCard
                key={battalion.id || index}
                battalion={battalion}
                index={index}
                battalionTemplate={BATTALION_TEMPLATES.find((t: { type: string }) => t.type === battalion.templateId)}
                onCountChange={count => handleCountChange(index, count)}
                onRemove={() => handleRemoveBattalion(index)}
                onEquipmentClick={() => onEquipmentClick(index)}
                combatWidthBudget={combatWidthBudget}
              />
            ))}
          </div>
        )}

        {/* Add Battalion Modal */}
        {showAddBattalion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[80vh] rounded-lg border bg-background p-6 shadow-lg overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Battalion</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddBattalion(false)}>
                  ✕
                </Button>
              </div>
              <div className="space-y-4">
                {filteredTemplates.map((bt: { type: string; name: string; description: string; width: number; manpower: number; equipment: string[] }) => (
                  <Button
                    key={bt.type}
                    variant="outline"
                    className="w-full justify-start gap-4 p-4"
                    onClick={() => handleAddBattalion(bt.type)}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium">{bt.name}</div>
                      <div className="text-sm text-muted-foreground">{bt.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Width: {bt.width} • Manpower: {bt.manpower} • Equipment: {bt.equipment.join(', ')}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}