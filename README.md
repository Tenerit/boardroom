# council — review any project through a panel of expert hats

Most reviews give you one perspective. `council` convenes a **panel** — architect,
security, SRE, UX, product, investor, and a skeptic — sends each one into the
codebase **in parallel** through its own lens, then **reconciles their verdicts**
into a single decision-grade report.

The differentiator isn't the personas (anyone can prompt "review as a security
expert"). It's the **synthesis**: where the hats *agree* (fix first), where they
*conflict* (a human must decide), and one prioritized action list across all of
them. A council that always agrees is worthless — this one keeps the disagreement.

```
/council:review
/council:review src/
/council:review --hats=security,sre
/council:review --hats=investor,pm marketing-site/
```

## What you get

```
# Council review — <project>

<chair's one-paragraph summary>

## Readiness scorecard      ← each hat's score + one-liner
## Consensus                ← flagged by 2+ hats — fix first
## Conflicts                ← where experts disagree — needs a human call
## Top risks                ← ranked
## Prioritized actions      ← effort × impact, in order
## Hard questions           ← the things the team can't currently answer
```

## The panel

| Hat | Lens |
| --- | --- |
| **Architect** | system design, coupling, complexity, tech debt |
| **Security** | threat model, authz, secrets, injection, SSRF, supply chain |
| **SRE** | reliability, failure modes, observability, deploy/rollback |
| **UX** | first-run friction, clarity, hierarchy, consistency |
| **Product** | who it's for, problem fit, scope, positioning |
| **Investor** | moat, market, traction, kill-risks |
| **Skeptic** | red-teams the headline claim and the load-bearing assumptions |

Every hat is **read-only** — the council diagnoses, it never edits your code.

## Install

```bash
# try it without installing
claude --plugin-dir ./council

# then in the session
/council:review
```

To distribute via a marketplace, see the Claude Code plugin docs. The hats are
just markdown files in `agents/` — see "Customize" below.

## Customize the panel

- **Add a hat:** drop a new `agents/council-<role>.md` (copy an existing one,
  change the lens + the verdict header), then add it to the table in
  `skills/review/SKILL.md`. Examples worth adding: `council-cost` (token/$$ —
  pairs well with [ccx](https://github.com/REPLACE_ME/ccx)), `council-legal`,
  `council-data` (privacy/compliance), `council-perf`.
- **Run a subset:** `--hats=architect,security`.
- **Drop a hat:** delete its file and its table row.

Each hat returns the same verdict contract (score · strengths · severity-tagged
risks · top-3 actions · one hard question), which is what makes the synthesis
clean.

## How it works

`/council:review` is a skill that acts as the **chair**: it does one recon pass
to build a shared **project map** (brief + annotated key-file list), then launches
every selected hat as a parallel subagent with that map, collects the verdicts,
and synthesizes them. Each subagent runs in its own context window, so the hats
don't contaminate each other — and you pay for focused analysis, not one model
trying to wear seven hats at once.

## Cost & performance

Multi-agent reviews are token-hungry by nature. council is built to spend the
minimum:

- **Recon once, not N times.** The chair builds the project map a single time and
  hands it to every hat. Without it, all seven hats re-read the README, re-walk
  the tree, and re-open the same core files — the same duplicate-read waste your
  own sessions accumulate. The map is the biggest lever.
- **Read budget.** Each hat is told to navigate by the map, open only the files in
  its lane (aim ≤12), and cite specifics instead of pasting whole files back.
- **Model tiering.** Deep-code hats (architect, security, SRE, skeptic) `inherit`
  your session model; judgment hats (UX, product, investor) default to a lighter
  model where surface reading is enough. Override any hat's `model:` frontmatter.
- **Run a subset.** `--hats=security,sre` on a focused pass costs a fraction of
  the full panel. Right-size to the project.

## License

MIT
