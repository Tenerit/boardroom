# slugify

A tiny, dependency-free string slugifier. Turns `"Hello World!"` into `"hello-world"`.

MIT licensed, ~15 lines, does one thing. No runtime dependencies.

## Use

```js
import { slugify } from './src/slugify.js';
slugify('Café del Mar'); // "cafe-del-mar"
```

## Test

```
node --test
```
