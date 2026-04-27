// Re-encodes apps/user-app/src/assets/images/* into resized WebP.
// Originals are moved to ./_originals/ as a one-shot backup before deletion.
// Run: node apps/user-app/scripts/optimize-images.mjs

import { readdir, mkdir, rename, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const IMAGES_DIR = join(HERE, '..', 'src', 'assets', 'images');
const BACKUP_DIR = join(IMAGES_DIR, '_originals');

const RASTER = /\.(jpe?g|png)$/i;

// Per-image rules: panoramas need extra width; everything else caps at 1920.
function rulesFor(name) {
  if (name.startsWith('pano-')) return { maxWidth: 2400, quality: 78 };
  if (name.startsWith('hero-') || name.startsWith('about-hero-')) return { maxWidth: 1920, quality: 80 };
  return { maxWidth: 1600, quality: 80 };
}

async function main() {
  if (!existsSync(BACKUP_DIR)) await mkdir(BACKUP_DIR, { recursive: true });

  const entries = await readdir(IMAGES_DIR, { withFileTypes: true });
  const targets = entries
    .filter((e) => e.isFile() && RASTER.test(e.name))
    .map((e) => e.name);

  if (targets.length === 0) {
    console.log('No raster images to process.');
    return;
  }

  const dims = {};
  let totalIn = 0;
  let totalOut = 0;

  for (const file of targets) {
    const src = join(IMAGES_DIR, file);
    const { name } = parse(file);
    const out = join(IMAGES_DIR, `${name}.webp`);
    const backup = join(BACKUP_DIR, file);

    const { maxWidth, quality } = rulesFor(name);
    const inSize = (await stat(src)).size;

    const pipeline = sharp(src).rotate();
    const meta = await pipeline.metadata();
    const targetWidth = Math.min(meta.width ?? maxWidth, maxWidth);

    await pipeline
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality, effort: 5 })
      .toFile(out);

    const outMeta = await sharp(out).metadata();
    const outSize = (await stat(out)).size;

    dims[`${name}.webp`] = { width: outMeta.width, height: outMeta.height };
    totalIn += inSize;
    totalOut += outSize;

    const pct = ((1 - outSize / inSize) * 100).toFixed(1);
    console.log(
      `${file.padEnd(28)} ${(inSize / 1024).toFixed(0).padStart(6)} KB -> ${(outSize / 1024).toFixed(0).padStart(5)} KB  (-${pct}%)  ${outMeta.width}x${outMeta.height}`,
    );

    // Move original out of the build path.
    await rename(src, backup);
  }

  await writeFile(
    join(IMAGES_DIR, 'dimensions.json'),
    JSON.stringify(dims, null, 2) + '\n',
    'utf8',
  );

  const savedMb = ((totalIn - totalOut) / 1024 / 1024).toFixed(1);
  console.log(`\nTotal: ${(totalIn / 1024 / 1024).toFixed(1)} MB -> ${(totalOut / 1024 / 1024).toFixed(1)} MB  (saved ${savedMb} MB)`);
  console.log(`Originals moved to ${BACKUP_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
