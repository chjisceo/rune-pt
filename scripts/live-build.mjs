// Builds the integrated app: trainer's upstream files + Path A overlay -> apps/live/dist/.
// Upstream files stay byte-for-byte except the small, asserted patches below.
import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const live = path.join(root, 'apps/live');
const upstream = path.join(live, 'upstream');
const overlay = path.join(live, 'overlay');
const dist = path.join(live, 'dist');
const webPublic = path.join(root, 'apps/web/public');

// Overlay files that only fill gaps: if the trainer adds their own, theirs wins.
const FILL_ONLY = new Set(['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']);

// Each step is [label, find, replace, done]. `done` marks a step the upstream already carries
// (e.g. after the trainer adopts these files), so re-syncing never applies a patch twice.
function patch(file, steps) {
  const p = path.join(dist, file);
  let text = readFileSync(p, 'utf8');
  for (const [label, find, replace, done] of steps) {
    if (done && text.includes(done)) continue;
    const hit = typeof find === 'string' ? text.includes(find) : find.test(text);
    if (!hit) throw new Error(`[live-build] ${file}: anchor for "${label}" not found. Upstream changed; update scripts/live-build.mjs.`);
    text = text.replace(find, replace);
  }
  writeFileSync(p, text);
}

if (!existsSync(upstream)) throw new Error('apps/live/upstream is missing. Run: npm run live:sync');
rmSync(dist, { recursive: true, force: true });
cpSync(upstream, dist, { recursive: true });

cpSync(overlay, dist, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(overlay, src);
    return !(FILL_ONLY.has(rel) && existsSync(path.join(upstream, rel)));
  },
});

cpSync(path.join(webPublic, 'draco'), path.join(dist, 'draco'), { recursive: true });
const glb = path.join(webPublic, 'models/stayfit-muscle-skeleton.glb');
if (existsSync(glb)) {
  mkdirSync(path.join(dist, 'models'), { recursive: true });
  cpSync(glb, path.join(dist, 'models/stayfit-muscle-skeleton.glb'));
} else {
  console.warn('[live-build] models/stayfit-muscle-skeleton.glb is missing; the 3D dialog will show names only. See README.');
}

await build({
  entryPoints: [path.join(live, 'src/muscle-viewer.js')],
  outfile: path.join(dist, 'ui/muscle-viewer.js'),
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'eof',
  logLevel: 'warning',
});

patch('index.html', [
  ['overlay stylesheet', '</head>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap">\n<link rel="stylesheet" href="ui/path-a.css">\n</head>', 'href="ui/path-a.css"'],
  ['overlay script', /<script>\s*if\('serviceWorker' in navigator\)/,
    (m) => `<script src="ui/path-a.js"></script>\n${m}`, 'src="ui/path-a.js"'],
  ['avatar postMessage origin', "f.contentWindow.postMessage(avatarState(),'*')",
    'f.contentWindow.postMessage(avatarState(),location.origin)', 'postMessage(avatarState(),location.origin)'],
]);

patch('avatar/avatar.html', [
  ['avatar message origin check', "var d=e.data;if(!d||d.type!=='rune-state')return;",
    "if(e.origin!==location.origin||e.source!==window.parent)return;var d=e.data;if(!d||d.type!=='rune-state')return;", 'e.origin!==location.origin'],
  ['avatar ready origin', "window.parent.postMessage({type:'rune-ready'},'*')",
    "window.parent.postMessage({type:'rune-ready'},location.origin)", "{type:'rune-ready'},location.origin"],
]);

patch('sw.js', [
  ['cache version', /const V = '([^']+)';/, (_, v) => `const V = '${v}-pa1';`, "-pa1';"],
  ['shell files', /const SHELL = \[([^\]]*)\];/,
    (_, list) => `const SHELL = [${list}, 'ui/path-a.css', 'ui/path-a.js'];`, "'ui/path-a.js'"],
]);

const up = JSON.parse(readFileSync(path.join(live, 'UPSTREAM.json'), 'utf8'));
writeFileSync(path.join(dist, 'ui/build.json'), JSON.stringify({ upstream: up.sha, builtAt: new Date().toISOString() }) + '\n');
console.log(`[live-build] apps/live/dist ready (upstream ${up.sha.slice(0, 7)})`);
