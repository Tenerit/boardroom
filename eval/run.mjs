#!/usr/bin/env node
// boardroom eval runner — runs the board headless on each fixture, N times.
//
// Each run reviews a fresh copy of the fixture in a neutral temp folder (its own git
// history, no "eval" or "fixture" in the path), with the fixture's stage pinned, so
// nothing the board reads gives the expected answer away. Expected outcomes live in
// eval/expected.json, outside the reviewed folders.
//
// Usage:
//   node eval/run.mjs --dry-run            # show what would run and the estimated cost
//   node eval/run.mjs                      # every fixture, 5 runs each, --light
//   node eval/run.mjs --only paykit --runs 2 --depth standard
//
// Needs `claude` on PATH, logged in (`claude auth status`), and the boardroom plugin
// installed. Runs are appended: eval/runs/<fixture>/run-<k>.md (the report) and
// eval/runs/costs.jsonl (decision, cost, duration). Then: node eval/aggregate.mjs

import { spawnSync } from 'node:child_process';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync,
  readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const runs = Number(opt('runs', 5));
const depth = opt('depth', 'light');
const only = opt('only', null)?.split(',');
const dryRun = args.includes('--dry-run');

// Measured on the first real run (v0.11.0, --light, 3 hats on Opus): $0.81 per run.
// Only used for the --dry-run estimate; standard/deep seat more hats and cost more.
const USD_PER_LIGHT_RUN = 0.81;

const expected = JSON.parse(readFileSync(join(here, 'expected.json'), 'utf8'));
const fixtures = Object.keys(expected).filter((f) => !f.startsWith('_') && (!only || only.includes(f)));
if (fixtures.length === 0) {
  console.error(`No fixture matches --only ${only}. Known: ${Object.keys(expected).filter((f) => !f.startsWith('_')).join(', ')}`);
  process.exit(1);
}

// The eval session must match boardroom's default promise: read-only, no project code
// executed, no network. `--allowedTools` alone is NOT enough — it adds to the user's own
// permissions (an `auto` mode or `Bash(npm *)` allow rule let the chair run `npm view`
// on the first real run). So:
//   --restricted        drops code-running tools and WebFetch, ignores user/project
//                       settings (their allow rules and permission mode), and confines
//                       file tools to the working directory;
//   --strict-mcp-config no MCP servers;
//   --tools             only Read/Grep/Glob/Agent — no Bash at all: even "read-only"
//                       allow rules leak (`find -exec`, `git -c alias.x='!sh …'`), and
//                       an untrusted repo can try to steer the reviewer into using them;
//   --plugin-dir        loads boardroom from this repo (user settings, where plugins
//                       are enabled, are ignored) — so the eval tests the working tree;
//   --settings          hooks off, so user hooks can't rewrite what the board sees.
const settingsDir = mkdtempSync(join(tmpdir(), 'br-settings-'));
const settingsFile = join(settingsDir, 'settings.json');
writeFileSync(settingsFile, JSON.stringify({ disableAllHooks: true }));
const pluginDir = join(here, '..');
const tools = 'Read,Grep,Glob,Agent';

function runClaude(cwd, prompt) {
  const argv = ['-p', prompt, '--output-format', 'json',
    '--restricted', '--strict-mcp-config', '--settings', settingsFile, '--plugin-dir', pluginDir,
    '--tools', tools, '--allowedTools', ...tools.split(',')];
  if (argv.some((a) => a.includes('"'))) throw new Error('unexpected quote in an argument');
  // shell: true so Windows resolves the npm `claude.cmd` shim; every argument is quoted.
  const cmd = ['claude', ...argv.map((a) => `"${a}"`)].join(' ');
  const r = spawnSync(cmd, {
    cwd, shell: true, encoding: 'utf8', timeout: 20 * 60_000, maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) throw r.error;
  try {
    return JSON.parse(r.stdout);
  } catch {
    throw new Error(`claude did not return JSON (exit ${r.status}): ${(r.stderr || r.stdout).slice(0, 400)}`);
  }
}

// A fresh copy in a neutral folder, with one commit so git facts exist like in a real repo.
function neutralCopy(name) {
  const root = mkdtempSync(join(tmpdir(), 'proj-'));
  const dest = join(root, name);
  cpSync(join(here, 'fixtures', name), dest, { recursive: true });
  const git = (...a) => spawnSync('git', ['-c', 'user.name=dev', '-c', 'user.email=dev@localhost', ...a], { cwd: dest });
  git('init', '-q');
  git('add', '-A');
  git('commit', '-q', '-m', 'initial');
  return { root, dest };
}

const nextIndex = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => /^run-\d+\.md$/.test(f)).length + 1 : 1;

const total = fixtures.length * runs;
console.log(`boardroom eval: ${fixtures.join(', ')} × ${runs} run(s), --${depth} → ${total} run(s)`);
if (depth === 'light') console.log(`estimated cost ≈ $${(total * USD_PER_LIGHT_RUN).toFixed(2)} API-equivalent (quota on a subscription)`);
else console.log('estimated cost: higher than --light (more hats per run)');

let spent = 0;
const outRoot = join(here, 'runs');
for (const fx of fixtures) {
  const { stage } = expected[fx];
  const prompt = `/boardroom:review --${depth} --stage=${stage}`;
  const outDir = join(outRoot, fx);
  const start = nextIndex(outDir);
  for (let k = start; k < start + runs; k++) {
    const { root, dest } = neutralCopy(fx);
    const label = `${fx} run-${k}`;
    if (dryRun) {
      console.log(`[dry-run] ${label}: cd ${dest} && claude -p "${prompt}" …`);
      rmSync(root, { recursive: true, force: true });
      continue;
    }
    process.stdout.write(`${label} … `);
    let j;
    try {
      j = runClaude(dest, prompt);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
    if (j.is_error) {
      console.log(`\nERROR: ${j.result}`);
      console.log('Stopped. Fix the cause (e.g. `claude auth login`), then re-run — runs are appended.');
      process.exit(1);
    }
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, `run-${k}.md`), j.result ?? '');
    const decision = (j.result?.match(/^\s*decision:\s*([A-Z_]+)/m) ?? [])[1] ?? null;
    spent += j.total_cost_usd ?? 0;
    // What the board tried and was refused (e.g. running code, network lookups) — worth
    // reading: it shows where the chair reaches beyond the read-only promise.
    const denied = (j.permission_denials ?? []).map((d) =>
      `${d.tool_name}:${JSON.stringify(d.tool_input?.command ?? d.tool_input ?? '').slice(0, 80)}`);
    appendFileSync(join(outRoot, 'costs.jsonl'), JSON.stringify({
      fixture: fx, run: k, depth, stage, decision,
      cost_usd: j.total_cost_usd, duration_ms: j.duration_ms, denied, at: new Date().toISOString(),
    }) + '\n');
    console.log(`${decision ?? 'NO DECISION'}  $${(j.total_cost_usd ?? 0).toFixed(2)}${denied.length ? `  (${denied.length} denied)` : ''}`);
  }
}
rmSync(settingsDir, { recursive: true, force: true });
if (!dryRun) console.log(`\ndone — $${spent.toFixed(2)} API-equivalent. Next: node eval/aggregate.mjs`);
