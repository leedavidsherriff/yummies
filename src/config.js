// ─────────────────────────────────────────────────────────────────────────────
// BIZ — the only block you touch. Every string, price, colour and media URL the
// site renders lives in here.
//
// YUMMIES — 102 Pisgah Street, Kenfig Hill. Address, phone and opening hours are
// the shop's real published details. Item names come from their real menu.
//
// ⚠️  PRICES ARE ESTIMATES. Yummies' prices aren't published anywhere public —
// they sit behind the Foodhub ordering flow. Everything in `price:` below is a
// plausible South Wales figure, not their actual board. Photograph the menu on
// the wall and correct these before the site goes anywhere near a customer.
// ─────────────────────────────────────────────────────────────────────────────
export const BIZ = {
  name: 'YUMMIES',
  tagline: 'Off the spit. Off the skewer. Seven nights on Pisgah Street.',
  town: 'Kenfig Hill',
  address: '102 Pisgah Street, Kenfig Hill, Bridgend, CF33 6DA',
  locationLine: 'Pisgah Street, Kenfig Hill',
  phone: '01656 749966',
  phoneHref: 'tel:+441656749966',

  // ⚠️  Unknown — Yummies' WhatsApp number isn't published. Empty means the
  // button doesn't render at all and the site falls back to call + copy.
  // For a demo, drop YOUR OWN mobile in here: the order lands on your phone in
  // front of the owner, which sells the idea far better than a dead link.
  whatsapp: '',

  // Demo checkout — the full pay flow with a test card and a paid screen, but
  // no processor behind it and no card ever charged. Turns on the "Pay now"
  // button and the special-requests box in the order panel.
  payments: true,

  hours: [
    { days: 'Mon – Thu', time: '3pm – 11pm' },
    { days: 'Fri – Sat', time: '3pm – 11.30pm' },
    { days: 'Sunday', time: '3pm – 11pm' },
  ],

  ticker: [
    'OPEN SEVEN NIGHTS',
    'DONER · SHISH · KOFTE',
    'THE KENFIG HILLS SPECIAL',
    'THE SQUEAK · THE CRUNCH · THE LOT',
    '102 PISGAH STREET',
    'RING IT THROUGH',
  ],

  heroVideoUrl: 'hero-loop.mp4',
  heroPosterUrl: 'hero-poster.jpg',

  audio: {
    slam: 'sfx/slam.mp3',
    whoosh: 'sfx/whoosh.mp3',
  },

  // Red and gold. Everything on the page tints from these five.
  colors: {
    charcoal: '#0A0A0A',
    ember: '#D81F26',
    amber: '#F0A81E',
    cream: '#F6EFE4',
    smoke: '#8B8279',
  },

  copy: {
    wordmarkAccent: 1,
    heroKicker: 'Kebabs, burgers & pizza',
    heroCta: 'Build yours',
    builderHeading: ['Build it.', 'Watch the price.'],
    builderBlurb:
      'Pick your meat, load it how you want it, ring it through. What you see is what goes in the wrap.',
    favouritesHeading: ['Shop favourites', '— pick one, then build it your way'],
    hoursHeading: ['Open', 'every night'],
    locationHeading: ['Number', '102'],
    locationBlurb: "You'll smell the grill before you see the sign.",
    orderHeading: ['Ring it', 'through'],
    orderBlurb: 'Order ahead and skip the wait.',
    footerLine: 'Kenfig Hill, Bridgend · Kebabs, burgers & pizza',
  },

  seo: {
    title: 'YUMMIES — Kebabs, Burgers & Pizza, Kenfig Hill',
    description:
      'Yummies, 102 Pisgah Street, Kenfig Hill — doner, shish, smashed burgers and pizza. Build your kebab and watch the price.',
    ogTitle: 'YUMMIES — Build it. Watch the price.',
    ogDescription:
      'Kebabs, burgers and pizza on Pisgah Street, Kenfig Hill. Build yours and watch every ingredient land on the grill.',
    url: 'https://leedavidsherriff.github.io/yummies/',
    image: 'https://leedavidsherriff.github.io/yummies/og.jpg',
    initial: 'Y',
    schemaDescription:
      'Kebab, burger and pizza takeaway on Pisgah Street in Kenfig Hill, Bridgend.',
    locality: 'Kenfig Hill',
    postcode: 'CF33 6DA',
    openingHours: [
      { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '15:00', closes: '23:00' },
      { dayOfWeek: ['Friday', 'Saturday'], opens: '15:00', closes: '23:30' },
      { dayOfWeek: 'Sunday', opens: '15:00', closes: '23:00' },
    ],
  },

  // ── The builder ────────────────────────────────────────────────────────────
  // Only what the film covers. Yummies' pizza, wraps, chicken strips and
  // meal deals aren't filmed and deliberately aren't here — see PITCH.md.
  builder: {
    // ── Shop favourites ──────────────────────────────────────────────────────
    // A shortcut into the builder, not a pre-filled order. `sel` describes the
    // build the card pictures — its art is that combination's real end frame,
    // resolved through the same variant lookup the panel uses, so it gets truer
    // as clips land and never oversells. Tapping applies only the meat: the
    // salad and the sauce stay the customer's to pick and to watch land.
    bestSellers: [
      {
        id: 'fav-doner-salad-garlic',
        tab: 'kebabs',
        name: 'Doner, Salad & Garlic',
        desc: 'The one everyone orders',
        sel: { meat: ['doner'], bread: ['flatbread'], salad: ['salad-full'], sauce: ['garlic'], extras: [] },
      },
      {
        id: 'fav-doner-salad-chilli',
        tab: 'kebabs',
        name: 'Doner, Salad & Chilli',
        desc: 'For the ones who can take it',
        sel: { meat: ['doner'], bread: ['flatbread'], salad: ['salad-full'], sauce: ['chilli'], extras: [] },
      },
      {
        id: 'fav-chicken-salad-garlic',
        tab: 'kebabs',
        name: 'Chicken, Salad & Garlic',
        desc: 'The Yardbird done properly',
        sel: { meat: ['chicken-doner'], bread: ['flatbread'], salad: ['salad-full'], sauce: ['garlic'], extras: [] },
      },
      {
        id: 'fav-doner-works',
        tab: 'kebabs',
        name: 'The Full Works',
        desc: 'Salad, chillies, garlic & chilli',
        sel: { meat: ['doner'], bread: ['flatbread'], salad: ['salad-works'], sauce: ['garlic-chilli'], extras: [] },
      },
      {
        id: 'fav-halloumi',
        tab: 'kebabs',
        name: 'Doner & The Squeak',
        desc: 'Grilled halloumi on top',
        sel: { meat: ['doner'], bread: ['flatbread'], salad: [], sauce: [], extras: ['halloumi'] },
      },
      {
        id: 'fav-burger-dressed',
        tab: 'burgers',
        name: 'The Pisgah Smash, Dressed',
        desc: 'Quarter pounder, cheese & salad',
        sel: { patty: ['quarter'], bun: ['brioche'], toppings: ['cheese-salad'], sauce: ['no-sauce'], extras: [] },
      },
      {
        id: 'fav-burger-works',
        tab: 'burgers',
        name: 'The Kenfig Hills Special',
        desc: 'Double stack, cheese, bacon, the lot',
        sel: { patty: ['kenfig-special'], bun: ['brioche'], toppings: ['the-works'], sauce: ['no-sauce'], extras: [] },
      },
    ],

    tabs: [
      {
        id: 'kebabs',
        label: 'Kebabs',
        groups: [
          {
            id: 'meat', label: 'The meat', pick: 'one',
            items: [
              { id: 'doner', name: 'The Yummies Original', desc: 'Flame-cut lamb doner', price: 7.0, layer: 'doner' },
              { id: 'chicken-doner', name: 'The Yardbird', desc: 'Chicken doner', price: 7.5, layer: 'chicken' },
              { id: 'lamb-shish', name: 'The Mountain Lamb', desc: 'Lamb shish, off the skewer', price: 9.5, layer: 'shish' },
              { id: 'mixed-doner', name: 'The Best of Both', desc: 'Lamb & chicken doner, mixed', price: 8.5, layer: 'mixed' },
            ],
          },
          {
            id: 'bread', label: 'The bread', pick: 'one', hidden: true,
            items: [
              { id: 'flatbread', name: 'Flatbread', price: 0, layer: 'flatbread', clip: 'flatbread' },
            ],
          },
          {
            id: 'salad', label: 'The salad — free', pick: 'one',
            items: [
              { id: 'no-salad', name: 'No salad', price: 0, layer: null },
              { id: 'salad-lt', name: 'Lettuce & tomato', price: 0, layer: ['lettuce', 'tomato'], clip: 'salad-lt' },
              { id: 'salad-full', name: 'Full salad', price: 0, layer: ['lettuce', 'tomato', 'onion', 'cabbage'], clip: 'salad-full' },
              { id: 'salad-works', name: 'Full salad & chillies', price: 0, layer: ['lettuce', 'tomato', 'onion', 'cabbage', 'chillies'], clip: 'salad-works' },
            ],
          },
          {
            id: 'sauce', label: 'The sauce — free', pick: 'one',
            items: [
              { id: 'no-sauce', name: 'No sauce', price: 0, layer: null },
              { id: 'garlic', name: 'Garlic', price: 0, layer: 'sauce-garlic', clip: 'sauce-garlic' },
              { id: 'chilli', name: 'Chilli', price: 0, layer: 'sauce-chilli', clip: 'sauce-chilli' },
              { id: 'garlic-chilli', name: 'Garlic & chilli', price: 0, layer: ['sauce-garlic', 'sauce-chilli'], clip: 'sauce-garlic-chilli' },
              { id: 'mint', name: 'Mint yoghurt', price: 0, layer: 'sauce-mint', clip: 'sauce-mint' },
              { id: 'bbq', name: 'BBQ', price: 0, layer: 'sauce-bbq', clip: 'sauce-bbq' },
            ],
          },
          {
            id: 'extras', label: 'Do it properly', pick: 'many',
            items: [
              { id: 'halloumi', name: 'The Squeak — grilled halloumi', price: 1.5, layer: 'halloumi', clip: 'halloumi' },
              { id: 'double-meat', name: 'Load it up — double meat', price: 3.0, layer: 'DOUBLE_MEAT' },
              { id: 'meal-deal', name: 'Make it a meal — chips & a can', price: 3.5, layer: null, clip: 'meal-deal' },
              { id: 'cheese-chips', name: 'Cheese & chips', price: 3.5, layer: null },
            ],
          },
        ],
      },
      {
        id: 'burgers',
        label: 'Burgers',
        groups: [
          {
            id: 'patty', label: 'The burger', pick: 'one',
            items: [
              { id: 'quarter', name: 'The Pisgah Smash', desc: 'Quarter pounder beef burger', price: 6.0, layer: 'patty', clip: 'patty', cardStill: 'clips/burger-finale.jpg' },
              { id: 'kenfig-special', name: 'The Kenfig Hills Special', desc: 'Double stack burger', price: 9.0, layer: 'patty-double', clip: 'patty-double' },
              { id: 'chicken-strip', name: 'The Crunch', desc: 'Crispy chicken strip burger', price: 7.0, layer: 'fillet', clip: 'fillet' },
            ],
          },
          {
            id: 'bun', label: 'The bun', pick: 'one', hidden: true,
            items: [
              { id: 'brioche', name: 'Toasted bun', price: 0, layer: 'BUN' },
            ],
          },
          {
            id: 'toppings', label: 'The build', pick: 'one',
            items: [
              { id: 'plain', name: 'Straight up', price: 0, layer: null },
              { id: 'cheese', name: 'The Melt — American cheese', price: 1.0, layer: 'cheese', clip: 'burger-cheese' },
              { id: 'cheese-salad', name: 'Dressed — cheese & salad', price: 1.75, layer: ['cheese', 'lettuce', 'tomato', 'onion'], clip: 'burger-cheese-salad' },
              { id: 'the-works', name: 'The Lot — cheese, bacon, the works', price: 3.0, layer: ['cheese', 'bacon', 'jalapenos', 'lettuce', 'tomato', 'onion'], clip: 'burger-works' },
            ],
          },
          {
            // Burger sauces stay hidden until their clips are re-shot on the
            // correct patty bed — the last batch was rendered on the kebab meat
            // bed by mistake, so all four came back unusable.
            id: 'sauce', label: 'The sauce — free', pick: 'one', hidden: true,
            items: [
              { id: 'no-sauce', name: 'No sauce', price: 0, layer: null },
            ],
          },
          {
            id: 'extras', label: 'Do it properly', pick: 'many',
            items: [
              { id: 'extra-patty', name: 'Load it up — extra patty', price: 3.0, layer: 'DOUBLE_MEAT' },
              { id: 'meal-deal', name: 'Make it a meal — chips & a can', price: 3.5, layer: null },
              { id: 'cheese-chips', name: 'Cheese & chips', price: 3.5, layer: null },
            ],
          },
        ],
      },
    ],
  },
}
