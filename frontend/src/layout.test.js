import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');

function ruleFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return match?.[1] || '';
}

test('app shell keeps footer pinned to the bottom on short pages', () => {
  const rootRule = ruleFor('#root');
  const mainRule = ruleFor('.app-main');

  assert.match(rootRule, /min-height:\s*100vh/);
  assert.match(rootRule, /display:\s*flex/);
  assert.match(rootRule, /flex-direction:\s*column/);
  assert.match(mainRule, /flex:\s*1/);
  assert.match(app, /<main className="app-main">/);
});
