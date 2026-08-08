# Images

**All images are in place.** This file is the reference for replacing them or
adding more later.

The site references each photo by the exact filename below. To swap one, save
the new photo over the old file using the same name — no code changes needed.
If a file is ever missing, that slot shows a tidy branded placeholder rather
than a broken image, so the site is always safe to publish.

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
| `projects/inverter-battery-bank-2.jpg` | Second inverter/battery angle showing the labelled boards |

---

## Before you upload — please resize

Photos straight off a phone or an image tool are several MB each. That makes
the site slow, which hurts both visitors on mobile data and your Google
ranking. The current set was reduced from ~32 MB to ~2.5 MB with no visible
quality loss.

**Aim for under 400 KB per photo.** Use any free tool —
[squoosh.app](https://squoosh.app) works in the browser with nothing to install:

1. Open the photo
2. Set the width to **1400px** for landscape, **1000px** for portrait
   (**1920px** for the hero)
3. Choose **MozJPEG**, quality around **78**
4. Download and rename it to the filename above

Save as `.jpg` for photographs. Keep `.png` only for the logo, which needs a
transparent background.

---

## Adding more photos later

Copy an existing `<button class="g-item">…</button>` block in
`src/pages/projects.html`, change the three filenames and the caption text, then
run `node build.js`. Keep writing a real description in the `alt` text — it is
what Google reads, and what a visually impaired visitor hears.
