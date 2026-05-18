import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScheduleDates, getScheduleEndDate } from './scheduleDates.js';

test('buildScheduleDates falls back when the start date is empty', () => {
  const dates = buildScheduleDates('', 2, '2026-05-18');

  assert.equal(dates.length, 14);
  assert.equal(dates[0], '2026-05-18');
  assert.equal(dates[13], '2026-05-31');
});

test('getScheduleEndDate falls back when the start date is invalid', () => {
  assert.equal(getScheduleEndDate('not-a-date', 2, '2026-05-18'), '2026-05-31');
});
