import type { NationalSpirit, SpiritModifiers } from '@generalstaff/shared-types';

const now = new Date().toISOString();

export const NATIONAL_SPIRITS: NationalSpirit[] = [
  // Germany
  {
    id: 'german_military_tradition',
    name: 'German Military Tradition',
    description: 'The Prussian military tradition gives German divisions an edge in combat.',
    countryTag: 'GER',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      divisionAttack: 0.1,
      divisionDefense: 0.1,
      orgGain: 0.1,
      recoveryRate: 0.1,
    },
  },
  {
    id: 'german_industrial_efficiency',
    name: 'German Industrial Efficiency',
    description: 'German factories produce equipment more efficiently.',
    countryTag: 'GER',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      factoryOutput: 0.15,
      equipmentCost: -0.1,
      equipmentReliability: 0.05,
    },
  },

  // Soviet Union
  {
    id: 'soviet_mass_mobilization',
    name: 'Mass Mobilization',
    description: 'The Soviet Union can mobilize vast numbers of troops.',
    countryTag: 'SOV',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      recruitablePopulationFactor: 0.2,
      manpowerGain: 0.2,
      divisionAttack: 0.05,
    },
  },
  {
    id: 'soviet_industrial_relocation',
    name: 'Industrial Relocation',
    description: 'Soviet industry was moved eastward, safe from bombing.',
    countryTag: 'SOV',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      constructionSpeed: 0.1,
      factoryOutput: 0.1,
    },
  },

  // USA
  {
    id: 'american_industrial_base',
    name: 'Arsenal of Democracy',
    description: 'American industry outproduces the rest of the world combined.',
    countryTag: 'USA',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      factoryOutput: 0.25,
      constructionSpeed: 0.15,
      equipmentCost: -0.15,
    },
  },
  {
    id: 'american_logistics',
    name: 'Superior Logistics',
    description: 'American supply lines are the envy of the world.',
    countryTag: 'USA',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      supplyConsumption: -0.2,
      fuelConsumption: -0.15,
      maxOrg: 0.1,
    },
  },

  // UK
  {
    id: 'british_naval_tradition',
    name: 'British Naval Tradition',
    description: 'The Royal Navy dominates the seas.',
    countryTag: 'ENG',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      navalAttack: 0.15,
      navalDefense: 0.1,
      navalSpeed: 0.1,
      shoreBombardment: 0.1,
    },
  },
  {
    id: 'british_commonwealth',
    name: 'Commonwealth Support',
    description: 'The British Empire provides manpower from across the globe.',
    countryTag: 'ENG',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      recruitablePopulationFactor: 0.15,
      manpowerGain: 0.1,
    },
  },

  // France
  {
    id: 'french_maginot_line',
    name: 'Maginot Line',
    description: 'France has invested heavily in border fortifications.',
    countryTag: 'FRA',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      entrenchment: 0.2,
      maxOrg: 0.1,
      divisionDefense: 0.1,
    },
  },

  // Japan
  {
    id: 'japanese_bushido',
    name: 'Bushido Spirit',
    description: 'Japanese soldiers fight with fanatical determination.',
    countryTag: 'JPN',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      divisionAttack: 0.1,
      divisionBreakthrough: 0.1,
      orgGain: 0.1,
      recoveryRate: 0.1,
    },
  },
  {
    id: 'japanese_naval_aviation',
    name: 'Naval Aviation Pioneers',
    description: 'Japan pioneered carrier-based naval aviation.',
    countryTag: 'JPN',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      airAttack: 0.1,
      navalAttack: 0.1,
      shoreBombardment: 0.1,
    },
  },

  // Italy
  {
    id: 'italian_military_doctrine',
    name: 'Guerra di Rapido Corso',
    description: 'Italian doctrine emphasizes rapid mobile warfare.',
    countryTag: 'ITA',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      speed: 0.1,
      initiative: 0.1,
      supplyConsumption: -0.05,
    },
  },

  // Poland
  {
    id: 'polish_resistance',
    name: 'Unyielding Resistance',
    description: 'Polish forces fight tenaciously even when outnumbered.',
    countryTag: 'POL',
    createdAt: now,
    updatedAt: now,
    modifiers: {
      divisionDefense: 0.15,
      entrenchment: 0.1,
      orgGain: 0.05,
    },
  },
];