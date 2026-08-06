// Ingredient film registry. Keys match the layer/art ids used in the builder.
// Each entry: { src, still } — still is the clip's final frame (build-board tile).
// Entries appear here as clips are ingested; anything missing falls back to the
// SVG slam, so the site works at any level of coverage.
//
// FINALES: the "WRAP IT" payoff. Kebabs reuse the hero loop's second half —
// the explosion in reverse IS the kebab assembling. startAt skips to that half.
const clip = (id) => ({ src: `clips/${id}.mp4`, still: `clips/${id}.jpg` })

export const CLIPS = {
  'sauce-garlic-chilli': clip('sauce-garlic-chilli'),
  'salad-lt': clip('salad-lt'),
  'salad-full': clip('salad-full'),
  'salad-works': clip('salad-works'),
  flatbread: clip('flatbread'),
  doner: clip('doner'),
  mixed: clip('mixed'),
  chicken: clip('chicken'),
  shish: clip('shish'),
  patty: clip('patty'),
  'patty-double': clip('patty-double'),
  fillet: clip('fillet'),
  'halloumi-patty': clip('halloumi-patty'),
  'burger-cheese': clip('burger-cheese'),
  'burger-cheese-salad': clip('burger-cheese-salad'),
  'burger-works': clip('burger-works'),
  'meal-deal': clip('meal-deal'),
  lettuce: clip('lettuce'),
  tomato: clip('tomato'),
  onion: clip('onion'),
  cabbage: clip('cabbage'),
  chillies: clip('chillies'),
  halloumi: clip('halloumi'),
  'sauce-garlic': clip('sauce-garlic'),
  'sauce-chilli': clip('sauce-chilli'),
  'sauce-mint': clip('sauce-mint'),
  'sauce-bbq': clip('sauce-bbq'),
  // ── Combination variants ────────────────────────────────────────────────────
  // Filmed on the bed of a specific build state, so the sauce lands on the salad
  // that's actually there. Keys are read by resolveClip(); files use `--` where
  // the key uses `@` and `.` so they stay filename-safe.
  'sauce-garlic@salad-full': clip('sauce-garlic--salad-full'),
  'sauce-chilli@salad-full': clip('sauce-chilli--salad-full'),
  'sauce-garlic-chilli@salad-works': clip('sauce-garlic-chilli--salad-works'),
  'salad-full@chicken': clip('salad-full--chicken'),
  'sauce-garlic@chicken.salad-full': clip('sauce-garlic--chicken-salad-full'),
  'sauce-chilli@chicken.salad-full': clip('sauce-chilli--chicken-salad-full'),
  'sauce-bbq@salad-full': clip('sauce-bbq--salad-full'),
  'sauce-mint@salad-full': clip('sauce-mint--salad-full'),
  'salad-full@mixed': clip('salad-full--mixed'),
}

export const FINALES = {
  kebabs: { src: 'clips/kebab-finale.mp4' },
  burgers: { src: 'clips/burger-finale.mp4' },
}

// The empty-grill set plate — resting poster for the film panel.
export const SET_PLATE = 'clips/_set.jpg'

// Map a config layer id to its clip key (buns and double-meat are indirect).
export function clipKeyFor(layerId, baseMeatArt) {
  if (layerId === 'BUN') return 'bun'
  if (layerId === 'BUN_SEEDED') return 'bun-seeded'
  if (layerId === 'DOUBLE_MEAT') return baseMeatArt || null
  return layerId
}

// ─────────────────────────────────────────────────────────────────────────────
// Combination-aware lookup.
//
// A sauce doesn't land on a bare doner — it lands on whatever the customer has
// already built. So every clip can have variants filmed on a specific bed, and
// the site reaches for the most specific one it actually has:
//
//   sauce-garlic@chicken.salad-full   garlic, over full salad, on chicken
//   sauce-garlic@salad-full           garlic, over full salad
//   sauce-garlic@chicken              garlic, straight onto chicken
//   sauce-garlic                      the original: garlic on a bare doner
//
// Salad is checked before meat on purpose — once salad is on, it's the salad the
// sauce pours over and the meat is mostly hidden. Nothing here needs to exist;
// anything missing falls through to the plain key, which is exactly what the
// site did before. New variants improve it one render at a time.
//
// ctx: { meat, salad } — the meat's `layer` ('doner') and the salad's `clip`
// key ('salad-full'), or null for either.
// ─────────────────────────────────────────────────────────────────────────────
export function variantsFor(baseKey, ctx = {}) {
  const { meat, salad } = ctx
  const out = []
  if (meat && salad) out.push(`${baseKey}@${meat}.${salad}`)
  if (salad) out.push(`${baseKey}@${salad}`)
  if (meat) out.push(`${baseKey}@${meat}`)
  out.push(baseKey)
  return out
}

export function resolveClip(baseKey, ctx) {
  if (!baseKey) return null
  return variantsFor(baseKey, ctx).find((k) => CLIPS[k]) ?? null
}
