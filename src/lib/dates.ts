/** Date helpers working in local time with YYYY-MM-DD string keys. */

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Monday-based start of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  const c = new Date(d);
  const day = (c.getDay() + 6) % 7; // Mon=0 ... Sun=6
  c.setDate(c.getDate() - day);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function weekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MO = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function weekdayShort(d: Date): string {
  return WD[(d.getDay() + 6) % 7];
}

export function monthShort(d: Date): string {
  return MO[d.getMonth()];
}

export function rangeLabel(start: Date, end: Date): string {
  return `${monthShort(start)} ${start.getDate()} – ${monthShort(end)} ${end.getDate()}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b);
}

/** Inclusive list of date keys between two keys. */
export function keysInRange(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  let d = fromKey(startKey);
  const end = fromKey(endKey);
  while (d <= end) {
    out.push(toKey(d));
    d = addDays(d, 1);
  }
  return out;
}
