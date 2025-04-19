<script lang="ts">
// Current theme (default is the code-editor theme we've already applied)
let currentTheme = 'code-editor';

// All available themes
const themes = [
  {
    id: 'code-editor',
    name: 'Code Editor',
    description: 'Dark code editor with syntax highlighting colors'
  },
  { id: 'matrix', name: 'Matrix', description: 'Digital rain inspired by The Matrix' },
  { id: 'circuit-board', name: 'Circuit Board', description: 'PCB green with copper traces' },
  { id: 'binary', name: 'Binary', description: 'Minimalist black and white binary theme' },
  { id: 'punchcard', name: 'Punch Card', description: 'Vintage IBM punch card inspired' },
  {
    id: 'retro-beige',
    name: 'Retro Beige',
    description: 'Warm beige background with brown accents'
  },
  {
    id: 'retro-purple',
    name: 'Retro Purple',
    description: 'Vibrant purple background with yellow accents'
  },
  { id: 'retro-teal', name: 'Retro Teal', description: 'Fresh teal background with coral accents' }
];

// Function to simulate theme switching (for demo purposes only)
function applyTheme(themeId: string) {
  currentTheme = themeId;
  // In a real implementation, this would apply the theme
  // For now, we'll just update the selected button state
}
</script>

<div
  class="theme-switcher rounded border-2 border-[var(--color-border)] bg-[var(--color-secondary)] p-4 shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
>
  <h3 class="mb-3 font-bold">Theme Switcher</h3>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {#each themes as theme}
      <button
        class="rounded border-2 border-[var(--color-border)] px-3 py-2 text-sm font-bold shadow-[1px_1px_0_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-[var(--color-tertiary)] hover:shadow-none {currentTheme === theme.id ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-secondary)] text-[var(--color-text)]'}"
        on:click={() => applyTheme(theme.id)}
        title={theme.description}
      >
        {theme.name}
      </button>
    {/each}
  </div>
</div>

<style>
.theme-switcher {
  max-width: 100%;
  margin-bottom: 1rem;
}

button:hover {
  transform: translateY(1px);
}
</style>
