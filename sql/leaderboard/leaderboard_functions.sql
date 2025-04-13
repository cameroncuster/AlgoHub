-- Create a function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  github_url TEXT,
  problems_solved BIGINT,
  earliest_solves_sum BIGINT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      u.id AS user_id,
      u.raw_user_meta_data->>'user_name' AS username,
      u.raw_user_meta_data->>'avatar_url' AS avatar_url,
      CASE
        WHEN u.raw_user_meta_data->>'html_url' IS NOT NULL THEN u.raw_user_meta_data->>'html_url'
        ELSE 'https://github.com/' || (u.raw_user_meta_data->>'user_name')
      END AS github_url,
      COUNT(usp.problem_id) AS problems_solved,
      COALESCE(SUM(EXTRACT(EPOCH FROM usp.solved_at)::BIGINT), 0) AS earliest_solves_sum
    FROM 
      auth.users u
    LEFT JOIN 
      user_solved_problems usp ON u.id = usp.user_id
    GROUP BY 
      u.id, u.raw_user_meta_data
    HAVING 
      COUNT(usp.problem_id) > 0
  )
  SELECT 
    user_id,
    username,
    avatar_url,
    github_url,
    problems_solved,
    earliest_solves_sum,
    ROW_NUMBER() OVER (ORDER BY problems_solved DESC, earliest_solves_sum ASC) AS rank
  FROM 
    user_stats
  ORDER BY 
    problems_solved DESC,
    earliest_solves_sum ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated, anon;
