// Builds the typeface JSON that three's FontLoader/TextGeometry need from a licensed font file (browser font files are not compatible).
// Usage: node scripts/make-typeface.mjs [weight]   (default 600). Keeps only the glyphs the title uses, so the file stays tiny.
import { readFileSync, writeFileSync } from 'node:fs';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';

const weight = process.argv[2] || '600';
const src = `node_modules/@fontsource/oxanium/files/oxanium-latin-${weight}-normal.woff`;
const keep = new Set(' AARONPKSHGDI'.split('')); // AARON PRAKASH / GANDI
const buf = readFileSync(src);
const font = new TTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
font.glyphs = Object.fromEntries(Object.entries(font.glyphs).filter(([ch]) => keep.has(ch)));
font.glyphs[' '] = { ha: 260, x_min: 0, x_max: 0, o: '' }; // the loader drops empty glyphs, but TextGeometry needs a space to lay out two words
const out =`src/three/fonts/oxanium-${weight}.json`;
writeFileSync(out, JSON.stringify(font));
console.log(out, Object.keys(font.glyphs).join(''), 'resolution', font.resolution, 'bytes', JSON.stringify(font).length);
