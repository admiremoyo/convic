#!/usr/bin/env node
/**
 * Generates the PNG brand icons the site references:
 *
 *   assets/img/brand/apple-touch-icon.png   180x180
 *   assets/img/brand/icon-192.png           192x192
 *   assets/img/brand/icon-512.png           512x512
 *   assets/img/og-cover.png                1200x630
 *
 * Run:  node tools/make-icons.js
 *
 * These are brand-coloured placeholders built from the logo's bulb-and-bolt
 * mark so nothing 404s. Replace og-cover.png with a real photo of your work
 * (with the logo on it) when you have one — it is what shows up when the site
 * is shared on WhatsApp and Facebook.
 *
 * No dependencies: PNGs are encoded directly using Node's built-in zlib.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* --- brand ---------------------------------------------------------------- */
const BLUE = [0x17, 0x42, 0x9b];
const BLUE_DARK = [0x07, 0x16, 0x34];
const PINK = [0xf5, 0x57, 0x8a];
const WHITE = [0xff, 0xff, 0xff];

/* --- tiny raster canvas --------------------------------------------------- */
const SS = 3; // supersampling factor

function canvas(w, h) {
  return { w, h, px: new Uint8ClampedArray(w * h * 4) };
}

function set(c, x, y, rgb, a = 255) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  const sa = a / 255;
  c.px[i]     = c.px[i]     * (1 - sa) + rgb[0] * sa;
  c.px[i + 1] = c.px[i + 1] * (1 - sa) + rgb[1] * sa;
  c.px[i + 2] = c.px[i + 2] * (1 - sa) + rgb[2] * sa;
  c.px[i + 3] = Math.max(c.px[i + 3], a);
}

function fillRoundedRect(c, x0, y0, w, h, r, rgb) {
  for (let y = Math.floor(y0); y < y0 + h; y++) {
    for (let x = Math.floor(x0); x < x0 + w; x++) {
      const dx = Math.max(x0 + r - x, 0, x - (x0 + w - r - 1));
      const dy = Math.max(y0 + r - y, 0, y - (y0 + h - r - 1));
      if (dx * dx + dy * dy <= r * r) set(c, x, y, rgb);
    }
  }
}

function fillCircle(c, cx, cy, r, rgb) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) {
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) set(c, x, y, rgb);
    }
  }
}

/** Even-odd point-in-polygon fill. pts are [x, y] pairs in pixel space. */
function fillPolygon(c, pts, rgb) {
  const ys = pts.map(p => p[1]);
  const y0 = Math.floor(Math.min(...ys));
  const y1 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y1; y++) {
    const xs = [];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y)) xs.push(xi + ((y - yi) / (yj - yi)) * (xj - xi));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) set(c, x, y, rgb);
    }
  }
}

function linearGradient(c, from, to) {
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const t = (x / c.w) * 0.65 + (y / c.h) * 0.35;
      set(c, x, y, [
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t
      ]);
    }
  }
}

/** Box-downsample a supersampled canvas. */
function downsample(c, factor) {
  const w = c.w / factor, h = c.h / factor;
  const out = canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const i = ((y * factor + dy) * c.w + (x * factor + dx)) * 4;
          r += c.px[i]; g += c.px[i + 1]; b += c.px[i + 2]; a += c.px[i + 3];
        }
      }
      const n = factor * factor;
      const o = (y * w + x) * 4;
      out.px[o] = r / n; out.px[o + 1] = g / n; out.px[o + 2] = b / n; out.px[o + 3] = a / n;
    }
  }
  return out;
}

/* --- PNG encoder ---------------------------------------------------------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(c) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0);
  ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const raw = Buffer.alloc(c.h * (c.w * 4 + 1));
  for (let y = 0; y < c.h; y++) {
    const off = y * (c.w * 4 + 1);
    raw[off] = 0; // filter: none
    for (let x = 0; x < c.w * 4; x++) raw[off + 1 + x] = c.px[y * c.w * 4 + x];
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* --- the mark ------------------------------------------------------------- */
/** Bulb outline + split fill + bolt, drawn into a square of side `s` at (ox, oy). */
function drawMark(c, ox, oy, s) {
  const P = (fx, fy) => [ox + fx * s, oy + fy * s];

  // bulb glass
  fillCircle(c, ox + 0.5 * s, oy + 0.42 * s, 0.30 * s, WHITE);
  // pink left half
  fillPolygon(c, [
    P(0.20, 0.42), P(0.50, 0.42), P(0.50, 0.72), P(0.20, 0.72)
  ], BLUE); // clipped below by neck redraw
  fillCircle(c, ox + 0.5 * s, oy + 0.42 * s, 0.30 * s, WHITE);
  for (let y = Math.floor(oy + 0.12 * s); y < oy + 0.72 * s; y++) {
    for (let x = Math.floor(ox + 0.20 * s); x < ox + 0.5 * s; x++) {
      const dx = x - (ox + 0.5 * s), dy = y - (oy + 0.42 * s);
      if (dx * dx + dy * dy <= (0.30 * s) ** 2) set(c, x, y, PINK);
    }
  }

  // neck + base
  fillRoundedRect(c, ox + 0.38 * s, oy + 0.70 * s, 0.24 * s, 0.07 * s, 0.03 * s, WHITE);
  fillRoundedRect(c, ox + 0.40 * s, oy + 0.80 * s, 0.20 * s, 0.07 * s, 0.03 * s, WHITE);

  // bolt
  fillPolygon(c, [
    P(0.56, 0.18), P(0.36, 0.46), P(0.49, 0.46),
    P(0.44, 0.68), P(0.65, 0.40), P(0.51, 0.40)
  ], BLUE);
}

/* --- outputs -------------------------------------------------------------- */
function makeIcon(size, outFile) {
  const c = canvas(size * SS, size * SS);
  const s = size * SS;
  fillRoundedRect(c, 0, 0, s, s, s * 0.22, BLUE);
  drawMark(c, s * 0.16, s * 0.10, s * 0.68);
  fs.writeFileSync(outFile, encodePNG(downsample(c, SS)));
  console.log(`  ✓ ${path.relative(process.cwd(), outFile)}  ${size}x${size}`);
}

function makeOgCover(outFile) {
  const W = 1200, H = 630;
  const c = canvas(W * SS, H * SS);
  linearGradient(c, BLUE_DARK, BLUE);

  // pink diagonal accent
  fillPolygon(c, [
    [W * SS * 0.62, H * SS], [W * SS * 0.80, 0],
    [W * SS * 0.90, 0], [W * SS * 0.72, H * SS]
  ], PINK);

  drawMark(c, W * SS * 0.08, H * SS * 0.16, H * SS * 0.66);
  fs.writeFileSync(outFile, encodePNG(downsample(c, SS)));
  console.log(`  ✓ ${path.relative(process.cwd(), outFile)}  ${W}x${H}`);
}

const brand = path.join(__dirname, '..', 'assets', 'img', 'brand');
fs.mkdirSync(brand, { recursive: true });

makeIcon(180, path.join(brand, 'apple-touch-icon.png'));
makeIcon(192, path.join(brand, 'icon-192.png'));
makeIcon(512, path.join(brand, 'icon-512.png'));
makeOgCover(path.join(__dirname, '..', 'assets', 'img', 'og-cover.png'));

console.log('\nIcons generated.\n');
