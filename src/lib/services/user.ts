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
      console.error('Error fetching user preferences:', error);
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
    console.error('Failed to fetch user preferences:', err);
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
    console.error('No current user found');
    return false;
  }

  console.log('Current user:', currentUser.id);
  console.log('Updating preferences with:', {
    user_id: currentUser.id,
    hide_from_leaderboard: preferences.hideFromLeaderboard
  });

  try {
    // Try to update first (most likely scenario)
    let result = await supabase
      .from('user_preferences')
      .update({
        hide_from_leaderboard: preferences.hideFromLeaderboard,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', currentUser.id);
    
    console.log('Update result:', result);
    
    // If no rows were affected, try to insert
    if (result.error || result.count === 0) {
      console.log('No rows updated, trying insert');
      
      // Try to insert a new record
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: currentUser.id,
          hide_from_leaderboard: preferences.hideFromLeaderboard
        });
      
      console.log('Insert result:', result);
    }

    if (result.error) {
      // If we still have an error and it's a duplicate key error,
      // try one more time with an update
      if (result.error.code === '23505') {
        console.log('Duplicate key error, trying update one more time');
        
        // Wait a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
        
        result = await supabase
          .from('user_preferences')
          .update({
            hide_from_leaderboard: preferences.hideFromLeaderboard,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);
          
        console.log('Final update result:', result);
        
        if (result.error) {
          console.error('Error in final update attempt:', result.error);
          return false;
        }
      } else {
        console.error('Error updating user preferences:', result.error);
        return false;
      }
    }

    // Verify the update by fetching the current value
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    console.log('Verification fetch:', { data: verifyData, error: verifyError });

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    }

    return true;
  } catch (err) {
    console.error('Failed to update user preferences:', err);
    return false;
  }
}
