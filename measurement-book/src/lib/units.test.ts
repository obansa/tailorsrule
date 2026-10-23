import test from 'node:test';
import assert from 'node:assert/strict';
import { convert, display, formatNumber, parseEntry } from './units.ts';

test('converts between inches and centimetres', () => {
  assert.equal(convert(10, 'in', 'cm'), 25.4);
  assert.ok(Math.abs(convert(25.4, 'cm', 'in') - 10) < 1e-9);
  assert.equal(convert(7, 'in', 'in'), 7);
});

test('display rounds to one decimal and trims .0', () => {
  assert.equal(display(42, 'in', 'cm'), '106.7');
  assert.equal(display(106.68, 'cm', 'in'), '42');
  assert.equal(formatNumber(18.5), '18.5');
  assert.equal(formatNumber(24), '24');
});

test('switching units back and forth does not change stored value', () => {
  const stored = 18.5;
  display(stored, 'in', 'cm');
  assert.equal(display(stored, 'in', 'in'), '18.5');
});

test('parseEntry', () => {
  assert.equal(parseEntry(''), null);
  assert.equal(parseEntry('.'), null);
  assert.equal(parseEntry('0'), null);
  assert.equal(parseEntry('18.5'), 18.5);
});
