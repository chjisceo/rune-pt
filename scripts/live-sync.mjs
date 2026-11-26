// Pulls the trainer's live app (upvible/Rune-PT main) into apps/live/upstream/ verbatim.
// Usage: node scripts/live-sync.mjs [git-ref]
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'https://github.com/upvible/Rune-PT.git';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'apps/live/upstream');
const ref = process.argv[2] || 'main';

const tmp = mkdtempSync(path.join(tmpdir(), 'rune-upstream-'));
try {
  execFileSync('git', ['clone', '--quiet', '--depth', '1', '--branch', ref, REPO, tmp], { stdio: 'inherit' });
  const sha = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD']).toString().trim();
  const date = execFileSync('git', ['-C', tmp, 'log', '-1', '--format=%cI']).toString().trim();
  rmSync(path.join(tmp, '.git'), { recursive: true, force: true });
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  cpSync(tmp, dest, { recursive: true });
  writeFileSync(
    path.join(root, 'apps/live/UPSTREAM.json'),
    JSON.stringify({ repo: 'upvible/Rune-PT', ref, sha, committedAt: date, syncedAt: new Date().toISOString() }, null, 2) + '\n',
  );
  console.log(`apps/live/upstream <- upvible/Rune-PT@${sha.slice(0, 7)} (${date})`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
