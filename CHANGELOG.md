# Changelog

All notable changes to boardroom. Format follows [Keep a Changelog](https://keepachangelog.com);
this project uses [semantic versioning](https://semver.org).

## [0.7.0] — 2026-06-19
### Added — governance / decision-grade output (the moat, not new hats)
- **"Flips to … if"** — every non-SHIP decision now states the single thing that
  would change the verdict. A reader who gets NOT YET immediately wants "what do I
  do to get SHIP?" — this answers it. The most actionable line in the report.
- **Key assumption per hat** — each verdict states the assumption its top risk rests
  on, so a conflict can be framed as *Assumption A vs Assumption B*, not just
  "hat vs hat" — the more useful disagreement to surface.
- **"Strongest case the board is wrong"** — a red-team / falsification of the board's
  own verdict at the end of every report (not a re-review).
- `flips_if` added to the machine-readable summary.

Reliability/eval (stability runner, confidence, fixtures) remain the open v0.7
milestone work; this release ships the governance layer.

## [0.6.1] — 2026-06-19
### Changed
- **Token cost cut — output unchanged.** Reduced the parts of the bill that scale
  with the number of hats (the reading), without touching the report or findings:
  - the chair now **assigns disjoint file sets** to hats, so the panel doesn't all
    open the same core files (the #1 duplicated cost);
  - it pastes **shared excerpts** of the few universally-needed files into the map
    once, instead of each hat re-reading the whole file;
  - a **hard per-mode read cap** (5 / 8 / 12 files for `--light` / `--standard` /
    `--deep`) replaces the soft "aim ≤12";
  - per-hat prompt boilerplate compressed.

## [0.6.0] — 2026-06-19
### Added
- **Incremental review** — `--diff <range>` (e.g. `HEAD~10..HEAD`) and `--pr <n>`
  scope the board to changed files only; the Decision becomes "safe to merge?".
  The chair runs git/gh; hats stay read-only.
- **Hat weighting** — `--weights security=3,sre=2,…` tilts the synthesis to a
  project's real priorities (a bank ≠ a B2C SaaS).
- **First real review** — `examples/real-review-boardroom-v0.6.md`: an actual run
  of boardroom on itself, with real `file:line`s, metadata (command, hats, run
  time, token cost), and the verdict. Proof, not just a fictional sample.
- **"Who it's for"** section in the README (named ICPs / jobs-to-be-done).
### Changed
- Scorecard table (hat / score / one-line verdict) with a leading level emoji
  (💪 👍 ⚠️ 🚨) and the hat's identity icon, plus an overall. A **"What's solid"**
  strengths section so a review shows what works, not only problems.
- Cleaner, more scannable report format: scores on one line, a single ranked
  "What to fix" table (severity + "what to change" + time) replacing the separate
  scorecard/consensus/risks/actions sections. Effort is a **concrete time estimate
  per row** (`~30 min`, `~2 h`, `~half a day`) — no S/M/L abbreviation to decode.
- README usage section reworked: a modes/flags table ("which mode when"), a
  dedicated **"Review every PR"** section positioning `--pr`/`--diff` as the
  recurring, cheap workflow (review the diff on every PR, not just one-off audits),
  and a troubleshooting note for the "Unknown command" environment trap.
### Fixed
- README version badge (was stale at 0.4.0).
- All 8 hats now ask for a concrete time estimate (matching the report format)
  instead of the old `S/M/L` effort tag — no more two incompatible calibrations.
- `examples/sample-review.md` re-rendered in the current report format (scorecard
  with level emoji, "What's solid", "What to fix" table) — the showcase matched the
  old v0.4 layout.

## [0.5.0] — 2026-06-19
### Added
- **Depth modes** — `--light` (3 hats), `--standard` (5), `--deep` (full board),
  as friendly sugar over smart panel assembly; `--hats=` still overrides.
- **Machine-readable summary block** at the end of every report (`decision`,
  `risk_score` 0–100, `top_3_blockers`) so reviews are comparable across projects.

## [0.4.0] — 2026-06-18
### Added
- **Cost hat** (`board-cost`) — reviews what a project's own LLM/API calls cost
  (caching, prompt bounding, signal pre-extraction, output brevity, prompt-cache
  prefix discipline). Auto-seated only when the project calls an LLM/metered API.
  No competing review panel has this lens.
- Sample report (`examples/sample-review.md`) and a rewritten, scannable README.

## [0.3.0] — 2026-06-18
### Changed
- **Renamed `council` → `boardroom`** (the `council` name collided with several
  multi-model plugins) and repositioned from "persona code review" to
  **whole-project decision board**. Command is now `/boardroom:review`; subagents
  are `board-*`.
### Added
- **GO/NO-GO decision** headline (SHIP · SHIP WITH FIXES · NOT YET · NEEDS PROOF).
- **"Decisions for you"** — cross-discipline trade-offs surfaced as human calls
  (each hat emits a Cross-discipline flag that feeds this section).
- **Smart panel assembly** — the chair classifies the project type and seats only
  the hats that fit.
- **`--debate`** — optional rebuttal round scoped to the conflicts.

## [0.2.0] — 2026-06-18
### Added
- Shared **project map** built once by the chair (recon once, not per hat).
- Per-hat **read budget** and a **no-preamble** verdict contract.
- **Model tiering** — deep-code hats inherit the session model; judgment hats use
  a lighter one.

## [0.1.0] — 2026-06-18
### Added
- Initial release: a panel of read-only expert subagents (architect, security,
  SRE, UX, product, investor, skeptic) run in parallel, reconciled into one report.
