// Drives apps/live/dist in the installed Chrome: guest login, onboarding, member tabs,
// 3D dialog, trainer tabs. Fails on page errors or missing screens.
// Usage: node scripts/live-smoke.mjs [screenshot-dir]
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (shots) mkdirSync(shots, { recursive: true });
const PORT = 4179;
const BASE = `http://localhost:${PORT}/`;
const CHROME = process.env.CHROME_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find((p) => existsSync(p));

const server = spawn(process.execPath, [path.join(root, 'scripts/live-serve.mjs'), String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 400));

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
async function run(viewport, theme, label) {
  const ctx = await browser.newContext({ viewport, colorScheme: theme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('request', (r) => requests.push(r.url()));
  const snap = async (name) => { if (shots) await page.screenshot({ path: path.join(shots, `${label}-${name}.png`), fullPage: false }); };
  const act = (sel) => page.locator(sel).first().click();

  await page.goto(BASE);
  await page.waitForSelector('.pa-auth');
  check(await page.locator('.pa-auth h1').innerText() === '오늘 한 세트가 숙련도가 돼요', `${label}: login headline`);
  check(await page.locator('.btn.kk').count() === 1, `${label}: one kakao button`);
  await snap('01-login');
  check(!requests.some((u) => u.endsWith('.glb') || u.includes('muscle-viewer')), `${label}: no 3D files before login`);

  await act('[data-act="guest"]');
  await page.waitForSelector('.pa-ob');
  check(await page.locator('.pa-ob > .pn:not([hidden])').count() === 1, `${label}: onboarding shows one question`);
  await snap('02-onboard');
  const next = () => act('#pa-ob-next');
  await page.fill('[data-pf="age"]', '34'); await next();
  await act('[data-act="ob"][data-k="sex"][data-v="M"]'); await next();
  await page.fill('[data-pf="h"]', '172'); await page.fill('[data-pf="w"]', '68.5'); await next();
  await act('[data-act="ob"][data-k="exp"]'); await next();
  await act('[data-act="ob"][data-k="interests"]'); await next();
  await act('[data-act="ob"][data-k="injuries"][data-v="없음"]');
  check(await page.locator('#obgo').isVisible(), `${label}: last step shows finish`);
  await act('#obgo');
  await page.waitForSelector('[data-act="enter"][data-v="member"]');
  await act('[data-act="enter"][data-v="member"]');

  await page.waitForSelector('.pa-today');
  const tabs = await page.locator('#nav button').allInnerTexts();
  check(JSON.stringify(tabs.map((t) => t.trim())) === JSON.stringify(['오늘', '달력', '통계', '내 정보']), `${label}: member tabs ${tabs.join('/')}`);
  check(await page.locator('.pa-gifts').count() === 1, `${label}: gifts on today`);
  await snap('03-today-empty');

  // 운동 담기: 검색해서 첫 결과를 올려요
  await page.fill('#fq', '벤치');
  await page.waitForTimeout(300);
  const add = page.locator('#fqr [data-act="fqadd"]').first();
  // 원본은 담기 직후 0.5초 동안 실수 탭을 막아요.
  if (await add.count()) { await add.click(); await page.waitForTimeout(800); }
  check(await page.locator('.pa-mus-list li').count() >= 1, `${label}: muscle card lists exercise`);
  await snap('04-today');

  await act('.frl [data-act="slot"]');
  await page.waitForSelector('#md.on .pa-recmus');
  check(true, `${label}: set sheet has muscle row`);
  await snap('05-sheet');
  await act('#md .pa-recmus [data-act="pa3d"]');
  await page.waitForSelector('.pa-dlg canvas', { timeout: 20000 });
  await page.waitForFunction(() => { const m = document.querySelector('.pa-stage-msg'); return m && (m.hidden || m.classList.contains('err')); }, null, { timeout: 60000 });
  check(!(await page.locator('.pa-stage-msg.err').count()), `${label}: 3D model loaded`);
  await page.waitForTimeout(600);
  await snap('06-3d');
  await page.keyboard.press('Escape');
  check(!(await page.locator('.pa-dlg').count()), `${label}: Esc closes dialog`);
  await act('#md [data-act="close"]');
  await page.waitForTimeout(300);

  // 원본 동작이 그대로인지: 세트 완료 체크, 오늘 기록 저장, 선물함, 성적표
  await act('.frl [data-act="slot"]');
  await page.waitForSelector('#md.on');
  await act('#md [data-act="sck"]');
  await page.waitForTimeout(300);
  await act('#md [data-act="close"]');
  await page.waitForTimeout(300);
  check(/1\/3세트/.test(await page.locator('.frl').first().innerText()), `${label}: set check is saved`);
  await act('[data-act="save"]');
  await page.waitForTimeout(400);
  const stored = await page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('rpt1')); return Object.keys(s.sessions || {}).length; } catch (e) { return -1; } });
  check(stored >= 1, `${label}: today record stored in rpt1`);
  if (await page.locator('#md.on').count()) await page.keyboard.press('Escape');
  await page.evaluate(() => { if (document.querySelector('#md.on')) closeM(); });
  await act('.pa-gifts');
  await page.waitForSelector('#md.on');
  await page.evaluate(() => closeM());

  for (const [v, sel, title] of [['cal', '#app', '달력'], ['stat', '#app', '통계'], ['me', '.pa-avatar', '내 정보']]) {
    await act(`#nav [data-v="${v}"]`);
    await page.waitForSelector(sel);
    check((await page.locator('#app h1').first().innerText()).trim() === title, `${label}: ${v} title is ${title}`);
    await snap(`07-${v}`);
  }

  await act('[data-act="servers"]');
  await act('[data-act="enter"][data-v="admin"]');
  await page.waitForSelector('body.pa-admin');
  check((await page.locator('#nav button .pa-i').count()) === 6, `${label}: trainer tabs keep six with icons`);
  await snap('08-trainer');
  for (const v of ['day', 'quest', 'mem', 'rec', 'cat']) { await act(`#nav [data-v="${v}"]`); await page.waitForTimeout(150); }
  await snap('09-trainer-cat');

  check(errors.length === 0, `${label}: no page errors${errors.length ? ' -> ' + errors.slice(0, 3).join(' | ') : ''}`);
  await ctx.close();
}

try {
  await run({ width: 390, height: 844 }, 'dark', 'm-dark');
  await run({ width: 1440, height: 900 }, 'light', 'd-light');
  await run({ width: 1440, height: 900 }, 'dark', 'd-dark');
} catch (e) {
  failures.push(String(e));
  console.error(e);
} finally {
  await browser.close();
  server.kill();
}
if (failures.length) { console.error(`\n${failures.length} check(s) failed`); process.exit(1); }
console.log('\nall live checks passed');
