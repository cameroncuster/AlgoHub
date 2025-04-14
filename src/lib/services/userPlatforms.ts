/**
 * Service for managing user platform usernames and importing solved problems
 */
import { supabase } from './database';
import { user } from './auth';
import { get } from 'svelte/store';
import type { Problem } from './problem';

/**
 * User platform usernames interface
 */
export type UserPlatformUsernames = {
  id?: string;
  user_id: string;
  codeforces_username?: string;
  kattis_username?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Fetches the current user's platform usernames
 * @returns User platform usernames or null if not found
 */
export async function fetchUserPlatformUsernames(): Promise<UserPlatformUsernames | null> {
  const currentUser = get(user);

  if (!currentUser) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_platform_usernames')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, which is fine for new users
        return null;
      }
      console.error('Error fetching user platform usernames:', error);
      return null;
    }

    return data as UserPlatformUsernames;
  } catch (err) {
    console.error('Failed to fetch user platform usernames:', err);
    return null;
  }
}

/**
 * Saves the user's platform usernames
 * @param codeforcesUsername - Codeforces username
 * @param kattisUsername - Kattis username
 * @returns Success flag and message
 */
export async function saveUserPlatformUsernames(
  codeforcesUsername?: string,
  kattisUsername?: string
): Promise<{ success: boolean; message?: string }> {
  const currentUser = get(user);

  if (!currentUser) {
    return {
      success: false,
      message: 'You must be logged in to save platform usernames'
    };
  }

  try {
    // Check if the user already has platform usernames
    const existingData = await fetchUserPlatformUsernames();

    if (existingData) {
      // Update existing record
      const { error } = await supabase
        .from('user_platform_usernames')
        .update({
          codeforces_username: codeforcesUsername || null,
          kattis_username: kattisUsername || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error updating user platform usernames:', error);
        return {
          success: false,
          message: `Error updating platform usernames: ${error.message}`
        };
      }
    } else {
      // Insert new record
      const { error } = await supabase.from('user_platform_usernames').insert({
        user_id: currentUser.id,
        codeforces_username: codeforcesUsername || null,
        kattis_username: kattisUsername || null
      });

      if (error) {
        console.error('Error inserting user platform usernames:', error);
        return {
          success: false,
          message: `Error saving platform usernames: ${error.message}`
        };
      }
    }

    return {
      success: true
    };
  } catch (err) {
    console.error('Failed to save user platform usernames:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error saving platform usernames'
    };
  }
}

/**
 * Imports user's solved problems from Codeforces
 * @param codeforcesUsername - Codeforces username
 * @returns Success flag, message, and counts
 */
export async function importCodeforcesSolves(codeforcesUsername: string): Promise<{
  success: boolean;
  message?: string;
  totalSolved?: number;
  importedCount?: number;
}> {
  const currentUser = get(user);

  if (!currentUser) {
    return {
      success: false,
      message: 'You must be logged in to import solved problems'
    };
  }

  if (!codeforcesUsername) {
    return {
      success: false,
      message: 'Codeforces username is required'
    };
  }

  try {
    // Fetch user's solved problems from Codeforces API
    const response = await fetch(`/api/codeforces/user-solves?username=${codeforcesUsername}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Failed to fetch solved problems from Codeforces'
      };
    }

    // Get all problems from our database
    const { data: problems, error: problemsError } = await supabase.from('problems').select('*');

    if (problemsError) {
      console.error('Error fetching problems:', problemsError);
      return {
        success: false,
        message: `Error fetching problems: ${problemsError.message}`
      };
    }

    // Map problems by URL for easy lookup
    const problemsByUrl = new Map<string, Problem>();
    for (const problem of problems) {
      problemsByUrl.set(problem.url, problem);
    }

    // Match solved problems with our database
    const solvedProblems = data.solvedProblems || [];
    const matchedProblems = [];

    for (const solvedProblem of solvedProblems) {
      const problem = problemsByUrl.get(solvedProblem.url);
      if (problem) {
        matchedProblems.push({
          user_id: currentUser.id,
          problem_id: problem.id,
          solved_at: solvedProblem.solvedAt || new Date().toISOString()
        });
      }
    }

    // Insert matched problems into user_solved_problems table
    if (matchedProblems.length > 0) {
      // First, get existing solved problems to avoid duplicates
      const { data: existingSolved, error: existingError } = await supabase
        .from('user_solved_problems')
        .select('problem_id')
        .eq('user_id', currentUser.id);

      if (existingError) {
        console.error('Error fetching existing solved problems:', existingError);
        return {
          success: false,
          message: `Error fetching existing solved problems: ${existingError.message}`
        };
      }

      // Filter out already solved problems
      const existingSolvedIds = new Set(existingSolved.map((item) => item.problem_id));
      const newSolvedProblems = matchedProblems.filter(
        (item) => !existingSolvedIds.has(item.problem_id)
      );

      if (newSolvedProblems.length > 0) {
        const { error: insertError } = await supabase
          .from('user_solved_problems')
          .insert(newSolvedProblems);

        if (insertError) {
          console.error('Error inserting solved problems:', insertError);
          return {
            success: false,
            message: `Error inserting solved problems: ${insertError.message}`
          };
        }
      }

      return {
        success: true,
        totalSolved: solvedProblems.length,
        importedCount: newSolvedProblems.length
      };
    }

    return {
      success: true,
      totalSolved: solvedProblems.length,
      importedCount: 0
    };
  } catch (err) {
    console.error('Failed to import Codeforces solves:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error importing Codeforces solves'
    };
  }
}

/**
 * Imports user's solved problems from Kattis
 * @param kattisUsername - Kattis username
 * @returns Success flag, message, and counts
 */
export async function importKattisSolves(kattisUsername: string): Promise<{
  success: boolean;
  message?: string;
  totalSolved?: number;
  importedCount?: number;
}> {
  const currentUser = get(user);

  if (!currentUser) {
    return {
      success: false,
      message: 'You must be logged in to import solved problems'
    };
  }

  if (!kattisUsername) {
    return {
      success: false,
      message: 'Kattis username is required'
    };
  }

  try {
    // Fetch user's solved problems from Kattis API
    const response = await fetch(`/api/kattis/user-solves?username=${kattisUsername}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Failed to fetch solved problems from Kattis'
      };
    }

    // Get all problems from our database
    const { data: problems, error: problemsError } = await supabase.from('problems').select('*');

    if (problemsError) {
      console.error('Error fetching problems:', problemsError);
      return {
        success: false,
        message: `Error fetching problems: ${problemsError.message}`
      };
    }

    // Map problems by URL for easy lookup
    const problemsByUrl = new Map<string, Problem>();
    for (const problem of problems) {
      problemsByUrl.set(problem.url, problem);
    }

    // Match solved problems with our database
    const solvedProblems = data.solvedProblems || [];
    const matchedProblems = [];

    for (const solvedProblem of solvedProblems) {
      const problem = problemsByUrl.get(solvedProblem.url);
      if (problem) {
        matchedProblems.push({
          user_id: currentUser.id,
          problem_id: problem.id,
          solved_at: solvedProblem.solvedAt || new Date().toISOString()
        });
      }
    }

    // Insert matched problems into user_solved_problems table
    if (matchedProblems.length > 0) {
      // First, get existing solved problems to avoid duplicates
      const { data: existingSolved, error: existingError } = await supabase
        .from('user_solved_problems')
        .select('problem_id')
        .eq('user_id', currentUser.id);

      if (existingError) {
        console.error('Error fetching existing solved problems:', existingError);
        return {
          success: false,
          message: `Error fetching existing solved problems: ${existingError.message}`
        };
      }

      // Filter out already solved problems
      const existingSolvedIds = new Set(existingSolved.map((item) => item.problem_id));
      const newSolvedProblems = matchedProblems.filter(
        (item) => !existingSolvedIds.has(item.problem_id)
      );

      if (newSolvedProblems.length > 0) {
        const { error: insertError } = await supabase
          .from('user_solved_problems')
          .insert(newSolvedProblems);

        if (insertError) {
          console.error('Error inserting solved problems:', insertError);
          return {
            success: false,
            message: `Error inserting solved problems: ${insertError.message}`
          };
        }
      }

      return {
        success: true,
        totalSolved: solvedProblems.length,
        importedCount: newSolvedProblems.length
      };
    }

    return {
      success: true,
      totalSolved: solvedProblems.length,
      importedCount: 0
    };
  } catch (err) {
    console.error('Failed to import Kattis solves:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error importing Kattis solves'
    };
  }
}
