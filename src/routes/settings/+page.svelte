<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { user } from '$lib/services/auth';
import { fetchUserPreferences, updateUserPreferences } from '$lib/services/user';
import type { UserPreferences } from '$lib/services/user';
import type { Unsubscriber } from 'svelte/store';
import { supabase } from '$lib/services/database';
import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

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
    console.log('loadPreferences: Fetching user preferences');
    const userPrefs = await fetchUserPreferences();
    if (userPrefs) {
      console.log('loadPreferences: User preferences loaded', userPrefs);
      preferences = userPrefs;
    } else {
      console.log('loadPreferences: No preferences returned, using defaults');
      // If no preferences were returned, try to create them
      const result = await updateUserPreferences({
        hideFromLeaderboard: false
      });

      if (result) {
        console.log('loadPreferences: Default preferences created');
        // Set the default preferences in the UI
        preferences = {
          hideFromLeaderboard: false
        };
      } else {
        console.log('loadPreferences: Failed to create default preferences');
      }
    }
  } catch (err) {
    console.error('loadPreferences: Error loading preferences', err);
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
    console.log('savePreferences: Saving preferences', preferences);
    const result = await updateUserPreferences(preferences);
    if (result) {
      console.log('savePreferences: Preferences saved successfully');
      success = 'Saved';
      setTimeout(() => {
        success = null;
      }, 2000);
    } else {
      console.error('savePreferences: Failed to save preferences');
      error = 'Failed to save';
    }
  } catch (err) {
    console.error('savePreferences: Error saving preferences', err);
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
  // Create a flag to track if we've already checked auth
  let authChecked = false;
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

  // First, directly check the session
  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // No session, redirect to home
        goto('/');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error checking session:', err);
      return false;
    }
  };

  // Function to load preferences with a delay
  const loadPreferencesWithDelay = () => {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Set a timeout to ensure user state is fully initialized
    loadingTimeout = setTimeout(async () => {
      console.log('Loading preferences after delay');

      // Try to directly check the toggle state from the database
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const userId = data.session.user.id;
          console.log('Directly checking preferences for user', userId);

          const { data: prefData, error } = await supabase
            .from('user_preferences')
            .select('hide_from_leaderboard')
            .eq('user_id', userId)
            .single();

          if (prefData && !error) {
            console.log('Direct preference check result:', prefData);
            preferences = {
              hideFromLeaderboard: prefData.hide_from_leaderboard
            };
            loading = false;
            return;
          } else {
            console.log('No direct preferences found, falling back to normal load');
          }
        }
      } catch (err) {
        console.error('Error in direct preference check:', err);
      }

      // Fall back to normal loading if direct check fails
      loadPreferences();
    }, 500); // 500ms delay
  };

  // Check session and load preferences if authenticated
  checkSession().then((isAuthenticated) => {
    if (isAuthenticated) {
      authChecked = true;
      loadPreferencesWithDelay();
    }
  });

  // Also set up a subscription to handle auth state changes
  userUnsubscribe = user.subscribe(async (value) => {
    console.log('User state changed:', value ? 'logged in' : 'logged out');

    // If we haven't checked auth yet, do it now
    if (!authChecked && value === null) {
      // Double-check with the API directly
      const isAuthenticated = await checkSession();
      if (!isAuthenticated) {
        goto('/');
        return;
      }
    } else if (value === null) {
      // User logged out, redirect to home
      goto('/');
      return;
    } else if (!authChecked || value) {
      // User is authenticated and we haven't loaded preferences yet
      // OR user state just changed to logged in
      authChecked = true;
      loadPreferencesWithDelay();
    }
  });

  // Cleanup function
  return () => {
    if (userUnsubscribe) {
      userUnsubscribe();
    }
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
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

    <!-- Theme Settings Section -->
    {#if !loading}
      <div class="mt-6 overflow-hidden rounded">
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
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              />
            </svg>
            <span class="font-bold text-[var(--color-heading)]">Theme</span>
          </div>
        </div>

        <div class="bg-[var(--color-secondary)] p-4">
          <ThemeSwitcher />
          <p class="mt-2 text-sm text-[var(--color-text-muted)]">
            Choose your preferred theme. Your selection will be remembered when you return.
          </p>
        </div>
      </div>
    {/if}
  {/if}
</div>
