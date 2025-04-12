<script lang="ts">
import type { Contest } from '$lib/services/contest';
import { formatDuration } from '$lib/services/contest';
import { user } from '$lib/services/auth';
import { createEventDispatcher } from 'svelte';
import RecommendersFilter from './RecommendersFilter.svelte';
import BaseTable from './tables/BaseTable.svelte';
import StatusFilter from './tables/StatusFilter.svelte';
import SourceFilter from './tables/SourceFilter.svelte';
import SortableHeader from './tables/SortableHeader.svelte';
import StatusButton from './tables/StatusButton.svelte';
import FeedbackButtons from './tables/FeedbackButtons.svelte';

// Event dispatcher
const dispatch = createEventDispatcher();

// Use static image paths for logos
const codeforcesLogo = '/images/codeforces.png';
const icpcLogo = '/images/icpc.svg';

// Props
export let contests: Contest[] = [];
export let userParticipation: Set<string> = new Set();
export let userFeedback: Record<string, 'like' | 'dislike' | null> = {};
export let onToggleParticipation: (contestId: string, hasParticipated: boolean) => Promise<void>;
export let onLike: (contestId: string, isLike: boolean) => Promise<void>;
export let allAuthors: string[] = []; // New prop for filtered authors

// Computed
$: isAuthenticated = !!$user;

// Filter states
let difficultyFilter: number | null = null;
let difficultySortDirection: 'asc' | 'desc' | null = null;
let participatedFilterState: 'all' | 'active' | 'inactive' = 'all';
let authorFilter: string | null = null;
let typeFilterState: 'all' | 'icpc' | 'codeforces' = 'all';

// Get unique authors for filter dropdown
// If allAuthors is provided, use it; otherwise, fall back to extracting from current contests
$: uniqueAuthors =
  allAuthors.length > 0
    ? [...allAuthors].sort()
    : [...new Set(contests.map((contest) => contest.addedBy))].sort();

// Source filter options
const typeOptions = [
  {
    value: 'icpc',
    icon: `<img src="${icpcLogo}" alt="ICPC" class="h-6 w-6 object-contain" />`,
    color: 'rgb(34 197 94)'
  },
  {
    value: 'codeforces',
    icon: `<img src="${codeforcesLogo}" alt="Codeforces" class="h-5 w-5 object-contain" />`,
    color: 'rgb(239 68 68)'
  }
];

// Handle events
function handleDifficultySort(event: CustomEvent<{ direction: 'asc' | 'desc' | null }>) {
  difficultySortDirection = event.detail.direction;
  dispatch('sortDifficulty', { direction: difficultySortDirection });
}

function handleParticipatedFilter(event: CustomEvent<{ state: 'all' | 'active' | 'inactive' }>) {
  const stateMap: Record<string, 'all' | 'participated' | 'not-participated'> = {
    all: 'all',
    active: 'participated',
    inactive: 'not-participated'
  };
  participatedFilterState = event.detail.state;
  dispatch('filterParticipated', { state: stateMap[participatedFilterState] });
}

function handleTypeFilter(event: CustomEvent<{ source: string | null }>) {
  typeFilterState = event.detail.source
    ? (event.detail.source as 'all' | 'icpc' | 'codeforces')
    : 'all';
  dispatch('filterType', { type: typeFilterState });
}

function handleFeedback(event: CustomEvent<{ itemId: string; isLike: boolean }>) {
  const { itemId, isLike } = event.detail;
  onLike(itemId, isLike);
}

function handleStatusToggle(event: CustomEvent<{ itemId: string; isActive: boolean }>) {
  const { itemId, isActive } = event.detail;
  onToggleParticipation(itemId, isActive);
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

// Apply filters to contests
$: filteredContests = contests.filter((contest) => {
  // Filter by difficulty
  if (difficultyFilter !== null && contest.difficulty !== difficultyFilter) {
    return false;
  }

  // Filter by participation status
  const stateMap: Record<string, 'all' | 'participated' | 'not-participated'> = {
    all: 'all',
    active: 'participated',
    inactive: 'not-participated'
  };
  const mappedState = stateMap[participatedFilterState];

  if (mappedState === 'participated' && contest.id && !userParticipation.has(contest.id)) {
    return false;
  }
  if (mappedState === 'not-participated' && contest.id && userParticipation.has(contest.id)) {
    return false;
  }

  // Filter by author
  if (authorFilter && contest.addedBy !== authorFilter) {
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

// Icons for participated filter
const participatedIcon = `
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
  `;

const notParticipatedIcon = `
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
  `;

const allIcon = `
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
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </svg>
  `;
</script>

<BaseTable>
  <svelte:fragment slot="header">
    <th
      class="sticky top-0 z-10 w-[5%] cursor-pointer bg-[var(--color-tertiary)] p-3 text-center font-bold transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]"
      title="Filter by participation status"
    >
      <StatusFilter
        state={participatedFilterState}
        activeIcon={participatedIcon}
        inactiveIcon={notParticipatedIcon}
        allIcon={allIcon}
        activeColor="rgb(34 197 94)"
        title="Filter by participation status"
        on:change={handleParticipatedFilter}
      />
    </th>
    <th
      class="sticky top-0 z-10 w-[6%] cursor-pointer bg-[var(--color-tertiary)] p-3 text-center font-bold transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]"
      style="min-width: 50px;"
      title="Filter by contest type"
    >
      <SourceFilter
        state={typeFilterState}
        options={typeOptions}
        title="Filter by contest type"
        on:change={handleTypeFilter}
      />
    </th>
    <th class="sticky top-0 z-10 w-[34%] bg-[var(--color-tertiary)] p-3 text-left font-bold"
      >Contest</th
    >
    <th class="sticky top-0 z-10 w-[12%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
      >Duration</th
    >
    <th
      class="sticky top-0 z-10 w-[15%] cursor-pointer bg-[var(--color-tertiary)] p-3 text-center font-bold transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]"
      title="Click to sort by difficulty"
    >
      <SortableHeader
        direction={difficultySortDirection}
        label="Difficulty"
        on:sort={handleDifficultySort}
      />
    </th>
    <th class="sticky top-0 z-10 w-[21%] bg-[var(--color-tertiary)] p-3 text-left font-bold">
      <div class="flex items-center gap-2">
        <RecommendersFilter
          authors={uniqueAuthors}
          selectedAuthor={authorFilter}
          width="w-auto min-w-[160px]"
          onAuthorChange={(author) => {
              authorFilter = author;
              dispatch('filterAuthor', { author: authorFilter });
            }}
        />
      </div>
    </th>
    <th class="sticky top-0 z-10 w-[5%] bg-[var(--color-tertiary)] p-3 text-right font-bold"></th>
  </svelte:fragment>

  <svelte:fragment slot="body">
    {#each filteredContests as contest}
      <tr
        class="relative border-b border-[var(--color-border)] transition-colors duration-200 last:border-b-0
          ${contest.id && userParticipation.has(contest.id)
            ? 'border-l-4 border-l-[rgb(34_197_94)] bg-[var(--color-solved-row)]'
            : 'hover:bg-black/5'}"
      >
        <td class="p-3 text-center">
          {#if contest.id}
            <StatusButton
              itemId={contest.id}
              isActive={userParticipation.has(contest.id)}
              isAuthenticated={isAuthenticated}
              on:toggle={handleStatusToggle}
            />
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
        <td class="p-3 text-left">
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
          {#if contest.id}
            <FeedbackButtons
              itemId={contest.id}
              likes={contest.likes}
              dislikes={contest.dislikes}
              userFeedback={userFeedback[contest.id]}
              isAuthenticated={isAuthenticated}
              on:feedback={handleFeedback}
            />
          {/if}
        </td>
      </tr>
    {/each}
  </svelte:fragment>
</BaseTable>

<style>
/* Ensure proper text truncation */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
