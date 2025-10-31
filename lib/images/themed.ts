export type Topic =
  | 'volunteer'
  | 'military'
  | 'family'
  | 'children'
  | 'medicine'
  | 'humanitarian'
  | 'donation'
  | 'ukraine'
  | 'solidarity';

function slug(s: string){
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
}

export function topicFromTitle(title?: string): Topic {
  const t = (title || '').toLowerCase();
  if (t.includes('дит') || t.includes('child')) return 'children';
  if (t.includes('родин') || t.includes('family')) return 'family';
  if (t.includes('мед') || t.includes('health') || t.includes('medic')) return 'medicine';
  if (t.includes('військ') || t.includes('milit') || t.includes('army')) return 'military';
  if (t.includes('гуман') || t.includes('human')) return 'humanitarian';
  if (t.includes('донат') || t.includes('donat') || t.includes('пожертв')) return 'donation';
  if (t.includes('украї') || t.includes('ukrain')) return 'ukraine';
  return 'volunteer';
}

/** Robust random photo URL (no API key). Uses Picsum with deterministic seed. */
export function randomPhoto(topic: Topic, w: number, h: number, seedBase?: string): string {
  const W = Math.max(200, Math.round(w));
  const H = Math.max(200, Math.round(h));
  const seed = slug(`${topic}-${seedBase || ''}-${W}x${H}`);
  // Picsum supports seed — стабильно отдаёт одну картинку на seed
  return `https://picsum.photos/seed/${seed}/${W}/${H}`;
}

/** Fallback local placeholder (always exists) */
export const LOCAL_FALLBACK = '/images/fallbacks/photo-fallback.svg';
