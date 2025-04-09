-- Create stored procedure for updating problem feedback in a transaction
CREATE OR REPLACE FUNCTION update_problem_feedback(
    p_problem_id UUID,
    p_user_id UUID,
    p_is_like BOOLEAN,
    p_is_undo BOOLEAN DEFAULT FALSE,
    p_previous_feedback TEXT DEFAULT NULL
  ) RETURNS SETOF problems AS $$
DECLARE 
  v_problem problems %ROWTYPE;
  v_feedback_exists BOOLEAN;
  v_feedback_type TEXT;
BEGIN 
  -- Lock the problem record for update to prevent race conditions
  SELECT * INTO v_problem
  FROM problems
  WHERE id = p_problem_id FOR UPDATE;
  
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Problem with ID % not found', p_problem_id;
  END IF;
  
  -- Check if user already has feedback for this problem
  SELECT EXISTS(
    SELECT 1
    FROM user_problem_feedback
    WHERE user_id = p_user_id
      AND problem_id = p_problem_id
  ) INTO v_feedback_exists;
  
  IF v_feedback_exists THEN
    SELECT feedback_type INTO v_feedback_type
    FROM user_problem_feedback
    WHERE user_id = p_user_id
      AND problem_id = p_problem_id;
  END IF;
  
  -- Handle different feedback scenarios
  IF p_is_undo THEN 
    -- Undoing previous action
    IF p_is_like THEN 
      -- Undo a like
      UPDATE problems
      SET likes = GREATEST(0, likes - 1)
      WHERE id = p_problem_id;
    ELSE 
      -- Undo a dislike
      UPDATE problems
      SET dislikes = GREATEST(0, dislikes - 1)
      WHERE id = p_problem_id;
    END IF;
    
    -- Remove the feedback record
    DELETE FROM user_problem_feedback
    WHERE user_id = p_user_id
      AND problem_id = p_problem_id;
      
  ELSIF p_previous_feedback = 'like' AND NOT p_is_like THEN 
    -- Switching from like to dislike
    UPDATE problems
    SET likes = GREATEST(0, likes - 1),
        dislikes = dislikes + 1
    WHERE id = p_problem_id;
    
    -- Update the feedback record
    UPDATE user_problem_feedback
    SET feedback_type = 'dislike'
    WHERE user_id = p_user_id
      AND problem_id = p_problem_id;
      
  ELSIF p_previous_feedback = 'dislike' AND p_is_like THEN 
    -- Switching from dislike to like
    UPDATE problems
    SET likes = likes + 1,
        dislikes = GREATEST(0, dislikes - 1)
    WHERE id = p_problem_id;
    
    -- Update the feedback record
    UPDATE user_problem_feedback
    SET feedback_type = 'like'
    WHERE user_id = p_user_id
      AND problem_id = p_problem_id;
      
  ELSE 
    -- New feedback
    IF p_is_like THEN 
      -- New like
      UPDATE problems
      SET likes = likes + 1
      WHERE id = p_problem_id;
    ELSE 
      -- New dislike
      UPDATE problems
      SET dislikes = dislikes + 1
      WHERE id = p_problem_id;
    END IF;
    
    -- Insert new feedback record
    INSERT INTO user_problem_feedback (user_id, problem_id, feedback_type)
    VALUES (
      p_user_id,
      p_problem_id,
      CASE
        WHEN p_is_like THEN 'like'
        ELSE 'dislike'
      END
    );
  END IF;
  
  -- Return the updated problem
  RETURN QUERY
  SELECT *
  FROM problems
  WHERE id = p_problem_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function is accessible to authenticated users
GRANT EXECUTE ON FUNCTION update_problem_feedback TO authenticated;
