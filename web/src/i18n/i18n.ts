import { i18n } from '@lingui/core';

import { messages } from './locales/en-GB/messages.po';

export const LOCALE = 'en-GB';

i18n.load(LOCALE, messages);
i18n.activate(LOCALE);

export { i18n };
