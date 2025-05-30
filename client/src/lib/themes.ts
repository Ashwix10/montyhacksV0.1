export const themes = {
  light: {
    name: 'Light',
    icon: '☀️',
    primary: 'hsl(210 11% 15%)',
    background: 'hsl(210 11% 98%)',
    foreground: 'hsl(210 11% 15%)',
    card: 'hsl(210 11% 100%)',
    'card-foreground': 'hsl(210 11% 15%)',
    muted: 'hsl(210 11% 96%)',
    'muted-foreground': 'hsl(210 11% 45%)',
    border: 'hsl(210 11% 90%)',
    input: 'hsl(210 11% 90%)',
    ring: 'hsl(210 11% 15%)',
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    primary: 'hsl(210 50% 60%)',
    background: 'hsl(240 10% 4%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(240 10% 6%)',
    'card-foreground': 'hsl(0 0% 98%)',
    muted: 'hsl(240 4% 16%)',
    'muted-foreground': 'hsl(240 5% 65%)',
    border: 'hsl(240 4% 16%)',
    input: 'hsl(240 4% 16%)',
    ring: 'hsl(240 5% 84%)',
  },
  vibe: {
    name: 'Vibe',
    icon: '🎨',
    primary: 'hsl(280 100% 70%)',
    background: 'hsl(240 10% 4%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(240 10% 6%)',
    'card-foreground': 'hsl(0 0% 98%)',
    muted: 'hsl(240 4% 16%)',
    'muted-foreground': 'hsl(240 5% 65%)',
    border: 'hsl(240 4% 16%)',
    input: 'hsl(240 4% 16%)',
    ring: 'hsl(280 100% 70%)',
  },
} as const;

export type ThemeColors = typeof themes[keyof typeof themes];
export type Theme = keyof typeof themes;
