# boardroom reliability — methodology

An LLM review board is only worth trusting if it is **stable**: the same project should
get the same *decision* run to run. Single-run LLM verdicts are near-arbitrary — the same
input can flip verdict roughly 30% of the time at temperature 1 ("Rating Roulette",
[arXiv:2510.27106](https://arxiv.org/abs/2510.27106)). So the **primary metric here is
decision variance, not accuracy.** A board can be confidently wrong; first prove it isn't
confidently *inconsistent*.

## Fixtures

Three small repos in `fixtures/`, each with an unambiguous right decision — so any
run-to-run flip is the *board's* inconsistency, not genuine ambiguity in the project. The
expected outcomes and pinned stages live in [`expected.json`](expected.json):

| Fixture | What it is | Pinned stage | Expected decision |
| --- | --- | --- | --- |
| `slugify` | a tiny, tested, honest util | `ga` | **SHIP** (or SHIP_WITH_FIXES) |
| `paykit` | hardcoded live key, double-charge on retry, failures reported as success | `alpha` | **NOT_YET** |
| `neuralguard` | "99.9%, enterprise-ready" claims over a `Math.random()` classifier, no tests | `ga` | **NEEDS_PROOF** (or NOT_YET) |

**Nothing the board reads may give the answer away.** The first real run (v0.11.0) caught
the fixtures leaking it: a header comment listing the planted bugs, README warnings
("deliberately broken"), folder names (`fixture-b-broken`) and an `EXAMPLE` key. The board
quoted the leak back — so that run proved the pipeline, not detection. Since then:
- fixtures contain only what a real project would (no explanatory comments or warnings);
- expected outcomes sit in `expected.json`, outside the reviewed folders;
- the runner reviews a fresh copy in a neutral temp folder (`…/Temp/proj-xxxx/paykit`),
  with its own git history, so no path says "eval" or "fixture".

When you add a fixture, keep the code honest-looking and put the answer in `expected.json`.

**Pin the stage.** Without `--stage` the board infers the lifecycle stage, and that
inference can itself wobble between runs — which would show up as decision variance that
isn't the board's judgement. The runner always passes the pinned stage. (`aggregate.mjs`
still prints the stage spread and warns if it varies.)

## Run it

Needs `claude` on PATH and logged in (`claude auth status`; for long runs `claude
setup-token` avoids an expiry midway) and the boardroom plugin installed.

```
node eval/run.mjs --dry-run      # what would run, and the estimated cost
node eval/run.mjs                # every fixture × 5 runs, --light
node eval/run.mjs --only paykit --runs 2 --depth standard
node eval/aggregate.mjs          # the report
```

`run.mjs` (zero dependencies) runs `claude -p "/boardroom:review --light --stage=…"`
headless in each neutral copy with `--restricted`: your settings are ignored (no `auto`
mode, no allow rules), code-running tools and WebFetch are removed, Bash is limited to
`git` / `grep` / `ls` / `find`, there are no MCP servers and no hooks — so fixture code is
never executed and nothing goes to the network. `--allowedTools` alone isn't enough: it
*adds* to your own permissions, which let the chair run `npm view` on the first real run.
The plugin is loaded with `--plugin-dir` from this repo, so the eval tests the working
tree, not the installed version. Anything the board tried and was refused is logged. Runs are **appended** to `eval/runs/<fixture>/run-<k>.md`, with
decision, cost and duration logged to `eval/runs/costs.jsonl`. It stops on the first error
(e.g. an expired login); re-run to continue. `eval/runs/` is gitignored — commit the
*number*, not the runs.

Cost: the first real `--light` run (3 hats on Opus) was **$0.81 API-equivalent**, so the
default 15 runs ≈ $12. On a subscription it comes out of your quota, not your bill.
`--standard` and `--deep` seat more hats and cost more.

## Read it

- **Stability (primary).** Per fixture, the share of runs on the modal decision. 100% = the
  board never contradicted itself. Anything lower is the honest reliability number to
  publish — it is the real trustworthiness of the tool.
- **Accuracy (secondary).** Whether the modal decision is one of the expected ones. A board
  can be perfectly stable and still wrong; you want both. The fixtures are easy on purpose,
  so a wrong modal decision here is a red flag.
- **`risk_score` spread.** A wide spread under a stable decision means the headline holds
  but the severity read wobbles — worth noting.
- **Cost.** Mean API-equivalent cost per run, per fixture.

## Honest limits

- This measures the board's **own consistency** on easy cases, not correctness in
  general — add harder, real-repo fixtures over time.
- **Same base model across hats:** high stability does not rule out a *shared* blind spot
  (that's what the chair's ground-truth anchoring and "same facts, independent framing"
  are for — see `skills/review/SKILL.md`).
- Model version and the user's global `CLAUDE.md` (still loaded in headless mode) move
  these numbers — record the model and date alongside any published result.
