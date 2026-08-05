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
