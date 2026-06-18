# boardroom — a whole-project review board for Claude Code

Most reviews tell you whether the code is good. **boardroom tells you whether the
*project* is good** — and gives you a decision.

`/boardroom:review` convenes a board of expert hats — architect, security, SRE,
UX, product, investor, and a skeptic — sends each into your project **in parallel**
through its own lens, then delivers:

- a **GO / NO-GO decision** (SHIP · SHIP WITH FIXES · NOT YET · NEEDS PROOF), and
- the **cross-discipline trade-offs you have to resolve** — the calls with no
  correct answer (ship now vs harden first, scope vs simplicity, growth vs
  compliance).

```
/boardroom:review
/boardroom:review src/
/boardroom:review --hats=security,sre
/boardroom:review --debate          # add a rebuttal round on the conflicts
```

## How this is different

There are already good multi-agent reviewers for Claude Code. boardroom sits where
they don't:

| | Code-review panels (e.g. roundtable, official code-review) | Multi-**model** councils (Gemini/GPT/Grok) | **boardroom** |
| --- | --- | --- | --- |
| Reviews | a diff / code quality | a question, across vendors | the **whole project** |
| Hats | engineering only | one per model | **engineering + business** (investor, product, UX) |
| Output | findings / a merge verdict | side-by-side answers | a **GO/NO-GO decision** |
| Disagreement | a judge picks the right answer | consensus vs divergence | **surfaced as a decision *you* make** — because business trade-offs have no right answer |

A code reviewer can adjudicate "is this correct?" The board's job is the question
no judge can settle: *"is this worth shipping / buying / trusting — and what do we
trade off to get there?"*

## What you get

```
# Boardroom review — <project>

## Decision: SHIP WITH FIXES         ← the headline call + what's gating it
## Decisions for you                 ← cross-discipline trade-offs you must resolve
## Scorecard                         ← each hat's score + one-liner
## Consensus                         ← flagged by 2+ hats — do first
## Top risks                         ← ranked
## Prioritized actions               ← effort × impact
## Hard questions                    ← what the team can't currently answer
```

## The board

| Hat | Lens |
| --- | --- |
| **Architect** | system design, coupling, complexity, tech debt |
| **Security** | threat model, authz, secrets, injection, SSRF, supply chain |
| **SRE** | reliability, failure modes, observability, deploy/rollback |
| **UX** | first-run friction, clarity, hierarchy, consistency |
| **Product** | who it's for, problem fit, scope, positioning |
| **Investor** | moat, market, traction, kill-risks |
| **Skeptic** | red-teams the headline claim and the load-bearing assumptions |
| **Cost** | LLM/token spend — caching, prompt bounding, signal pre-extraction (auto-seated only when the project calls an LLM) |

Every hat is **read-only** — the board diagnoses, it never edits your code. The
**Cost** hat is unique to boardroom — no other review panel judges what your LLM
calls actually cost.

## Install

```bash
claude --plugin-dir ./boardroom    # then, in the session:
/boardroom:review
```

## Smart panel assembly

The chair classifies the project and seats only the hats that fit — a throwaway
script gets architect + skeptic; a SaaS product gets the full board; a library
skips the investor unless you ask. Force a panel with `--hats=architect,security`.

## The `--debate` round

By default each hat reviews independently (one parallel pass). Add `--debate` for
one extra **rebuttal round**: each hat sees only the *conflicting* findings and
gets ≤3 lines to defend, concede, or refine. It sharpens the trade-offs without
re-reviewing the whole project — cheap, scoped to the disagreements.

## Cost & performance

Multi-agent reviews are token-hungry; boardroom spends the minimum:

- **Recon once, not N times.** The chair builds the project map a single time and
  hands it to every hat, so seven reviewers don't each re-read the README and
  re-walk the tree.
- **Read budget.** Each hat navigates by the map, opens only its lane (aim ≤12
  files), and cites instead of pasting whole files.
- **Model tiering.** Deep-code hats `inherit` your session model; judgment hats
  (UX, product, investor) default to a lighter model. Override any hat's `model:`.
- **Right-sized panel + subsets.** Smart assembly and `--hats=` keep focused runs
  cheap.

## Customize the board

Hats are just markdown subagents in `agents/`. Add one (copy an existing
`board-*.md`, change the lens + verdict header, add it to the table in
`skills/review/SKILL.md`). Worth adding: `board-cost` (token/$$ — pairs with a
cost analyzer), `board-legal`, `board-data` (privacy/compliance), `board-perf`.
Each hat returns the same verdict contract (score · strengths · severity-tagged
risks · top-3 actions · cross-discipline flag · one hard question), which is what
makes the decision synthesis clean.

## License

MIT
