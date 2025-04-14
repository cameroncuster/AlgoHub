<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { user } from '$lib/services/auth';
import { 
  fetchUserPlatformUsernames, 
  saveUserPlatformUsernames,
  importCodeforcesSolves,
  importKattisSolves
} from '$lib/services/userPlatforms';
import type { UserPlatformUsernames } from '$lib/services/userPlatforms';
import type { Unsubscriber } from 'svelte/store';

// Form state
let codeforcesUsername = '';
let kattisUsername = '';
let loading = false;
let saving = false;
let importing = false;
let error: string | null = null;
let success: string | null = null;
let userPlatforms: UserPlatformUsernames | null = null;

// Import results
let codeforcesImportResult: { totalSolved?: number; importedCount?: number } | null = null;
let kattisImportResult: { totalSolved?: number; importedCount?: number } | null = null;

// Auth state
let userUnsubscribe: Unsubscriber | undefined;

// Initialize auth state
onMount(() => {
  // Check if user is logged in
  const currentUser = user.subscribe((value) => {
    if (!value) {
      // Redirect to home if not logged in
      goto('/');
    }
  });

  // Load user platform usernames
  loadUserPlatforms();

  // Cleanup
  return () => {
    if (currentUser) {
      currentUser();
    }
  };
});

// Load user platform usernames
async function loadUserPlatforms() {
  loading = true;
  error = null;
  
  try {
    userPlatforms = await fetchUserPlatformUsernames();
    
    if (userPlatforms) {
      codeforcesUsername = userPlatforms.codeforces_username || '';
      kattisUsername = userPlatforms.kattis_username || '';
    }
  } catch (err) {
    console.error('Error loading user platforms:', err);
    error = 'Failed to load your platform usernames. Please try again.';
  } finally {
    loading = false;
  }
}

// Save user platform usernames
async function handleSave() {
  saving = true;
  error = null;
  success = null;
  
  try {
    const result = await saveUserPlatformUsernames(codeforcesUsername, kattisUsername);
    
    if (result.success) {
      success = 'Your platform usernames have been saved successfully.';
      await loadUserPlatforms();
    } else {
      error = result.message || 'Failed to save your platform usernames. Please try again.';
    }
  } catch (err) {
    console.error('Error saving user platforms:', err);
    error = 'Failed to save your platform usernames. Please try again.';
  } finally {
    saving = false;
  }
}

// Import solved problems
async function handleImport() {
  importing = true;
  error = null;
  success = null;
  codeforcesImportResult = null;
  kattisImportResult = null;
  
  try {
    // Save usernames first
    const saveResult = await saveUserPlatformUsernames(codeforcesUsername, kattisUsername);
    
    if (!saveResult.success) {
      error = saveResult.message || 'Failed to save your platform usernames. Please try again.';
      return;
    }
    
    // Import from Codeforces if username is provided
    if (codeforcesUsername) {
      const cfResult = await importCodeforcesSolves(codeforcesUsername);
      
      if (cfResult.success) {
        codeforcesImportResult = {
          totalSolved: cfResult.totalSolved,
          importedCount: cfResult.importedCount
        };
      } else {
        error = cfResult.message || 'Failed to import Codeforces solves. Please try again.';
        return;
      }
    }
    
    // Import from Kattis if username is provided
    if (kattisUsername) {
      const kattisResult = await importKattisSolves(kattisUsername);
      
      if (kattisResult.success) {
        kattisImportResult = {
          totalSolved: kattisResult.totalSolved,
          importedCount: kattisResult.importedCount
        };
      } else {
        error = kattisResult.message || 'Failed to import Kattis solves. Please try again.';
        return;
      }
    }
    
    // Show success message if at least one platform was imported
    if (codeforcesImportResult || kattisImportResult) {
      success = 'Your solved problems have been imported successfully.';
    } else {
      error = 'Please provide at least one platform username to import solved problems.';
    }
  } catch (err) {
    console.error('Error importing solved problems:', err);
    error = 'Failed to import your solved problems. Please try again.';
  } finally {
    importing = false;
  }
}
</script>

<svelte:head>
  <title>AlgoHub | Import Solved Problems</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
  <h1 class="mb-6 text-3xl font-bold text-[var(--color-heading)]">Import Solved Problems</h1>
  
  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent"></div>
    </div>
  {:else}
    {#if error}
      <div class="mb-6 rounded-md bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        <p>{error}</p>
      </div>
    {/if}
    
    {#if success}
      <div class="mb-6 rounded-md bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-300">
        <p>{success}</p>
      </div>
    {/if}
    
    <div class="mb-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <h2 class="mb-4 text-xl font-semibold text-[var(--color-heading)]">Platform Usernames</h2>
      <p class="mb-6 text-[var(--color-text)]">
        Enter your Codeforces and Kattis usernames to import your solved problems. We'll match your
        solved problems with the problems in our database and mark them as solved for you.
      </p>
      
      <form on:submit|preventDefault={handleSave}>
        <div class="mb-6">
          <label for="codeforcesUsername" class="mb-2 block font-semibold text-[var(--color-heading)]">
            Codeforces Username
          </label>
          <input
            type="text"
            id="codeforcesUsername"
            bind:value={codeforcesUsername}
            placeholder="Enter your Codeforces username"
            disabled={saving || importing}
            class="font-inherit box-border w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:opacity-70 focus:border-[var(--color-primary)] focus:shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        
        <div class="mb-6">
          <label for="kattisUsername" class="mb-2 block font-semibold text-[var(--color-heading)]">
            Kattis Username
          </label>
          <input
            type="text"
            id="kattisUsername"
            bind:value={kattisUsername}
            placeholder="Enter your Kattis username"
            disabled={saving || importing}
            class="font-inherit box-border w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:opacity-70 focus:border-[var(--color-primary)] focus:shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        
        <div class="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving || importing}
            class="cursor-pointer rounded border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-all duration-200 hover:bg-[color-mix(in_oklab,black_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Usernames'}
          </button>
          
          <button
            type="button"
            disabled={saving || importing || (!codeforcesUsername && !kattisUsername)}
            on:click={handleImport}
            class="cursor-pointer rounded border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[color-mix(in_oklab,var(--color-accent)_80%,black)] hover:bg-[color-mix(in_oklab,var(--color-accent)_80%,black)] hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing ? 'Importing...' : 'Import Solved Problems'}
          </button>
        </div>
      </form>
    </div>
    
    {#if codeforcesImportResult || kattisImportResult}
      <div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-semibold text-[var(--color-heading)]">Import Results</h2>
        
        {#if codeforcesImportResult}
          <div class="mb-4">
            <h3 class="mb-2 text-lg font-medium text-[var(--color-heading)]">Codeforces</h3>
            <p class="text-[var(--color-text)]">
              Found {codeforcesImportResult.totalSolved} solved problems, imported {codeforcesImportResult.importedCount} new solves.
            </p>
          </div>
        {/if}
        
        {#if kattisImportResult}
          <div class="mb-4">
            <h3 class="mb-2 text-lg font-medium text-[var(--color-heading)]">Kattis</h3>
            <p class="text-[var(--color-text)]">
              Found {kattisImportResult.totalSolved} solved problems, imported {kattisImportResult.importedCount} new solves.
            </p>
          </div>
        {/if}
        
        <p class="mt-4 text-sm text-[var(--color-text-muted)]">
          Note: Only problems that exist in our database can be imported. If you've solved problems that aren't in our database, they won't be counted.
        </p>
      </div>
    {/if}
  {/if}
</div>
