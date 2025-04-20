-- Function to get solved problems for a specific user
CREATE OR REPLACE FUNCTION get_user_solved_problems(p_user_id UUID)
RETURNS TABLE (problem_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT usp.problem_id
  FROM user_solved_problems usp
  JOIN auth.users u ON usp.user_id = u.id
  LEFT JOIN user_preferences up ON u.id = up.user_id
  WHERE usp.user_id = p_user_id
  AND COALESCE(up.hide_from_leaderboard, false) = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_solved_problems TO authenticated, anon;
