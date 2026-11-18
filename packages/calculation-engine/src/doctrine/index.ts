import type { Doctrine, DoctrineModifiers, DoctrineSelection, BaseEntity } from '@generalstaff/shared-types';

export interface DoctrineTree {
  id: string;
  name: string;
  countryTag: string;
  groups: DoctrineGroup[];
  connections: DoctrineConnection[];
}

export interface DoctrineGroup {
  id: string;
  name: string;
  description: string;
  doctrines: string[];
  x: number;
  y: number;
  mutuallyExclusive?: boolean;
}

export interface DoctrineConnection {
  from: string;
  to: string;
  type: 'prerequisite' | 'mutually_exclusive';
}

export const DOCTRINE_GROUPS = [
  'superior_firepower',
  'mobile_warfare',
  'grand_battleplan',
  'mass_assault',
  'integrated_support',
  'logistics',
  'naval_doctrine',
  'air_doctrine',
] as const;

export type DoctrineGroupType = typeof DOCTRINE_GROUPS[number];

export function calculateDoctrineModifiers(
  selections: DoctrineSelection[],
  allDoctrines: Record<string, Doctrine>
): DoctrineModifiers {
  const combined: DoctrineModifiers = {};

  for (const selection of selections) {
    const doctrine = allDoctrines[selection.doctrineId];
    if (!doctrine) continue;

    for (const [key, value] of Object.entries(doctrine.modifiers)) {
      if (typeof value === 'number') {
        combined[key] = (combined[key] || 0) + value;
      }
    }
  }

  return combined;
}

export function getAvailableDoctrines(
  selected: string[],
  allDoctrines: Record<string, Doctrine>,
  countryTag: string
): Doctrine[] {
  return Object.values(allDoctrines).filter(d => {
    if (d.countryTag && d.countryTag !== countryTag) return false;
    if (selected.includes(d.id)) return false;

    // Check prerequisites
    const prereqsMet = d.prerequisites.every(p => selected.includes(p));
    if (!prereqsMet) return false;

    // Check mutually exclusive
    const mutuallyExclusive = d.mutuallyExclusive || [];
    const hasConflict = mutuallyExclusive.some(m => selected.includes(m));
    if (hasConflict) return false;

    return true;
  });
}

export function getDoctrineGroup(
  doctrineId: string,
  allDoctrines: Record<string, Doctrine>
): DoctrineGroupType | null {
  const doctrine = allDoctrines[doctrineId];
  if (!doctrine) return null;
  return doctrine.group as DoctrineGroupType;
}

export function getDoctrineTree(
  countryTag: string,
  allDoctrines: Record<string, Doctrine>
): DoctrineTree {
  const countryDoctrines = Object.values(allDoctrines).filter(
    d => !d.countryTag || d.countryTag === countryTag
  );

  const groups: DoctrineGroup[] = DOCTRINE_GROUPS.map((group, i) => {
    const doctrinesInGroup = countryDoctrines.filter(d => d.group === group);
    return {
      id: group,
      name: group.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `${group} doctrine tree`,
      doctrines: doctrinesInGroup.map(d => d.id),
      x: (i % 4) * 300,
      y: Math.floor(i / 4) * 250,
      mutuallyExclusive: ['superior_firepower', 'mobile_warfare', 'grand_battleplan', 'mass_assault'].includes(group),
    };
  }).filter(g => g.doctrines.length > 0);

  const connections: DoctrineConnection[] = [];
  for (const doctrine of countryDoctrines) {
    for (const prereq of doctrine.prerequisites) {
      connections.push({ from: prereq, to: doctrine.id, type: 'prerequisite' });
    }
    for (const exclusive of doctrine.mutuallyExclusive || []) {
      connections.push({ from: doctrine.id, to: exclusive, type: 'mutually_exclusive' });
    }
  }

  return {
    id: `doctrine_tree_${countryTag}`,
    name: `${countryTag} Doctrine Tree`,
    countryTag,
    groups,
    connections,
  };
}

export function validateDoctrineSelection(
  selections: string[],
  allDoctrines: Record<string, Doctrine>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const selectedDoctrines = selections.map(id => allDoctrines[id]).filter(Boolean) as Doctrine[];

  // Check for mutually exclusive doctrines
  for (const doctrine of selectedDoctrines) {
    for (const exclusive of doctrine.mutuallyExclusive || []) {
      if (selections.includes(exclusive)) {
        errors.push(`Cannot select both ${doctrine.name} and ${allDoctrines[exclusive]?.name || exclusive}`);
      }
    }
  }

  // Check prerequisites
  for (const doctrine of selectedDoctrines) {
    for (const prereq of doctrine.prerequisites) {
      if (!selections.includes(prereq)) {
        errors.push(`${doctrine.name} requires ${allDoctrines[prereq]?.name || prereq}`);
      }
    }
  }

  // Check group limits (one per major group)
  const majorGroups = ['superior_firepower', 'mobile_warfare', 'grand_battleplan', 'mass_assault'];
  for (const group of majorGroups) {
    const count = selectedDoctrines.filter(d => d.group === group).length;
    if (count > 1) {
      errors.push(`Can only select one doctrine from ${group.replace(/_/g, ' ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function calculateDoctrineCost(
  doctrineId: string,
  allDoctrines: Record<string, Doctrine>,
  selected: string[]
): number {
  const doctrine = allDoctrines[doctrineId];
  if (!doctrine) return 0;

  let cost = doctrine.cost;

  // Discount if prerequisites already selected
  const prereqCount = doctrine.prerequisites.filter(p => selected.includes(p)).length;
  if (prereqCount > 0) {
    cost *= 0.8;
  }

  return Math.round(cost);
}

export function getDoctrinePath(
  targetId: string,
  allDoctrines: Record<string, Doctrine>
): string[] {
  const path: string[] = [];
  const visited = new Set<string>();

  function dfs(id: string): boolean {
    if (visited.has(id)) return false;
    visited.add(id);

    const doctrine = allDoctrines[id];
    if (!doctrine) return false;

    if (doctrine.prerequisites.length === 0) {
      path.push(id);
      return true;
    }

    for (const prereq of doctrine.prerequisites) {
      if (dfs(prereq)) {
        path.push(id);
        return true;
      }
    }

    return false;
  }

  dfs(targetId);
  return path;
}

export function calculateDoctrineBonuses(
  selections: string[],
  allDoctrines: Record<string, Doctrine>
): Record<string, number> {
  const combined: Record<string, number> = {};

  for (const id of selections) {
    const doctrine = allDoctrines[id];
    if (!doctrine) continue;

    for (const [key, value] of Object.entries(doctrine.modifiers)) {
      if (typeof value === 'number') {
        combined[key] = (combined[key] || 0) + value;
      }
    }
  }

  return combined;
}