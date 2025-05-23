<script lang="ts">
import { browser } from '$app/environment';
import { onMount } from 'svelte';

// Props
export let topics: string[] = [];
export let selectedTopic: string | null = null;
export let onSelectTopic: (topic: string | null) => void;
export let isMobile: boolean = false;
export let isOpen: boolean = false;
export let onToggle: () => void;

// Special topic value for NEW problems
const NEW_TOPIC = 'NEW';

let touchStartX = 0;
let touchEndX = 0;

// Format topic name for display
function formatTopicName(topic: string): string {
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

// Handle touch start
function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
}

// Handle touch end
function handleTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
}

// Handle swipe
function handleSwipe() {
  if (!isMobile) return;

  const swipeThreshold = 70; // Minimum distance required for a swipe

  // Left to right swipe (open sidebar)
  if (touchEndX - touchStartX > swipeThreshold && !isOpen) {
    onToggle();
  }

  // Right to left swipe (close sidebar)
  if (touchStartX - touchEndX > swipeThreshold && isOpen) {
    onToggle();
  }
}

// Add touch event listeners
onMount(() => {
  if (browser) {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }
});
</script>

<!-- Mobile sidebar toggle -->
<button
  class="sidebar-toggle fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
  on:click={onToggle}
  aria-label="Toggle filters"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    {#if isOpen}
      <path d="M18 6L6 18M6 6l12 12" />
    {:else}
      <!-- Filter icon -->
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    {/if}
  </svg>
</button>

<!-- Overlay for mobile -->
{#if isOpen && isMobile}
  <div
    class="fixed inset-0 z-30 bg-black/30 transition-opacity md:hidden"
    on:click={onToggle}
    on:keydown={(e) => e.key === 'Escape' && onToggle()}
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Desktop sidebar (always visible) -->
<div
  class="absolute top-[60px] bottom-auto left-0 hidden w-[13rem] bg-[var(--color-primary)] md:block"
>
  <div class="h-[calc(100vh-140px)] overflow-y-auto">
    <div class="w-full space-y-1 p-3">
      <button
        class={`w-full rounded-md px-3 py-2 text-left transition-all duration-200 ${
          selectedTopic === null
            ? 'scale-102 bg-[var(--color-accent)] text-white shadow-sm'
            : 'text-[var(--color-heading)] hover:scale-102 hover:bg-[var(--color-tertiary)] hover:text-[var(--color-heading)] hover:shadow-sm'
        }`}
        on:click={() => onSelectTopic(null)}
      >
        All
      </button>

      <!-- Special NEW button with different styling -->
      <button
        class={`w-full rounded-md px-3 py-2 text-left transition-all duration-200 ${
          selectedTopic === NEW_TOPIC
            ? 'scale-102 bg-[var(--color-accent)] text-white shadow-sm'
            : 'text-[var(--color-heading)] hover:scale-102 hover:bg-[var(--color-tertiary)] hover:text-[var(--color-heading)] hover:shadow-sm'
        } border-2 border-dashed border-[var(--color-accent)] font-bold`}
        on:click={() => onSelectTopic(NEW_TOPIC)}
      >
        NEW
      </button>

      {#each topics as topic}
        <button
          class={`w-full rounded-md px-3 py-2 text-left transition-all duration-200 ${
            selectedTopic === topic
              ? 'scale-102 bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-heading)] hover:scale-102 hover:bg-[var(--color-tertiary)] hover:text-[var(--color-heading)] hover:shadow-sm'
          }`}
          on:click={() => onSelectTopic(topic)}
        >
          {formatTopicName(topic)}
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Mobile sidebar (slide in from left) -->
<div
  class="sidebar fixed inset-y-0 left-0 z-40 w-[80%] max-w-[300px] transform overflow-hidden bg-[var(--color-secondary)] shadow-lg transition-transform duration-300 ease-in-out md:hidden"
  style={`transform: translateX(${isOpen ? '0' : '-100%'});`}
>
  <div class="h-full overflow-y-auto p-4 pt-16">
    <div class="space-y-1">
      <button
        class={`w-full rounded-md px-3 py-2 text-left transition-all duration-200 ${
          selectedTopic === null
            ? 'scale-102 bg-[var(--color-accent)] text-white shadow-sm'
            : 'text-[var(--color-heading)] hover:scale-102 hover:bg-[var(--color-tertiary)] hover:text-[var(--color-heading)] hover:shadow-sm'
        }`}
        on:click={() => onSelectTopic(null)}
      >
        All Topics
      </button>

      <!-- Special NEW button with different styling for mobile -->
      <button
        class={`w-full rounded-md px-3 py-2 text-left transition-all duration-200 ${
          selectedTopic === NEW_TOPIC
            ? 'scale-102 bg-[var(--color-accent)] text-white shadow-sm'
            : 'text-[var(--color-heading)] hover:scale-102 hover:bg-[var(--color-tertiary)] hover:text-[var(--color-heading)] hover:shadow-sm'
        } border-2 border-dashed border-[var(--color-accent)] font-bold`}
        on:click={() => onSelectTopic(NEW_TOPIC)}
      >
        NEW
      </button>

      {#each topics as topic}
        <button
          class={`w-full rounded-md px-3 py-2 text-left transition-all duration-200 ${
            selectedTopic === topic
              ? 'scale-102 bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-heading)] hover:scale-102 hover:bg-[var(--color-tertiary)] hover:text-[var(--color-heading)] hover:shadow-sm'
          }`}
          on:click={() => onSelectTopic(topic)}
        >
          {formatTopicName(topic)}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
/* Add responsive styles for the sidebar */
@media (max-width: 768px) {
  /* Mobile styles */
  :global(body) {
    padding-bottom: 5rem; /* Add padding for the floating button */
  }
}

/* Ensure proper z-index and positioning */
.sidebar {
  z-index: 40;
}

/* Add hover animation scale */
:global(.scale-102) {
  transform: scale(1.02);
}

:global(.hover\:scale-102:hover) {
  transform: scale(1.02);
}

/* Ensure sidebar doesn't overlap footer */
@media (min-width: 768px) {
  /* Desktop styles */
  div[class*='absolute top-[60px]'] {
    height: auto;
    min-height: calc(100vh - 140px);
  }
}
</style>
