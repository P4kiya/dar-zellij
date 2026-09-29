// One-time import of the restaurant's own photos from marrakech-riads.com (the current Dar Zellij
// page and its media library). Originals are cached in .cache/originals (git-ignored); the masters
// written to public/images are what the site uses. Run `npm run images` afterwards for the smaller
// copies and the manifest.
//
// - The 2023 shoot was uploaded as 1642x960 triptychs (three portrait photos side by side). They are
//   split back into single photos at the seams (found by comparing neighbouring pixel columns).
// - The 2018 photos were heavily HDR-processed; `grade: 'calm'` takes some saturation out and adds a
//   little contrast so they sit with the newer photos.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const BASE = 'https://marrakech-riads.com/wp-content/uploads/';
const CACHE = '.cache/originals';
const OUT = 'public/images';

// Seams (x) of the triptychs; each panel is cut a few pixels inside them.
const INSET = 3;
const panel = (from, to) => ({ left: from + INSET, right: to - INSET });

const PHOTOS = [
  // Single photos.
  // The hero: first thing on screen, so a little lighter (quality 80).
  {
    name: 'courtyard',
    src: '2018/08/Dar-Zellij-8-1.jpg',
    grade: 'calm',
    quality: 80,
  },
  // Upright phones only see a strip of the hero, so they get just that strip (around the red alcove).
  {
    name: 'courtyard-portrait',
    src: '2018/08/Dar-Zellij-8-1.jpg',
    grade: 'calm',
    crop: { left: 560, right: 1300 },
    quality: 76,
  },
  { name: 'patio', src: '2023/02/zellij10.png' },
  { name: 'rooftop-view', src: '2023/02/zellij9.png' },
  { name: 'salon-fireplace', src: '2018/08/zelij6.jpg', grade: 'calm' },
  { name: 'rooftop-dusk', src: '2018/08/zelij7.jpg', grade: 'calm' },
  { name: 'rooftop-tent', src: '2018/08/zelij3.jpg', grade: 'calm' },
  { name: 'curtains', src: '2018/08/zelij5.jpg', grade: 'calm' },
  { name: 'carved-door', src: '2018/08/zelij17.jpg', grade: 'calm' },
  { name: 'patio-red', src: '2018/08/zelij15.jpg', grade: 'calm' },
  { name: 'rooftop-waiter', src: '2018/08/zelij19.jpg', grade: 'calm' },
  { name: 'dar-cherifa', src: '2018/08/Dar-Cherifa-9-1.jpg', grade: 'calm' },
  { name: 'dar-bensouda', src: '2018/08/Bensouda-2-1.jpg', grade: 'calm' },

  // Triptych panels (2023 shoot). Seams: ZELLIJ-1 541/1112, zellij2 546/1103, zellij3 515/1103,
  // zellij4 510/1134, zellij5 570/1132, zellij12 572/1140 (its middle panel is a text notice).
  { name: 'alcove-table', src: '2023/02/ZELLIJ-1.png', crop: panel(0, 541) },
  { name: 'tea-pour', src: '2023/02/ZELLIJ-1.png', crop: panel(541, 1112) },
  { name: 'wine-petals', src: '2023/02/ZELLIJ-1.png', crop: panel(1112, 1642) },
  { name: 'waiter-tray', src: '2023/02/zellij2.png', crop: panel(0, 546) },
  {
    name: 'couscous-tfaya',
    src: '2023/02/zellij2.png',
    crop: panel(546, 1103),
  },
  {
    name: 'alcove-service',
    src: '2023/02/zellij2.png',
    crop: panel(1103, 1642),
  },
  { name: 'terrace-cactus', src: '2023/02/zellij3.png', crop: panel(0, 515) },
  { name: 'tagine-prunes', src: '2023/02/zellij3.png', crop: panel(515, 1103) },
  {
    name: 'alcove-salads',
    src: '2023/02/zellij3.png',
    crop: panel(1103, 1642),
  },
  { name: 'rose-wine', src: '2023/02/zellij4.png', crop: panel(0, 510) },
  { name: 'salads', src: '2023/02/zellij4.png', crop: panel(510, 1134) },
  {
    name: 'painted-ceiling',
    src: '2023/02/zellij4.png',
    crop: panel(1134, 1642),
  },
  { name: 'tagine-reveal', src: '2023/02/zellij5.png', crop: panel(0, 570) },
  { name: 'mojito', src: '2023/02/zellij5.png', crop: panel(570, 1132) },
  { name: 'red-salon', src: '2023/07/zellij12-jpg.webp', crop: panel(0, 572) },
  {
    name: 'waiter-plating',
    src: '2023/07/zellij12-jpg.webp',
    crop: panel(1140, 1642),
  },
];

async function original(src) {
  const file = path.join(CACHE, src.replaceAll('/', '_'));
  try {
    await fs.access(file);
  } catch {
    const res = await fetch(BASE + src, {
      headers: { 'user-agent': 'Mozilla/5.0 (dar-zellij photo import)' },
    });
    if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
    await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log('downloaded', src);
  }
  return file;
}

await fs.mkdir(CACHE, { recursive: true });
await fs.mkdir(OUT, { recursive: true });

for (const photo of PHOTOS) {
  const file = await original(photo.src);
  let img = sharp(file).flatten({ background: '#ffffff' });
  const { width, height } = await sharp(file).metadata();
  if (photo.crop) {
    img = img.extract({
      left: photo.crop.left,
      top: 0,
      width: Math.min(photo.crop.right, width) - photo.crop.left,
      height,
    });
  }
  if (photo.grade === 'calm') {
    img = img.modulate({ saturation: 0.8, brightness: 0.97 }).linear(1.06, -7);
  }
  const out = path.join(OUT, `${photo.name}.webp`);
  const info = await img
    .webp({ quality: photo.quality ?? 88, effort: 6 })
    .toFile(out);
  console.log(
    `${photo.name.padEnd(20)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`,
  );
}
