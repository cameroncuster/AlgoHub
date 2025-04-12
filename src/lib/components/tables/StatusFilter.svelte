<script lang="ts">
import { createEventDispatcher } from 'svelte';

// Event dispatcher
const dispatch = createEventDispatcher();

// Props
export let state: 'all' | 'active' | 'inactive' = 'all';
export let activeIcon: string;
export let inactiveIcon: string;
export let allIcon: string;
export let activeColor: string = 'rgb(34 197 94)'; // Green by default
export let title: string = 'Filter by status';

// Function to handle filter interaction
function handleInteraction() {
  // Toggle filter state: all -> active -> inactive -> all
  if (state === 'all') {
    state = 'active';
  } else if (state === 'active') {
    state = 'inactive';
  } else {
    state = 'all';
  }

  // Dispatch event to parent component
  dispatch('change', { state });
}

// Handle keyboard events
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleInteraction();
  }
}
</script>

<button
  class="flex cursor-pointer items-center justify-center gap-1 border-none bg-transparent p-0"
  on:click={handleInteraction}
  on:keydown={handleKeydown}
  title={title}
  type="button"
  aria-label={`${title}: ${state === 'all' ? 'Show all' : state === 'active' ? 'Show active only' : 'Show inactive only'}`}
>
  {#if state === 'active'}
    <span class="text-sm font-bold" style="color: {activeColor}">
      {@html activeIcon}
    </span>
  {:else if state === 'inactive'}
    <span class="text-sm font-bold text-[var(--color-text-muted)]">
      {@html inactiveIcon}
    </span>
  {:else}
    <span class="text-sm font-bold text-[var(--color-text-muted)]">
      {@html allIcon}
    </span>
  {/if}
</button>
