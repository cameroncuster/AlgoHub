/**
 * Service for user operations
 */
import { supabase } from './database';
import { user } from './auth';
import { get } from 'svelte/store';

/**
 * User preferences interface
 */
export type UserPreferences = {
  hideFromLeaderboard: boolean;
};

/**
 * Database record type from Supabase
 */
export type UserPreferencesRecord = {
  id: string;
  user_id: string;
  hide_from_leaderboard: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Fetches user preferences from the database
 * @returns User preferences or null if not found
 */
export async function fetchUserPreferences(): Promise<UserPreferences | null> {
  const currentUser = get(user);

  if (!currentUser) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (error) {
      return null;
    }

    if (!data) {
      return null;
    }

    const record = data as UserPreferencesRecord;
    return {
      hideFromLeaderboard: record.hide_from_leaderboard
    };
  } catch (err) {
    return null;
  }
}

/**
 * Updates user preferences in the database
 * @param preferences - User preferences to update
 * @returns True if successful, false otherwise
 */
export async function updateUserPreferences(preferences: UserPreferences): Promise<boolean> {
  const currentUser = get(user);

  if (!currentUser) {
    return false;
  }

  try {
    // First check if a record exists
    const { data: existingData } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', currentUser.id)
      .single();

    let result;

    if (existingData) {
      // Update existing record
      result = await supabase
        .from('user_preferences')
        .update({
          hide_from_leaderboard: preferences.hideFromLeaderboard,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);
    } else {
      // Insert new record
      result = await supabase.from('user_preferences').insert({
        user_id: currentUser.id,
        hide_from_leaderboard: preferences.hideFromLeaderboard,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    if (result.error) {
      // If we still have an error and it's a duplicate key error,
      // try one more time with an update
      if (result.error.code === '23505') {
        // Wait a moment before retrying
        await new Promise((resolve) => setTimeout(resolve, 100));

        result = await supabase
          .from('user_preferences')
          .update({
            hide_from_leaderboard: preferences.hideFromLeaderboard,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);

        if (result.error) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  } catch (err) {
    return false;
  }
}
