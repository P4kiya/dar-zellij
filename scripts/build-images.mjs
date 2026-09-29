// Makes the smaller copies of every master photo in public/images (name-400.webp, -800, -1200,
// -1600, only below the master's width) and writes src/lib/photos.json: each photo's size, its
// average colour and a tiny blurred preview, used while the real photo loads. Also writes the
// 1200x630 share image (public/og.jpg). Run after adding or replacing a photo.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = 'public/images';
const WIDTHS = [400, 800, 1200, 1600];
const MASTER = /^[a-z0-9-]+(?<!-\d{3,4})\.webp$/;

const manifest = {};
const masters = (await fs.readdir(DIR)).filter((f) => MASTER.test(f)).sort();

for (const file of masters) {
  const name = file.replace(/\.webp$/, '');
  const src = path.join(DIR, file);
  const { width, height } = await sharp(src).metadata();
  const widths = WIDTHS.filter((w) => w < width - 40);
  for (const w of widths) {
    await sharp(src)
      .resize({ width: w })
      .webp({ quality: 76, effort: 6 })
      .toFile(path.join(DIR, `${name}-${w}.webp`));
  }
  const { dominant } = await sharp(src).stats();
  const blur = await sharp(src)
    .resize({ width: 16 })
    .webp({ quality: 40 })
    .toBuffer();
  manifest[name] = {
    width,
    height,
    widths,
    color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
  };
  console.log(
    `${name.padEnd(20)} ${width}x${height}  copies: ${widths.join(', ') || '-'}`,
  );
}

await fs.writeFile(
  'src/lib/photos.json',
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(`\nsrc/lib/photos.json: ${masters.length} photos`);

// Share image: the courtyard with a soft dark foot for legibility in link previews.
await sharp(path.join(DIR, 'courtyard.webp'))
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .composite([
    {
      input: Buffer.from(
        `<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stop-color="#1a1311" stop-opacity="0"/>
          <stop offset="1" stop-color="#1a1311" stop-opacity="0.75"/></linearGradient></defs>
          <rect width="1200" height="630" fill="url(#g)"/></svg>`,
      ),
    },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og.jpg');
console.log('public/og.jpg');
