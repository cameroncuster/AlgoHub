-- Create a function to refresh the leaderboard on a schedule
-- This can be called by a cron job or trigger
-- First, create a function to refresh the leaderboard after a problem is marked as solved
CREATE OR REPLACE FUNCTION refresh_leaderboard_on_solve() RETURNS TRIGGER AS $$ BEGIN -- Only refresh if this is a new solve (INSERT) or a solve being removed (DELETE)
  IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'DELETE'
  ) THEN -- Call the refresh function
  PERFORM refresh_leaderboard();
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a trigger to refresh the leaderboard when a problem is marked as solved
-- Only create the trigger if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_trigger
  WHERE tgname = 'refresh_leaderboard_trigger'
) THEN CREATE TRIGGER refresh_leaderboard_trigger
AFTER
INSERT
  OR DELETE ON user_solved_problems FOR EACH STATEMENT EXECUTE FUNCTION refresh_leaderboard_on_solve();
END IF;
END $$;
-- Initial refresh of the materialized view
-- Use regular refresh first time since the unique index is needed for concurrent refresh
REFRESH MATERIALIZED VIEW leaderboard_view;