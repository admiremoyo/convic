# Images — what to drop in and where

The site already references every filename below. **Save your photos with these
exact names in these exact folders and they appear automatically — no code
changes needed.** Until a file exists, that slot shows a tidy branded
placeholder rather than a broken image, so the site is safe to publish at any
point.

---

## 1. Brand (required)

| File | What it is | Notes |
|---|---|---|
| `brand/logo.png` | Your company logo | **Transparent background PNG.** Roughly 640×320. Used in the header and footer. Until it exists, a "Covcro / Electrical & Plumbing" text wordmark shows instead. |

Already generated for you (no action needed): `brand/favicon.svg`,
`brand/apple-touch-icon.png`, `brand/icon-192.png`, `brand/icon-512.png`,
`og-cover.png`.

> **Replace `og-cover.png` when you can.** It is the picture that appears when
> someone shares the site on WhatsApp or Facebook. Ideally a 1200×630 photo of
> your best work with the logo on it. The generated one is a plain brand tile.

---

## 2. Hero (required)

| File | What it is |
|---|---|
| `hero/hero-solar-install.jpg` | The big image behind the homepage headline. Use the shot of your team on the roof with the solar panels and solar geyser — it shows people, work and product at once. **Landscape, at least 1920px wide.** |

---

## 3. Projects

These are the photos you sent. Save each one under the matching name:

| File | Which photo |
|---|---|
| `projects/kitchen-led-ceiling.jpg` | The kitchen with the pink concealed LED strip in the bulkhead ceiling |
| `projects/chandelier-lounge.jpg` | The black-and-gold chandelier on the ornate ceiling rose |
| `projects/inverter-battery-bank.jpg` | The two inverters above the five white lithium batteries |
| `projects/rooftop-solar-geyser.jpg` | Your two technicians on the roof with the panels and solar geyser |
| `projects/solar-borehole-pumping.jpg` | The ground-mounted solar array with the elevated black water tank |
| `projects/slab-conduit-first-fix.jpg` | Conduit and pipes laid in the slab reinforcement (with the solar geyser on the roof behind) |
| `projects/slab-pour-team.jpg` | The team pouring concrete over the reinforced slab |
| `projects/drip-irrigation-field.jpg` | The grey PVC manifold with red valves feeding the drip lines |
| `projects/greenhouse-irrigation.jpg` | The greenhouse rows with drip lines down each bed |

---

## Before you upload — please resize

Photos straight off a phone are 4–8 MB each. That will make the site slow,
which hurts both visitors on mobile data and your Google ranking.

**Aim for under 400 KB per photo.** Use any free tool —
[squoosh.app](https://squoosh.app) works in the browser with nothing to install:

1. Open the photo
2. Set the width to **1600px** (or 1920px for the hero)
3. Choose **MozJPEG**, quality around **75**
4. Download and rename it to the filename above

---

## Adding more photos later

Copy an existing `<button class="g-item">…</button>` block in
`src/pages/projects.html`, change the three filenames and the caption text, then
run `node build.js`. Keep writing a real description in the `alt` text — it is
what Google reads, and what a visually impaired visitor hears.
