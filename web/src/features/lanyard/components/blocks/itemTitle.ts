import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { hostOf } from '@/lib/normalise';
import type { RenderableBlockType } from '@/lib/person/config';
import type { BlockItems } from '@/lib/person/personView.types';

import { OPEN_TO_LABELS } from './OpenToBlock/OpenToBlock.constants';

const POST_TITLE_LENGTH = 60;

type Titles = {
  [T in RenderableBlockType]: (item: BlockItems[T], i18n: I18n) => string;
};

const TITLES: Titles = {
  links: (item) => item.title,
  // One talk can be given at several events, so the event tells them apart.
  talks: (item, i18n) => {
    const { title, eventName } = item;
    return eventName ? i18n._(msg`${title} at ${eventName}`) : title;
  },
  openTo: (item, i18n) => i18n._(OPEN_TO_LABELS[item.value]),
  blogPosts: (item) => item.title,
  bskyPosts: (item) => {
    const text = item.text.replace(/\s+/g, ' ').trim();
    return text.length > POST_TITLE_LENGTH
      ? `${text.slice(0, POST_TITLE_LENGTH).trimEnd()}…`
      : text;
  },
  publications: (item) => item.title,
  skills: (item) => item.name,
  education: (item) => item.institution,
  code: (item) => item.name,
  collections: (item) => item.name,
  media: (item) => item.title ?? hostOf(item.url),
  details: (_item, i18n) => i18n._(msg`Location and languages`),
};

/**
 * A short name for an item, for its "More options for …" menu and the
 * customiser's hidden-items list.
 */
export function itemTitle<T extends RenderableBlockType>(
  type: T,
  item: BlockItems[T],
  i18n: I18n
): string {
  return TITLES[type](item, i18n);
}
