// Design system tokens.

export const colors = {
  // Surfaces — warm, calm, slightly off-white for an appetizing feel.
  bg: '#F5F6F2',
  card: '#FFFFFF',
  cardAlt: '#FBFBF9',
  border: '#EBEDE7',
  borderStrong: '#DDE0D9',

  // Text
  text: '#1B1E1A',
  muted: '#6E746C',
  faint: '#9AA09A',

  // Brand — fresh, confident green with a warm appetite accent.
  primary: '#2E7D5B',
  primaryDark: '#22603F',
  primaryLight: '#E4F1EA',
  accent: '#E58338',
  accentLight: '#FBEADA',

  // Semantic
  danger: '#D85A4A',
  star: '#F2B100',
  checked: '#AAB0A8',
  staple: '#9AA0A6',
  success: '#2E7D5B',
};

// Per-recipe accent palette — gives every recipe a colorful visual identity
// without needing photos or a backend.
export const recipeAccents: { bg: string; fg: string }[] = [
  { bg: '#E4F1EA', fg: '#2E7D5B' },
  { bg: '#FCE9DA', fg: '#C26A2C' },
  { bg: '#E1ECF7', fg: '#356FA8' },
  { bg: '#F7E2E1', fg: '#C0564B' },
  { bg: '#EFE6F5', fg: '#7E5AA2' },
  { bg: '#FBF1D6', fg: '#A07E16' },
  { bg: '#DDF1EC', fg: '#2C8C77' },
  { bg: '#F3E8DC', fg: '#8A6A45' },
];

export function accentFor(id: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return recipeAccents[h % recipeAccents.length];
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const font = {
  display: 30,
  h1: 25,
  h2: 20,
  h3: 17,
  body: 15,
  small: 13,
  tiny: 11,
};

// Soft, layered shadow used on cards and floating elements.
export const shadow = {
  card: {
    shadowColor: '#1B1E1A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  float: {
    shadowColor: '#1B1E1A',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
