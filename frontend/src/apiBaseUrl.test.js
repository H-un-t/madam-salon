import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from './apiBaseUrl.js';

test('uses same-origin API path when Vite env does not override it', () => {
  assert.equal(resolveApiBaseUrl({}), '/api');
});

test('uses explicit Vite API base URL when provided', () => {
  assert.equal(resolveApiBaseUrl({ VITE_API_BASE_URL: 'https://api.example.test/api' }), 'https://api.example.test/api');
});
