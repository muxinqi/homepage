// Dish photos live in a public repository, so they go in prepared: upright, at
// most 2400px on the long edge, and with no metadata — no camera model, no
// timestamps, and above all no GPS. The site's own images are stripped by
// Astro either way; this is about the originals anyone can download from
// GitHub.
//
//   npm run photos           rewrites any photo that needs it, in place
//   npm run photos -- --check  only reports, and fails; part of `npm run check`

import { readdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const DIR = new URL('../src/content/dishes/', import.meta.url);
const LONG_EDGE = 2400;
const check = process.argv.includes('--check');

const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const problems = [];

for (const file of files) {
  const url = new URL(file, DIR);
  const input = await readFile(url);
  const meta = await sharp(input).metadata();

  const why = [];
  if (meta.exif || meta.xmp || meta.iptc) why.push('has metadata');
  if (Math.max(meta.width ?? 0, meta.height ?? 0) > LONG_EDGE) why.push(`is over ${LONG_EDGE}px`);
  if (why.length === 0) continue;

  if (check) {
    problems.push(`  ${file} ${why.join(' and ')}`);
    continue;
  }

  // rotate() with no angle applies the EXIF orientation before the EXIF goes,
  // so a phone photo does not end up on its side. sharp writes no metadata
  // unless asked to.
  const output = await sharp(input)
    .rotate()
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
    .toFormat(meta.format, meta.format === 'jpeg' ? { quality: 82, mozjpeg: true } : { quality: 85 })
    .toBuffer();
  await writeFile(url, output);
  console.log(`${file}: ${why.join(', ')} → ${(input.length / 1e6).toFixed(1)} MB to ${(output.length / 1e6).toFixed(1)} MB`);
}

if (problems.length > 0) {
  console.error(`Dish photos not ready for a public repository:\n${problems.join('\n')}\nRun \`npm run photos\` to fix them in place.`);
  process.exit(1);
}
