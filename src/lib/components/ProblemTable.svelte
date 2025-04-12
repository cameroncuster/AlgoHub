<script lang="ts">
import type { Problem } from '$lib/services/problem';
import { user } from '$lib/services/auth';
import { createEventDispatcher } from 'svelte';
import RecommendersFilter from './RecommendersFilter.svelte';
import BaseTable from './tables/BaseTable.svelte';
import StatusFilter from './tables/StatusFilter.svelte';
import SourceFilter from './tables/SourceFilter.svelte';
import SortableHeader from './tables/SortableHeader.svelte';
import StatusButton from './tables/StatusButton.svelte';
import FeedbackButtons from './tables/FeedbackButtons.svelte';

// Use static image paths instead of imports
const codeforcesLogo = '/images/codeforces.png';
const kattisLogo = '/images/kattis.png';

// Event dispatcher
const dispatch = createEventDispatcher();

// Props
export let problems: Problem[] = [];
export let userFeedback: Record<string, 'like' | 'dislike' | null> = {};
export let userSolvedProblems: Set<string> = new Set();
export let onLike: (problemId: string, isLike: boolean) => Promise<void>;
export let onToggleSolved: (problemId: string, isSolved: boolean) => Promise<void>;

// State
let isAuthenticated = false;
let difficultySortDirection: 'asc' | 'desc' | null = null;
let solvedFilterState: 'all' | 'active' | 'inactive' = 'all';
let authorFilterValue: string | null = null;
let sourceFilterValue: 'all' | 'codeforces' | 'kattis' = 'all';
let uniqueAuthors: string[] = [];

// Subscribe to auth state
user.subscribe((value) => {
  isAuthenticated = !!value;
});

// We need to get all authors from the parent component
export let allAuthors: string[] = [];

// If allAuthors is not provided, fall back to extracting from current problems
$: {
  if (allAuthors.length === 0) {
    uniqueAuthors = [...new Set(problems.map((p) => p.addedBy))].sort();
  } else {
    uniqueAuthors = [...allAuthors].sort();
  }
}

// Source filter options
const sourceOptions = [
  {
    value: 'codeforces',
    icon: `<img src="${codeforcesLogo}" alt="Codeforces" class="h-5 w-5 object-contain" />`,
    color: '#3B5998'
  },
  {
    value: 'kattis',
    icon: `<img src="${kattisLogo}" alt="Kattis" class="h-5 w-5 object-contain" />`,
    color: '#f2ae00'
  }
];

// Handle events
function handleDifficultySort(event: CustomEvent<{ direction: 'asc' | 'desc' | null }>) {
  difficultySortDirection = event.detail.direction;
  dispatch('sortDifficulty', { direction: difficultySortDirection });
}

function handleSolvedFilter(event: CustomEvent<{ state: 'all' | 'active' | 'inactive' }>) {
  const stateMap: Record<string, 'all' | 'solved' | 'unsolved'> = {
    all: 'all',
    active: 'solved',
    inactive: 'unsolved'
  };
  solvedFilterState = event.detail.state;
  dispatch('filterSolved', { state: stateMap[solvedFilterState] });
}

function handleSourceFilter(event: CustomEvent<{ source: string | null }>) {
  sourceFilterValue = event.detail.source
    ? (event.detail.source as 'all' | 'codeforces' | 'kattis')
    : 'all';
  dispatch('filterSource', { source: event.detail.source });
}

function handleFeedback(event: CustomEvent<{ itemId: string; isLike: boolean }>) {
  const { itemId, isLike } = event.detail;
  onLike(itemId, isLike);
}

function handleStatusToggle(event: CustomEvent<{ itemId: string; isActive: boolean }>) {
  const { itemId, isActive } = event.detail;
  onToggleSolved(itemId, isActive);
}

// Define common tiers
const TIERS = [
  [3000, 'Legendary Grandmaster'],
  [2600, 'International Grandmaster'],
  [2400, 'Grandmaster'],
  [2300, 'International Master'],
  [2100, 'Master'],
  [1900, 'Candidate Master'],
  [1600, 'Expert'],
  [1400, 'Specialist'],
  [1200, 'Pupil']
] as const;

// Get rating color class
function getRatingColor(rating: number | undefined): string {
  if (!rating) return 'unrated';
  const tier = TIERS.find(([min]) => rating >= min)?.[1];
  if (!tier) return 'newbie';
  return tier.toLowerCase().replace(' ', '-');
}

// Get rating tier display name
function getRatingTierName(rating: number | undefined): string {
  if (!rating) return 'Unrated';
  return TIERS.find(([min]) => rating >= min)?.[1] || 'Newbie';
}

// Function to get difficulty tooltip text
function getDifficultyTooltip(problem: Problem): string {
  if (problem.source === 'kattis') {
    return `Kattis difficulty mapped from 1-10 scale to 800-3500 rating range`;
  } else {
    return `${getRatingTierName(problem.difficulty)}`;
  }
}

// Icons for solved filter
const solvedIcon = `
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
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fill="none" opacity="0.2" />
  </svg>
  `;

const unsolvedIcon = `
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
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" fill="none" opacity="0.2" />
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
      title="Filter by solved status"
    >
      <StatusFilter
        state={solvedFilterState}
        activeIcon={solvedIcon}
        inactiveIcon={unsolvedIcon}
        allIcon={allIcon}
        activeColor="rgb(34 197 94)"
        title="Filter by solved status"
        on:change={handleSolvedFilter}
      />
    </th>
    <th
      class="sticky top-0 z-10 w-[5%] cursor-pointer bg-[var(--color-tertiary)] p-3 text-center font-bold transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]"
      title="Filter by source"
    >
      <SourceFilter
        state={sourceFilterValue}
        options={sourceOptions}
        title="Filter by source"
        on:change={handleSourceFilter}
      />
    </th>
    <th class="sticky top-0 z-10 w-[25%] bg-[var(--color-tertiary)] p-3 text-left font-bold"
      >Problem</th
    >
    <th
      class="sticky top-0 z-10 w-[10%] cursor-pointer bg-[var(--color-tertiary)] p-3 py-4 text-center font-bold transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]"
      title="Click to sort by difficulty"
    >
      <SortableHeader
        direction={difficultySortDirection}
        label="Difficulty"
        on:sort={handleDifficultySort}
      />
    </th>
    <th class="sticky top-0 z-10 w-[10%] bg-[var(--color-tertiary)] p-3 text-left font-bold"
      >Topic</th
    >
    <th class="sticky top-0 z-10 w-[22%] bg-[var(--color-tertiary)] p-3 text-left font-bold">
      <div class="flex items-center gap-2">
        <RecommendersFilter
          authors={uniqueAuthors}
          selectedAuthor={authorFilterValue}
          onAuthorChange={(author) => {
              authorFilterValue = author;
              dispatch('filterAuthor', { author: authorFilterValue });
            }}
        />
      </div>
    </th>
    <th class="sticky top-0 z-10 w-[20%] bg-[var(--color-tertiary)] p-3 text-right font-bold"></th>
  </svelte:fragment>

  <svelte:fragment slot="body">
    {#each problems as problem}
      <tr
        class="relative border-b border-[var(--color-border)] transition-colors duration-200 last:border-b-0
          ${problem.id && userSolvedProblems.has(problem.id)
            ? 'border-l-4 border-l-[rgb(34_197_94)] bg-[var(--color-solved-row)]'
            : 'hover:bg-black/5'}"
      >
        <td class="p-3 text-center">
          {#if problem.id}
            <StatusButton
              itemId={problem.id}
              isActive={userSolvedProblems.has(problem.id)}
              isAuthenticated={isAuthenticated}
              on:toggle={handleStatusToggle}
            />
          {/if}
        </td>
        <td class="p-3 text-center">
          <span class="flex items-center justify-center">
            <img
              src={problem.source === 'codeforces' ? codeforcesLogo : kattisLogo}
              alt={problem.source}
              class="h-6 w-6 object-contain"
            />
          </span>
        </td>
        <td class="truncate p-3">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
            title={problem.name}
          >
            {problem.name}
          </a>
        </td>
        <td class="p-3 text-center">
          <span
            class="group relative inline-block rounded px-2 py-1 font-bold
                text-white
                 {problem.source === 'codeforces' ? 'cursor-default' : 'cursor-help'}"
            style="background-color: var(--color-{getRatingColor(problem.difficulty)})"
          >
            {problem.difficulty}
            <span
              class="invisible absolute bottom-full left-1/2 z-50 -translate-x-1/2 transform rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] text-left text-xs leading-relaxed font-normal whitespace-pre-line text-[var(--color-text)] opacity-0 shadow-md transition-opacity duration-300 group-hover:visible group-hover:opacity-100 {problem.source === 'codeforces'
                  ? 'w-auto max-w-fit min-w-0 p-1.5 px-3 text-center whitespace-nowrap'
                  : 'w-[280px] p-2.5'} mb-0.3"
            >
              {getDifficultyTooltip(problem)}
            </span>
          </span>
        </td>
        <td class="p-3">
          {#if problem.type}
            <span
              class="inline-block rounded bg-[var(--color-tertiary)] px-2 py-1 text-sm text-[var(--color-text)]"
            >
              {problem.type}
            </span>
          {:else}
            <span class="text-[var(--color-text-muted)]">-</span>
          {/if}
        </td>
        <td class="truncate p-3">
          <a
            href={problem.addedByUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[var(--color-username)] hover:text-[color-mix(in_oklab,var(--color-username)_80%,white)] hover:underline"
            title={"@" + problem.addedBy}
          >
            @{problem.addedBy}
          </a>
        </td>
        <td class="p-3 text-right">
          {#if problem.id}
            <FeedbackButtons
              itemId={problem.id}
              likes={problem.likes}
              dislikes={problem.dislikes}
              userFeedback={userFeedback[problem.id]}
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
/* Ensure table is responsive and centered */
@media (max-width: 768px) {
  div {
    margin-left: auto;
    margin-right: auto;
  }
}

/* Remove margin between sidebar and table */
@media (min-width: 768px) {
  :global(.table-wrapper) {
    margin-left: 0;
  }
}
</style>
