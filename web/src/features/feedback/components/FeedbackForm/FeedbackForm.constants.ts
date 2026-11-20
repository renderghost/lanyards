import discussion from '../../../../../lexicons/vendor/app/userinput/discussion.json';

const fields = discussion.defs.main.record.properties;

/** UserInput's limits on a discussion (#134): characters, and UTF-8 bytes. */
export const TITLE_MAX_GRAPHEMES = fields.title.maxGraphemes;
export const TITLE_MAX_BYTES = fields.title.maxLength;
export const DETAILS_MAX_GRAPHEMES = fields.body.maxGraphemes;
export const DETAILS_MAX_BYTES = fields.body.maxLength;

/** Up to this many types are radios; more are a list (Form Standards). */
export const RADIO_MAX = 5;

export const EMPTY_FEEDBACK = {
  type: '',
  title: '',
  details: '',
  techDetails: false,
  screenshots: [],
};
