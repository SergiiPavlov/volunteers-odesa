import {ImageResponse} from 'next/og';

export const runtime = 'edge';
export const alt = 'Volunteer Foundation Odesa';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(180deg, rgba(0,87,184,1) 0%, rgba(0,87,184,0.85) 45%, rgba(255,215,0,0.9) 100%)',
          color: '#ffffff',
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Волонтери · Odesa
      </div>
    ),
    {...size},
  );
}
