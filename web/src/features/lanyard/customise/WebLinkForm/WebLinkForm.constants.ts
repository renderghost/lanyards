import lexicon from '../../../../../lexicons/lanyards/app/lanyards/link/web.json';

/** The kept web link lexicon's title limit, in UTF-8 bytes. */
export const TITLE_MAX = lexicon.defs.main.record.properties.title.maxLength;

export const EMPTY_WEB_LINK = { url: '', title: '' };
