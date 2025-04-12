/**
 * Service for leaderboard operations
 */
import { supabase } from './database';

/**
 * Leaderboard entry interface
 */
export type LeaderboardEntry = {
  userId: string;
  username: string;
  avatarUrl: string;
  githubUrl: string;
  problemsSolved: number;
  earliestSolvesSum: number;
  rank: number; // Now comes directly from the database
};

/**
 * Database record type from Supabase
 */
export type LeaderboardRecord = {
  user_id: string;
  username: string;
  avatar_url: string;
  github_url: string;
  problems_solved: number;
  earliest_solves_sum: number;
  rank: number;
};

/**
 * Fetches leaderboard data from the database
 * @returns Array of leaderboard entries
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    // Try to fetch directly from the materialized view first
    const { data: viewData, error: viewError } = await supabase
      .from('leaderboard_view')
      .select('*')
      .order('rank', { ascending: true });

    if (!viewError && viewData && viewData.length > 0) {
      console.log('Fetched leaderboard from view:', viewData);

      // Transform database records to LeaderboardEntry type
      return viewData.map((record: LeaderboardRecord) => ({
        userId: record.user_id,
        username: record.username,
        avatarUrl: record.avatar_url,
        githubUrl: record.github_url,
        problemsSolved: record.problems_solved,
        earliestSolvesSum: record.earliest_solves_sum,
        rank: record.rank
      }));
    }

    // Fallback to using the function if the view doesn't work
    console.log('Falling back to function, view error:', viewError);
    const { data, error } = await supabase.rpc('get_leaderboard');

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    console.log('Fetched leaderboard from function:', data);

    // Transform database records to LeaderboardEntry type
    return (data as LeaderboardRecord[]).map((record) => ({
      userId: record.user_id,
      username: record.username,
      avatarUrl: record.avatar_url,
      githubUrl: record.github_url,
      problemsSolved: record.problems_solved,
      earliestSolvesSum: record.earliest_solves_sum,
      rank: record.rank // Rank now comes directly from the database
    }));
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}
