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
  <div class="table-wrapper rounded-lg bg-[var(--color-secondary)] shadow-sm">
    <table
      class="w-full min-w-[900px] table-fixed border-collapse overflow-hidden bg-[var(--color-secondary)]"
    >
      <thead>
        <tr>
          <th
            class="sticky top-0 z-10 w-[10%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
          >
            Rank
          </th>
          <th class="sticky top-0 z-10 w-[60%] bg-[var(--color-tertiary)] p-3 text-left font-bold">
            User
          </th>
          <th
            class="sticky top-0 z-10 w-[30%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
          >
            Solves
          </th>
        </tr>
      </thead>
      <tbody>
        {#each leaderboardEntries as entry}
          <tr
            class="relative border-b border-[var(--color-border)] transition-colors duration-200 last:border-b-0 hover:bg-black/5"
          >
            <td class="p-3 text-center">
              <!-- Rank with special styling for top 3 -->
              {#if entry.rank === 1}
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-legendary-grandmaster)] font-bold text-white"
                >
                  {entry.rank}
                </span>
              {:else if entry.rank === 2}
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-specialist)] font-bold text-white"
                >
                  {entry.rank}
                </span>
              {:else if entry.rank === 3}
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-pupil)] font-bold text-white"
                >
                  {entry.rank}
                </span>
              {:else}
                <span class="font-medium text-[var(--color-text-muted)]">{entry.rank}</span>
              {/if}
            </td>
            <td class="p-3">
              <div class="flex items-center gap-3">
                {#if entry.avatarUrl}
                  <img
                    src={entry.avatarUrl}
                    alt={entry.username}
                    class="h-10 w-10 rounded-full border border-[var(--color-border)]"
                  />
                {:else}
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-tertiary)] text-sm font-medium"
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
            <td class="p-3 text-center font-medium">
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

/* Ensure username is always purple */
a[href*='github.com'] {
  color: var(--color-username) !important;
}

a[href*='github.com']:hover {
  color: color-mix(in oklab, var(--color-username) 80%, white) !important;
}
</style>
