import { create } from 'zustand';
import type {
  DivisionTemplate,
  CountryTag,
  BattalionInstance,
  SupportCompanyInstance,
  Doctrine,
  NationalSpirit,
  DivisionStats,
} from '@generalstaff/shared-types';
import { calculateDivisionStats, type CalculationContext } from '@generalstaff/calculation-engine';
import { BATTALION_TEMPLATES } from '@/data/battalionTemplates';
import { SUPPORT_COMPANY_TEMPLATES } from '@/data/supportCompanyTemplates';

interface DivisionDesignerState {
  template: DivisionTemplate | null;
  selectedCountry: CountryTag | null;
  selectedDoctrine: Doctrine | null;
  selectedNationalSpirits: NationalSpirit[];
  availableCountries: CountryTag[];
  availableDoctrines: Doctrine[];
  availableNationalSpirits: NationalSpirit[];
  combatWidthBudget: number;
  validationErrors: string[];
  calculatedStats: DivisionStats | null;

  setTemplate: (template: DivisionTemplate | null) => void;
  setSelectedCountry: (country: CountryTag | null) => void;
  setSelectedDoctrine: (doctrine: Doctrine | null) => void;
  setSelectedNationalSpirits: (spirits: NationalSpirit[]) => void;
  setCombatWidthBudget: (budget: number) => void;
  addBattalion: (battalion: BattalionInstance) => void;
  removeBattalion: (battalionId: string) => void;
  updateBattalionCount: (battalionId: string, count: number) => void;
  addSupportCompany: (support: SupportCompanyInstance) => void;
  removeSupportCompany: (supportId: string) => void;
  recalculateStats: () => void;
  validateTemplate: () => string[];
  reset: () => void;
}

const DEFAULT_COUNTRIES: CountryTag[] = [
  { tag: 'GER', name: 'Germany', color: '#000000' },
  { tag: 'SOV', name: 'Soviet Union', color: '#CC0000' },
  { tag: 'USA', name: 'United States', color: '#002868' },
  { tag: 'ENG', name: 'United Kingdom', color: '#00247D' },
  { tag: 'FRA', name: 'France', color: '#0055A4' },
  { tag: 'JPN', name: 'Japan', color: '#BC002D' },
  { tag: 'ITA', name: 'Italy', color: '#009246' },
  { tag: 'POL', name: 'Poland', color: '#DC143C' },
];

const now = new Date().toISOString();
const DEFAULT_DOCTRINES: Doctrine[] = [
  {
    id: 'superior_firepower',
    name: 'Superior Firepower',
    description: 'Focus on artillery and firepower',
    countryTag: 'generic',
    group: 'superior_firepower',
    tier: 1,
    cost: 100,
    modifiers: {
      softAttack: 0.1,
      hardAttack: 0.1,
    },
    prerequisites: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'mobile_warfare',
    name: 'Mobile Warfare',
    description: 'Focus on speed and maneuver',
    countryTag: 'generic',
    group: 'mobile_warfare',
    tier: 1,
    cost: 100,
    modifiers: {
      speed: 0.1,
      maxSpeed: 0.1,
    },
    prerequisites: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'grand_battleplan',
    name: 'Grand Battleplan',
    description: 'Focus on planning and entrenchment',
    countryTag: 'generic',
    group: 'grand_battleplan',
    tier: 1,
    cost: 100,
    modifiers: {
      entrenchment: 0.1,
      defense: 0.05,
    },
    prerequisites: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'mass_assault',
    name: 'Mass Assault',
    description: 'Focus on infantry and defense',
    countryTag: 'generic',
    group: 'mass_assault',
    tier: 1,
    cost: 100,
    modifiers: {
      hp: 0.1,
      organization: 0.05,
      defense: 0.05,
    },
    prerequisites: [],
    createdAt: now,
    updatedAt: now,
  },
];

const DEFAULT_TEMPLATE: DivisionTemplate = {
  id: 'new_division',
  name: 'New Division',
  description: '',
  country: DEFAULT_COUNTRIES[0],
  battalions: [],
  supportCompanies: [],
  doctrineSelections: [],
  nationalSpirits: [],
  technologies: [],
  version: 1,
  isPublic: false,
  ownerId: 'local',
  statsSnapshot: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useDivisionDesignerStore = create<DivisionDesignerState>((set, get) => ({
  template: DEFAULT_TEMPLATE,
  selectedCountry: DEFAULT_COUNTRIES[0],
  selectedDoctrine: DEFAULT_DOCTRINES[0],
  selectedNationalSpirits: [],
  availableCountries: DEFAULT_COUNTRIES,
  availableDoctrines: DEFAULT_DOCTRINES,
  availableNationalSpirits: [],
  combatWidthBudget: 80,
  validationErrors: [],
  calculatedStats: null,

  setTemplate: (template) => set({ template }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedDoctrine: (doctrine) => set({ selectedDoctrine: doctrine }),
  setSelectedNationalSpirits: (spirits) => set({ selectedNationalSpirits: spirits }),
  setCombatWidthBudget: (budget) => set({ combatWidthBudget: budget }),

  addBattalion: (battalion) =>
    set((state) => ({
      template: state.template
        ? {
            ...state.template,
            battalions: [...state.template.battalions, battalion],
          }
        : null,
    })),

  removeBattalion: (battalionId) =>
    set((state) => ({
      template: state.template
        ? {
            ...state.template,
            battalions: state.template.battalions.filter((b) => b.id !== battalionId),
          }
        : null,
    })),

  updateBattalionCount: (battalionId, count) =>
    set((state) => ({
      template: state.template
        ? {
            ...state.template,
            battalions: state.template.battalions.map((b) =>
              b.id === battalionId ? { ...b, count: Math.max(1, count) } : b
            ),
          }
        : null,
    })),

  addSupportCompany: (support) =>
    set((state) => ({
      template: state.template
        ? {
            ...state.template,
            supportCompanies: [...state.template.supportCompanies, support],
          }
        : null,
    })),

  removeSupportCompany: (supportId) =>
    set((state) => ({
      template: state.template
        ? {
            ...state.template,
            supportCompanies: state.template.supportCompanies.filter((s) => s.id !== supportId),
          }
        : null,
    })),

  recalculateStats: () => {
    const { template, selectedDoctrine, selectedNationalSpirits } = get();
    if (!template) return;

    const context: CalculationContext = {
      battalionTemplates: Object.fromEntries(BATTALION_TEMPLATES.map(t => [t.id, t])),
      supportCompanyTemplates: Object.fromEntries(SUPPORT_COMPANY_TEMPLATES.map(t => [t.id, t])),
      equipmentVariants: {},
      doctrines: Object.fromEntries(DEFAULT_DOCTRINES.map(d => [d.id, d])),
      nationalSpirits: Object.fromEntries(get().availableNationalSpirits.map(s => [s.id, s])),
      technologies: {},
    };

    const updatedTemplate = {
      ...template,
      doctrineSelections: selectedDoctrine ? [selectedDoctrine.id] : [],
      nationalSpirits: selectedNationalSpirits.map(s => s.id),
    };

    const stats = calculateDivisionStats(updatedTemplate, context);
    set({ calculatedStats: stats });
  },

  validateTemplate: () => {
    const { template } = get();
    const errors: string[] = [];

    if (!template) {
      errors.push('No template selected');
      return errors;
    }

    if (template.battalions.length === 0) {
      errors.push('Division must have at least one battalion');
    }

    if (template.battalions.length > 25) {
      errors.push('Cannot have more than 25 battalions');
    }

    if (template.supportCompanies.length > 5) {
      errors.push('Cannot have more than 5 support companies');
    }

    set({ validationErrors: errors });
    return errors;
  },

  reset: () => set({
    template: DEFAULT_TEMPLATE,
    selectedCountry: DEFAULT_COUNTRIES[0],
    selectedDoctrine: DEFAULT_DOCTRINES[0],
    selectedNationalSpirits: [],
    combatWidthBudget: 80,
    validationErrors: [],
    calculatedStats: null,
  }),
}));