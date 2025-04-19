// Theme configuration
export const theme = {
  name: 'retro-blue',
  description: 'A retro-inspired theme with blue background and pink accents',
  author: 'gitgud team',
  version: '1.0.0'
};

// Theme types
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Available themes
export const AVAILABLE_THEMES = [
  {
    id: 'light',
    name: 'Light Mode',
    type: THEME_TYPES.LIGHT,
    description: 'Light blue background with pink accents'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    type: THEME_TYPES.DARK,
    description: 'Dark blue background with pink accents'
  }
];
