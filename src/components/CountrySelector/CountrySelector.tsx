import { COUNTRIES } from './CountrySelector.constants';
import { styles } from './CountrySelector.styles';
import type { CountrySelectorProps } from './CountrySelector.types';

export default function CountrySelector({
  value,
  onChange,
  placeholder = 'Select country...',
  required = false,
  disabled = false,
  id,
  name,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: CountrySelectorProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className={styles.select}
    >
      <option value="">{placeholder}</option>
      {COUNTRIES.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
}
