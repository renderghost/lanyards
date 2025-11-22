export interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}
