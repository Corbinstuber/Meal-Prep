import { Dimension, Unit } from '../types';

/** Which dimension each unit belongs to. */
export const UNIT_DIMENSION: Record<Unit, Dimension> = {
  g: 'mass',
  kg: 'mass',
  oz: 'mass',
  lb: 'mass',
  ml: 'volume',
  l: 'volume',
  tsp: 'volume',
  tbsp: 'volume',
  cup: 'volume',
  floz: 'volume',
  each: 'count',
  dozen: 'count',
};

/** Conversion factor from each unit to its dimension's base unit. */
const TO_BASE: Record<Unit, number> = {
  // mass -> grams
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  // volume -> milliliters
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  floz: 29.5735,
  // count -> each
  each: 1,
  dozen: 12,
};

export const UNITS_BY_DIMENSION: Record<Dimension, Unit[]> = {
  mass: ['g', 'kg', 'oz', 'lb'],
  volume: ['ml', 'l', 'tsp', 'tbsp', 'cup', 'floz'],
  count: ['each', 'dozen'],
};

export const ALL_UNITS: Unit[] = Object.keys(TO_BASE) as Unit[];

export function sameDimension(a: Unit, b: Unit): boolean {
  return UNIT_DIMENSION[a] === UNIT_DIMENSION[b];
}

/**
 * Convert a quantity between two units of the same dimension.
 * Throws if the units belong to different dimensions.
 */
export function convert(quantity: number, from: Unit, to: Unit): number {
  if (!sameDimension(from, to)) {
    throw new Error(`Cannot convert ${from} to ${to}: different dimensions`);
  }
  const inBase = quantity * TO_BASE[from];
  return inBase / TO_BASE[to];
}

/** Round to a sensible number of decimals for display. */
export function prettyQuantity(n: number): number {
  if (Number.isInteger(n)) return n;
  const rounded = Math.round(n * 100) / 100;
  return rounded;
}

export function formatQuantity(quantity: number, unit: Unit): string {
  const q = prettyQuantity(quantity);
  if (unit === 'each') return q === 1 ? '1' : `${q}`;
  return `${q} ${unit}`;
}
