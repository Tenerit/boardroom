---
name: boardroom:review
description: Convene the boardroom review board over the current project
---

Run the boardroom review skill in `skills/review/SKILL.md` as the chair.

Arguments (a path, a depth mode, `--hats=`, `--debate`, `--diff`, `--pr`, `--weights`):
$ARGUMENTS

Pass every argument above straight through to the skill — the chair parses them.
If no path is given, target the current working directory.