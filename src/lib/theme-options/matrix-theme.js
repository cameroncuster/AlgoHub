// Matrix Theme Configuration
export const matrixTheme = {
  name: 'matrix',
  description: 'A Matrix-inspired theme with digital rain effect',
  author: 'gitgud team',
  version: '1.0.0',
  colors: `
    /* Colors - Matrix Theme */
    --color-white: oklch(1 0 0);
    --color-black: oklch(0 0 0);
    --color-primary: oklch(0.1 0 0); /* Dark background */
    --color-secondary: oklch(0.15 0 0); /* Slightly lighter panels */
    --color-tertiary: oklch(0.2 0 0); /* Header backgrounds */
    --color-accent: oklch(0.8 0.2 140); /* Matrix green */
    --color-heading: oklch(0.8 0.2 140 / 0.95); /* Green text for headings */
    --color-text: oklch(0.7 0.15 140 / 0.9); /* Light green text for body */
    --color-text-muted: oklch(0.6 0.1 140 / 0.7); /* Muted green text */
    --color-background: oklch(0.1 0 0 / 0.9); /* Dark background */
    --color-border: oklch(0.5 0.15 140); /* Green border color */
    --color-link: oklch(0.8 0.2 140); /* Green links */
    --color-link-subtle: oklch(0.7 0.15 140); /* Subtle green links */
    --color-link-nav: oklch(0.8 0.2 140 / 0.9); /* Green nav links */
    --color-username: oklch(0.8 0.2 140); /* Green usernames */
  `,
  additionalCSS: `
    /* Matrix digital rain effect for background */
    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(0deg, 
        rgba(0, 20, 0, 0.3) 50%, 
        rgba(0, 40, 0, 0.1) 100%);
      z-index: -1;
      pointer-events: none;
      opacity: 0.2;
      background-size: 100% 100%;
      animation: matrix-rain 30s linear infinite;
    }
    
    @keyframes matrix-rain {
      0% { background-position: 0 0; }
      100% { background-position: 0 100%; }
    }
    
    /* Glowing effect for buttons */
    button:hover {
      box-shadow: 0 0 10px var(--color-accent);
    }
  `
};
