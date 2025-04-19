// Circuit Board Theme Configuration
export const circuitTheme = {
  name: 'circuit-board',
  description: 'A theme inspired by PCB circuit boards',
  author: 'gitgud team',
  version: '1.0.0',
  colors: `
    /* Colors - Circuit Board Theme */
    --color-white: oklch(1 0 0);
    --color-black: oklch(0 0 0);
    --color-primary: oklch(0.4 0.1 140); /* PCB green */
    --color-secondary: oklch(0.45 0.08 140); /* Lighter PCB green */
    --color-tertiary: oklch(0.35 0.12 140); /* Darker PCB green */
    --color-accent: oklch(0.7 0.2 50); /* Copper traces */
    --color-heading: oklch(0.95 0 0 / 0.95); /* Light text for headings */
    --color-text: oklch(0.9 0 0 / 0.9); /* Light text for body */
    --color-text-muted: oklch(0.8 0 0 / 0.7); /* Muted light text */
    --color-background: oklch(0.4 0.1 140 / 0.9); /* PCB background */
    --color-border: oklch(0.3 0.08 140); /* Darker green border */
    --color-link: oklch(0.7 0.2 50); /* Copper colored links */
    --color-link-subtle: oklch(0.65 0.15 50); /* Subtle copper links */
    --color-link-nav: oklch(0.95 0 0 / 0.9); /* Light nav links */
    --color-username: oklch(0.8 0.15 60); /* Gold plated usernames */
  `,
  additionalCSS: `
    /* Circuit trace pattern for background */
    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px),
        radial-gradient(circle at 50px 50px, rgba(255,255,255,0.1) 2px, transparent 2px),
        radial-gradient(circle at 100px 100px, rgba(255,255,255,0.1) 2px, transparent 2px),
        radial-gradient(circle at 150px 50px, rgba(255,255,255,0.1) 2px, transparent 2px),
        radial-gradient(circle at 50px 150px, rgba(255,255,255,0.1) 2px, transparent 2px);
      background-size: 20px 20px, 20px 20px, 200px 200px, 200px 200px, 200px 200px, 200px 200px;
      z-index: -1;
      pointer-events: none;
      opacity: 0.3;
    }
    
    /* Make buttons look like components */
    button {
      border-radius: 2px !important;
      box-shadow: 0 2px 0 rgba(0,0,0,0.2) !important;
    }
    
    /* Add solder joint effect to buttons on hover */
    button:hover {
      box-shadow: 0 0 5px var(--color-accent) !important;
    }
  `
};
