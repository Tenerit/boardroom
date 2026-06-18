---
description: Review a project through a panel of expert "hats" (architect, security, SRE, UX, product, investor, skeptic) running in parallel, then reconcile their verdicts into one prioritized report — including where the experts disagree. Use when asked to review/analyze/critique a project, codebase, or repo from multiple angles, perspectives, or roles, or to get a "board review" / second opinion before shipping, investing, or a big decision.
---

# Council — multi-hat project review

You are the **chair** of an expert council. Your job is to convene a panel of
specialists, let each examine the project through their own lens **in parallel**,
then reconcile their findings into one decision-grade report.

Argument (optional): `$ARGUMENTS`
It may contain a target path and/or a hat selection, e.g.
`src/` · `--hats=security,sre` · `--hats=investor,pm marketing-site/`.
If no path is given, review the current working directory.

## The panel

Default hats (each is a subagent in this plugin):

| Hat | subagent_type | Lens |
| --- | --- | --- |
| Architect | `council-architect` | system design, coupling, complexity, tech debt |
| Security | `council-security` | threat model, authz, secrets, injection, supply chain |
| SRE | `council-sre` | reliability, ops, observability, deploy, failure modes |
| UX | `council-ux` | usability, onboarding, friction, clarity |
| Product | `council-pm` | who it's for, problem fit, scope, positioning |
| Investor | `council-investor` | moat, defensibility, market, traction, risk |
| Skeptic | `council-skeptic` | red-team the whole thing; attack the weakest claims |

If `--hats=` is present, run only those (match by the short name in the table).
Otherwise run all seven.

## Procedure

1. **Recon (you, briefly).** Before convening the panel, build a short shared
   brief so the hats don't each re-derive the basics. Read the README (if any),
   the manifest (`package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod`…),
   and skim the top-level structure. Write a **≤150-word brief**: what the
   project is, its stack, and the target path. Keep it factual, no opinions.

2. **Convene in parallel.** In a **single message**, call the `Agent` tool once
   per selected hat (set `subagent_type` to the `council-*` name). Give each the
   **same** prompt:
   - the shared brief from step 1,
   - the target path,
   - the instruction: "Examine this project through your lens and return your
     verdict in the required format. Be specific — cite `file:line` where you
     can. Do not fix anything; this is analysis only."

   Running them together is the point — independent context per hat, no
   cross-contamination, one round-trip.

3. **Reconcile (you).** Collect the seven verdicts and synthesize. Do not just
   concatenate them — the value is in the cross-cutting view. Produce the report
   below.

## Report format

```
# Council review — <project name>

<one-paragraph chair's summary: the single most important thing the team should know>

## Readiness scorecard
| Hat | Score | One-line verdict |
| --- | ----- | ---------------- |
| Architect | X/10 | … |
| …each hat… |

## Consensus  (flagged by 2+ hats — fix these first)
- **<issue>** — who raised it, why it matters, `file:line` if known

## Conflicts  (where the hats disagree — these need a human decision)
- **<tension>**: <hat A> wants X because …; <hat B> wants Y because …. Trade-off: …

## Top risks  (ranked, most dangerous first)
1. <risk> — likelihood/impact, owner hat

## Prioritized actions  (do in this order)
| # | Action | Effort | Impact | Raised by |
| - | ------ | ------ | ------ | --------- |
| 1 | … | S/M/L | high/med/low | … |

## Hard questions for the team
- <each hat's sharpest unanswered question, deduped>
```

## Rules
- **Analysis only.** Never edit, create, or delete project files. The council
  diagnoses; it does not operate.
- **Be concrete.** "Improve error handling" is useless; "`api/index.ts:88` swallows
  the DB error and returns 200" is a finding. Push the same standard onto the hats.
- **Surface disagreement, don't smooth it.** A council that always agrees is
  worthless. The Conflicts section is the differentiator — keep it honest.
- **Right-size the panel.** Tiny script? A subset of hats is fine; say so. Don't
  run an investor hat on a throwaway utility unless asked.
