import type { Unit } from './types';

export const CM_PER_INCH = 2.54;

export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  return from === 'in' ? value * CM_PER_INCH : value / CM_PER_INCH;
}

/** One decimal place, no trailing ".0". */
export function formatNumber(value: number): string {
  const r = Math.round(value * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** Text shown for a value recorded in `from`, displayed in `to`. */
export function display(value: number, from: Unit, to: Unit): string {
  return formatNumber(convert(value, from, to));
}

export const unitLabel = (u: Unit) => (u === 'in' ? 'in' : 'cm');
export const unitName = (u: Unit) => (u === 'in' ? 'inches' : 'centimetres');

/** Parses keypad text; returns null for empty or non-positive input. */
export function parseEntry(text: string): number | null {
  if (!text || text === '.') return null;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? n : null;
}
