import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { BIZ } from './src/config.js'

// The head comes from BIZ too — tab title, share card, LocalBusiness schema and
// favicon are all baked into index.html at build time from the same config the
// page renders from.
function shopHead(BIZ) {
  const { seo, colors } = BIZ
  const enc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

  const social = [
    seo.image && `<meta property="og:image" content="${enc(seo.image)}" />`,
    seo.url && `<meta property="og:url" content="${enc(seo.url)}" />`,
    seo.image && `<meta name="twitter:image" content="${enc(seo.image)}" />`,
  ]
    .filter(Boolean)
    .map((tag) => `    ${tag}`)
    .join('\n')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FastFoodRestaurant',
    name: BIZ.name,
    description: seo.schemaDescription,
    servesCuisine: ['Kebab', 'Burgers', 'Fast food'],
    telephone: BIZ.phoneHref.replace('tel:', ''),
    priceRange: '£',
    address: {
      '@type': 'PostalAddress',
      addressLocality: seo.locality,
      addressRegion: 'Wales',
      postalCode: seo.postcode,
      addressCountry: 'GB',
    },
    openingHoursSpecification: seo.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      ...h,
    })),
    ...(seo.url ? { url: seo.url } : {}),
  }

  const hex = (c) => c.replace('#', '%23')
  const favicon =
    `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E` +
    `%3Crect width='100' height='100' rx='20' fill='${hex(colors.charcoal)}'/%3E` +
    `%3Ctext x='50' y='72' font-family='Arial Black,sans-serif' font-size='64' font-weight='900' ` +
    `text-anchor='middle' fill='${hex(colors.ember)}'%3E${seo.initial}%3C/text%3E%3C/svg%3E`

  const map = {
    '%TITLE%': enc(seo.title),
    '%DESC%': enc(seo.description),
    '%OG_TITLE%': enc(seo.ogTitle),
    '%OG_DESC%': enc(seo.ogDescription),
    '%THEME%': colors.charcoal,
    '%FAVICON%': favicon,
    '%SOCIAL%': social,
    '%SCHEMA%': JSON.stringify(schema, null, 2),
  }

  return {
    name: 'shop-head',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/%TITLE%|%DESC%|%OG_TITLE%|%OG_DESC%|%THEME%|%FAVICON%|%SOCIAL%|%SCHEMA%/g,
          (k) => map[k]),
    },
  }
}

export default defineConfig({
  plugins: [react(), shopHead(BIZ)],
  server: { port: 5174, strictPort: true },
})
