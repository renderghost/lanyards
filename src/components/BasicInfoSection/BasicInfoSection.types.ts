import { Honorific, Location } from '@/types';

export interface BasicInfoSectionProps {
  honorifics?: Honorific[];
  location?: Location;
  onSave: (data: BasicInfoData) => Promise<void>;
}

export interface BasicInfoData {
  honorifics: Honorific[];
  location?: Location;
}
