#!/usr/bin/env node
// boardroom stability aggregator — measures DECISION VARIANCE across repeated runs.
//
// The primary reliability metric for an LLM review board is not accuracy, it's
// *consistency*: does the same project get the same DECISION run to run? Single-run
// LLM verdicts are near-arbitrary (same-verdict rate falls to ~70% at temperature 1;
// see "Rating Roulette", arXiv:2510.27106). A board you can trust must first be stable.
//
// Usage:
//   1. node eval/run.mjs            (or save reports by hand to eval/runs/<fixture>/run-<k>.md)
//   2. node eval/aggregate.mjs [runsDir]     (default: eval/runs next to this script)
//
// It reads the machine-readable ```yaml summary block from every report and reports,
// per fixture: the decision distribution, the modal decision, a STABILITY score
// (modal share, 1.0 = never flipped), the risk_score spread, whether the modal decision
// matches eval/expected.json (accuracy — secondary), and the mean cost per run from
// eval/runs/costs.jsonl when present. No dependencies.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const runsDir = process.argv[2] ?? join(here, 'runs');

if (!existsSync(runsDir)) {
  console.error(`No runs directory at "${runsDir}".`);
  console.error('Run `node eval/run.mjs` first — see eval/METHODOLOGY.md.');
  process.exit(1);
}

const expectedFile = join(here, 'expected.json');
const expected = existsSync(expectedFile) ? JSON.parse(readFileSync(expectedFile, 'utf8')) : {};

// Mean cost per run, per fixture, from the runner's log.
const costs = {};
const costFile = join(runsDir, 'costs.jsonl');
if (existsSync(costFile)) {
  for (const line of readFileSync(costFile, 'utf8').split('\n').filter(Boolean)) {
    const c = JSON.parse(line);
    if (typeof c.cost_usd !== 'number') continue;
    (costs[c.fixture] ??= []).push(c.cost_usd);
  }
}

// Pull decision / confidence / risk_score out of the report's ```yaml summary block.
// Falls back to scanning the whole file if no fenced yaml block is present.
function parseReport(text) {
  const fenced = text.match(/```ya?ml\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const field = (name) => {
    const m = body.match(new RegExp(`^\\s*${name}:\\s*([^\\n#]+)`, 'im'));
    return m ? m[1].trim() : null;
  };
  const decision = field('decision');
  const stage = field('stage');
  const confidence = field('confidence');
  const riskRaw = field('risk_score');
  const risk = riskRaw != null && /^\d+$/.test(riskRaw) ? Number(riskRaw) : null;
  return { decision, stage, confidence, risk };
}

function modal(arr) {
  const counts = {};
  for (const v of arr) counts[v ?? 'MISSING'] = (counts[v ?? 'MISSING'] || 0) + 1;
  let best = null, bestN = -1;
  for (const [k, n] of Object.entries(counts)) if (n > bestN) { best = k; bestN = n; }
  return { counts, modal: best, modalN: bestN };
}

const fixtures = readdirSync(runsDir).filter((d) => statSync(join(runsDir, d)).isDirectory());
if (fixtures.length === 0) {
  console.error(`"${runsDir}" has no fixture subfolders. Expected eval/runs/<fixture>/run-*.md`);
  process.exit(1);
}

const rows = [];
let stabilitySum = 0;

for (const fx of fixtures.sort()) {
  const dir = join(runsDir, fx);
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const parsed = files.map((f) => parseReport(readFileSync(join(dir, f), 'utf8')));
  const n = parsed.length;
  if (n === 0) continue;

  const decisions = parsed.map((p) => p.decision);
  const { counts, modal: modalDecision, modalN } = modal(decisions);
  const stability = modalN / n; // share of runs landing on the modal decision
  stabilitySum += stability;

  const risks = parsed.map((p) => p.risk).filter((x) => x != null);
  const riskMean = risks.length ? (risks.reduce((a, b) => a + b, 0) / risks.length).toFixed(0) : '—';
  const riskSpread = risks.length ? `${Math.min(...risks)}–${Math.max(...risks)}` : '—';
  const dist = Object.entries(counts).map(([k, v]) => `${k}×${v}`).join(' ');

  // Stage the board judged against. More than one value means stage inference itself
  // wobbled — pin it with --stage so decision variance measures the board's judgement.
  const stageCounts = modal(parsed.map((p) => p.stage)).counts;
  const stageDist = Object.entries(stageCounts).map(([k, v]) => `${k}×${v}`).join(' ');
  const stageWobble = Object.keys(stageCounts).length > 1;

  // Accuracy (secondary): is the modal decision one of the expected ones?
  const exp = expected[fx]?.expected ?? null;
  const correct = exp ? exp.includes(modalDecision) : null;

  const c = costs[fx];
  const cost = c?.length ? `$${(c.reduce((a, b) => a + b, 0) / c.length).toFixed(2)} mean over ${c.length} run(s)` : '—';

  rows.push({ fx, n, modalDecision, stability, riskMean, riskSpread, dist, stageDist, stageWobble, exp, correct, cost });
}

const overall = rows.length ? stabilitySum / rows.length : 0;
const judged = rows.filter((r) => r.correct !== null);
const accurate = judged.filter((r) => r.correct).length;

// ---- report ----
const pct = (x) => `${(x * 100).toFixed(0)}%`;
console.log('\nboardroom decision-stability report');
console.log('='.repeat(72));
for (const r of rows) {
  console.log(`\n${r.fx}   (${r.n} runs)`);
  console.log(`  modal decision : ${r.modalDecision}`);
  console.log(`  STABILITY      : ${pct(r.stability)}   ${r.stability < 1 ? '⚠ decision flipped between runs' : 'never flipped'}`);
  console.log(`  distribution   : ${r.dist}`);
  console.log(`  stage          : ${r.stageDist}${r.stageWobble ? '   ⚠ stage varied — pin it with --stage' : ''}`);
  console.log(`  risk_score     : mean ${r.riskMean}, spread ${r.riskSpread}`);
  if (r.exp) console.log(`  expected       : ${r.exp.join(' or ')}   ${r.correct ? '✓ modal decision matches' : '✗ modal decision does NOT match'}`);
  console.log(`  cost           : ${r.cost}`);
}
console.log('\n' + '='.repeat(72));
console.log(`OVERALL DECISION STABILITY: ${pct(overall)}  (mean modal-share across ${rows.length} fixtures)`);
console.log('Primary metric — higher = more reliable. A fixture < 100% means the board\ngave the same project different verdicts on different runs.');
if (judged.length) console.log(`ACCURACY (secondary): ${accurate}/${judged.length} fixtures where the modal decision matches eval/expected.json`);
console.log('');
