-- Create a materialized view for the leaderboard
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_view AS WITH user_stats AS (
  SELECT u.id AS user_id,
    u.raw_user_meta_data->>'user_name' AS username,
    u.raw_user_meta_data->>'avatar_url' AS avatar_url,
    CASE
      WHEN u.raw_user_meta_data->>'html_url' IS NOT NULL THEN u.raw_user_meta_data->>'html_url'
      ELSE 'https://github.com/' || (u.raw_user_meta_data->>'user_name')
    END AS github_url,
    COUNT(usp.problem_id) AS problems_solved,
    COALESCE(
      SUM(
        EXTRACT(
          EPOCH
          FROM usp.solved_at
        )::BIGINT
      ),
      0
    ) AS earliest_solves_sum
  FROM auth.users u
    LEFT JOIN user_solved_problems usp ON u.id = usp.user_id
  GROUP BY u.id,
    u.raw_user_meta_data
  HAVING COUNT(usp.problem_id) > 0
)
SELECT user_id,
  username,
  avatar_url,
  github_url,
  problems_solved,
  earliest_solves_sum,
  ROW_NUMBER() OVER (
    ORDER BY problems_solved DESC,
      earliest_solves_sum ASC
  ) AS rank
FROM user_stats
ORDER BY problems_solved DESC,
  earliest_solves_sum ASC;
-- Create a unique index on the materialized view for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_view_user_id_idx ON leaderboard_view(user_id);
CREATE INDEX IF NOT EXISTS leaderboard_view_rank_idx ON leaderboard_view(rank);
-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard() RETURNS VOID AS $$ BEGIN REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_view;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a function to get leaderboard data (kept for backward compatibility)
CREATE OR REPLACE FUNCTION get_leaderboard() RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    github_url TEXT,
    problems_solved BIGINT,
    earliest_solves_sum BIGINT,
    rank BIGINT
  ) AS $$ BEGIN RETURN QUERY
SELECT lv.user_id,
  lv.username,
  lv.avatar_url,
  lv.github_url,
  lv.problems_solved,
  lv.earliest_solves_sum,
  lv.rank
FROM leaderboard_view lv
ORDER BY lv.rank ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant permissions
GRANT SELECT ON leaderboard_view TO authenticated,
  anon;
GRANT EXECUTE ON FUNCTION refresh_leaderboard() TO authenticated,
  service_role;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated,
  anon;