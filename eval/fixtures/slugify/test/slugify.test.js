import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slugify.js';

test('lowercases and hyphenates', () => {
  assert.equal(slugify('Hello World!'), 'hello-world');
});

test('strips accents', () => {
  assert.equal(slugify('Café del Mar'), 'cafe-del-mar');
});

test('transliterates letters normalization keeps', () => {
  assert.equal(slugify('Straße Øresund Łódź'), 'strasse-oresund-lodz');
});

test('keeps digits', () => {
  assert.equal(slugify('Top 10 tips'), 'top-10-tips');
});

test('collapses runs and trims edges', () => {
  assert.equal(slugify('  --A  B--  '), 'a-b');
});

test('drops non-Latin text, so it can return an empty string', () => {
  assert.equal(slugify('Москва 東京'), '');
  assert.equal(slugify(''), '');
});

test('is idempotent', () => {
  const once = slugify('Ça va, Zoë?');
  assert.equal(once, 'ca-va-zoe');
  assert.equal(slugify(once), once);
});

test('rejects non-strings', () => {
  assert.throws(() => slugify(null), TypeError);
  assert.throws(() => slugify(42), TypeError);
});
