import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slugify.js';

test('lowercases and hyphenates', () => {
  assert.equal(slugify('Hello World!'), 'hello-world');
});

test('strips accents', () => {
  assert.equal(slugify('Café del Mar'), 'cafe-del-mar');
});

test('collapses runs and trims edges', () => {
  assert.equal(slugify('  --A  B--  '), 'a-b');
});
