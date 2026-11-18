import { BattalionInstance, BattalionTemplate } from '@generalstaff/shared-types';
import { Button } from '@generalstaff/ui-components';
import { cn } from '@generalstaff/ui-components';

interface BattalionCardProps {
  battalion: BattalionInstance;
  index: number;
  battalionTemplate?: BattalionTemplate;
  onCountChange: (count: number) => void;
  onRemove: () => void;
  onEquipmentClick: () => void;
  combatWidthBudget: number;
}

export function BattalionCard({
  battalion,
  index: _index,
  battalionTemplate,
  onCountChange,
  onRemove,
  onEquipmentClick,
  combatWidthBudget,
}: BattalionCardProps) {
  const width = battalionTemplate?.width ?? 2;
  const totalWidth = width * battalion.count;
  const isOverBudget = totalWidth > combatWidthBudget;

  return (
    <div className={cn('border rounded-lg p-4 bg-card', isOverBudget && 'border-destructive/50')}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-2xl">{battalionTemplate?.icon || '📦'}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{battalionTemplate?.name || battalion.templateId}</h4>
              {battalion.customName && (
                <span className="text-sm text-muted-foreground">{battalion.customName}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {battalionTemplate?.description}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onEquipmentClick}>
            Equipment
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
            ✕
          </Button>
        </div>
      </div>

      {/* Count and Width */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Count:</label>
          <input
            type="number"
            value={battalion.count}
            onChange={e => onCountChange(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={10}
            className="w-16 px-2 py-1 text-sm border rounded bg-background"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Width per battalion: {width}</span>
          <span className={cn('font-medium', isOverBudget && 'text-destructive')}>
            Total: {totalWidth}
          </span>
        </div>
      </div>

      {/* Equipment Slots */}
      {battalionTemplate && battalionTemplate.equipment.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Equipment Slots:</div>
          <div className="flex flex-wrap gap-2">
            {battalionTemplate.equipment.map((slot, slotIndex) => {
              const assigned = battalion.equipmentAssignments?.[slot];
              return (
                <div
                  key={slotIndex}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded border transition-colors',
                    assigned ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  <span className="font-medium">{slot.replace('_', ' ')}:</span>
                  <span className="ml-2">
                    {assigned || 'Unassigned'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Base Stats Preview */}
      {battalionTemplate && (
        <div className="mt-3 pt-3 border-t grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Soft Attack:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.softAttack}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Hard Attack:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.hardAttack}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Defense:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.defense}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Breakthrough:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.breakthrough}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Armor:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.armor}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Org:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.org}</span>
          </div>
          <div>
            <span className="text-muted-foreground">HP:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.hp}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Speed:</span>
            <span className="ml-1 font-medium">{battalionTemplate.baseStats.speed}</span>
          </div>
        </div>
      )}
    </div>
  );
}