import { Resvg } from '@resvg/resvg-wasm';
import type { ReactElement } from 'react';
import satori from 'satori';

import { loadBadgeAssets } from './fonts.ts';

export type BadgeImageInput = {
  displayName: string;
  handle: string;
  headline?: string;
  /** The avatar as a data: URI, so satori never fetches it itself. */
  avatarDataUri?: string;
};

const WIDTH = 1200;
const HEIGHT = 630;
const BRAND = '#4020DF';
const INK = '#1F1638';
const MUTED = '#5B4E80';

type Child = ReactElement | string | false | null | undefined;

/**
 * Builds the element objects satori renders. This file is plain .ts, not
 * .tsx, because Vercel's Node builder leaves .tsx modules out of the
 * function bundle (#110).
 */
function h(
  type: string,
  props: Record<string, unknown>,
  ...children: Child[]
): ReactElement {
  const kept = children.filter(
    (child) => child !== false && child !== null && child !== undefined
  );
  return {
    type,
    key: null,
    props: { ...props, children: kept.length === 1 ? kept[0] : kept },
  };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function personBadge(input: BadgeImageInput): ReactElement {
  const avatar = input.avatarDataUri
    ? h('img', {
        src: input.avatarDataUri,
        alt: '',
        width: 220,
        height: 220,
        style: { borderRadius: 110 },
      })
    : h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 220,
            height: 220,
            borderRadius: 110,
            background: '#E6E1FA',
            color: BRAND,
            fontSize: 88,
            fontWeight: 700,
          },
        },
        initials(input.displayName)
      );

  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: 56 } },
    avatar,
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 700,
        },
      },
      h(
        'div',
        {
          style: {
            display: 'block',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            color: INK,
            lineClamp: 2,
          },
        },
        input.displayName
      ),
      input.headline &&
        h(
          'div',
          {
            style: {
              display: 'block',
              fontSize: 32,
              lineHeight: 1.3,
              color: INK,
              lineClamp: 3,
            },
          },
          input.headline
        ),
      h(
        'div',
        { style: { display: 'flex', fontSize: 30, color: BRAND } },
        `@${input.handle}`
      )
    )
  );
}

function defaultBadge(): ReactElement {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: 24 } },
    h(
      'div',
      { style: { display: 'flex', fontSize: 96, fontWeight: 700, color: INK } },
      'Lanyards'
    ),
    h(
      'div',
      { style: { display: 'flex', fontSize: 40, color: MUTED } },
      'Your conference lanyard on the AT Protocol'
    )
  );
}

/**
 * A 1200×630 badge-style PNG for link previews; `null` draws the generic
 * Lanyards badge (no profile, opted out, or anything failed).
 */
export async function renderBadgePng(
  input: BadgeImageInput | null
): Promise<Uint8Array> {
  const fonts = await loadBadgeAssets();
  const svg = await satori(
    h(
      'div',
      {
        style: {
          display: 'flex',
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: 40,
          background: BRAND,
          fontFamily: 'DM Sans',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
            padding: 64,
            borderRadius: 32,
            background: '#FFFFFF',
          },
        },
        input ? personBadge(input) : defaultBadge(),
        h(
          'div',
          { style: { display: 'flex', fontSize: 28, color: MUTED } },
          'lanyards.app'
        )
      )
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'DM Sans', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'DM Sans', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    }
  );
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } })
    .render()
    .asPng();
}
