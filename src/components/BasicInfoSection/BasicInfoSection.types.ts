import { HonorificValue, Location } from '@/types';

export interface BasicInfoSectionProps {
  honorifics?: HonorificValue[];
  location?: Location;
  onSave: (data: BasicInfoData) => Promise<void>;
}

export interface BasicInfoData {
  honorifics: HonorificValue[];
  location?: Location;
}
