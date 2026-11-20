import item from '../../../../../lexicons/lanyards/app/lanyards/media/item.json';

export {
  MEDIA_KINDS,
  MEDIA_PLATFORMS,
  MEDIA_TYPES,
  type MediaKind,
} from '@/lib/sources/lanyards/media';

/** The lexicon's limits, in UTF-8 bytes. */
export const TITLE_MAX = item.defs.main.record.properties.title.maxLength;
export const DESCRIPTION_MAX =
  item.defs.main.record.properties.description.maxLength;

export const EMPTY_MEDIA = {
  url: '',
  platform: '',
  title: '',
  description: '',
  type: '',
};
