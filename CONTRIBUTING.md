# Contributing to boardroom

Thanks for helping! boardroom is small and made of plain markdown — adding value
is mostly writing a good prompt, not code.

## Develop locally

```bash
claude --plugin-dir ./boardroom    # load the plugin
/boardroom:review                  # try it on any project
/reload-plugins                    # pick up edits without restarting
```

Validate before opening a PR (the marketplace review runs the same check):

```bash
claude plugin validate ./boardroom
```

## Repo layout

```
boardroom/
├── .claude-plugin/
│   ├── plugin.json        # plugin manifest
│   └── marketplace.json   # lets the repo be added as a marketplace
├── agents/                # one markdown subagent per hat (board-*.md)
├── skills/review/SKILL.md # the chair: recon → assemble → convene → decide
├── examples/              # sample reports
├── CHANGELOG.md
└── README.md
```

## Add a new hat

1. Copy an existing `agents/board-*.md` to `agents/board-<role>.md`.
2. Change the role, the lens bullets, and the verdict header.
3. Keep the **verdict contract** identical in shape — this is what lets the chair
   reconcile every hat cleanly:
   ```
   ## <Role> verdict
   **Score:** X/10 — <one line>
   **Strengths:** …
   **Risks:** <🔴/🟡/🟢 + file:line>
   **Top 3 actions:** <ordered; effort S/M/L>
   **Cross-discipline flag:** <trade-off with another discipline, or "none">
   **Hard question for the team:** …
   ```
4. Add a row to the board table **and** the smart-assembly rules in
   `skills/review/SKILL.md` so the chair knows when to seat it.
5. Keep hats **read-only** (`tools: Read, Grep, Glob`) — the board never edits code.

## Prompt-writing guidelines

- Be specific about the lens; demand `file:line` evidence, not vibes.
- Tell the hat to navigate by the chair's project map (don't re-walk the repo).
- Pick `model: inherit` for deep-code hats, `model: sonnet` for judgment hats.

## Conventions

- Conventional Commit messages (`feat:`, `fix:`, `docs:`, `chore:`…).
- Bump `version` in both `plugin.json` and `marketplace.json`, and add a
  `CHANGELOG.md` entry.
