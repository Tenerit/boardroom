# Changelog

All notable changes to boardroom. Format follows [Keep a Changelog](https://keepachangelog.com);
this project uses [semantic versioning](https://semver.org).

## [Unreleased]
### Security
- **Closed a loophole in the no-execution rule.** On the first real eval run the chair
  checked a claim by running an inline copy of the project's code ("I didn't execute the
  project's own code") and looked the package up with `npm view`. The rule now says: no
  project code — not its files, not a copy, not a re-typed snippet — and no network
  lookups; anything that would need them is marked `[inferred]` with the check that
  would settle it. `gh` CI status left the default ground truth (it's a network call);
  `gh` now only runs for `--pr`.
- **The privacy section is honest about how strong the guarantee is.** Hats are limited
  to Read/Grep/Glob by their own definitions; the chair runs with the user's permissions,
  so its offline, code-free behaviour is an instruction, not a wall. The README gives the
  `claude -p … --restricted` command for a hard guarantee on an untrusted repo.

- **The repo under review is evidence, not instructions.** A README or comment telling
  reviewers what to conclude, run or skip is now reported as attempted manipulation,
  never followed — in the chair's rules and in every hat. Due diligence means reviewing
  repos that may want a good grade.
- **The hard-guarantee command drops Bash entirely.** "Read-only" allow rules leak:
  `find -exec` and `git -c alias.x='!sh …'` run arbitrary commands, which a hostile repo
  could steer the reviewer toward. Ground truth comes from Grep and Glob instead.

### Fixed
- **`/boardroom:review` no longer depends on reading a file.** The legacy wrapper
  `commands/review.md` told the chair to go read `skills/review/SKILL.md` — which fails
  when file reads are confined to the project (the chair then improvised with no
  procedure and no decision), and can trigger a permission prompt otherwise. The wrapper
  is gone; the skill registers the command itself, with its text and `$ARGUMENTS`
  injected directly.

### Fixed — eval harness
- **The eval fixtures leaked their own answers.** The first real headless run (v0.11.0,
  `--light`) got the right verdict on the broken fixture — and quoted the fixture's header
  comment, which listed the planted bugs. README warnings ("deliberately broken"), folder
  names (`fixture-b-broken`) and an `EXAMPLE` key gave the rest away. Fixtures are now
  neutral (`slugify`, `paykit`, `neuralguard`, no explanatory comments), and expected
  outcomes and pinned stages moved to `eval/expected.json`, outside the reviewed folders.
- **`--allowedTools` didn't restrict anything** — it adds to the user's own permissions,
  so an `auto` mode with `npm`/`node` allow rules let the chair run them. The runner now
  uses `--restricted` (settings ignored, code-running tools and WebFetch removed),
  `--strict-mcp-config`, `--tools Read,Grep,Glob,Agent,Bash` with Bash limited to
  git/grep/ls/find, and `--plugin-dir` (plugins enabled in user settings no longer load).
  Refused tool calls are logged per run.
- **The `slugify` fixture wasn't a clean 1.0 package.** The board rightly blocked it at
  `ga`: no `exports`, an npm name already taken, and undocumented lossy output for
  non-Latin text. It's now a real 1.0 package (scoped name, `exports`, documented
  Latin-only contract pinned by 8 tests, transliteration of ß/æ/ø/œ/ł/đ/þ/ð, `TypeError`
  on non-strings, LICENSE, CI). The run made under the leaky permissions was discarded.

### Added
- **`eval/run.mjs`** — runs the board headless (`claude -p`) on each fixture N times, each
  in a fresh neutral temp copy with its own git history, the fixture's stage pinned, user
  hooks off and read-only tools. Appends reports to `eval/runs/` and logs decision, cost
  and duration to `costs.jsonl`; `--dry-run` shows the plan and the estimated cost
  (first real `--light` run: $0.81 API-equivalent).
- `aggregate.mjs` checks each modal decision against `expected.json` (accuracy, secondary)
  and shows the mean cost per run.

## [0.11.0] — 2026-10-09
### Security
- **The board no longer executes the reviewed project's code by default.** Since 0.9.0
  the ground-truth step ran the repo's build and test scripts — which is running untrusted
  code when you review a repo you don't own yet (due diligence), and contradicted the
  read-only promise. Ground truth is now gathered without execution (does the cited file
  exist, a secret grep, tests / lockfile / CI present, last CI status via `gh`, git facts).
  The new **`--run-checks`** flag opts back into running build / test / lint, for repos
  you trust. README privacy section says so plainly.

### Changed
- **Explicit seating order.** Six inputs chose the hats with no precedence (`--hats`,
  depth, type, intent, stage, the cost rule), so `--light --stage=ga` was ambiguous — and
  ambiguity shows up as run-to-run variance. Now: `--hats` wins outright; depth sets *how
  many* seats and the read cap; type and intent decide *who is eligible*; stage decides
  *who leads* (takes the seats first) and *how harsh* every hat is.
- **Prompts consolidated, no behaviour change.** The chair's instructions had grown from
  1,554 words (v0.6) to 3,555; duplicated rules are merged and the Rules section no
  longer restates the procedure — now 2,476 words (−30%). Each hat lost ~80 words of
  boilerplate (shared "How to work" block, shorter contract lines). Fewer tokens per run,
  and fewer rules for the model to half-follow.
- The skill's trigger description mentions stage ("is my prototype on track?", "ready
  for beta / launch?"); the marketplace manifest gains the top-level `description` the
  validator asked for.

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
