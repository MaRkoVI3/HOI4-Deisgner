import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => <svg data-testid="plus-icon" />,
  Minus: () => <svg data-testid="minus-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
  GripVertical: () => <svg data-testid="grip-icon" />,
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock calculation-engine
vi.mock('@generalstaff/calculation-engine', () => ({
  calculateDivisionStats: vi.fn(),
  calculateCombatWidth: vi.fn(),
  isDivisionValid: vi.fn(),
  getValidationErrors: vi.fn(),
  getValidationWarnings: vi.fn(),
  getValidationInfo: vi.fn(),
  validateDivision: vi.fn(),
  BATTALION_TEMPLATES: [],
  SUPPORT_COMPANY_TEMPLATES: [],
  DOCTRINES: [],
  EQUIPMENT_VARIANTS: {},
  NATIONAL_SPIRITS: {},
  STAT_DEFINITIONS: {},
}));

// Mock ui-components
vi.mock('@generalstaff/ui-components', () => ({
  Button: ({ children, 'aria-label': ariaLabel, 'data-testid': testId, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { 'data-testid'?: string }) => (
    <button {...props} aria-label={ariaLabel} data-testid={testId}>{children}</button>
  ),
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
  Select: ({ options, onChange, placeholder, ...props }: any) => (
    <select onChange={onChange} {...props}>
      <option value="" disabled>{placeholder}</option>
      {options?.map((opt: { value: string; label: string }) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
  Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
  cn: (...inputs: (string | Record<string, boolean> | undefined)[]) => {
    return inputs
      .filter(Boolean)
      .map((input) =>
        typeof input === 'string'
          ? input
          : input
          ? Object.entries(input)
              .filter(([, value]) => value)
              .map(([key]) => key)
              .join(' ')
          : ''
      )
      .join(' ');
  },
}));

// Mock shared-types data
vi.mock('@generalstaff/shared-types', () => ({
  BATTALION_TEMPLATES: [],
  SUPPORT_COMPANY_TEMPLATES: [],
  STAT_DEFINITIONS: {},
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

// Suppress console.error in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});