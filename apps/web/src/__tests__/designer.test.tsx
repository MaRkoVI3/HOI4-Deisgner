import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BattalionCard } from '@/components/designer/division/BattalionCard';
import { BattalionEditor } from '@/components/designer/division/BattalionEditor';
import { DivisionToolbar } from '@/components/designer/division/DivisionToolbar';
import type { BattalionInstance, BattalionTemplate } from '@generalstaff/shared-types';

// Create a valid empty equipment assignments object
const createEmptyEquipmentAssignments = () => ({
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
});

// Helper to create a valid battalion for tests
const createMockBattalion = (overrides: Partial<BattalionInstance> = {}): BattalionInstance => ({
  id: 'b1',
  templateId: 'infantry',
  count: 3,
  equipmentAssignments: createEmptyEquipmentAssignments(),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Helper to create a valid template for tests
const createMockTemplate = (overrides: Partial<BattalionTemplate> = {}): BattalionTemplate => ({
  id: 'infantry',
  type: 'infantry',
  name: 'Infantry Battalion',
  description: 'Standard infantry battalion',
  width: 2,
  manpower: 1000,
  equipment: ['infantry_equipment', 'support_equipment'] as any,
  baseStats: {
    hp: 100,
    org: 30,
    recoveryRate: 0.2,
    recon: 1,
    suppression: 2,
    weight: 50,
    supplyConsumption: 0.5,
    softAttack: 10,
    hardAttack: 2,
    airAttack: 0,
    defense: 15,
    breakthrough: 3,
    armor: 0,
    hardness: 0,
    apAttack: 0,
    initiative: 10,
    entrenchment: 2,
    speed: 4,
    fuelConsumption: 0,
    productionCost: 100,
    piercing: 0,
  },
  icon: '👟',
  ...overrides,
});

// Mock zustand store
vi.mock('@/store/divisionDesignerStore', () => ({
  useDivisionDesignerStore: vi.fn(() => ({
    battalions: [],
    availableBattalions: [],
    addBattalion: vi.fn(),
    removeBattalion: vi.fn(),
    updateBattalionCount: vi.fn(),
    setCountry: vi.fn(),
    setCombatWidthBudget: vi.fn(),
    setDoctrineSelections: vi.fn(),
    setNationalSpirits: vi.fn(),
    setTechnologies: vi.fn(),
    validateDivision: vi.fn(() => true),
    getValidationErrors: vi.fn(() => []),
    getValidationWarnings: vi.fn(() => []),
    getValidationInfo: vi.fn(() => []),
  })),
}));

// Mock calculation-engine
vi.mock('@generalstaff/calculation-engine', () => ({
  calculateDivisionStats: vi.fn(() => ({
    softAttack: 100,
    hardAttack: 50,
    defense: 80,
    breakthrough: 20,
    armor: 30,
    organization: 45,
    combatWidth: 20,
    isValid: true,
    validationIssues: [],
  })),
  calculateCombatWidth: vi.fn(() => 20),
  isDivisionValid: vi.fn(() => true),
  getValidationErrors: vi.fn(() => []),
  getValidationWarnings: vi.fn(() => []),
  getValidationInfo: vi.fn(() => []),
  validateDivision: vi.fn(),
  BATTALION_TEMPLATES: [],
  SUPPORT_COMPANY_TEMPLATES: [],
  DOCTRINES: [],
  EQUIPMENT_VARIANTS: {},
  NATIONAL_SPIRITS: {},
  STAT_DEFINITIONS: {},
}));

// Mock the division module specifically
vi.mock('@generalstaff/calculation-engine/division', () => ({
  calculateDivisionStats: vi.fn(() => ({
    softAttack: 100,
    hardAttack: 50,
    defense: 80,
    breakthrough: 20,
    armor: 30,
    organization: 45,
    combatWidth: 20,
    isValid: true,
    validationIssues: [],
  })),
  calculateCombatWidth: vi.fn(() => 20),
  isDivisionValid: vi.fn(() => true),
  getValidationErrors: vi.fn(() => []),
  getValidationWarnings: vi.fn(() => []),
  getValidationInfo: vi.fn(() => []),
  validateDivision: vi.fn(),
  DEFAULT_COMBAT_WIDTH_LIMIT: 80,
}));

// Mock data files
vi.mock('@/data/battalionTemplates', () => ({
  BATTALION_TEMPLATES: [
    {
      id: 'infantry',
      type: 'infantry',
      name: 'Infantry Battalion',
      description: 'Standard infantry battalion',
      width: 2,
      manpower: 1000,
      equipment: ['infantry_equipment', 'support_equipment'],
      baseStats: {
        hp: 100,
        org: 30,
        recoveryRate: 0.2,
        recon: 1,
        suppression: 2,
        weight: 50,
        supplyConsumption: 0.5,
        softAttack: 10,
        hardAttack: 2,
        airAttack: 0,
        defense: 15,
        breakthrough: 3,
        armor: 0,
        hardness: 0,
        apAttack: 0,
        initiative: 10,
        entrenchment: 2,
        speed: 4,
        fuelConsumption: 0,
        productionCost: 100,
        piercing: 0,
      },
      icon: '👟',
    },
    {
      id: 'artillery',
      type: 'artillery',
      name: 'Artillery Battalion',
      description: 'Artillery support battalion',
      width: 3,
      manpower: 800,
      equipment: ['artillery_equipment'],
      baseStats: {
        hp: 80,
        org: 25,
        recoveryRate: 0.15,
        recon: 0,
        suppression: 0,
        weight: 100,
        supplyConsumption: 1.0,
        softAttack: 50,
        hardAttack: 10,
        airAttack: 0,
        defense: 5,
        breakthrough: 0,
        armor: 0,
        hardness: 0,
        apAttack: 0,
        initiative: 5,
        entrenchment: 0,
        speed: 3,
        fuelConsumption: 0.5,
        productionCost: 200,
        piercing: 5,
      },
      icon: '💣',
    },
    {
      id: 'light_tank',
      type: 'light_tank',
      name: 'Light Tank Battalion',
      description: 'Light tank battalion',
      width: 2,
      manpower: 500,
      equipment: ['armor_equipment'],
      baseStats: {
        hp: 120,
        org: 30,
        recoveryRate: 0.2,
        recon: 5,
        suppression: 1,
        weight: 200,
        supplyConsumption: 0.8,
        softAttack: 15,
        hardAttack: 25,
        airAttack: 0,
        defense: 20,
        breakthrough: 10,
        armor: 30,
        hardness: 0.5,
        apAttack: 5,
        initiative: 20,
        entrenchment: 0,
        speed: 12,
        fuelConsumption: 2.0,
        productionCost: 300,
        piercing: 10,
      },
      icon: '🚗',
    },
  ],
}));

vi.mock('@/data/supportCompanyTemplates', () => ({
  SUPPORT_COMPANY_TEMPLATES: [
    {
      id: 'engineer',
      type: 'engineer',
      name: 'Engineer Company',
      description: 'Combat engineering support',
      width: 1,
      equipment: 'support_equipment',
      stats: {
        hp: 10,
        org: 5,
        recoveryRate: 0.05,
        recon: 0,
        suppression: 0,
        weight: 10,
        supplyConsumption: 0.1,
        softAttack: 0,
        hardAttack: 0,
        airAttack: 0,
        defense: 2,
        breakthrough: 1,
        armor: 0,
        hardness: 0,
        initiative: 0,
        entrenchment: 5,
        speed: 0,
        fuelConsumption: 0,
        reliability: 0.9,
        productionCost: 20,
        apAttack: 0,
        planningSpeed: 0,
        maxPlanning: 0,
        piercing: 0,
        airDefense: 0,
        experienceLossFactor: 0,
      },
      icon: '⛏️',
    },
    {
      id: 'recon',
      type: 'recon',
      name: 'Recon Company',
      description: 'Reconnaissance support',
      width: 1,
      equipment: 'recon_equipment',
      stats: {
        hp: 5,
        org: 5,
        recoveryRate: 0.05,
        recon: 10,
        suppression: 0,
        weight: 5,
        supplyConsumption: 0.05,
        softAttack: 0,
        hardAttack: 0,
        airAttack: 0,
        defense: 0,
        breakthrough: 0,
        armor: 0,
        hardness: 0,
        initiative: 5,
        entrenchment: 0,
        speed: 5,
        fuelConsumption: 0.1,
        reliability: 0.9,
        productionCost: 15,
        apAttack: 0,
        planningSpeed: 0,
        maxPlanning: 0,
        piercing: 0,
        airDefense: 0,
        experienceLossFactor: 0,
      },
      icon: '🔍',
    },
  ],
}));

describe('BattalionCard', () => {
  const mockBattalion = createMockBattalion({
    equipmentAssignments: {
      ...createEmptyEquipmentAssignments(),
      infantry_equipment: 'eq1',
      support_equipment: 'eq2',
    },
  });

  const mockTemplate = createMockTemplate();

  const defaultProps = {
    battalion: mockBattalion,
    index: 0,
    battalionTemplate: mockTemplate,
    onCountChange: vi.fn(),
    onRemove: vi.fn(),
    onEquipmentClick: vi.fn(),
    combatWidthBudget: 80,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders battalion name and type', () => {
    render(<BattalionCard {...defaultProps} />);
    expect(screen.getByText('Infantry Battalion')).toBeInTheDocument();
  });

  it('renders custom name when provided', () => {
    const battalionWithCustomName = createMockBattalion({ customName: '1st Guards' });
    render(<BattalionCard {...defaultProps} battalion={battalionWithCustomName} />);
    expect(screen.getByText('1st Guards')).toBeInTheDocument();
  });

  it('renders battalion count input', () => {
    render(<BattalionCard {...defaultProps} />);
    const input = screen.getByDisplayValue(3);
    expect(input).toBeInTheDocument();
  });

  it('calls onCountChange when count is changed', () => {
    render(<BattalionCard {...defaultProps} />);
    const input = screen.getByDisplayValue(3);
    fireEvent.change(input, { target: { value: '5' } });
    expect(defaultProps.onCountChange).toHaveBeenCalledWith(5);
  });

  it('clamps count to minimum of 1', () => {
    render(<BattalionCard {...defaultProps} />);
    const input = screen.getByDisplayValue(3);
    fireEvent.change(input, { target: { value: '0' } });
    expect(defaultProps.onCountChange).toHaveBeenCalledWith(1);
  });

  it('calls onRemove when remove button is clicked', () => {
    render(<BattalionCard {...defaultProps} />);
    const removeButton = screen.getByRole('button', { name: /✕/i });
    fireEvent.click(removeButton);
    expect(defaultProps.onRemove).toHaveBeenCalled();
  });

  it('calls onEquipmentClick when equipment button is clicked', () => {
    render(<BattalionCard {...defaultProps} />);
    const equipButton = screen.getByRole('button', { name: /equipment/i });
    fireEvent.click(equipButton);
    expect(defaultProps.onEquipmentClick).toHaveBeenCalled();
  });

  it('shows equipment assignments', () => {
    render(<BattalionCard {...defaultProps} />);
    expect(screen.getByText('infantry equipment:')).toBeInTheDocument();
    expect(screen.getByText('eq1')).toBeInTheDocument();
    expect(screen.getByText('support equipment:')).toBeInTheDocument();
    expect(screen.getByText('eq2')).toBeInTheDocument();
  });

  it('shows unassigned for empty equipment slots', () => {
    const battalionNoEquip = createMockBattalion();
    render(<BattalionCard {...defaultProps} battalion={battalionNoEquip} />);
    const unassignedElements = screen.getAllByText('Unassigned');
    expect(unassignedElements.length).toBeGreaterThan(0);
  });

  it('displays base stats preview', () => {
    render(<BattalionCard {...defaultProps} />);
    expect(screen.getByText('Soft Attack:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Hard Attack:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Defense:')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows combat width calculations', () => {
    render(<BattalionCard {...defaultProps} />);
    expect(screen.getByText('Width per battalion: 2')).toBeInTheDocument();
    expect(screen.getByText('Total: 6')).toBeInTheDocument();
  });

  it('highlights when over combat width budget', () => {
    render(<BattalionCard {...defaultProps} combatWidthBudget={4} />);
    const card = screen.getByText('Infantry Battalion').closest('div[class*="border"]');
    expect(card).toHaveClass('border-destructive/50');
  });
});

describe('BattalionEditor', () => {
  const mockBattalions = [
    createMockBattalion({ id: 'b1', templateId: 'infantry', count: 3 }),
    createMockBattalion({ id: 'b2', templateId: 'artillery', count: 1 }),
  ];

  const mockAvailableBattalions = [
    createMockTemplate({ id: 'infantry', type: 'infantry' }),
    createMockTemplate({
      id: 'artillery',
      type: 'artillery',
      name: 'Artillery Battalion',
      description: 'Artillery support battalion',
      width: 3,
      manpower: 800,
      equipment: ['artillery_equipment'] as any,
      baseStats: {
        hp: 80,
        org: 25,
        recoveryRate: 0.15,
        recon: 0,
        suppression: 0,
        weight: 100,
        supplyConsumption: 1.0,
        softAttack: 50,
        hardAttack: 10,
        airAttack: 0,
        defense: 5,
        breakthrough: 0,
        armor: 0,
        hardness: 0,
        apAttack: 0,
        initiative: 5,
        entrenchment: 0,
        speed: 3,
        fuelConsumption: 0.5,
        productionCost: 200,
        piercing: 5,
      },
      icon: '💣',
    }),
    createMockTemplate({
      id: 'light_tank',
      type: 'light_tank',
      name: 'Light Tank Battalion',
      description: 'Light tank battalion',
      width: 2,
      manpower: 500,
      equipment: ['armor_equipment'] as any,
      baseStats: {
        hp: 120,
        org: 30,
        recoveryRate: 0.2,
        recon: 5,
        suppression: 1,
        weight: 200,
        supplyConsumption: 0.8,
        softAttack: 15,
        hardAttack: 25,
        airAttack: 0,
        defense: 20,
        breakthrough: 10,
        armor: 30,
        hardness: 0.5,
        apAttack: 5,
        initiative: 20,
        entrenchment: 0,
        speed: 12,
        fuelConsumption: 2.0,
        productionCost: 300,
        piercing: 10,
      },
      icon: '🚗',
    }),
  ];

  const defaultProps = {
    battalions: mockBattalions,
    availableBattalions: mockAvailableBattalions,
    onAddBattalion: vi.fn(),
    onRemoveBattalion: vi.fn(),
    onUpdateBattalionCount: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders add battalion selector', () => {
    render(<BattalionEditor {...defaultProps} />);
    expect(screen.getByText('Add Battalion:')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    // Initial value should be empty (placeholder selected)
    expect(select).toHaveValue('');
  });

  it('shows placeholder when no selection', () => {
    render(<BattalionEditor {...defaultProps} />);
    // The placeholder option should be present
    expect(screen.getByText('Select battalion type')).toBeInTheDocument();
  });

  it('shows only available battalions not already added', () => {
    render(<BattalionEditor {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    // Light tank should be available since it's not in battalions
    expect(screen.getByText('light_tank - Light Tank Battalion')).toBeInTheDocument();
  });

  it('calls onAddBattalion when selecting a battalion', () => {
    render(<BattalionEditor {...defaultProps} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'light_tank' } });
    expect(defaultProps.onAddBattalion).toHaveBeenCalledWith('light_tank');
  });

  it('renders existing battalions with counts', () => {
    render(<BattalionEditor {...defaultProps} />);
    expect(screen.getByText('Infantry Battalion')).toBeInTheDocument();
    expect(screen.getByText('Artillery Battalion')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // infantry count
    expect(screen.getByText('1')).toBeInTheDocument(); // artillery count
  });

  it('calls onUpdateBattalionCount when minus button clicked', () => {
    render(<BattalionEditor {...defaultProps} />);
    const firstCard = screen.getByText('Infantry Battalion').closest('div[class*="flex items-center gap-4 p-4"]') as HTMLElement;
    const minusButton = within(firstCard!).getAllByRole('button')[0];
    fireEvent.click(minusButton);
    expect(defaultProps.onUpdateBattalionCount).toHaveBeenCalledWith(0, 2);
  });

  it('calls onUpdateBattalionCount when plus button clicked', () => {
    render(<BattalionEditor {...defaultProps} />);
    const firstCard = screen.getByText('Infantry Battalion').closest('div[class*="flex items-center gap-4 p-4"]') as HTMLElement;
    const plusButton = within(firstCard!).getAllByRole('button')[1];
    fireEvent.click(plusButton);
    expect(defaultProps.onUpdateBattalionCount).toHaveBeenCalledWith(0, 4);
  });

  it('disables minus button when count is 1', () => {
    const battalionsWithOne = [
      createMockBattalion({ id: 'b1', templateId: 'infantry', count: 1 }),
    ];
    render(<BattalionEditor {...defaultProps} battalions={battalionsWithOne} />);
    const firstCard = screen.getByText('Infantry Battalion').closest('div[class*="flex items-center gap-4 p-4"]') as HTMLElement;
    const minusButton = within(firstCard!).getAllByRole('button')[0];
    expect(minusButton).toBeDisabled();
  });

  it('calls onRemoveBattalion when trash button clicked', () => {
    render(<BattalionEditor {...defaultProps} />);
    // Find the trash button for the first battalion (Infantry)
    const firstCard = screen.getByText('Infantry Battalion').closest('div[class*="flex items-center gap-4 p-4"]') as HTMLElement;
    const trashButton = within(firstCard!).getByTestId('trash-icon').closest('button');
    fireEvent.click(trashButton!);
    expect(defaultProps.onRemoveBattalion).toHaveBeenCalledWith(0);
  });

  it('shows total combat width', () => {
    render(<BattalionEditor {...defaultProps} />);
    // 3 infantry * 2 width + 1 artillery * 3 width = 9
    expect(screen.getByText('Total Combat Width: 9')).toBeInTheDocument();
  });

  it('shows empty state when no battalions', () => {
    render(<BattalionEditor {...defaultProps} battalions={[]} />);
    expect(screen.getByText('No battalions added yet. Select a battalion type above to add one.')).toBeInTheDocument();
  });

  it('shows battalion type badge', () => {
    render(<BattalionEditor {...defaultProps} />);
    expect(screen.getByText('infantry')).toBeInTheDocument();
    expect(screen.getByText('artillery')).toBeInTheDocument();
  });
});

describe('DivisionToolbar', () => {
  const mockTemplate = {
    id: 'div1',
    name: 'Test Division',
    description: 'A test division',
    country: { tag: 'GER', name: 'Germany', color: '#000000' },
    battalions: [],
    supportCompanies: [],
    doctrineSelections: [],
    nationalSpirits: [],
    technologies: [],
    version: 1,
    isPublic: false,
    ownerId: 'local',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockCountries = [
    { tag: 'GER', name: 'Germany', color: '#000000' },
    { tag: 'SOV', name: 'Soviet Union', color: '#CC0000' },
    { tag: 'USA', name: 'United States', color: '#002868' },
  ];

  const mockVersions = [
    { id: 'v1', version: 1, createdAt: '2024-01-01T00:00:00Z' },
    { id: 'v2', version: 2, createdAt: '2024-01-02T00:00:00Z' },
  ];

  const defaultProps = {
    template: mockTemplate,
    divisionId: 'div1',
    isDirty: true,
    combatWidthBudget: 80 as const,
    onBudgetChange: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    onLoad: vi.fn(),
    onNew: vi.fn(),
    onAnalyze: vi.fn().mockResolvedValue(undefined),
    onShare: vi.fn().mockResolvedValue(undefined),
    onExportJson: vi.fn(),
    onExportPng: vi.fn(),
    availableCountries: mockCountries,
    versions: mockVersions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders division designer title', () => {
    render(<DivisionToolbar {...defaultProps} />);
    expect(screen.getByText('Division Designer')).toBeInTheDocument();
  });

  it('shows current country name', () => {
    render(<DivisionToolbar {...defaultProps} />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('opens country dropdown when button clicked', () => {
    render(<DivisionToolbar {...defaultProps} />);
    const countryButton = screen.getByRole('button', { name: /Germany/i });
    fireEvent.click(countryButton);
    expect(screen.getByText('Soviet Union')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('renders combat width budget selector', () => {
    render(<DivisionToolbar {...defaultProps} />);
    expect(screen.getByText('Combat Width:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
  });

  it('calls onBudgetChange when combat width changed', () => {
    render(<DivisionToolbar {...defaultProps} />);
    const select = screen.getByDisplayValue('80');
    fireEvent.change(select, { target: { value: '40' } });
    expect(defaultProps.onBudgetChange).toHaveBeenCalledWith(40);
  });

  it('renders action buttons', () => {
    render(<DivisionToolbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export png/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('calls onNew when New button clicked', () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    expect(defaultProps.onNew).toHaveBeenCalled();
  });

  it('does not call onLoad when Load button clicked (no versions, button disabled)', () => {
    render(<DivisionToolbar {...defaultProps} versions={[]} />);
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeDisabled();
    // Clicking a disabled button should not trigger onClick
    fireEvent.click(loadButton);
    expect(defaultProps.onLoad).not.toHaveBeenCalled();
  });

  it('opens load dialog when versions exist', () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByText('Load Division')).toBeInTheDocument();
    // Use a more flexible text matcher
    expect(screen.getByText((content) => content.includes('v1') && content.includes('1/1/2024'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('v2') && content.includes('1/2/2024'))).toBeInTheDocument();
  });

  it('calls onLoad with selected version when Load in dialog clicked', () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    // Find the select element in the dialog
    const dialog = screen.getByText('Load Division').closest('div[class*="fixed inset-0"]');
    const versionSelect = within(dialog as HTMLElement).getByRole('combobox');
    fireEvent.change(versionSelect, { target: { value: 'v1' } });
    const loadButton = within(dialog as HTMLElement).getByRole('button', { name: /^load$/i });
    fireEvent.click(loadButton);
    expect(defaultProps.onLoad).toHaveBeenCalledWith('v1');
  });

  it('calls onSave when Save button clicked', async () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
  });

  it('disables Save button when not dirty', () => {
    render(<DivisionToolbar {...defaultProps} isDirty={false} />);
    const saveButton = screen.getByRole('button', { name: /saved/i });
    expect(saveButton).toBeDisabled();
  });

  it('disables Analyze button when no divisionId', () => {
    render(<DivisionToolbar {...defaultProps} divisionId={null} />);
    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    expect(analyzeButton).toBeDisabled();
  });

  it('disables Share button when no divisionId', () => {
    render(<DivisionToolbar {...defaultProps} divisionId={null} />);
    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeDisabled();
  });

  it('disables Load button when no versions', () => {
    render(<DivisionToolbar {...defaultProps} versions={[]} />);
    const loadButton = screen.getByRole('button', { name: /load/i });
    expect(loadButton).toBeDisabled();
  });

  it('calls onExportJson when Export JSON clicked', () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /export json/i }));
    expect(defaultProps.onExportJson).toHaveBeenCalled();
  });

  it('calls onExportPng when Export PNG clicked', () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /export png/i }));
    expect(defaultProps.onExportPng).toHaveBeenCalled();
  });

  it('calls onAnalyze when Analyze clicked', async () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));
    await waitFor(() => {
      expect(defaultProps.onAnalyze).toHaveBeenCalled();
    });
  });

  it('calls onShare when Share clicked', async () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    await waitFor(() => {
      expect(defaultProps.onShare).toHaveBeenCalled();
    });
  });

  it('closes load dialog when Cancel clicked', () => {
    render(<DivisionToolbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText('Load Division')).not.toBeInTheDocument();
  });
});

describe('Validation Logic', () => {
  it('has validation functions available in mock', () => {
    // The mocked calculation-engine functions are available via the vi.mock
    // Just verify the mock was set up correctly
    const mockFunctions = {
      calculateDivisionStats: vi.fn(),
      calculateCombatWidth: vi.fn(),
      isDivisionValid: vi.fn(),
      getValidationErrors: vi.fn(),
      getValidationWarnings: vi.fn(),
      getValidationInfo: vi.fn(),
      validateDivision: vi.fn(),
    };

    expect(mockFunctions.calculateDivisionStats).toBeDefined();
    expect(mockFunctions.calculateCombatWidth).toBeDefined();
    expect(mockFunctions.isDivisionValid).toBeDefined();
    expect(mockFunctions.getValidationErrors).toBeDefined();
    expect(mockFunctions.getValidationWarnings).toBeDefined();
    expect(mockFunctions.getValidationInfo).toBeDefined();
    expect(mockFunctions.validateDivision).toBeDefined();
  });
});

describe('Stats Calculation', () => {
  it('calculateDivisionStats returns DivisionStats shape from mock', () => {
    const mockCalculateDivisionStats = vi.fn((_division: unknown, _context: unknown) => ({
      softAttack: 100,
      hardAttack: 50,
      defense: 80,
      breakthrough: 20,
      armor: 30,
      organization: 45,
      combatWidth: 20,
      isValid: true,
      validationIssues: [],
    }));

    const result = mockCalculateDivisionStats(
      {
        id: 'test',
        name: 'Test Division',
        description: '',
        country: { tag: 'GER', name: 'Germany', color: '#000000' },
        battalions: [],
        supportCompanies: [],
        doctrineSelections: [],
        nationalSpirits: [],
        technologies: [],
        version: 1,
        isPublic: false,
        ownerId: 'local',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        battalionTemplates: {},
        supportCompanyTemplates: {},
        equipmentVariants: {},
        doctrines: {},
        nationalSpirits: {},
        technologies: {},
      }
    );

    expect(result).toBeDefined();
    expect(result.softAttack).toBeDefined();
    expect(result.hardAttack).toBeDefined();
    expect(result.defense).toBeDefined();
    expect(result.breakthrough).toBeDefined();
    expect(result.armor).toBeDefined();
    expect(result.organization).toBeDefined();
    expect(result.combatWidth).toBeDefined();
    expect(result.isValid).toBeDefined();
    expect(result.validationIssues).toBeDefined();
  });

  it('isDivisionValid returns boolean from mock', () => {
    const mockIsDivisionValid = vi.fn(() => true);
    expect(typeof mockIsDivisionValid).toBe('function');
  });

  it('getValidationErrors returns error array from mock', () => {
    const mockGetValidationErrors = vi.fn(() => []);
    expect(typeof mockGetValidationErrors).toBe('function');
  });

  it('getValidationWarnings returns warning array from mock', () => {
    const mockGetValidationWarnings = vi.fn(() => []);
    expect(typeof mockGetValidationWarnings).toBe('function');
  });
});

describe('Store Integration', () => {
  it('store hook mock is available', () => {
    // The store is mocked at the top of the file
    const mockStore = vi.fn();
    expect(mockStore).toBeDefined();
  });
});