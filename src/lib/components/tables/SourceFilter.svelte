<script lang="ts">
import { createEventDispatcher } from 'svelte';

// Event dispatcher
const dispatch = createEventDispatcher();

// Props
export let state: 'all' | string = 'all';
export let options: { value: string; icon: string; color: string }[] = [];
export let title: string = 'Filter by source';

// Function to handle filter interaction
function handleInteraction() {
  // Find current index
  const currentIndex = options.findIndex((opt) => opt.value === state) + 1;

  // If we're at the end or not found, go back to 'all'
  if (currentIndex >= options.length || currentIndex === 0) {
    state = 'all';
  } else {
    // Otherwise, go to the next option
    state = options[currentIndex].value;
  }

  // Dispatch event to parent component
  dispatch('change', { source: state === 'all' ? null : state });
}

// Handle keyboard events
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleInteraction();
  }
}

// Get current option
$: currentOption =
  state === 'all'
    ? { value: 'all', icon: '', color: 'var(--color-text-muted)' }
    : options.find((opt) => opt.value === state) || {
        value: 'all',
        icon: '',
        color: 'var(--color-text-muted)'
      };

// Get current state label for aria-label
$: stateLabel = state === 'all' ? 'Show all sources' : `Show ${state} only`;
</script>

<button
  class="flex cursor-pointer items-center justify-center gap-1 border-none bg-transparent p-0"
  on:click={handleInteraction}
  on:keydown={handleKeydown}
  title={title}
  type="button"
  aria-label={`${title}: ${stateLabel}`}
>
  {#if state === 'all'}
    <span class="text-sm font-bold text-[var(--color-text-muted)]">
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
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    </span>
  {:else}
    <span class="text-sm font-bold" style="color: {currentOption.color}">
      {@html currentOption.icon}
    </span>
  {/if}
</button>
