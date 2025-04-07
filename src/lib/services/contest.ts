/**
 * Service for database operations related to programming contests
 */
import { supabase } from './database';
import { user } from './auth';
import { get } from 'svelte/store';

/**
 * Contest interface from our app's perspective
 */
export type Contest = {
  id?: string;
  name: string;
  url: string;
  durationSeconds: number;
  difficulty?: number;
  dateAdded: string;
  addedBy: string;
  addedByUrl: string;
  likes: number;
  dislikes: number;
  type?: string;
};

/**
 * Database record type from Supabase
 */
export type ContestRecord = Omit<
  Contest,
  'dateAdded' | 'addedBy' | 'addedByUrl' | 'durationSeconds'
> & {
  date_added: string;
  added_by: string;
  added_by_url: string;
  duration_seconds: number;
  type?: string;
};

/**
 * User participation type
 */
export type UserContestParticipation = {
  id: string;
  user_id: string;
  contest_id: string;
  participated_at: string;
};

/**
 * Fetches contests from the database
 * @returns Array of contests
 */
export async function fetchContests(): Promise<Contest[]> {
  try {
    const { data, error } = await supabase.from('contests').select('*');

    if (error) {
      console.error('Error fetching contests:', error);
      return [];
    }

    // Transform database records to Contest type
    return (data as ContestRecord[]).map((record) => ({
      id: record.id,
      name: record.name,
      url: record.url,
      durationSeconds: record.duration_seconds,
      difficulty: record.difficulty,
      dateAdded: record.date_added,
      addedBy: record.added_by,
      addedByUrl: record.added_by_url,
      likes: record.likes || 0,
      dislikes: record.dislikes || 0,
      type: record.type
    }));
  } catch (err) {
    console.error('Failed to fetch contests:', err);
    return [];
  }
}

/**
 * Fetches user participation data for contests
 * @returns Set of contest IDs the user has participated in
 */
export async function fetchUserParticipation(): Promise<Set<string>> {
  const currentUser = get(user);
  if (!currentUser) {
    return new Set();
  }

  try {
    const { data, error } = await supabase
      .from('user_contest_participation')
      .select('contest_id')
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error fetching user participation:', error);
      return new Set();
    }

    return new Set(data.map((item) => item.contest_id));
  } catch (err) {
    console.error('Failed to fetch user participation:', err);
    return new Set();
  }
}

/**
 * Toggles user participation in a contest
 * @param contestId - Contest ID
 * @param hasParticipated - Whether the user has participated
 * @returns Success status
 */
export async function toggleContestParticipation(
  contestId: string,
  hasParticipated: boolean
): Promise<boolean> {
  const currentUser = get(user);

  if (!currentUser) {
    console.error('Cannot toggle participation: User not authenticated');
    return false;
  }

  try {
    if (hasParticipated) {
      // Mark contest as participated
      const { error } = await supabase.from('user_contest_participation').insert({
        user_id: currentUser.id,
        contest_id: contestId
      });

      if (error) {
        // If the error is a duplicate key error, it means the contest is already marked as participated
        if (error.code === '23505') {
          // Postgres unique violation code
          return true; // Already participated, so consider it a success
        }
        console.error(`Error marking contest ${contestId} as participated:`, error);
        return false;
      }
    } else {
      // Mark contest as not participated (delete the record)
      const { error } = await supabase
        .from('user_contest_participation')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('contest_id', contestId);

      if (error) {
        console.error(`Error marking contest ${contestId} as not participated:`, error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error(`Failed to toggle participation for contest ${contestId}:`, err);
    return false;
  }
}

/**
 * Format duration in seconds to a human-readable string
 * @param durationSeconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2h 30m" or "45m")
 */
export function formatDuration(durationSeconds: number): string {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  } else {
    return `${minutes}m`;
  }
}
