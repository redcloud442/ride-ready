// Renders RideReady brand PNGs (logo mark, app icon, Android adaptive layers, splash) from SVG.
// Not a project dependency. Run from an empty temp dir:
//   npm i @resvg/resvg-js@2 && node <repo>/docs/brand/render-brand-assets.mjs ./out
// then copy out/*.png to apps/mobile/assets/images/ (logo-mark.png -> assets/images/brand/).
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';
const out = process.argv[2];
mkdirSync(out, { recursive: true });

// Brand mark on a 64-unit grid: a 240° gauge arc ("every kilometer") whose needle is a check ("ready").
const mark = (arc, check, sw = 6) => `
  <path d="M14.68 44 A20 20 0 1 1 49.32 44" fill="none" stroke="${arc}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M22.5 34.5 L29 41 L42.5 27.5" fill="none" stroke="${check}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#6B5E9C"/><stop offset="1" stop-color="#2E2650"/></linearGradient></defs>`;
// scale the 64 grid into a box of `size` centred in `canvas`
const place = (canvas, size, body) => {
  const s = size / 64, o = (canvas - size) / 2;
  return `<g transform="translate(${o} ${o}) scale(${s})">${body}</g>`;
};
const svg = (w, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}">${body}</svg>`;
const files = {
  // in-app logo: white arc + teal check, transparent
  'logo-mark.png': svg(512, place(512, 512, mark('#FFFFFF', '#5EEAD4'))),
  // iOS / store icon: full-bleed gradient, mark at 62%
  'icon.png': svg(1024, grad + `<rect width="1024" height="1024" fill="url(#g)"/>` + place(1024, 640, mark('#FFFFFF', '#5EEAD4'))),
  // Android adaptive: foreground inside the 66% safe zone; background is the gradient
  'android-icon-foreground.png': svg(1024, place(1024, 560, mark('#FFFFFF', '#5EEAD4'))),
  'android-icon-background.png': svg(1024, grad + `<rect width="1024" height="1024" fill="url(#g)"/>`),
  'android-icon-monochrome.png': svg(1024, place(1024, 560, mark('#FFFFFF', '#FFFFFF'))),
  // splash: mark on the splash background colour set in app.json
  'splash-icon.png': svg(1024, place(1024, 1024, mark('#FFFFFF', '#5EEAD4'))),
};
for (const [name, s] of Object.entries(files)) {
  writeFileSync(`${out}/${name}`, new Resvg(s, { fitTo: { mode: 'original' } }).render().asPng());
  console.log('wrote', name);
}
