'use client';

import { Select } from '@generalstaff/ui-components';
import type { CountryTag } from '@generalstaff/shared-types';

interface CountrySelectorProps {
  value: string;
  onChange: (countryTag: string) => void;
  countries: CountryTag[];
  placeholder?: string;
}

export function CountrySelector({
  value,
  onChange,
  countries,
  placeholder = 'Select a country',
}: CountrySelectorProps) {
  const options = countries.map(country => ({
    value: country.tag,
    label: `${country.name} (${country.tag})`,
  }));

  return (
    <Select
      value={value}
      placeholder={placeholder}
      options={options}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}