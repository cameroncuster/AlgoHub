<script lang="ts">
import { onMount } from 'svelte';
import ContestTable from '$lib/components/ContestTable.svelte';
import {
  fetchContests,
  fetchUserParticipation,
  toggleContestParticipation,
  fetchUserFeedback,
  updateContestFeedback
} from '$lib/services/contest';
import type { Contest } from '$lib/services/contest';
import { user } from '$lib/services/auth';

// State
let contests: Contest[] = [];
let filteredContests: Contest[] = [];
let userParticipation: Set<string> = new Set();
let userFeedback: Record<string, 'like' | 'dislike' | null> = {};
let loading = true;
let error: string | null = null;
let isAuthenticated = false;
let availableAuthors: string[] = [];
let authorFilter: string | null = null;

// Filter states
let participatedFilterState: 'participated' | 'not-participated' | 'all' = 'all';
let typeFilterState: 'all' | 'icpc' | 'codeforces' = 'all';

// Function to get contests filtered by everything except author
function getContestsWithoutAuthorFilter(): Contest[] {
  return contests.filter((contest) => {
    // Filter by participation status
    if (
      participatedFilterState === 'participated' &&
      contest.id &&
      !userParticipation.has(contest.id)
    ) {
      return false;
    }
    if (
      participatedFilterState === 'not-participated' &&
      contest.id &&
      userParticipation.has(contest.id)
    ) {
      return false;
    }

    // Filter by contest type
    if (typeFilterState === 'icpc' && contest.type !== 'ICPC') {
      return false;
    }
    if (typeFilterState === 'codeforces' && contest.type === 'ICPC') {
      return false;
    }

    return true;
  });
}

// Function to update available authors based on current filters
function updateAvailableAuthors(): void {
  // Get contests filtered by everything except author
  const contestsWithoutAuthorFilter = getContestsWithoutAuthorFilter();

  // Update available authors based on current filters
  availableAuthors = [...new Set(contestsWithoutAuthorFilter.map((c) => c.addedBy))].sort();
}

// Function to handle participation filter
function handleParticipatedFilter({
  detail
}: CustomEvent<{ state: 'all' | 'participated' | 'not-participated' }>): void {
  participatedFilterState = detail.state;
  updateFilters();
}

// Function to handle type filter
function handleTypeFilter({ detail }: CustomEvent<{ type: 'all' | 'icpc' | 'codeforces' }>): void {
  typeFilterState = detail.type;
  updateFilters();
}

// Function to handle author filter
function handleAuthorFilter({ detail }: CustomEvent<{ author: string | null }>): void {
  authorFilter = detail.author;
  updateFilters();
}

// Function to update filters and filtered contests
function updateFilters(): void {
  // Update available authors based on current filters
  updateAvailableAuthors();

  // Apply filters to get updated contests list
  let filtered = getContestsWithoutAuthorFilter();

  // Apply author filter if selected
  if (authorFilter) {
    filtered = filtered.filter((contest) => contest.addedBy === authorFilter);
  }

  // Update filtered contests
  filteredContests = sortContestsByLikes(filtered, 'desc');
}

// Function to load contests
async function loadContests() {
  loading = true;
  error = null;

  try {
    // Fetch contests
    contests = await fetchContests();

    // Apply default sorting by likes (most likes first)
    filteredContests = sortContestsByLikes([...contests], 'desc');

    // Initialize available authors with all authors
    updateAvailableAuthors();

    // Load user participation data and feedback if authenticated
    if (isAuthenticated) {
      userParticipation = await fetchUserParticipation();
      userFeedback = await fetchUserFeedback();
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
    // If no direction specified, return to default sort (by likes)
    return sortContestsByLikes(contestsToSort, 'desc');
  }

  return [...contestsToSort].sort((a, b) => {
    // Handle undefined difficulties
    const diffA = a.difficulty ?? 0;
    const diffB = b.difficulty ?? 0;

    // Sort based on direction
    return direction === 'asc' ? diffA - diffB : diffB - diffA;
  });
}

// Function to calculate contest score (likes - dislikes)
function calculateScore(contest: Contest): number {
  return contest.likes - contest.dislikes;
}

// Function to sort contests by score (likes - dislikes)
function sortContestsByLikes(
  contestsToSort: Contest[],
  direction: 'asc' | 'desc' | null
): Contest[] {
  if (direction === null) {
    // If no direction specified, return to default sort (original order)
    return [...contests];
  }

  // Group contests by score
  const contestsByScore: Record<number, Contest[]> = {};

  // Calculate score for each contest and group them
  contestsToSort.forEach((contest) => {
    const score = calculateScore(contest);
    if (!contestsByScore[score]) {
      contestsByScore[score] = [];
    }
    contestsByScore[score].push(contest);
  });

  // Sort contests within each score group by ID for consistency
  Object.values(contestsByScore).forEach((group) => {
    group.sort((a, b) => {
      if (a.id && b.id) {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });
  });

  // Get all scores and sort them based on direction
  const scores = Object.keys(contestsByScore)
    .map(Number)
    .sort((a, b) => (direction === 'asc' ? a - b : b - a));

  // Flatten the groups in order of score
  return scores.flatMap((score) => contestsByScore[score]);
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

// Handle like/dislike
async function handleLike(contestId: string, isLike: boolean) {
  if (!isAuthenticated) {
    // Don't allow likes/dislikes if not authenticated
    return;
  }

  try {
    const currentFeedback = userFeedback[contestId];
    let isUndo = false;

    // Determine if this is an undo operation
    if ((isLike && currentFeedback === 'like') || (!isLike && currentFeedback === 'dislike')) {
      isUndo = true;
    }

    console.log(
      `Updating contest ${contestId} feedback: isLike=${isLike}, isUndo=${isUndo}, currentFeedback=${currentFeedback}`
    );

    // Call the service to update feedback
    const updatedContest = await updateContestFeedback(
      contestId,
      isLike,
      isUndo,
      currentFeedback || null
    );

    if (updatedContest) {
      console.log(
        `Updated contest: likes=${updatedContest.likes}, dislikes=${updatedContest.dislikes}`
      );

      // Update the contest in the list
      const index = filteredContests.findIndex((c) => c.id === contestId);
      if (index !== -1) {
        filteredContests[index] = updatedContest;
        filteredContests = [...filteredContests]; // Trigger reactivity
      }

      // Update the user feedback state
      if (isUndo) {
        delete userFeedback[contestId];
      } else {
        userFeedback[contestId] = isLike ? 'like' : 'dislike';
      }
      userFeedback = { ...userFeedback }; // Trigger reactivity
    }
  } catch (err) {
    console.error('Error updating contest feedback:', err);
  }
}

// Load contests on mount
onMount(() => {
  // Subscribe to auth state changes
  const unsubscribe = user.subscribe((value) => {
    isAuthenticated = !!value;

    // Reload user participation and feedback when auth state changes
    if (isAuthenticated) {
      fetchUserParticipation().then((participation) => {
        userParticipation = participation;
      });
      fetchUserFeedback().then((feedback) => {
        userFeedback = feedback;
      });
    } else {
      userParticipation = new Set();
      userFeedback = {};
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
  <title>Contests</title>
  <meta name="description" content="Browse and track programming contests from various platforms" />
</svelte:head>

<div class="mx-auto w-full max-w-[1200px] bg-[var(--color-primary)] px-0">
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
    <div class="relative flex min-h-[calc(100vh-2rem)]">
      <!-- Main content -->
      <div class="flex w-full flex-1">
        <div class="w-full min-w-0 px-0 py-2 pb-6">
          <div class="contest-table-container w-full">
            <ContestTable
              contests={filteredContests}
              userParticipation={userParticipation}
              userFeedback={userFeedback}
              allAuthors={availableAuthors}
              onToggleParticipation={handleToggleParticipation}
              onLike={handleLike}
              on:sortDifficulty={handleDifficultySort}
              on:filterAuthor={handleAuthorFilter}
              on:filterParticipated={handleParticipatedFilter}
              on:filterType={handleTypeFilter}
            />
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
@media (max-width: 767px) {
  :global(body) {
    overflow-x: hidden;
  }
}

/* Remove excess margin from table container */
.contest-table-container {
  width: 100%;
  margin: 0;
}

@media (min-width: 768px) {
  .contest-table-container {
    margin: 0;
  }
}
</style>
