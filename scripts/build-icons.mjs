// Favicon (SVG + 32px ICO) and Apple touch icon from the restaurant's rosette (the path traced in
// src/components/brand.tsx), cream on the menu's wine red.
import fs from 'node:fs/promises';
import sharp from 'sharp';

const WINE = '#873f3f';
const CREAM = '#fffef7';

const brand = await fs.readFile('src/components/brand.tsx', 'utf8');
// Prettier (singleQuote) turns the path's double quotes into single ones and may wrap the line.
const rosette = brand.match(/const ROSETTE =\s*(["'])([^"']+)\1/)?.[2];
if (!rosette) throw new Error('Rosette path not found in brand.tsx');

// The rosette's 400-unit square, centred on a rounded tile with some breathing room.
const icon = (size, radius, pad) => {
  const scale = (size - pad * 2) / 400;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${WINE}"/><path transform="translate(${pad} ${pad}) scale(${scale.toFixed(4)})" d="${rosette}" fill="${CREAM}" fill-rule="evenodd"/></svg>`;
};

await fs.writeFile('public/icon.svg', icon(64, 14, 7));

await sharp(Buffer.from(icon(180, 0, 26)))
  .png()
  .toFile('public/apple-touch-icon.png');

// An .ico is a small header and directory entry followed by PNG data.
const png = await sharp(Buffer.from(icon(32, 7, 3)))
  .png()
  .toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // no palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
await fs.writeFile('public/favicon.ico', Buffer.concat([header, png]));

await fs.writeFile('public/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log(
  'public/icon.svg, public/favicon.ico, public/apple-touch-icon.png, public/robots.txt',
);
