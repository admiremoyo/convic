#!/usr/bin/env node
/**
 * Covcro Electrical & Plumbing — static site generator.
 *
 *   node build.js
 *
 * Reads page content from src/pages/*.html, wraps each one in the shared
 * layout (header, footer, meta, structured data) and writes plain static
 * HTML to the repository root. The published site has no runtime
 * dependency on this script — it exists so the header, footer and contact
 * details live in exactly one place instead of nine.
 *
 * Business details come from site.config.json. Change a phone number there
 * and re-run this script to update every page at once.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));

/* -------------------------------------------------------------------------
   Shared markup
   ------------------------------------------------------------------------- */

const waHref = `https://wa.me/${cfg.whatsapp}`;

const icon = {
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  caret: `<svg class="nav__caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>`
};

const SERVICES = [
  { slug: 'electrical',    label: 'Electrical Installations',    blurb: 'Domestic, commercial, industrial &amp; 11kV' },
  { slug: 'solar',         label: 'Solar &amp; Battery Storage', blurb: 'Inverters, lithium batteries, on &amp; off-grid' },
  { slug: 'water-systems', label: 'Boreholes &amp; Water Systems', blurb: 'Pumps, tanks, pressure &amp; booster systems' },
  { slug: 'plumbing',      label: 'Plumbing &amp; Drainage',     blurb: 'New installations, repairs &amp; maintenance' }
];

function topbar() {
  return `<div class="topbar">
  <div class="wrap topbar__inner">
    <ul class="topbar__list">
      <li>${icon.pin}${cfg.address.street}, ${cfg.address.city}</li>
      <li>${icon.clock}${cfg.hours.weekdays} · ${cfg.hours.saturday}</li>
    </ul>
    <ul class="topbar__list">
      <li><a href="tel:${cfg.phonePrimary.e164}">${cfg.phonePrimary.display}</a></li>
      <li><a href="tel:${cfg.phoneSecondary.e164}">${cfg.phoneSecondary.display}</a></li>
      <li><a href="mailto:${cfg.email}">${cfg.email}</a></li>
    </ul>
  </div>
</div>`;
}

function header(nav) {
  const cur = (key) => (nav === key ? ' aria-current="page"' : '');
  const drops = SERVICES.map(s =>
    `          <li><a href="{{base}}services/${s.slug}/">${s.label}<span>${s.blurb}</span></a></li>`
  ).join('\n');

  return `<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="{{base}}" aria-label="${cfg.name} home">
      <img src="{{base}}assets/img/brand/logo.png" alt="${cfg.name}" width="320" height="160">
      <span class="brand__fallback" hidden aria-hidden="true">
        <span class="brand__name">${cfg.shortName}</span>
        <span class="brand__tag">Electrical &amp; Plumbing</span>
      </span>
    </a>

    <ul class="nav__menu" id="primary-menu">
      <li><a class="nav__link" href="{{base}}"${cur('home')}>Home</a></li>
      <li class="has-drop">
        <a class="nav__link" href="{{base}}services/"${cur('services')}>Services ${icon.caret}</a>
        <ul class="nav__drop">
${drops}
        </ul>
      </li>
      <li><a class="nav__link" href="{{base}}projects/"${cur('projects')}>Projects</a></li>
      <li><a class="nav__link" href="{{base}}about/"${cur('about')}>About</a></li>
      <li><a class="nav__link" href="{{base}}contact/"${cur('contact')}>Contact</a></li>

      <li class="nav__mobile-cta">
        <a class="btn btn--pink" href="{{base}}contact/">Request a free quote</a>
        <a class="btn btn--wa" href="${waHref}" rel="noopener">WhatsApp us</a>
      </li>
    </ul>

    <div class="nav__actions">
      <a class="btn btn--pink btn--quote" href="{{base}}contact/">Get a free quote</a>
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="primary-menu" aria-label="Open menu">
        <span></span>
      </button>
    </div>
  </div>
</header>`;
}

function ctaBand() {
  return `<section class="cta-band">
  <div class="wrap cta-band__inner">
    <div class="cta-band__copy">
      <h2>Get a Free Quote</h2>
      <p>Call ${cfg.phonePrimary.display} or send us a message. Free site visits across Harare.</p>
    </div>
    <div class="btn-row">
      <a class="btn btn--white btn--lg" href="{{base}}contact/">Request a quote</a>
      <a class="btn btn--wa btn--lg" href="${waHref}" rel="noopener">WhatsApp us</a>
    </div>
  </div>
</section>`;
}

function footer() {
  const services = SERVICES.map(s =>
    `        <li><a href="{{base}}services/${s.slug}/">${s.label}</a></li>`
  ).join('\n');

  return `<footer class="site-footer footer">
  <div class="wrap footer__top">
    <div class="footer__brand">
      <img src="{{base}}assets/img/brand/logo.png" alt="${cfg.name}" width="320" height="160">
      <span class="brand__fallback brand__fallback--light" hidden aria-hidden="true">
        <span class="brand__name">${cfg.shortName}</span>
        <span class="brand__tag">Electrical &amp; Plumbing</span>
      </span>
      <p>
        ${cfg.name} is a Harare-based contractor delivering electrical, solar,
        borehole and plumbing installations for domestic, commercial and
        industrial clients across Zimbabwe.
      </p>
      <div class="social">
        <a href="${waHref}" aria-label="Chat to us on WhatsApp" rel="noopener">${icon.whatsapp}</a>
        <a href="mailto:${cfg.email}" aria-label="Email ${cfg.shortName}">${icon.mail}</a>
        <a href="tel:${cfg.phonePrimary.e164}" aria-label="Call ${cfg.shortName}">${icon.phone}</a>
      </div>
    </div>

    <div>
      <h4>Services</h4>
      <ul class="footer__list">
${services}
        <li><a href="{{base}}services/">All services</a></li>
      </ul>
    </div>

    <div>
      <h4>Company</h4>
      <ul class="footer__list">
        <li><a href="{{base}}about/">About ${cfg.shortName}</a></li>
        <li><a href="{{base}}projects/">Projects</a></li>
        <li><a href="{{base}}contact/">Contact &amp; quotes</a></li>
      </ul>
    </div>

    <div>
      <h4>Get in touch</h4>
      <ul class="footer__list footer__contact">
        <li>${icon.pin}<span>${cfg.address.street},<br>${cfg.address.city}, ${cfg.address.countryName}</span></li>
        <li>${icon.phone}<span><a href="tel:${cfg.phonePrimary.e164}">${cfg.phonePrimary.display}</a><br><a href="tel:${cfg.phoneSecondary.e164}">${cfg.phoneSecondary.display}</a></span></li>
        <li>${icon.mail}<span><a href="mailto:${cfg.email}">${cfg.email}</a></span></li>
      </ul>
    </div>
  </div>

  <div class="wrap footer__bottom">
    <p style="margin:0">&copy; <span data-year>${new Date().getFullYear()}</span> ${cfg.name}. All rights reserved.</p>
    <ul class="footer__legal">
      <li>Registered in Zimbabwe</li>
      <li><a href="{{base}}contact/">Request a quote</a></li>
    </ul>
  </div>
</footer>

<a class="wa-float" href="${waHref}" rel="noopener" aria-label="Chat to ${cfg.shortName} on WhatsApp">
  ${icon.whatsapp}
  <span>WhatsApp us</span>
</a>`;
}

/* -------------------------------------------------------------------------
   Layout
   ------------------------------------------------------------------------- */

function layout(page, body, schema) {
  const url = cfg.domain + page.canonical;
  const ogImage = `${cfg.domain}/assets/img/${page.ogImage || 'og-cover.jpg'}`;

  const schemaBlock = schema
    ? `\n<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en-ZW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${page.title}</title>
<meta name="description" content="${page.description}">
<link rel="canonical" href="${url}">

<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta name="theme-color" content="#17429b">
<meta name="geo.region" content="ZW-HA">
<meta name="geo.placename" content="Marlborough, Harare">

<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${cfg.name}">
<meta property="og:locale" content="en_ZW">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${page.title}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${ogImage}">

<link rel="icon" href="{{base}}assets/img/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{{base}}assets/img/brand/apple-touch-icon.png">
<link rel="manifest" href="{{base}}site.webmanifest">
<link rel="stylesheet" href="{{base}}assets/css/styles.css">
<script>document.documentElement.className+=" js";</script>${schemaBlock}
</head>

<body>
<a class="skip-link" href="#main">Skip to main content</a>

${topbar()}

${header(page.nav)}

<main id="main">
${body}
${page.hideCta ? '' : ctaBand()}
</main>

${footer()}

<script src="{{base}}assets/js/main.js" defer></script>
</body>
</html>
`;
}

/* -------------------------------------------------------------------------
   Intrinsic image dimensions

   Browsers need width/height on <img> to reserve space before the file
   downloads — without it the page jumps as photos load. Reading the real
   dimensions here means the attributes stay correct whenever a photo is
   swapped, instead of drifting out of sync with hand-written numbers.
   ------------------------------------------------------------------------- */

function imageSize(file) {
  let buf;
  try { buf = fs.readFileSync(file); } catch { return null; }

  // PNG: IHDR is always the first chunk.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: walk the marker segments to the frame header.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0-SOF15, excluding the non-frame markers DHT/JPG/DAC
      if (marker >= 0xc0 && marker <= 0xcf &&
          marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

/** Rewrite width/height on every <img> whose file we can measure. */
function fixImageDimensions(html, base) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!src || /^(https?:)?\/\//.test(src)) return tag;

    const rel = src.startsWith(base) ? src.slice(base.length) : src;
    const size = imageSize(path.join(ROOT, rel));
    if (!size) return tag;

    return tag
      .replace(/\swidth="\d+"/, '')
      .replace(/\sheight="\d+"/, '')
      .replace(/\s*\/?>$/, ` width="${size.width}" height="${size.height}">`);
  });
}

/* -------------------------------------------------------------------------
   Page assembly
   ------------------------------------------------------------------------- */

const BLOCK = /^<!--(meta|schema)\s*([\s\S]*?)-->\s*/;

function parsePage(raw) {
  let rest = raw;
  const parts = {};
  let m;
  while ((m = rest.match(BLOCK))) {
    parts[m[1]] = JSON.parse(m[2]);
    rest = rest.slice(m[0].length);
  }
  if (!parts.meta) throw new Error('page is missing its <!--meta ... --> block');
  return { meta: parts.meta, schema: parts.schema || null, body: rest.trim() };
}

/** Business node reused by every page's structured data. */
function businessNode() {
  return {
    '@type': ['LocalBusiness', 'ElectricalContractor', 'Plumber'],
    '@id': `${cfg.domain}/#business`,
    name: cfg.name,
    alternateName: 'Covcro Electrical',
    url: `${cfg.domain}/`,
    logo: `${cfg.domain}/assets/img/brand/logo.png`,
    image: `${cfg.domain}/assets/img/og-cover.jpg`,
    email: cfg.email,
    telephone: cfg.phonePrimary.e164,
    description: 'Electrical, solar, borehole, water reticulation and plumbing contractors based in Marlborough, Harare. Domestic, commercial and industrial installation and maintenance, including 11kV and medium-voltage lines.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: cfg.address.street,
      addressLocality: cfg.address.city,
      addressRegion: cfg.address.region,
      addressCountry: cfg.address.country
    },
    areaServed: [
      { '@type': 'City', name: 'Harare' },
      { '@type': 'Country', name: 'Zimbabwe' }
    ],
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: cfg.phonePrimary.e164,
      contactType: 'sales',
      areaServed: 'ZW',
      availableLanguage: ['en', 'sn']
    }],
    priceRange: '$$',
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '17:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '13:00' }
    ]
  };
}

function breadcrumbNode(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: cfg.domain + t.url
    }))
  };
}

function buildSchema(meta, extra) {
  const graph = [businessNode()];

  if (meta.canonical === '/') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${cfg.domain}/#website`,
      url: `${cfg.domain}/`,
      name: cfg.name,
      publisher: { '@id': `${cfg.domain}/#business` },
      inLanguage: 'en-ZW'
    });
  }

  if (meta.breadcrumb) graph.push(breadcrumbNode(meta.breadcrumb));
  if (extra) graph.push(...(Array.isArray(extra) ? extra : [extra]));

  return { '@context': 'https://schema.org', '@graph': graph };
}

/* -------------------------------------------------------------------------
   Run
   ------------------------------------------------------------------------- */

const pagesDir = path.join(ROOT, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
const built = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const { meta, schema, body } = parsePage(raw);

  const outPath = path.join(ROOT, meta.path);
  const depth = meta.path.split('/').length - 1;
  const base = depth === 0 ? '' : '../'.repeat(depth);

  const tokens = {
    '{{base}}': base,
    '{{domain}}': cfg.domain,
    '{{phone1}}': cfg.phonePrimary.display,
    '{{phone1e}}': cfg.phonePrimary.e164,
    '{{phone2}}': cfg.phoneSecondary.display,
    '{{phone2e}}': cfg.phoneSecondary.e164,
    '{{email}}': cfg.email,
    '{{whatsapp}}': waHref,
    '{{address}}': `${cfg.address.street}, ${cfg.address.city}`,
    '{{company}}': cfg.name
  };

  let html = layout(meta, body, buildSchema(meta, schema));
  for (const [token, value] of Object.entries(tokens)) {
    html = html.split(token).join(value);
  }
  html = fixImageDimensions(html, base);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);

  built.push({ ...meta, out: meta.path });
  console.log(`  ✓ ${meta.path}`);
}

/* Sitemap ---------------------------------------------------------------- */
const today = new Date().toISOString().slice(0, 10);
const urls = built
  .filter(p => !p.noindex)
  .sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5))
  .map(p => `  <url>
    <loc>${cfg.domain}${p.canonical}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq || 'monthly'}</changefreq>
    <priority>${(p.priority || 0.5).toFixed(1)}</priority>
  </url>`).join('\n');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

console.log(`  ✓ sitemap.xml (${built.filter(p => !p.noindex).length} urls)`);

/* robots.txt ------------------------------------------------------------- */
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
`User-agent: *
Allow: /

Sitemap: ${cfg.domain}/sitemap.xml
`);
console.log('  ✓ robots.txt');

console.log(`\nBuilt ${built.length} pages.\n`);
