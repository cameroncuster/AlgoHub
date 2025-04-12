<script lang="ts">
import { createEventDispatcher } from 'svelte';

// Event dispatcher
const dispatch = createEventDispatcher();

// Props
export let itemId: string;
export let likes: number = 0;
export let dislikes: number = 0;
export let userFeedback: 'like' | 'dislike' | null = null;
export let isAuthenticated: boolean = false;

// Function to handle like/dislike
function handleFeedback(isLike: boolean) {
  if (!isAuthenticated) return;
  
  // If already liked/disliked, toggle off
  const isUndo = (isLike && userFeedback === 'like') || (!isLike && userFeedback === 'dislike');
  
  // Dispatch event to parent component
  dispatch('feedback', { 
    itemId, 
    isLike, 
    isUndo,
    previousFeedback: userFeedback
  });
}
</script>

<div class="flex justify-end gap-2">
  <button
    class={`flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors duration-200 ${
      userFeedback === 'like'
        ? 'bg-[var(--color-accent)] text-white'
        : 'bg-[var(--color-tertiary)] text-[var(--color-text)] hover:bg-[var(--color-accent-muted)]'
    }`}
    on:click={() => handleFeedback(true)}
    disabled={!isAuthenticated}
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
      class="stroke-2"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
    <span>{likes}</span>
  </button>

  <button
    class={`flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors duration-200 ${
      userFeedback === 'dislike'
        ? 'bg-[var(--color-accent)] text-white'
        : 'bg-[var(--color-tertiary)] text-[var(--color-text)] hover:bg-[var(--color-accent-muted)]'
    }`}
    on:click={() => handleFeedback(false)}
    disabled={!isAuthenticated}
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
      class="stroke-2"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
    </svg>
    <span>{dislikes}</span>
  </button>
</div>
