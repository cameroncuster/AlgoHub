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
 * User feedback type
 */
export type UserContestFeedback = {
  user_id: string;
  contest_id: string;
  feedback_type: 'like' | 'dislike';
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
 * Fetches user's feedback for all contests
 * @returns Record of contestId to feedback type ('like' | 'dislike' | null)
 */
export async function fetchUserFeedback(): Promise<Record<string, 'like' | 'dislike' | null>> {
  const currentUser = get(user);

  if (!currentUser) {
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('user_contest_feedback')
      .select('contest_id, feedback_type')
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error fetching user contest feedback:', error);
      return {};
    }

    const feedbackMap: Record<string, 'like' | 'dislike' | null> = {};

    data.forEach((item) => {
      feedbackMap[item.contest_id] = item.feedback_type as 'like' | 'dislike';
    });

    return feedbackMap;
  } catch (err) {
    console.error('Failed to fetch user contest feedback:', err);
    return {};
  }
}

/**
 * Updates a contest's likes or dislikes in the database
 * @param contestId - Contest ID
 * @param isLike - Whether it's a like (true) or dislike (false)
 * @param isUndo - Whether this is an undo operation
 * @param previousFeedback - The user's previous feedback (if any)
 * @returns Promise with the updated contest
 */
export async function updateContestFeedback(
  contestId: string,
  isLike: boolean,
  isUndo: boolean = false,
  previousFeedback: 'like' | 'dislike' | null = null
): Promise<Contest | null> {
  const currentUser = get(user);

  if (!currentUser) {
    console.error('Cannot update feedback: User not authenticated');
    return null;
  }

  try {
    // Call the stored procedure to handle the transaction
    const { data, error } = await supabase.rpc('update_contest_feedback', {
      p_contest_id: contestId,
      p_user_id: currentUser.id,
      p_is_like: isLike,
      p_is_undo: isUndo,
      p_previous_feedback: previousFeedback
    });

    if (error) {
      console.error(`Error updating feedback for contest ${contestId}:`, error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No data returned from stored procedure');
      return null;
    }

    // The stored procedure returns the updated contest record
    const record = data[0] as ContestRecord;
    return {
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
    };
  } catch (err) {
    console.error(`Failed to update contest ${contestId}:`, err);
    return null;
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
