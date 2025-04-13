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
    // Fetch leaderboard data using the get_leaderboard function
    const { data, error } = await supabase.rpc('get_leaderboard');

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Transform database records to LeaderboardEntry type
    return (data as LeaderboardRecord[]).map((record) => ({
      userId: record.user_id,
      username: record.username,
      avatarUrl: record.avatar_url,
      githubUrl: record.github_url,
      problemsSolved: record.problems_solved,
      earliestSolvesSum: record.earliest_solves_sum,
      rank: record.rank
    }));
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}
