// Serves the scene to headless Chrome and saves one transparent WebP per vehicle style / powertrain.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import * as mdi from '@mdi/js';
import puppeteer from 'puppeteer-core';

const root = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const out = process.argv[2] ?? join(root, 'out');
mkdirSync(out, { recursive: true });

const html = `<!doctype html><html><body style="margin:0;background:transparent">
<canvas id="c"></canvas>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module" src="/scene.js"></script></body></html>`;
const types = { '.js': 'text/javascript' };
const server = createServer((req, res) => {
  if (req.url === '/') return res.end(html);
  try {
    res.setHeader('content-type', types[extname(req.url)] ?? 'application/octet-stream');
    res.end(readFileSync(join(root, decodeURIComponent(req.url))));
  } catch {
    res.statusCode = 404;
    res.end();
  }
}).listen(0);
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()));
await page.setViewport({ width: 1000, height: 625 });
await page.goto(`http://localhost:${port}/`);
await page.waitForFunction('window.ready === true', { timeout: 30000 });
// optional realistic car pack (see README); procedural cars are the fallback
if (process.env.CAR_PACK) await page.evaluate((u) => window.loadPack(u), process.env.CAR_PACK);

const icons = { gasoline: 1, diesel: 1, hybrid: 1, phev: 1, ev: 1 };
const only = process.env.ONLY?.split(',');
const jobs = ['sedan', 'hatchback', 'suv', 'pickup', 'van', 'coupe', 'sport', 'cruiser', 'scooter', 'adventure', ...Object.keys(icons)];
const mdiPaths = Object.fromEntries(['mdiGasStation', 'mdiBarrel', 'mdiLeaf', 'mdiEvPlugType2', 'mdiLightningBolt'].map((k) => [k, mdi[k]]));

// paint options (keep in sync with paint.py and core VEHICLE_COLORS): <style>-<colour>.webp per vehicle
const COLOURS = { white: 0xecece8, silver: 0x8a8e96, graphite: 0x4e525a, black: 0x16161a, red: 0xaa181e, blue: 0x1c46a0, green: 0x225c3c, beige: 0xc4b08c };
const packDir = process.env.CAR_PACK?.replace(/\/[^/]*$/, '');
const canvas = await page.$('#c');
const shot = (file) => canvas.screenshot({ path: join(out, file), type: 'webp', quality: 86, omitBackground: true });
for (const name of only ?? jobs) {
  const isIcon = name in icons;
  for (const colour of isIcon ? [null] : [null, ...Object.keys(COLOURS)]) {
    if (!isIcon) await page.evaluate((n, c, d) => window.applyPaint(n, c, d), name, colour && { name: colour, hex: COLOURS[colour] }, packDir);
    await page.evaluate((n, p) => window.renderJob(n, p), name, mdiPaths);
    await shot(colour ? `${name}-${colour}.webp` : `${name}.webp`);
  }
  console.log('rendered', name, isIcon ? '(icon)' : '');
}
await browser.close();
server.close();
