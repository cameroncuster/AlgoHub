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
  matchedCount?: number;
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
    console.log(`Fetching solved problems for Codeforces user: ${codeforcesUsername}`);

    // Fetch user's solved problems from Codeforces API
    const response = await fetch(
      `/api/codeforces/user-solves?username=${encodeURIComponent(codeforcesUsername)}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error('Error response from Codeforces API:', data);

      // Check if the error is related to user not found
      if (data.error && data.error.includes('not found')) {
        return {
          success: false,
          message: `User "${codeforcesUsername}" not found on Codeforces. Please check that you've entered your Codeforces username correctly (case-sensitive). You can verify your username by checking if this link works: <a href="https://codeforces.com/profile/${codeforcesUsername}" target="_blank" rel="noopener noreferrer" class="text-[var(--color-accent)]">https://codeforces.com/profile/${codeforcesUsername}</a>`
        };
      }

      return {
        success: false,
        message: data.error || 'Failed to fetch solved problems from Codeforces'
      };
    }

    // Check if we got a valid response with solvedProblems array
    if (!data.solvedProblems) {
      console.error('Invalid response from Codeforces API:', data);
      return {
        success: false,
        message: 'Invalid response from Codeforces API'
      };
    }

    console.log(
      `Found ${data.solvedProblems.length} solved problems for Codeforces user: ${codeforcesUsername}`
    );

    // Get all problems from our database
    const { data: problems, error: problemsError } = await supabase.from('problems').select('*');

    if (problemsError) {
      console.error('Error fetching problems:', problemsError);
      return {
        success: false,
        message: `Error fetching problems: ${problemsError.message}`
      };
    }

    console.log(`Found ${problems.length} problems in our database`);

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

    console.log(`Matched ${matchedProblems.length} problems with our database`);

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

      console.log(`Found ${newSolvedProblems.length} new problems to mark as solved`);

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
        matchedCount: matchedProblems.length,
        importedCount: newSolvedProblems.length
      };
    }

    return {
      success: true,
      totalSolved: solvedProblems.length,
      matchedCount: matchedProblems.length,
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
  matchedCount?: number;
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
    console.log(`Fetching solved problems for Kattis user: ${kattisUsername}`);

    // Fetch user's solved problems from Kattis API
    const response = await fetch(
      `/api/kattis/user-solves?username=${encodeURIComponent(kattisUsername)}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error('Error response from Kattis API:', data);
      return {
        success: false,
        message: data.error || 'Failed to fetch solved problems from Kattis'
      };
    }

    // Check if we got a valid response
    if (!data.success) {
      console.error('Error response from Kattis API:', data);

      // Provide a more helpful error message for user not found
      if (data.error && data.error.includes('not found on Kattis')) {
        return {
          success: false,
          message: `User "${kattisUsername}" not found on Kattis. Please check that you've entered your Kattis username exactly as it appears in your profile URL. You can verify your username by checking if this link works: <a href="https://open.kattis.com/users/${kattisUsername}" target="_blank" rel="noopener noreferrer" class="text-[var(--color-accent)]">https://open.kattis.com/users/${kattisUsername}</a>`
        };
      }

      return {
        success: false,
        message: data.error || 'Failed to fetch solved problems from Kattis'
      };
    }

    // Check if solvedProblems array exists (it should, but just to be safe)
    if (!data.solvedProblems) {
      console.error('Invalid response from Kattis API:', data);
      return {
        success: false,
        message: 'Invalid response from Kattis API'
      };
    }

    // If the user has no solved problems, return early with success
    if (data.solvedProblems.length === 0) {
      console.log(`User ${kattisUsername} has no solved problems on Kattis`);
      return {
        success: true,
        totalSolved: 0,
        matchedCount: 0,
        importedCount: 0
      };
    }

    console.log(
      `Found ${data.solvedProblems.length} solved problems for Kattis user: ${kattisUsername}`
    );

    // Get all problems from our database
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .select('*')
      .like('url', 'https://open.kattis.com/problems/%');

    if (problemsError) {
      console.error('Error fetching problems:', problemsError);
      return {
        success: false,
        message: `Error fetching problems: ${problemsError.message}`
      };
    }

    console.log(`Found ${problems.length} Kattis problems in our database`);

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

    console.log(`Matched ${matchedProblems.length} problems with our database`);

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

      console.log(`Found ${newSolvedProblems.length} new problems to mark as solved`);

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
        matchedCount: matchedProblems.length,
        importedCount: newSolvedProblems.length
      };
    }

    return {
      success: true,
      totalSolved: solvedProblems.length,
      matchedCount: matchedProblems.length,
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
