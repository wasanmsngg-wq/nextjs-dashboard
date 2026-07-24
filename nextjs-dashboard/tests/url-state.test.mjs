import assert from 'node:assert/strict';
import test from 'node:test';
import { withPage, withPageSize, withSearchQuery } from '../app/lib/url-state.ts';

test('search resets page and preserves pageSize', () => {
  assert.equal(withSearchQuery(new URLSearchParams('page=8&pageSize=50'), 'bangkok').toString(), 'page=1&pageSize=50&query=bangkok');
});

test('clearing search removes only query and resets page', () => {
  assert.equal(withSearchQuery(new URLSearchParams('query=a&page=4&pageSize=25'), '').toString(), 'page=1&pageSize=25');
});

test('page size validates allowed values and resets page', () => {
  assert.equal(withPageSize(new URLSearchParams('query=a&page=7'), 50, [10, 25, 50]).toString(), 'query=a&page=1&pageSize=50');
  assert.equal(withPageSize(new URLSearchParams('query=a&page=7'), 100, [10, 25, 50]).toString(), 'query=a&page=7');
});

test('pagination preserves query and pageSize', () => {
  assert.equal(withPage(new URLSearchParams('query=a&pageSize=25'), 3).toString(), 'query=a&pageSize=25&page=3');
});
