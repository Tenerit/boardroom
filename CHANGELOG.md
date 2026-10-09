# Changelog

All notable changes to boardroom. Format follows [Keep a Changelog](https://keepachangelog.com);
this project uses [semantic versioning](https://semver.org).

## [0.10.0] — 2026-10-09
### Added — stage-aware review (dev · alpha · beta · ga)
- **The board now judges a project for its lifecycle stage.** The chair infers the stage
  in recon (version, `WIP`/`alpha`/`beta` badges, releases, CI/CD, monitoring, real or
  paying users, pricing) or takes it from the new **`--stage <dev|alpha|beta|ga>`** flag
  (aliases: `prototype`/`poc` → dev, `commercial`/`production`/`launch` → ga), and states
  how sure it is so the user can correct it.
- **Stage changes who leads.** dev → architect + skeptic ("is the approach sound?");
  alpha → + security on real data; beta → + sre, ux, product; ga → the full board with
  security, sre and cost weighted up. Layers on project type and intent; an explicit
  `--hats=` still overrides seating.
- **Severity is stage-relative.** The same finding is scored against the stage, not an
  absolute production bar — "no tests" is 🟢 at dev, 🔴 at ga; a thin moat is noise at dev
  and a blocker at commercialisation. Applying production standards to a prototype is the
  biggest source of review noise. A committed live secret, exposed user data, or an
  approach that cannot work still block at every stage.
- **Each hat has its own stage lens** — security at dev looks only for live secrets and
  data exposure, the full threat model at ga; the investor hat no longer scores missing
  traction as a kill risk on a prototype; SRE says "nothing operational to flag yet" at
  dev instead of inventing gaps.
- The decision names the stage (`SHIP · stage: beta`), so SHIP as a beta isn't read as
  "ready for GA"; `stage` added to the machine-readable summary.

## [0.9.0] — 2026-08-11
### Added — grounded verdict + a way to prove reliability
- **Ground-truth anchoring.** The chair now gathers the cheap deterministic checks the
  repo already declares (build / typecheck, tests, lint, a secret grep, does-the-cited-
  line-exist) into a `<ground_truth>` block, and the verification step demotes any 🔴 that
  contradicts a green check. LLM hats over-flag; facts are the cheapest filter for the
  false positives that are the #1 reason review tools lose trust. Read-only — only the
  chair runs commands, and only what the manifest declares (never install or mutate).
- **Independent framing per hat.** Hats receive the same *facts* but are each framed in
  their own discipline's terms — no single shared "here's what to look for". Identical
  framing on one base model manufactures false consensus (same-vendor panels err together
  ~60% of the time); independent framing is the cheapest defense against it.
- **Reliability harness (`eval/`).** Three caricatural fixtures with unambiguous expected
  decisions (clean → SHIP, broken → NOT_YET, unproven → NEEDS_PROOF), a zero-dependency
  `aggregate.mjs` that reads the machine-readable summaries across repeated runs and
  reports **decision variance** (the primary reliability metric — single-run LLM verdicts
  are near-arbitrary), and `METHODOLOGY.md`. Run the board N× and publish the number.

## [0.8.0] — 2026-08-10
### Added — reliability / trust layer (what a decision-grade review can't skip)
- **Findings are verified before they gate a decision.** Before deciding, the chair
  re-opens the cited source for every 🔴 ship-blocking finding and confirms it says
  what the hat claimed. A citation that doesn't hold is marked `⚠ unverified` and no
  longer counts toward the decision — same-model hats can hallucinate a `file:line`,
  and an unverified blocker must not gate a ship call. Scoped to the decision-critical
  findings, so it stays cheap.
- **Per-hat `[seen]` / `[inferred]` risk tags + a per-hat Confidence.** Each hat marks
  whether a risk was confirmed at the cited line or merely suspected, and rates its own
  confidence (dropping it when the read cap forced a skip). A guess can no longer
  masquerade as a confirmed finding.
- **The decision carries a confidence** (High / Medium / Low), from hat agreement,
  verification, and coverage. Low confidence reads as *"a prompt for human review, not
  a verdict"*.
- **Groupthink / unanimity flag.** Unanimous agreement is surfaced as a *caution*, not
  a green light — same-model reviewers can share a blind spot — and the chair names the
  independent evidence that would actually confirm the consensus.
- **Hats score independently** — the discipline note tells each hat to give its honest
  score even as the outlier, rather than soften toward an imagined consensus.
- `confidence`, `hat_agreement`, and `blockers_verified` added to the machine-readable
  summary.

### Changed — positioning (honest against the current field)
- Reframed the "vs other review tools" comparison around *persona / debate panels* (the
  real competitor category) and added a **Trust signal** row. The strongest debate
  panels verify more deeply but stay engineering-only and resolve conflict to one
  verdict; boardroom keeps the no-right-answer trade-off for the human and now backs it
  with verification + a confidence signal.
- Softened the Cost-hat claim to what's defensible: it judges what *your* project's
  LLM/API calls cost — a lens general "is this expensive?" takes miss — rather than
  claiming no other panel touches cost at all.

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
