import { renderBadgePng } from '../server/badgeImage.tsx';
import { createOgHandler } from '../server/ogHandler.ts';

/** /og/p/:did.png and /og/default.png: 1200×630 badge images. */
export const GET = createOgHandler({ render: renderBadgePng });
