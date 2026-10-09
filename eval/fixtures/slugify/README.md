# @norrin/slugify

Turns Latin-script text into a URL-safe slug: `"Café del Mar"` → `"cafe-del-mar"`.
No runtime dependencies.

```js
import { slugify } from '@norrin/slugify';

slugify('Café del Mar');   // "cafe-del-mar"
slugify('Straße Øresund'); // "strasse-oresund"
```

## Contract (stable for 1.x)

- The output only contains `a-z`, `0-9` and single hyphens, never at either end.
- Accents are removed; ß, æ, ø, œ, ł, đ, þ and ð are transliterated.
- Characters outside the Latin script (Cyrillic, CJK, emoji…) are dropped, so text with
  no Latin letters or digits returns `""`. Handle that case if you need a non-empty slug.
- Unicode compatibility forms are folded (`ａｄｍｉｎ` → `admin`): check reserved names
  *after* slugifying.
- Anything that isn't a string throws a `TypeError`.

## Test

```
npm test
```
