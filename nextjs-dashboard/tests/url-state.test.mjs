import assert from 'node:assert/strict';
import test from 'node:test';
import { withSearchQuery } from '../app/lib/url-state.ts';

test('search preserves unrelated parameters', () => {
  assert.equal(withSearchQuery(new URLSearchParams('sort=name'), 'alice').toString(), 'sort=name&query=alice');
});

test('clearing search removes only query', () => {
  assert.equal(withSearchQuery(new URLSearchParams('query=a&sort=name'), '').toString(), 'sort=name');
});
