// Theme configuration
export const theme = {
  name: 'retro-blue-light',
  description: 'A retro-inspired theme with light blue background and pink accents',
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
    id: 'retro-blue-light',
    name: 'Blue Light',
    type: THEME_TYPES.LIGHT,
    description: 'Light blue background with pink accents'
  },
  {
    id: 'retro-blue-dark',
    name: 'Blue Dark',
    type: THEME_TYPES.DARK,
    description: 'Dark blue background with pink accents'
  },
  {
    id: 'retro-beige',
    name: 'Beige & Brown',
    type: THEME_TYPES.LIGHT,
    description: 'Warm beige background with brown accents'
  },
  {
    id: 'retro-purple',
    name: 'Purple & Yellow',
    type: THEME_TYPES.LIGHT,
    description: 'Vibrant purple background with yellow accents'
  },
  {
    id: 'retro-teal',
    name: 'Teal & Coral',
    type: THEME_TYPES.LIGHT,
    description: 'Fresh teal background with coral accents'
  }
];
