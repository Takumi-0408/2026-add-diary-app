export const colors = {
  paper: '#efe9d9',
  paper2: '#faf5e6',
  ink: '#1a1612',
  inkSoft: '#5a554a',
  inkFaint: '#a39e8e',
  rule: '#c8c0a8',
  grass: '#5b8a3a',
  grassSoft: '#cfe1b8',
  coral: '#d97757',
  sun: '#e8b94a',
  sky: '#7a9eb9',
  pink: '#d68fa2',
  white: '#ffffff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  title: { fontSize: 20, fontWeight: 'bold' as const, color: colors.ink },
  heading: { fontSize: 18, fontWeight: 'bold' as const, color: colors.ink },
  body: { fontSize: 16, color: colors.ink },
  caption: { fontSize: 14, color: colors.inkSoft },
  small: { fontSize: 12, color: colors.inkFaint },
};
