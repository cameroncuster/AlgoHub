// Retro Blue Dark Theme Configuration
export const retroBlueDarkTheme = {
  name: 'retro-blue-dark',
  description: 'A dark retro-inspired theme with deep blue background and pink accents',
  author: 'gitgud team',
  version: '1.0.0',
  colors: `
    /* Colors - Retro Blue Dark Theme */
    --color-white: oklch(1 0 0);
    --color-black: oklch(0 0 0);
    --color-primary: oklch(0.2 0.05 240); /* Dark blue background */
    --color-secondary: oklch(0.25 0.04 240); /* Slightly lighter blue for cards */
    --color-tertiary: oklch(0.15 0.06 240); /* Darker blue for headers */
    --color-accent: oklch(0.8 0.25 350); /* Brighter pink accent for dark theme */
    --color-heading: oklch(0.9 0 0 / 0.9); /* Light text for headings */
    --color-text: oklch(0.9 0 0 / 0.8); /* Light text for body */
    --color-text-muted: oklch(0.9 0 0 / 0.5); /* Muted light text */
    --color-background: oklch(0.2 0.05 240 / 0.7); /* Transparent dark blue background */
    --color-border: oklch(0.3 0.08 240); /* Border color */
    --color-link: oklch(0.85 0.25 350); /* Brighter pink links for better visibility */
    --color-link-subtle: oklch(0.8 0.2 350); /* Brighter subtle pink links */
    --color-link-nav: oklch(0.9 0 0 / 0.9); /* Light nav links */
    --color-username: oklch(0.6 0.25 30); /* Orange for usernames */
    --color-solved-row: color-mix(
      in oklab,
      rgb(34 197 94) 25%,
      transparent
    ); /* Dark green for solved rows */
  `
};
