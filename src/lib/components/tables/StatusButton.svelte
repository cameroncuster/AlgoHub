<script lang="ts">
import { createEventDispatcher } from 'svelte';

// Event dispatcher
const dispatch = createEventDispatcher();

// Props
export let itemId: string;
export let isActive: boolean = false;
export let isAuthenticated: boolean = false;

// Function to handle status toggle
function handleToggle() {
  if (!isAuthenticated) return;
  
  // Dispatch event to parent component
  dispatch('toggle', { 
    itemId, 
    isActive: !isActive
  });
}
</script>

<button
  class={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-sm transition-all duration-300
    ${isActive
      ? 'solved-button bg-[rgb(34_197_94)] text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]'
      : 'bg-[var(--color-tertiary)] text-[var(--color-text-muted)] hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)]'
    }`}
  on:click={handleToggle}
  disabled={!isAuthenticated}
  aria-label={isActive ? "Mark as inactive" : "Mark as active"}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="checkmark-icon"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
</button>
