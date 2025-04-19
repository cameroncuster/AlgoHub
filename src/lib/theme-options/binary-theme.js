// Binary Theme Configuration
export const binaryTheme = {
  name: 'binary',
  description: 'A minimalist black and white binary theme',
  author: 'gitgud team',
  version: '1.0.0',
  colors: `
    /* Colors - Binary Theme */
    --color-white: oklch(1 0 0);
    --color-black: oklch(0 0 0);
    --color-primary: oklch(0.05 0 0); /* Almost black background */
    --color-secondary: oklch(0.1 0 0); /* Slightly lighter panels */
    --color-tertiary: oklch(0.15 0 0); /* Header backgrounds */
    --color-accent: oklch(0.95 0 0); /* White accent */
    --color-heading: oklch(0.95 0 0 / 0.95); /* White text for headings */
    --color-text: oklch(0.9 0 0 / 0.9); /* Light text for body */
    --color-text-muted: oklch(0.7 0 0 / 0.7); /* Muted light text */
    --color-background: oklch(0.05 0 0 / 0.9); /* Dark background */
    --color-border: oklch(0.3 0 0); /* Dark gray border */
    --color-link: oklch(0.95 0 0); /* White links */
    --color-link-subtle: oklch(0.8 0 0); /* Light gray links */
    --color-link-nav: oklch(0.95 0 0 / 0.9); /* White nav links */
    --color-username: oklch(0.95 0 0); /* White usernames */
  `,
  additionalCSS: `
    /* Binary pattern for background */
    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='20' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E01%3C/text%3E%3Ctext x='50' y='20' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E10%3C/text%3E%3Ctext x='10' y='40' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E00%3C/text%3E%3Ctext x='50' y='40' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E11%3C/text%3E%3Ctext x='10' y='60' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E10%3C/text%3E%3Ctext x='50' y='60' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E01%3C/text%3E%3Ctext x='10' y='80' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E11%3C/text%3E%3Ctext x='50' y='80' font-family='monospace' font-size='10' fill='rgba(255,255,255,0.1)'%3E00%3C/text%3E%3C/svg%3E");
      z-index: -1;
      pointer-events: none;
      opacity: 0.2;
    }
    
    /* Sharp edges for all elements */
    * {
      border-radius: 0 !important;
    }
    
    /* Monospace everything */
    body {
      font-family: 'Courier New', monospace !important;
    }
    
    /* Add terminal cursor effect to links */
    a:hover::after {
      content: '|';
      animation: blink 1s step-end infinite;
      margin-left: 2px;
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `
};
