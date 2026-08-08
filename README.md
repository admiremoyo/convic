# Covcro Electrical & Plumbing (Pvt) Ltd — website

Marketing site for Covcro Electrical & Plumbing (Pvt) Ltd, Harare, Zimbabwe.

Plain static HTML, CSS and JavaScript. No frameworks, no npm install, no
external fonts or CDNs. It will run on any web host, and you can open
`index.html` straight off your computer to preview it.

---

## Quick start

**To preview:** open `index.html` in a browser. Or, for accurate link
behaviour, run a local server:

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

**To publish:** push to `main`. GitHub Actions deploys to Azure Static Web
Apps automatically — no manual upload.

Live at **https://kind-bush-0e71ca310.7.azurestaticapps.net** until the custom
domain is connected.

---

## Before you go live — a checklist

| # | Task | Where |
|---|---|---|
| 1 | Add your logo and photos | See [`assets/img/README.md`](assets/img/README.md) — filenames are already wired up |
| 2 | Point the domain at Azure | See "Custom domain" below. Site URL is set to `https://covcroelectrical.co.zw` |
| 3 | Confirm opening hours | `site.config.json` → `hours` |
| 4 | Connect the quote form | See "Making the form send email" below |
| 5 | Set up Google Business Profile | See "Getting found on Google" below |
| 6 | Re-run the build | `node build.js` after any change in `site.config.json` |

---

## Custom domain (covcroelectrical.co.zw)

The site's canonical URL is already set to `https://covcroelectrical.co.zw`.
To make that live:

1. In the Azure portal, open your Static Web App → **Custom domains** → **Add**
2. Add `www.covcroelectrical.co.zw` first — Azure gives you a **CNAME** target
   like `kind-bush-0e71ca310.7.azurestaticapps.net`. Add that CNAME at your
   `.co.zw` registrar.
3. Then add the apex `covcroelectrical.co.zw`. Apex domains cannot use a plain
   CNAME, so either:
   - use your registrar's **ALIAS/ANAME** record pointing at the same target, or
   - move DNS to **Azure DNS** and let Azure create the alias record for you.
4. Azure issues the HTTPS certificate automatically once DNS resolves. This can
   take up to a few hours to propagate.

Pick one as primary and redirect the other, so Google does not treat
`www.` and the apex as two competing copies of the same site. The canonical
tags on every page already point at the apex.

**If you choose `www.` as primary instead**, change `domain` in
`site.config.json` to `https://www.covcroelectrical.co.zw` and run
`node build.js` — that single value drives every canonical tag, the sitemap,
robots.txt and all structured data.

---

## How the site is put together

You edit **`src/`**, then run the build, which writes the finished HTML pages
into the root of the project.

```
site.config.json          Phone numbers, email, address, hours  ← edit here
build.js                  Assembles pages (needs Node.js)
src/pages/*.html          The words on each page               ← edit here
assets/css/styles.css     All styling
assets/js/main.js         Menu, gallery, form, animations
assets/img/               Your photos                          ← add here

index.html                ┐
about/, contact/,         │ Generated — do not edit these by hand,
projects/, services/…     │ your changes will be overwritten
sitemap.xml, robots.txt   ┘
```

### Making a change

```bash
# 1. Edit the words in src/pages/  (or the details in site.config.json)
# 2. Rebuild:
node build.js
# 3. Upload the changed files
```

**Why a build step?** The menu, footer and contact details appear on all ten
pages. Without this, changing a phone number would mean editing ten files and
missing one. Now you change it in `site.config.json` once.

> If you would rather not use Node at all, you can edit the generated `.html`
> files directly — the site works fine that way. Just remember the header and
> footer are repeated on every page, and don't run `build.js` afterwards or it
> will overwrite them.

---

## Making the form send email

Right now the quote form opens the visitor's own email app with their details
filled in. That works, but many people abandon at that point. To get
submissions straight to your inbox:

1. Sign up at [formspree.io](https://formspree.io) (free tier is plenty)
2. Create a form pointed at `covcroelectrical@gmail.com`
3. Copy the endpoint they give you — it looks like `https://formspree.io/f/abcdwxyz`
4. In `src/pages/contact.html`, find `data-endpoint=""` and paste it in:

```html
<form class="form-card" data-quote-form data-endpoint="https://formspree.io/f/abcdwxyz" …>
```

5. Run `node build.js` and upload

The form already has spam protection (a hidden honeypot field) built in.

---

## Getting found on Google

The technical SEO is done — every page has a unique title and description,
structured data (`LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`),
Open Graph tags for WhatsApp and Facebook sharing, a sitemap and clean URLs.

**That is roughly 30% of local ranking.** The rest is these four things, and
none of them are code:

1. **Google Business Profile** — [business.google.com](https://business.google.com).
   Free, and the single highest-impact thing you can do. Get the name, address
   and phone number *character-for-character identical* to the footer of this
   site. Add photos, your services and your hours.
2. **Reviews.** Ask every satisfied customer. Local ranking leans on these
   heavily, and so do people choosing between three contractors.
3. **Consistent details everywhere.** Same name, same address, same phone on
   your Facebook page, any directory listing, your invoices. Inconsistency
   actively hurts.
4. **Submit the sitemap.** In
   [Google Search Console](https://search.google.com/search-console), add the
   property and submit `https://covcroelectrical.co.zw/sitemap.xml`.

### Adding testimonials

There is a ready-made testimonial card style (`.quote` in the CSS) but no
testimonials on the site — nothing invented on your behalf. When you have real
ones with permission to publish, they will be worth adding.

---

## Regenerating the brand icons

The favicon, app icons and social share image were generated from the logo's
bulb-and-bolt mark:

```bash
node tools/make-icons.js
```

You only need this if you change the brand colours in `tools/make-icons.js`.

---

## Housekeeping

- **Accessibility:** skip link, keyboard-navigable menu and gallery, visible
  focus rings, real alt text, and reduced-motion support.
- **Performance:** no external requests at all. Keep photos under ~400 KB.
- **Browser support:** every current browser, mobile and desktop.
