<script lang="ts">
import { onMount } from 'svelte';
import ContestTable from '$lib/components/ContestTable.svelte';
import {
  fetchContests,
  fetchUserParticipation,
  toggleContestParticipation
} from '$lib/services/contest';
import type { Contest } from '$lib/services/contest';
import { user } from '$lib/services/auth';

// State
let contests: Contest[] = [];
let filteredContests: Contest[] = [];
let userParticipation: Set<string> = new Set();
let loading = true;
let error: string | null = null;
let isAuthenticated = false;

// Function to load contests
async function loadContests() {
  loading = true;
  error = null;

  try {
    // Fetch contests
    contests = await fetchContests();
    filteredContests = [...contests];

    // Load user participation data if authenticated
    if (isAuthenticated) {
      userParticipation = await fetchUserParticipation();
    }
  } catch (e) {
    console.error('Error loading contests:', e);
    error = 'Failed to load contests. Please try again later.';
  } finally {
    loading = false;
  }
}

// Function to sort contests by difficulty
function sortContestsByDifficulty(
  contestsToSort: Contest[],
  direction: 'asc' | 'desc' | null
): Contest[] {
  if (direction === null) {
    // If no direction specified, return to default sort (original order)
    return [...contests];
  }

  return [...contestsToSort].sort((a, b) => {
    // Handle undefined difficulties
    const diffA = a.difficulty ?? 0;
    const diffB = b.difficulty ?? 0;

    // Sort based on direction
    return direction === 'asc' ? diffA - diffB : diffB - diffA;
  });
}

// Handle difficulty sort event
function handleDifficultySort(event: CustomEvent<{ direction: 'asc' | 'desc' | null }>) {
  filteredContests = sortContestsByDifficulty(filteredContests, event.detail.direction);
}

// Handle user participation toggle
async function handleToggleParticipation(contestId: string, hasParticipated: boolean) {
  if (!isAuthenticated) {
    // Don't allow participation toggle if not authenticated
    return;
  }

  try {
    const success = await toggleContestParticipation(contestId, hasParticipated);

    if (success) {
      // Update local state
      if (hasParticipated) {
        userParticipation.add(contestId);
      } else {
        userParticipation.delete(contestId);
      }
      userParticipation = new Set(userParticipation); // Trigger reactivity
    }
  } catch (err) {
    console.error('Error toggling participation:', err);
  }
}

// Load contests on mount
onMount(() => {
  // Subscribe to auth state changes
  const unsubscribe = user.subscribe((value) => {
    isAuthenticated = !!value;

    // Reload user participation when auth state changes
    if (isAuthenticated) {
      fetchUserParticipation().then((participation) => {
        userParticipation = participation;
      });
    } else {
      userParticipation = new Set();
    }
  });

  // Load contests
  loadContests();

  // Cleanup function
  return () => {
    unsubscribe();
  };
});
</script>

<svelte:head>
  <title>AlgoHub | Contests</title>
  <meta name="description" content="Browse and track programming contests from various platforms" />
</svelte:head>

<div class="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-8">
  {#if loading}
    <div class="flex h-[calc(100vh-4rem)] items-center justify-center py-2 text-center">
      <div>
        <svg
          class="mx-auto h-10 w-10 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="var(--color-primary)"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-2 text-gray-600">Loading contests...</p>
      </div>
    </div>
  {:else if error}
    <div class="rounded-lg bg-red-100 p-4 text-red-700">
      <p>{error}</p>
    </div>
  {:else}
    <ContestTable
      contests={filteredContests}
      userParticipation={userParticipation}
      onToggleParticipation={handleToggleParticipation}
      on:sortDifficulty={handleDifficultySort}
    />
  {/if}
</div>
