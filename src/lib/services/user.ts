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
  // First try to get the user from the store
  let currentUser = get(user);

  // If no user in the store, try to get it directly from Supabase
  if (!currentUser) {
    console.log('fetchUserPreferences: No user in store, checking session directly');
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        currentUser = data.session.user;
        console.log('fetchUserPreferences: Got user from session', currentUser.id);
      }
    } catch (err) {
      console.error('fetchUserPreferences: Error getting session', err);
    }
  }

  if (!currentUser) {
    console.log('fetchUserPreferences: No current user after all checks');
    return null;
  }

  try {
    console.log('fetchUserPreferences: Fetching preferences for user', currentUser.id);
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (error) {
      console.log('fetchUserPreferences: Error fetching preferences', error);
      // If the error is that no rows were returned, create default preferences
      if (error.code === 'PGRST116') {
        console.log('fetchUserPreferences: No preferences found, creating default');
        // Create default preferences
        const result = await updateUserPreferences({
          hideFromLeaderboard: false
        });

        if (result) {
          console.log('fetchUserPreferences: Default preferences created');
          return {
            hideFromLeaderboard: false
          };
        }
      }
      return null;
    }

    if (!data) {
      console.log('fetchUserPreferences: No data returned');
      return null;
    }

    console.log('fetchUserPreferences: Preferences found', data);
    const record = data as UserPreferencesRecord;
    return {
      hideFromLeaderboard: record.hide_from_leaderboard
    };
  } catch (err) {
    console.error('fetchUserPreferences: Exception', err);
    return null;
  }
}

/**
 * Updates user preferences in the database
 * @param preferences - User preferences to update
 * @returns True if successful, false otherwise
 */
export async function updateUserPreferences(preferences: UserPreferences): Promise<boolean> {
  // First try to get the user from the store
  let currentUser = get(user);

  // If no user in the store, try to get it directly from Supabase
  if (!currentUser) {
    console.log('updateUserPreferences: No user in store, checking session directly');
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        currentUser = data.session.user;
        console.log('updateUserPreferences: Got user from session', currentUser.id);
      }
    } catch (err) {
      console.error('updateUserPreferences: Error getting session', err);
    }
  }

  if (!currentUser) {
    console.log('updateUserPreferences: No current user after all checks');
    return false;
  }

  try {
    console.log('updateUserPreferences: Checking if preferences exist for user', currentUser.id);
    // First check if a record exists
    const { data: existingData, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', currentUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('updateUserPreferences: Error checking if preferences exist', checkError);
    }

    let result;

    if (existingData) {
      console.log('updateUserPreferences: Updating existing preferences', existingData.id);
      // Update existing record
      result = await supabase
        .from('user_preferences')
        .update({
          hide_from_leaderboard: preferences.hideFromLeaderboard,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id);
    } else {
      console.log('updateUserPreferences: Creating new preferences record');
      // Insert new record
      result = await supabase.from('user_preferences').insert({
        user_id: currentUser.id,
        hide_from_leaderboard: preferences.hideFromLeaderboard,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    if (result.error) {
      console.error('updateUserPreferences: Error updating/inserting preferences', result.error);
      // If we still have an error and it's a duplicate key error,
      // try one more time with an update
      if (result.error.code === '23505') {
        console.log('updateUserPreferences: Duplicate key error, retrying with update');
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
          console.error('updateUserPreferences: Error on retry', result.error);
          return false;
        }
      } else {
        return false;
      }
    }

    console.log('updateUserPreferences: Preferences updated successfully');
    return true;
  } catch (err) {
    console.error('updateUserPreferences: Exception', err);
    return false;
  }
}
