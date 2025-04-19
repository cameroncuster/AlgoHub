// Retro Blue Light Theme Configuration
export const retroBlueLightTheme = {
  name: 'retro-blue-light',
  description: 'A retro-inspired theme with light blue background and pink accents',
  author: 'gitgud team',
  version: '1.0.0',
  colors: `
    /* Colors - Retro Blue Light Theme */
    --color-white: oklch(1 0 0);
    --color-black: oklch(0 0 0);
    --color-primary: oklch(0.9 0.03 240); /* Light blue background */
    --color-secondary: oklch(0.95 0.02 240); /* Lighter blue for cards */
    --color-tertiary: oklch(0.85 0.04 240); /* Slightly darker blue for headers */
    --color-accent: oklch(0.7 0.2 350); /* Pink accent */
    --color-heading: oklch(0.2 0 0 / 0.9); /* Dark text for headings */
    --color-text: oklch(0.2 0 0 / 0.8); /* Dark text for body */
    --color-text-muted: oklch(0.2 0 0 / 0.5); /* Muted dark text */
    --color-background: oklch(0.9 0.03 240 / 0.7); /* Transparent blue background */
    --color-border: oklch(0.75 0.05 240); /* Border color */
    --color-link: oklch(0.7 0.2 350); /* Pink links */
    --color-link-subtle: oklch(0.75 0.15 350); /* Subtle pink links */
    --color-link-nav: oklch(0.2 0 0 / 0.9); /* Dark nav links */
    --color-username: oklch(0.6 0.25 30); /* Orange for usernames */
    --color-solved-row: color-mix(
      in oklab,
      rgb(34 197 94) 15%,
      transparent
    ); /* Light green for solved rows */
  `
};
