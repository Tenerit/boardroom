# Changelog

All notable changes to boardroom. Format follows [Keep a Changelog](https://keepachangelog.com);
this project uses [semantic versioning](https://semver.org).

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
- Cleaner, more scannable report format: scores on one line, a single ranked
  "What to fix" table (severity + effort, consensus tagged) replacing the separate
  scorecard/consensus/risks/actions sections, and an explicit Effort legend
  (S < 1h · M ~½ day · L ≥ 1 day).
### Fixed
- README version badge (was stale at 0.4.0).

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
