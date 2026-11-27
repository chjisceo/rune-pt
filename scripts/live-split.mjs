// Splits the trainer's single index.html into css/app.css + js/*.js without changing behaviour.
// Run it against a checkout of upvible/Rune-PT: node scripts/live-split.mjs ../Rune-PT
// It cuts only at the existing section comments, verifies the pieces join back to the original
// byte for byte, keeps them as classic <script> tags in the same order, and updates sw.js.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || '.');
const indexPath = path.join(dir, 'index.html');
if (!existsSync(indexPath)) throw new Error(`index.html not found in ${dir}`);
const html = readFileSync(indexPath, 'utf8');

if (html.includes('src="js/app.js"')) {
  console.log('[live-split] already split: index.html loads js/app.js. Nothing to do.');
  process.exit(0);
}

// 1. Stylesheet: the first <style> block.
const styleOpen = html.indexOf('<style>');
const styleClose = html.indexOf('</style>', styleOpen);
if (styleOpen < 0 || styleClose < 0) throw new Error('[live-split] <style> block not found');
const css = html.slice(styleOpen + '<style>'.length, styleClose);

// 2. Main script: the inline <script> that starts with the tier-core section comment.
const MARKS = [
  ['js/rune-tier-core.js', '/* ===== 티어 코어 (rune-tier-core.js) ===== */'],
  ['js/rune-routine.js', '/* ===== 루틴 엔진 (rune-routine.js) ===== */'],
  ['js/catalog.js', '/* ===== 종목 카탈로그 (catalog.js) ===== */'],
  ['js/app.js', '/* ===== 앱 ===== */'],
];
const first = html.indexOf(MARKS[0][1]);
if (first < 0) throw new Error('[live-split] tier-core section comment not found');
const scriptOpen = html.lastIndexOf('<script>', first);
const scriptClose = html.indexOf('</script>', first);
const body = html.slice(scriptOpen + '<script>'.length, scriptClose);
const lead = body.slice(0, body.indexOf(MARKS[0][1]));
if (lead.trim()) throw new Error('[live-split] unexpected code before the tier-core comment');

const at = MARKS.map(([, m]) => {
  const i = body.indexOf(m);
  if (i < 0) throw new Error(`[live-split] section comment not found: ${m}`);
  return i;
});
for (let k = 1; k < at.length; k++) if (at[k] <= at[k - 1]) throw new Error('[live-split] section comments are out of order');
const pieces = MARKS.map(([file], k) => [file, body.slice(at[k], k + 1 < at.length ? at[k + 1] : body.length)]);
if (lead + pieces.map((p) => p[1]).join('') !== body) throw new Error('[live-split] pieces do not join back to the original script');

// 3. Rewrite index.html: same positions, same order, classic scripts.
const tags = pieces.map(([file]) => `<script src="${file}"></script>`).join('\n');
const out = html.slice(0, styleOpen) + '<link rel="stylesheet" href="css/app.css">' +
  html.slice(styleClose + '</style>'.length, scriptOpen) + tags + html.slice(scriptClose + '</script>'.length);

// 4. Verify: rebuilding the old file from the new files gives the original bytes.
const rebuilt = out
  .replace('<link rel="stylesheet" href="css/app.css">', `<style>${css}</style>`)
  .replace(tags, `<script>${lead}${pieces.map((p) => p[1]).join('')}</script>`);
if (rebuilt !== html) throw new Error('[live-split] verification failed: the split files do not rebuild the original');

mkdirSync(path.join(dir, 'css'), { recursive: true });
mkdirSync(path.join(dir, 'js'), { recursive: true });
writeFileSync(path.join(dir, 'css/app.css'), css);
for (const [file, text] of pieces) writeFileSync(path.join(dir, file), text);
writeFileSync(indexPath, out);

// 5. Service worker: cache the new files, drop entries that do not exist, bump the version.
const swPath = path.join(dir, 'sw.js');
if (existsSync(swPath)) {
  let sw = readFileSync(swPath, 'utf8');
  sw = sw.replace(/const SHELL = \[([^\]]*)\];/, (_, list) => {
    const items = list.split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean)
      .filter((f) => f === './' || existsSync(path.join(dir, f)));
    for (const f of ['css/app.css', ...pieces.map((p) => p[0])]) if (!items.includes(f)) items.push(f);
    return `const SHELL = [${items.map((f) => `'${f}'`).join(', ')}];`;
  });
  sw = sw.replace(/const V = '([^']*?)v(\d+)([^']*)';/, (_, a, n, b) => `const V = '${a}v${Number(n) + 1}${b}';`);
  writeFileSync(swPath, sw);
}

const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)}KB`;
console.log(`[live-split] index.html ${kb(html)} -> ${kb(out)}`);
console.log(`[live-split] css/app.css ${kb(css)}`);
for (const [file, text] of pieces) console.log(`[live-split] ${file} ${kb(text)}`);
console.log('[live-split] verified: the new files rebuild the original index.html byte for byte');
