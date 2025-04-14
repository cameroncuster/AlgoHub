<script lang="ts">
import { onMount } from 'svelte';
import { browser } from '$app/environment';
import { user } from '$lib/services/auth';
import { fetchUserPreferences, updateUserPreferences } from '$lib/services/user';
import type { UserPreferences } from '$lib/services/user';
import { goto } from '$app/navigation';

let preferences: UserPreferences = {
  hideFromLeaderboard: false
};

let loading: boolean = true;
let saving: boolean = false;
let error: string | null = null;
let success: string | null = null;
let isAuthenticated: boolean = false;

// Load user preferences
async function loadPreferences(): Promise<void> {
  if (!browser || !isAuthenticated) return;

  loading = true;
  error = null;

  try {
    const userPrefs = await fetchUserPreferences();
    console.log('Loaded preferences:', userPrefs);
    if (userPrefs) {
      preferences = userPrefs;
    }
  } catch (err) {
    console.error('Error loading user preferences:', err);
    error = 'Failed to load your preferences. Please try again later.';
  } finally {
    loading = false;
  }
}

// Save user preferences
async function savePreferences(): Promise<void> {
  if (!isAuthenticated) {
    error = 'You must be signed in to update your preferences';
    return;
  }

  saving = true;
  error = null;
  success = null;

  try {
    console.log('Saving preferences:', preferences);
    const result = await updateUserPreferences(preferences);
    console.log('Save result:', result);
    if (result) {
      success = 'Your preferences have been saved successfully.';
      // Clear success message after 3 seconds
      setTimeout(() => {
        success = null;
      }, 3000);
    } else {
      error = 'Failed to save your preferences. Please try again.';
    }
  } catch (err) {
    console.error('Error saving user preferences:', err);
    error = 'An error occurred while saving your preferences. Please try again.';
  } finally {
    saving = false;
  }
}

// Toggle the hide from leaderboard setting
function toggleHideFromLeaderboard(): void {
  preferences.hideFromLeaderboard = !preferences.hideFromLeaderboard;
  savePreferences();
}

// Load data on mount
onMount(() => {
  // Subscribe to auth state changes
  const unsubscribe = user.subscribe((value) => {
    isAuthenticated = !!value;
    
    // If user is not authenticated, redirect to home page
    if (!isAuthenticated && browser) {
      goto('/');
      return;
    }
    
    // Load preferences when auth state changes
    if (isAuthenticated) {
      loadPreferences();
    }
  });

  // Cleanup function
  return () => {
    unsubscribe();
  };
});
</script>

<svelte:head>
  <title>AlgoHub | Settings</title>
  <meta name="description" content="Manage your AlgoHub settings and preferences" />
</svelte:head>

<div class="mx-auto w-full max-w-[600px] px-4 py-8">
  <h1 class="mb-6 text-2xl font-bold text-[var(--color-heading)] sm:text-3xl">Settings</h1>

  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div>
        <svg
          class="mx-auto h-10 w-10 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="var(--color-primary)"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-2 text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  {:else if !isAuthenticated}
    <div class="rounded-lg bg-[var(--color-secondary)] p-6 shadow-sm">
      <p class="text-center text-[var(--color-text)]">
        You need to be signed in to access settings.
      </p>
    </div>
  {:else}
    <div class="rounded-lg bg-[var(--color-secondary)] p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h2 class="text-lg font-medium text-[var(--color-heading)]">Hide from Leaderboard</h2>
          <p class="text-sm text-[var(--color-text-muted)]">
            When enabled, your solved problems will not be displayed on the leaderboard.
          </p>
        </div>
        
        <button
          type="button"
          role="switch"
          aria-checked={preferences.hideFromLeaderboard}
          class="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer items-center rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
          on:click={toggleHideFromLeaderboard}
          disabled={saving}
        >
          <span class="sr-only">Hide from leaderboard</span>
          <span
            class="absolute h-full w-full rounded-full bg-gray-300 transition-colors duration-200 {preferences.hideFromLeaderboard ? 'bg-[var(--color-primary)]' : ''} {saving ? 'opacity-50' : ''}"
          ></span>
          <span
            class="absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white transition-transform duration-200 {preferences.hideFromLeaderboard ? 'translate-x-6' : ''} {saving ? 'opacity-50' : ''}"
          ></span>
        </button>
      </div>

      {#if error}
        <div class="mt-4 rounded bg-red-100 p-2 text-sm text-red-700">
          <p>{error}</p>
        </div>
      {/if}

      {#if success}
        <div class="mt-4 rounded bg-green-100 p-2 text-sm text-green-700">
          <p>{success}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
/* Add some spacing for mobile */
@media (max-width: 640px) {
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
