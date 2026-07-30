/**
 * One-off asset pipeline step.
 *
 * The original project shipped its cubemap as six ~500KB JavaScript files that
 * each assigned a base64 data URL to a global. That costs ~33% in base64
 * overhead, blocks parsing, and can't be cached as an image. This decodes them
 * back into real PNGs under src/public/skybox/ so the browser can fetch them in
 * parallel and cache them normally.
 *
 * Run with: node scripts/decode-skybox.js
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'legacy', 'lib', 'skyboxAssets');
const outDir = join(root, 'src', 'public', 'skybox');

const faces = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'];

mkdirSync(outDir, { recursive: true });

for (const face of faces) {
  const jsPath = join(srcDir, `nvlobby_new_${face}.png.js`);
  const contents = readFileSync(jsPath, 'utf8');

  const match = contents.match(/base64,([A-Za-z0-9+/=\s]+)/);
  if (!match) {
    throw new Error(`No base64 payload found in ${jsPath}`);
  }

  const base64 = match[1].replace(/\s/g, '');
  const png = Buffer.from(base64, 'base64');
  const outPath = join(outDir, `${face}.png`);

  writeFileSync(outPath, png);
  console.log(`${face}.png  ${(png.length / 1024).toFixed(0)} KB`);
}

console.log(`\nWrote ${faces.length} faces to src/public/skybox/`);
