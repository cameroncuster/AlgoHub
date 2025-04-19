<script lang="ts">
import type { LeaderboardEntry } from '$lib/services/leaderboard';

// Props
export let leaderboardEntries: LeaderboardEntry[] = [];

// Format large numbers with commas
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
</script>

<div class="mt-4 w-full">
  <div
    class="table-wrapper rounded-md border-2 border-[var(--color-border)] bg-[var(--color-secondary)] shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
  >
    <table
      class="w-full table-fixed border-collapse overflow-hidden bg-[var(--color-secondary)] font-mono text-sm"
    >
      <thead>
        <tr>
          <th
            class="sticky top-0 z-10 w-[15%] border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-2 text-center font-bold sm:w-[10%] sm:p-3"
          >
            Rank
          </th>
          <th
            class="sticky top-0 z-10 w-[55%] border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-2 text-left font-bold sm:w-[60%] sm:p-3"
          >
            User
          </th>
          <th
            class="sticky top-0 z-10 w-[30%] border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-2 text-center font-bold sm:p-3"
          >
            Solves
          </th>
        </tr>
      </thead>
      <tbody>
        {#each leaderboardEntries as entry}
          <tr
            class="relative border-b border-[var(--color-border)] transition-colors duration-200 last:border-b-0 hover:bg-[var(--color-tertiary)]/30"
          >
            <td class="p-2 text-center sm:p-3">
              <!-- Rank with special styling for top 3 -->
              {#if entry.rank === 1}
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded bg-[var(--color-legendary-grandmaster)] font-bold text-white shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
                >
                  {entry.rank}
                </span>
              {:else if entry.rank === 2}
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded bg-[var(--color-specialist)] font-bold text-white shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
                >
                  {entry.rank}
                </span>
              {:else if entry.rank === 3}
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded bg-[var(--color-pupil)] font-bold text-white shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
                >
                  {entry.rank}
                </span>
              {:else}
                <span class="font-medium text-[var(--color-text-muted)]">{entry.rank}</span>
              {/if}
            </td>
            <td class="p-2 sm:p-3">
              <div class="flex items-center gap-1 sm:gap-3">
                {#if entry.avatarUrl}
                  <img
                    src={entry.avatarUrl}
                    alt={entry.username}
                    class="h-8 w-8 rounded sm:h-10 sm:w-10"
                  />
                {:else}
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-tertiary)] text-xs font-medium shadow-[1px_1px_0_rgba(0,0,0,0.1)] sm:h-10 sm:w-10 sm:text-sm"
                  >
                    {entry.username.substring(0, 2).toUpperCase()}
                  </div>
                {/if}
                <a
                  href={entry.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[var(--color-username)] hover:text-[color-mix(in_oklab,var(--color-username)_80%,white)] hover:underline"
                  title={"@" + entry.username}
                >
                  @{entry.username}
                </a>
              </div>
            </td>
            <td class="p-2 text-center font-medium sm:p-3">
              {formatNumber(entry.problemsSolved)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
/* Ensure table is responsive and centered */
@media (max-width: 768px) {
  div {
    margin-left: auto;
    margin-right: auto;
  }

  /* Make username text smaller on mobile */
  a[href*='github.com'] {
    font-size: 0.9rem;
  }
}

/* Remove margin between sidebar and table */
@media (min-width: 768px) {
  .table-wrapper {
    margin-left: 0;
  }
}

/* Ensure table fits within container */
.w-full {
  max-width: 100%;
}

/* Ensure proper table scrolling */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

/* Extra small screen adjustments */
@media (max-width: 480px) {
  /* Further reduce padding and spacing */
  td,
  th {
    padding: 0.5rem 0.25rem !important;
  }

  /* Make rank bubbles smaller on very small screens */
  .inline-flex.h-8.w-8 {
    height: 1.5rem !important;
    width: 1.5rem !important;
    font-size: 0.75rem !important;
  }
}

/* Ensure username is always purple */
a[href*='github.com'] {
  color: var(--color-username) !important;
}

a[href*='github.com']:hover {
  color: color-mix(in oklab, var(--color-username) 80%, white) !important;
}
</style>
