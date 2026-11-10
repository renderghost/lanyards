import { LANYARDS_NSID } from '@/lib/lexicons/nsids';

import audio from '../../../../../lexicons/lanyards/app/lanyards/link/media/audio.json';
import video from '../../../../../lexicons/lanyards/app/lanyards/link/media/video.json';

export type MediaKind = 'audio' | 'video';

export const MEDIA_KINDS: MediaKind[] = ['audio', 'video'];

const fields = { audio, video } as const;

/** Each kind's collection and its lexicon's enums and limits, in order. */
export const MEDIA = Object.fromEntries(
  MEDIA_KINDS.map((kind) => {
    const properties = fields[kind].defs.main.record.properties;
    return [
      kind,
      {
        collection: LANYARDS_NSID[kind],
        platforms: properties.platform.enum as string[],
        types: properties.type.enum as string[],
      },
    ];
  })
) as Record<
  MediaKind,
  {
    collection: (typeof LANYARDS_NSID)[MediaKind];
    platforms: string[];
    types: string[];
  }
>;

/** Both kinds share these limits, in UTF-8 bytes. */
export const TITLE_MAX = audio.defs.main.record.properties.title.maxLength;
export const DESCRIPTION_MAX =
  audio.defs.main.record.properties.description.maxLength;

export const EMPTY_MEDIA = {
  url: '',
  platform: '',
  title: '',
  description: '',
  type: '',
};
