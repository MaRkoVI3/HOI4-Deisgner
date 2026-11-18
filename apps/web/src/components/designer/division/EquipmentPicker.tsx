'use client';

import { Select } from '@generalstaff/ui-components';
import type { EquipmentVariant, EquipmentCategory } from '@generalstaff/shared-types';

interface EquipmentPickerProps {
  category: EquipmentCategory;
  value: string;
  onChange: (value: string) => void;
  availableEquipment: EquipmentVariant[];
  placeholder?: string;
  disabled?: boolean;
}

export function EquipmentPicker({
  category,
  value,
  onChange,
  availableEquipment,
  placeholder = 'Select equipment...',
  disabled = false,
}: EquipmentPickerProps) {
  const filteredEquipment = availableEquipment.filter(
    (eq) => eq.category === category
  );

  const options = filteredEquipment.map((equipment) => ({
    value: equipment.id,
    label: `${equipment.name} (${equipment.year})`,
  }));

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      options={options}
    />
  );
}