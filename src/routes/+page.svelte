<script lang="ts">
import { onMount } from 'svelte';
import { browser } from '$app/environment';
import { fetchProblems, updateProblemFeedback } from '$lib/services/problem';
import type { Problem } from '$lib/services/problem';
import ProblemTable from '$lib/components/ProblemTable.svelte';
import TopicSidebar from '$lib/components/TopicSidebar.svelte';

let problems: Problem[] = [];
let filteredProblems: Problem[] = [];
let loading: boolean = false;
let error: string | null = null;
let userFeedback: Record<string, 'like' | 'dislike' | null> = {};
let selectedTopic: string | null = null;
let sidebarOpen = false; // Default closed on mobile
let isMobile = false;

// Problem types
const PROBLEM_TYPES = ['graph', 'array', 'string', 'math', 'tree', 'queries', 'geometry', 'misc'];

// Function to calculate problem score (likes - dislikes)
function calculateScore(problem: Problem): number {
  return problem.likes - problem.dislikes;
}

// Function to sort problems by score (likes - dislikes)
function sortProblemsByScore(problemsToSort: Problem[]): Problem[] {
  // Group problems by score
  const problemsByScore: Record<number, Problem[]> = {};

  // Calculate score for each problem and group them
  problemsToSort.forEach((problem) => {
    const score = calculateScore(problem);
    if (!problemsByScore[score]) {
      problemsByScore[score] = [];
    }
    problemsByScore[score].push(problem);
  });

  Object.values(problemsByScore).forEach((group) => {
    group.sort((a, b) => {
      if (a.id && b.id) {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });
  });

  // Get all scores and sort them in descending order
  const scores = Object.keys(problemsByScore)
    .map(Number)
    .sort((a, b) => b - a);

  // Flatten the groups in order of score
  return scores.flatMap((score) => problemsByScore[score]);
}

// Function to filter problems by topic
function filterProblemsByTopic(topic: string | null): void {
  if (!topic) {
    filteredProblems = [...problems];
  } else {
    filteredProblems = problems.filter((problem) => {
      // If topic is "misc", include problems with no type or with "misc" type
      if (topic === 'misc') {
        return !problem.type || problem.type === 'misc';
      }
      return problem.type === topic;
    });
  }

  // Auto-close sidebar on mobile after selection
  if (isMobile) {
    sidebarOpen = false;
  }
}

// Function to handle topic selection
function handleTopicSelect(topic: string | null): void {
  selectedTopic = topic;
  filterProblemsByTopic(topic);
}

// Function to toggle sidebar visibility
function toggleSidebar(): void {
  sidebarOpen = !sidebarOpen;
}

// Check if mobile
function checkMobile(): void {
  if (!browser) return;
  isMobile = window.innerWidth < 768;
}

// Function to handle like/dislike actions
async function handleLike(problemId: string, isLike: boolean): Promise<void> {
  try {
    // Check if user has already provided feedback for this problem
    const currentFeedback = userFeedback[problemId];

    // If user already gave the same feedback, treat as an "undo"
    if ((isLike && currentFeedback === 'like') || (!isLike && currentFeedback === 'dislike')) {
      // Update UI optimistically
      problems = problems.map((problem) => {
        if (problem.id === problemId) {
          if (isLike) {
            return { ...problem, likes: problem.likes - 1 };
          } else {
            return { ...problem, dislikes: problem.dislikes - 1 };
          }
        }
        return problem;
      });

      // Remove the user's feedback
      userFeedback = {
        ...userFeedback,
        [problemId]: null
      };

      // Save feedback to localStorage
      localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

      // Update the database
      await updateProblemFeedback(problemId, isLike, true);

      // Update filtered problems
      filterProblemsByTopic(selectedTopic);
      return;
    }

    // Handle switching feedback (like to dislike or vice versa)
    if (currentFeedback) {
      // Update UI optimistically
      problems = problems.map((problem) => {
        if (problem.id === problemId) {
          if (isLike) {
            // Switching from dislike to like
            return {
              ...problem,
              likes: problem.likes + 1,
              dislikes: problem.dislikes - 1
            };
          } else {
            // Switching from like to dislike
            return {
              ...problem,
              likes: problem.likes - 1,
              dislikes: problem.dislikes + 1
            };
          }
        }
        return problem;
      });

      // Update user feedback - create a new object to ensure reactivity
      userFeedback = {
        ...userFeedback,
        [problemId]: isLike ? 'like' : 'dislike'
      };

      // Save feedback to localStorage
      localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

      // Update the database
      await updateProblemFeedback(problemId, isLike, false, currentFeedback);

      // Update filtered problems
      filterProblemsByTopic(selectedTopic);
      return;
    }

    // Handle new feedback
    // Update UI optimistically
    problems = problems.map((problem) => {
      if (problem.id === problemId) {
        if (isLike) {
          return { ...problem, likes: problem.likes + 1 };
        } else {
          return { ...problem, dislikes: problem.dislikes + 1 };
        }
      }
      return problem;
    });

    // Update user feedback - create a new object to ensure reactivity
    userFeedback = {
      ...userFeedback,
      [problemId]: isLike ? 'like' : 'dislike'
    };

    // Save feedback to localStorage
    localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

    // Update the database
    await updateProblemFeedback(problemId, isLike);

    // Update filtered problems
    filterProblemsByTopic(selectedTopic);
  } catch (err) {
    console.error('Error updating feedback:', err);
    // If there's an error, reload problems to ensure UI is in sync with server
    loadProblems();
  }
}

// Function to load problems
async function loadProblems() {
  loading = true;
  error = null;

  try {
    // Fetch problems
    const fetchedProblems = await fetchProblems();

    // Sort by score only on initial load
    problems = sortProblemsByScore(fetchedProblems);

    // Initialize filtered problems
    filteredProblems = [...problems];
  } catch (e) {
    console.error('Error loading problems:', e);
    error = 'Failed to load problems. Please try again later.';
  } finally {
    loading = false;
  }
}

// Load problems on mount
onMount(() => {
  loadProblems();

  // Load user feedback from localStorage
  const savedFeedback = localStorage.getItem('userFeedback');
  if (savedFeedback) {
    try {
      userFeedback = JSON.parse(savedFeedback);
    } catch (e) {
      console.error('Failed to parse saved feedback', e);
      userFeedback = {};
    }
  }

  // Check if mobile
  checkMobile();

  // Add event listeners
  if (browser) {
    window.addEventListener('resize', checkMobile);
  }

  return () => {
    if (browser) {
      window.removeEventListener('resize', checkMobile);
    }
  };
});

// Save user feedback to localStorage when it changes
$: {
  if (Object.keys(userFeedback).length > 0 && browser) {
    localStorage.setItem('userFeedback', JSON.stringify(userFeedback));
  }
}
</script>

<svelte:head>
  <title>AlgoHub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
</svelte:head>

<div class="mx-auto w-full max-w-[1200px]">
  {#if loading}
    <div class="py-2 text-center">
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
      <p class="mt-2 text-gray-600">Loading problems...</p>
    </div>
  {:else if error}
    <div class="py-2 text-center text-red-500">
      <p>{error}</p>
      <button
        class="hover:bg-opacity-90 mt-2 rounded bg-[var(--color-primary)] px-4 py-2 text-white transition-colors"
        on:click={() => window.location.reload()}>Try Again</button
      >
    </div>
  {:else}
    <div class="relative flex min-h-[calc(100vh-2rem)]">
      <!-- Topic Sidebar Component -->
      <TopicSidebar
        topics={PROBLEM_TYPES}
        selectedTopic={selectedTopic}
        onSelectTopic={handleTopicSelect}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <!-- Main content -->
      <div class="flex w-full flex-1">
        <div class="w-full md:mr-32 md:ml-32">
          <div class="problem-table-container w-full px-2 py-1">
            <ProblemTable
              problems={filteredProblems}
              userFeedback={userFeedback}
              onLike={handleLike}
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

/* Ensure proper spacing between sidebar and table */
@media (min-width: 768px) {
  .problem-table-container {
    margin: 0 auto;
    width: 100%;
  }
}
</style>
