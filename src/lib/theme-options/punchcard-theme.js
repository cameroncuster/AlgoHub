// Punch Card Theme Configuration
export const punchcardTheme = {
  name: 'punchcard',
  description: 'A theme inspired by vintage IBM punch cards',
  author: 'gitgud team',
  version: '1.0.0',
  colors: `
    /* Colors - Punch Card Theme */
    --color-white: oklch(1 0 0);
    --color-black: oklch(0 0 0);
    --color-primary: oklch(0.95 0.02 90); /* Buff/manila card color */
    --color-secondary: oklch(0.98 0.01 90); /* Lighter card panels */
    --color-tertiary: oklch(0.9 0.03 90); /* Slightly darker headers */
    --color-accent: oklch(0.3 0.05 240); /* IBM blue */
    --color-heading: oklch(0.2 0 0 / 0.95); /* Dark text for headings */
    --color-text: oklch(0.2 0 0 / 0.9); /* Dark text for body */
    --color-text-muted: oklch(0.3 0 0 / 0.7); /* Muted dark text */
    --color-background: oklch(0.95 0.02 90 / 0.9); /* Card background */
    --color-border: oklch(0.7 0.05 30); /* Brown border color */
    --color-link: oklch(0.3 0.05 240); /* IBM blue links */
    --color-link-subtle: oklch(0.4 0.04 240); /* Subtle blue links */
    --color-link-nav: oklch(0.2 0 0 / 0.9); /* Dark nav links */
    --color-username: oklch(0.5 0.1 0); /* Red usernames */
  `,
  additionalCSS: `
    /* Punch card hole pattern for background */
    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      z-index: -1;
      pointer-events: none;
      opacity: 0.5;
    }
    
    /* Monospace everything to mimic punch card text */
    body {
      font-family: 'Courier New', monospace !important;
    }
    
    /* Add subtle texture to cards */
    .card, .table-wrapper {
      background-image: linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02) 75%, transparent 75%, transparent);
      background-size: 4px 4px;
    }
  `
};
