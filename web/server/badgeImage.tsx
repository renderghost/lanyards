import { Resvg } from '@resvg/resvg-wasm';
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function PersonBadge({ input }: { input: BadgeImageInput }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
      {input.avatarDataUri ? (
        <img
          src={input.avatarDataUri}
          alt=""
          width={220}
          height={220}
          style={{ borderRadius: 110 }}
        />
      ) : (
        <div
          style={{
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
          }}
        >
          {initials(input.displayName)}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 700,
        }}
      >
        <div
          style={{
            display: 'block',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            color: INK,
            lineClamp: 2,
          }}
        >
          {input.displayName}
        </div>
        {input.headline && (
          <div
            style={{
              display: 'block',
              fontSize: 32,
              lineHeight: 1.3,
              color: INK,
              lineClamp: 3,
            }}
          >
            {input.headline}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 30, color: BRAND }}>
          @{input.handle}
        </div>
      </div>
    </div>
  );
}

function DefaultBadge() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: INK }}
      >
        Lanyards
      </div>
      <div style={{ display: 'flex', fontSize: 40, color: MUTED }}>
        Your conference lanyard on the AT Protocol
      </div>
    </div>
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
    <div
      style={{
        display: 'flex',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        padding: 40,
        background: BRAND,
        fontFamily: 'DM Sans',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: 64,
          borderRadius: 32,
          background: '#FFFFFF',
        }}
      >
        {input ? <PersonBadge input={input} /> : <DefaultBadge />}
        <div style={{ display: 'flex', fontSize: 28, color: MUTED }}>
          lanyards.app
        </div>
      </div>
    </div>,
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
