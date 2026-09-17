import { ImageResponse } from 'next/og';
import { MODE_LIST } from '@/lib/delphy/modes';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt =
  'Delphy, a voice-native sparring partner that answers only in questions';

// Paper, ink, hairline, ember. Literal values rather than the CSS tokens,
// because this renders in Satori with no stylesheet and no custom properties.
const PAPER = '#fdfcfa';
const INK = '#1f1c1a';
const MUTED = '#716c66';
const HAIRLINE = '#e5e0da';
const EMBER = '#c74a10';
const INDIGO = '#1a5199';

const MODE_ACCENT: Record<string, string> = {
  critical: INDIGO,
  ragebait: EMBER,
};

/**
 * The social card. Generated rather than committed as a PNG so it cannot drift
 * away from the mode names it advertises, which is exactly what a hand-exported
 * image does the first time a mode is renamed.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: PAPER,
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 6,
              color: MUTED,
              fontWeight: 500,
            }}
          >
            DELPHY
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 40,
              fontSize: 78,
              lineHeight: 1.08,
              color: INK,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            It answers only in questions.
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.45,
              color: MUTED,
              maxWidth: 820,
            }}
          >
            Bring a position you actually hold, say it out loud, and find out
            whether you have a reason for it.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{ display: 'flex', height: 1, backgroundColor: HAIRLINE }}
          />
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            {MODE_LIST.map((mode) => (
              <div
                key={mode.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  border: `1px solid ${MODE_ACCENT[mode.id]}55`,
                  backgroundColor: `${MODE_ACCENT[mode.id]}0f`,
                  borderRadius: 999,
                  padding: '14px 28px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    backgroundColor: MODE_ACCENT[mode.id],
                  }}
                />
                <div style={{ display: 'flex', fontSize: 26, color: INK }}>
                  {mode.name}
                </div>
                <div style={{ display: 'flex', fontSize: 26, color: MUTED }}>
                  {mode.kicker}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
