# boardroom reliability — methodology

An LLM review board is only worth trusting if it is **stable**: the same project should
get the same *decision* run to run. Single-run LLM verdicts are near-arbitrary — the same
input can flip verdict roughly 30% of the time at temperature 1 ("Rating Roulette",
[arXiv:2510.27106](https://arxiv.org/abs/2510.27106)). So the **primary metric here is
decision variance, not accuracy.** A board can be confidently wrong; first prove it isn't
confidently *inconsistent*.

## Fixtures

Three caricatural repos, each with an unambiguous "right" decision — so any run-to-run
flip is the *board's* inconsistency, not genuine ambiguity in the project:

| Fixture | What it is | Pinned stage | Expected decision |
| --- | --- | --- | --- |
| `fixture-a-clean` | a tiny, tested, honest util | `ga` | **SHIP** |
| `fixture-b-broken` | committed secret + a double-charge money bug | `alpha` | **NOT_YET** |
| `fixture-c-unproven` | grand "enterprise-ready" claims, a coin-flip implementation, no tests | `ga` | **NEEDS_PROOF** |

**Pin the stage.** The board infers a project's lifecycle stage when `--stage` is omitted,
and that inference can itself wobble between runs — which would show up as decision
variance that isn't the board's judgement. Pass the pinned stage so the harness measures
one thing. (To measure stage inference on its own, run once without `--stage` and look
at the `stage` spread in the output.)

## Run it

From the boardroom repo root, with the plugin loaded, run each fixture **N ≥ 5** times and
save every report under `eval/runs/<fixture>/`:

```
/boardroom:review eval/fixtures/fixture-a-clean --standard --stage=ga
#   -> save the report to eval/runs/fixture-a-clean/run-1.md
#   repeat N times per fixture (run-1.md … run-N.md), same flags each time

node eval/aggregate.mjs eval/runs
```

`aggregate.mjs` (zero dependencies) reads the machine-readable ` ```yaml ` summary from
every report and prints, per fixture: the decision distribution, the modal decision, a
**STABILITY** score (modal share; 1.0 = never flipped), and the `risk_score` spread — plus
one overall stability number. `eval/runs/` is gitignored; commit the *number*, not the runs.

## Read it

- **Stability (primary).** Per fixture, the share of runs on the modal decision. 100% = the
  board never contradicted itself. Anything lower is the honest reliability number to
  publish — it is the real trustworthiness of the tool.
- **Accuracy (secondary).** Compare each modal decision to the *Expected* column. A board
  can be perfectly stable and still wrong; you want both. The fixtures are deliberately
  easy, so a wrong modal decision here is a red flag.
- **`risk_score` spread.** A wide spread under a stable decision means the headline holds
  but the severity read wobbles — worth noting.

## Honest limits

- This measures the board's **own consistency**, not ground-truth correctness — the
  fixtures' expected decisions are the only accuracy anchor, and they're easy on purpose.
  Add harder, real-repo fixtures over time.
- **Same base model across hats:** high stability does not rule out a *shared* blind spot
  (that's what the chair's ground-truth anchoring and "same facts, independent framing"
  are for — see `skills/review/SKILL.md`).
- Temperature and model version move these numbers — record both alongside any result.
