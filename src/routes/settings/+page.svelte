<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { user } from '$lib/services/auth';
import { fetchUserPreferences, updateUserPreferences } from '$lib/services/user';
import type { UserPreferences } from '$lib/services/user';
import type { Unsubscriber } from 'svelte/store';

// Get the session data from the server
export let data;
// We don't directly use data in the template, but it's required for the server-side check

let preferences: UserPreferences = {
  hideFromLeaderboard: false
};

let loading: boolean = true;
let saving: boolean = false;
let error: string | null = null;
let success: string | null = null;
let userUnsubscribe: Unsubscriber | null = null;

// Load user preferences
async function loadPreferences(): Promise<void> {
  loading = true;
  error = null;

  try {
    const userPrefs = await fetchUserPreferences();
    if (userPrefs) {
      preferences = userPrefs;
    }
  } catch (err) {
    error = 'Failed to load preferences';
  } finally {
    loading = false;
  }
}

// Save user preferences
async function savePreferences(): Promise<void> {
  saving = true;
  error = null;
  success = null;

  try {
    const result = await updateUserPreferences(preferences);
    if (result) {
      success = 'Saved';
      setTimeout(() => {
        success = null;
      }, 2000);
    } else {
      error = 'Failed to save';
    }
  } catch (err) {
    error = 'Failed to save';
  } finally {
    saving = false;
  }
}

// Toggle the hide from leaderboard setting
function toggleHideFromLeaderboard(): void {
  preferences.hideFromLeaderboard = !preferences.hideFromLeaderboard;
  savePreferences();
}

// Initialize auth state and load preferences
onMount(() => {
  // Load preferences immediately since we know the user is authenticated
  // (the server-side load function already checked this)
  loadPreferences();

  // Set up a subscription to handle logout events
  userUnsubscribe = user.subscribe((value) => {
    if (value === null) {
      // User logged out, redirect to home
      goto('/');
    }
  });

  // Cleanup function
  return () => {
    if (userUnsubscribe) {
      userUnsubscribe();
    }
  };
});
</script>

<svelte:head>
  <title>Settings</title>
  <meta name="description" content="User settings" />
</svelte:head>

<div class="mx-auto w-full max-w-[1200px] px-4 py-6">
  {#if loading}
    <div class="flex h-[200px] items-center justify-center">
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-tertiary)] border-t-[var(--color-primary)]"
      ></div>
    </div>
  {:else}
    <div class="mb-4 flex h-6 justify-end">
      {#if success}
        <div class="text-sm font-medium text-[var(--color-primary)]">{success}</div>
      {/if}
      {#if error}
        <div class="text-sm font-medium text-[var(--color-accent)]">{error}</div>
      {/if}
    </div>

    <div class="overflow-hidden rounded">
      <div class="border-b border-[var(--color-border)] bg-[var(--color-tertiary)] p-4">
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-[var(--color-text-muted)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="font-bold text-[var(--color-heading)]">Privacy</span>
        </div>
      </div>

      <div class="bg-[var(--color-tertiary)] p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-[var(--color-text)]">Hide from leaderboard</p>
          </div>

          <div class="w-11 flex-shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={preferences.hideFromLeaderboard}
              class="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:outline-none"
              on:click={toggleHideFromLeaderboard}
              disabled={saving}
            >
              <span class="sr-only">Hide from leaderboard</span>
              <span
                class="absolute h-full w-full rounded-full transition-colors duration-200 {preferences.hideFromLeaderboard ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-text-muted)]'} {saving ? 'opacity-50' : ''}"
              ></span>
              <span
                class="absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full bg-white transition-transform duration-200 {preferences.hideFromLeaderboard ? 'translate-x-5' : ''} {saving ? 'opacity-50' : ''}"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
