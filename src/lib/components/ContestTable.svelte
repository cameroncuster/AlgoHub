<script lang="ts">
import type { Contest } from '$lib/services/contest';
import { formatDuration } from '$lib/services/contest';
import { user } from '$lib/services/auth';
import { createEventDispatcher } from 'svelte';

// Event dispatcher
const dispatch = createEventDispatcher();

// Use static image paths for logos
const codeforcesLogo = '/images/codeforces.png';
const icpcLogo = '/images/icpc.svg';

// Props
export let contests: Contest[] = [];
export let userParticipation: Set<string> = new Set();
export let onToggleParticipation: (contestId: string, hasParticipated: boolean) => Promise<void>;

// Computed
$: isAuthenticated = !!$user;

// Filter states
let difficultyFilter: number | null = null;
let difficultySortDirection: 'asc' | 'desc' | null = null;
let participatedFilterState: 'participated' | 'not-participated' | 'all' = 'all';
let authorFilter: string | null = null;

// Get unique authors for filter dropdown
$: authors = [...new Set(contests.map((contest) => contest.addedBy))].sort();

// Apply filters to contests
$: filteredContests = contests.filter((contest) => {
  // Filter by difficulty
  if (difficultyFilter !== null && contest.difficulty !== difficultyFilter) {
    return false;
  }

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

  // Filter by author
  if (authorFilter && contest.addedBy !== authorFilter) {
    return false;
  }

  return true;
});

// Handle filter changes
function handleParticipatedFilter() {
  if (participatedFilterState === 'all') {
    participatedFilterState = 'participated';
  } else if (participatedFilterState === 'participated') {
    participatedFilterState = 'not-participated';
  } else {
    participatedFilterState = 'all';
  }
}

// Handle difficulty sort
function handleDifficultySort() {
  // Toggle sort direction: null -> asc -> desc -> null
  if (difficultySortDirection === null) {
    difficultySortDirection = 'asc';
  } else if (difficultySortDirection === 'asc') {
    difficultySortDirection = 'desc';
  } else {
    difficultySortDirection = null;
  }

  // Dispatch event to parent component
  dispatch('sortDifficulty', { direction: difficultySortDirection });
}

function handleAuthorFilter(event: Event) {
  const select = event.target as HTMLSelectElement;
  authorFilter = select.value === 'all' ? null : select.value;
}

// Generate star rating display
function getDifficultyStars(difficulty: number | undefined): string {
  if (difficulty === undefined) return '';

  const fullStar = '★';
  const emptyStar = '☆';

  return fullStar.repeat(difficulty) + emptyStar.repeat(5 - difficulty);
}

// Get color class based on difficulty
function getDifficultyColorClass(difficulty: number | undefined): string {
  if (difficulty === undefined) return 'text-gray-400';

  const colors = [
    'text-green-500', // 1 - Easy
    'text-blue-500', // 2 - Medium-Easy
    'text-yellow-500', // 3 - Medium
    'text-orange-500', // 4 - Medium-Hard
    'text-red-500' // 5 - Hard
  ];

  return colors[Math.min(difficulty, 5) - 1];
}
</script>

<div class="mt-4 w-full">
  <div class="table-wrapper rounded-lg bg-[var(--color-secondary)] shadow-sm">
    <table
      class="w-full min-w-[900px] table-fixed border-collapse overflow-hidden bg-[var(--color-secondary)]"
    >
      <thead>
        <tr>
          <th
            class="sticky top-0 z-10 w-[5%] cursor-pointer bg-[var(--color-tertiary)] p-3 text-center font-bold transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]"
            on:click={handleParticipatedFilter}
            title="Filter by participation status"
          >
            <div class="flex items-center justify-center gap-1">
              {#if participatedFilterState === 'participated'}
                <span class="text-sm font-bold text-[rgb(34_197_94)]">
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
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              {:else if participatedFilterState === 'not-participated'}
                <span class="text-sm font-bold text-[rgb(239_68_68)]">
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </span>
              {:else}
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
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
              {/if}
            </div>
          </th>
          <th
            class="sticky top-0 z-10 w-[6%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
            style="min-width: 50px;"
          >
          </th>
          <th class="sticky top-0 z-10 w-[34%] bg-[var(--color-tertiary)] p-3 text-left font-bold">
            Contest
          </th>
          <th
            class="sticky top-0 z-10 w-[15%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
          >
            Duration
          </th>
          <th
            class="sticky top-0 z-10 w-[15%] cursor-pointer bg-[var(--color-tertiary)] p-3 text-center font-bold transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]"
            on:click={handleDifficultySort}
            title="Click to sort by difficulty"
          >
            <div class="flex items-center justify-center gap-2">
              {#if difficultySortDirection === 'asc'}
                <span class="text-sm font-bold text-[var(--color-accent)]">▲</span>
              {:else if difficultySortDirection === 'desc'}
                <span class="text-sm font-bold text-[var(--color-accent)]">▼</span>
              {:else}
                <span
                  class="flex flex-col text-sm leading-[1] font-bold text-[var(--color-text-muted)]"
                >
                  <span>▲</span>
                  <span>▼</span>
                </span>
              {/if}
              <span>Difficulty</span>
            </div>
          </th>
          <th
            class="sticky top-0 z-10 w-[20%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
          >
            <div class="flex items-center justify-center">
              <div class="relative">
                <div class="flex items-center gap-1">
                  <div class="relative inline-block">
                    <select
                      class="appearance-none rounded border border-[var(--color-border)] bg-transparent px-2 py-1 pr-7 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
                      on:change={handleAuthorFilter}
                      value={authorFilter || 'all'}
                    >
                      <option value="all">All recommenders</option>
                      {#each authors as author}
                        <option value={author} style="color: var(--color-username);"
                          >@{author}</option
                        >
                      {/each}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-[var(--color-text-muted)]"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </th>
          <th class="sticky top-0 z-10 w-[5%] bg-[var(--color-tertiary)] p-3 text-right font-bold"
          ></th>
        </tr>
      </thead>
      <tbody>
        {#each filteredContests as contest}
          <tr
            class="relative border-b border-[var(--color-border)] transition-colors duration-200 last:border-b-0
            ${contest.id && userParticipation.has(contest.id)
              ? 'border-l-4 border-l-[rgb(34_197_94)] bg-[var(--color-solved-row)]'
              : 'hover:bg-black/5'}"
          >
            <td class="p-3 text-center">
              {#if contest.id}
                {@const hasParticipated = userParticipation.has(contest.id)}
                <button
                  class={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-sm transition-all duration-300
                    ${hasParticipated
                      ? 'solved-button bg-[rgb(34_197_94)] text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                      : 'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:border-[rgb(34_197_94)] hover:bg-[color-mix(in_oklab,rgb(34_197_94)_10%,transparent)] hover:text-[rgb(34_197_94)] hover:shadow-[0_0_5px_rgba(34,197,94,0.2)]'
                    } ${!isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
                  on:click={() => isAuthenticated && onToggleParticipation(contest.id!, !hasParticipated)}
                  title={hasParticipated ? 'Mark as not participated' : 'Mark as participated'}
                  aria-label={hasParticipated ? 'Mark as not participated' : 'Mark as participated'}
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
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </button>
              {/if}
            </td>
            <td class="p-3 text-center" style="min-width: 50px;">
              <span class="flex items-center justify-center">
                {#if contest.type === 'ICPC'}
                  <img src={icpcLogo} alt="ICPC" class="h-8 w-8 object-contain" />
                {:else}
                  <img src={codeforcesLogo} alt="Codeforces" class="h-6 w-6 object-contain" />
                {/if}
              </span>
            </td>
            <td class="truncate p-3">
              <a
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
                title={contest.name}
              >
                {contest.name}
              </a>
            </td>
            <td class="p-3 text-center">
              <span class="font-mono text-sm font-medium">
                {formatDuration(contest.durationSeconds)}
              </span>
            </td>
            <td class="p-3 text-center">
              {#if contest.difficulty !== undefined}
                <span class={`text-lg font-bold ${getDifficultyColorClass(contest.difficulty)}`}>
                  {getDifficultyStars(contest.difficulty)}
                </span>
              {:else}
                <span class="text-[var(--color-text-muted)]">-</span>
              {/if}
            </td>
            <td class="p-3 text-center">
              <a
                href={contest.addedByUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-[var(--color-username)] hover:underline"
              >
                @{contest.addedBy}
              </a>
            </td>
            <td class="p-3 text-right">
              <div class="flex items-center justify-end gap-3">
                <div class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-green-500"
                  >
                    <path d="M7 10v12" />
                    <path
                      d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"
                    />
                  </svg>
                  <span class="text-sm">{contest.likes}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-red-500"
                  >
                    <path d="M17 14V2" />
                    <path
                      d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"
                    />
                  </svg>
                  <span class="text-sm">{contest.dislikes}</span>
                </div>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
/* Ensure the table is responsive */
.table-wrapper {
  overflow-x: auto;
  position: relative;
}

/* Add smooth transitions for solved button */
.solved-button {
  transition: all 0.3s ease;
}

/* Add hover effects */
tr:hover .solved-button:not(:hover) {
  transform: scale(1.05);
}

/* Ensure proper text truncation */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
