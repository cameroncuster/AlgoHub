<script lang="ts">
import { createEventDispatcher } from 'svelte';

// Event dispatcher
const dispatch = createEventDispatcher();

// Props
export let direction: 'asc' | 'desc' | null = null;
export let label: string;
export let width: string = 'auto';

// Function to handle click
function handleInteraction() {
  // Toggle direction: null -> asc -> desc -> null
  if (direction === null) {
    direction = 'asc';
  } else if (direction === 'asc') {
    direction = 'desc';
  } else {
    direction = null;
  }

  // Dispatch event to parent component
  dispatch('sort', { direction });
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
  class="flex w-full cursor-pointer items-center justify-center gap-2 border-none bg-transparent p-0 text-inherit"
  on:click={handleInteraction}
  on:keydown={handleKeydown}
  style="width: {width}"
  type="button"
  aria-label="Sort by {label}"
>
  {#if direction === 'asc'}
    <span class="text-sm font-bold text-[var(--color-accent)]">▲</span>
  {:else if direction === 'desc'}
    <span class="text-sm font-bold text-[var(--color-accent)]">▼</span>
  {:else}
    <span class="flex flex-col text-sm leading-[1] font-bold text-[var(--color-text-muted)]">
      <span>▲</span>
      <span>▼</span>
    </span>
  {/if}
  <span class="font-bold">{label}</span>
</button>
