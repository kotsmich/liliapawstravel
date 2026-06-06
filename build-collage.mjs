// Justified-gallery mosaic for the hero banner.
// Photos keep their ORIGINAL aspect ratio (no cropping) and orientation
// (EXIF-rotated upright). Each row is scaled to fill the width exactly, so
// rows still touch edge-to-edge (seamless) but nothing is cut off.
//
// Usage:
//   node build-collage.mjs [--src DIR] [--out FILE] [--w 2560] [--rows 3]
//                          [--gap 0] [--seed 7]

import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

// ---- args ----
const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : def;
};
const SRC = arg('src', 'collage-src');
const OUT = arg('out', 'collage-out.jpg');
const W = parseInt(arg('w', '2560'), 10);
const TARGET_H = arg('h', null) ? parseInt(arg('h'), 10) : null;
const ROWS = parseInt(arg('rows', '3'), 10);
const GAP = parseInt(arg('gap', '0'), 10);
const SEED = parseInt(arg('seed', '7'), 10);

// ---- seeded PRNG (reproducible shuffles) ----
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

// Balance images into R contiguous rows by minimizing the largest
// row's total aspect-sum (→ rows end up similar heights). DP linear partition.
function partition(aspects, R) {
  const n = aspects.length;
  R = Math.min(R, n);
  const prefix = [0];
  for (let i = 0; i < n; i++) prefix.push(prefix[i] + aspects[i]);
  const sum = (a, b) => prefix[b] - prefix[a];
  // dp[r][i] = min possible max-rowsum splitting first i items into r rows
  const dp = Array.from({ length: R + 1 }, () => new Array(n + 1).fill(Infinity));
  const cut = Array.from({ length: R + 1 }, () => new Array(n + 1).fill(0));
  dp[0][0] = 0;
  for (let r = 1; r <= R; r++) {
    for (let i = 1; i <= n; i++) {
      for (let j = r - 1; j < i; j++) {
        const val = Math.max(dp[r - 1][j], sum(j, i));
        if (val < dp[r][i]) { dp[r][i] = val; cut[r][i] = j; }
      }
    }
  }
  const bounds = [];
  let i = n;
  for (let r = R; r >= 1; r--) { bounds.unshift(i); i = cut[r][i]; }
  bounds.unshift(0);
  const groups = [];
  for (let k = 0; k < bounds.length - 1; k++) groups.push([bounds[k], bounds[k + 1]]);
  return groups;
}

async function main() {
  const files = (await readdir(SRC))
    .filter((f) => IMG_EXT.has(extname(f).toLowerCase()))
    .map((f) => join(SRC, f));

  if (files.length === 0) {
    console.error(`No images found in "${SRC}".`);
    process.exit(1);
  }

  // shuffle (seeded) so placement isn't alphabetical
  for (let k = files.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1));
    [files[k], files[j]] = [files[j], files[k]];
  }

  // load, auto-rotate by EXIF, capture true displayed aspect ratio
  const imgs = await Promise.all(
    files.map(async (f) => {
      const { data, info } = await sharp(f).rotate().toBuffer({ resolveWithObject: true });
      return { buf: data, w: info.width, h: info.height, aspect: info.width / info.height };
    })
  );

  const N = imgs.length;
  console.log(`Found ${N} photos → ${ROWS}-row justified layout, ${W}px wide`);

  const groups = partition(imgs.map((im) => im.aspect), ROWS);

  // compute each row's height so it fills W exactly, then integer-snap
  // boundaries so tiles touch with no sub-pixel gaps.
  const composites = [];
  let y = 0;
  for (const [start, end] of groups) {
    const row = imgs.slice(start, end);
    const n = row.length;
    const aspectSum = row.reduce((s, im) => s + im.aspect, 0);
    const usableW = W - GAP * (n - 1);
    const rowH = Math.round(usableW / aspectSum);

    // x boundaries across the row (snapped to fill exactly to W)
    let x = 0;
    const widths = row.map((im) => im.aspect * rowH);
    const widthSum = widths.reduce((s, w) => s + w, 0);
    const scale = (W - GAP * (n - 1)) / widthSum; // correct rounding drift
    for (let c = 0; c < n; c++) {
      const cellW = c === n - 1 ? W - x : Math.round(widths[c] * scale);
      composites.push({ im: row[c], left: x, top: y, w: cellW, h: rowH });
      x += cellW + GAP;
    }
    y += rowH + GAP;
  }
  const H = y - GAP;

  const tiles = await Promise.all(
    composites.map(async (c) => ({
      input: await sharp(c.im.buf).resize(c.w, c.h, { fit: 'fill' }).toBuffer(),
      left: c.left,
      top: c.top,
    }))
  );

  let canvas = sharp({
    create: { width: W, height: H, channels: 3, background: { r: 255, g: 255, b: 255 } },
  }).composite(tiles);

  // optionally scale the whole banner to an exact height (keeps everything
  // uncropped; width scales proportionally)
  let outW = W, outH = H;
  if (TARGET_H && TARGET_H !== H) {
    const png = await canvas.png().toBuffer();
    outH = TARGET_H;
    outW = Math.round(W * (TARGET_H / H));
    canvas = sharp(png).resize(outW, outH);
  }

  await canvas.jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);

  console.log(`✓ Wrote ${OUT}  (${outW}×${outH}, ratio ${(outW / outH).toFixed(2)}:1)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
