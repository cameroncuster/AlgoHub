-- Create stored procedure for updating contest feedback in a transaction
CREATE OR REPLACE FUNCTION update_contest_feedback(
    p_contest_id UUID,
    p_user_id UUID,
    p_is_like BOOLEAN,
    p_is_undo BOOLEAN DEFAULT FALSE,
    p_previous_feedback TEXT DEFAULT NULL
  ) RETURNS SETOF contests AS $$
DECLARE 
  v_contest contests %ROWTYPE;
  v_feedback_exists BOOLEAN;
  v_feedback_type TEXT;
BEGIN 
  -- Lock the contest record for update to prevent race conditions
  SELECT * INTO v_contest
  FROM contests
  WHERE id = p_contest_id FOR UPDATE;
  
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Contest with ID % not found', p_contest_id;
  END IF;
  
  -- Check if user already has feedback for this contest
  SELECT EXISTS(
    SELECT 1
    FROM user_contest_feedback
    WHERE user_id = p_user_id
      AND contest_id = p_contest_id
  ) INTO v_feedback_exists;
  
  IF v_feedback_exists THEN
    SELECT feedback_type INTO v_feedback_type
    FROM user_contest_feedback
    WHERE user_id = p_user_id
      AND contest_id = p_contest_id;
  END IF;
  
  -- Handle different feedback scenarios
  IF p_is_undo THEN 
    -- Undoing previous action
    IF p_is_like THEN 
      -- Undo a like
      UPDATE contests
      SET likes = GREATEST(0, likes - 1)
      WHERE id = p_contest_id;
    ELSE 
      -- Undo a dislike
      UPDATE contests
      SET dislikes = GREATEST(0, dislikes - 1)
      WHERE id = p_contest_id;
    END IF;
    
    -- Remove the feedback record
    DELETE FROM user_contest_feedback
    WHERE user_id = p_user_id
      AND contest_id = p_contest_id;
      
  ELSIF p_previous_feedback = 'like' AND NOT p_is_like THEN 
    -- Switching from like to dislike
    UPDATE contests
    SET likes = GREATEST(0, likes - 1),
        dislikes = dislikes + 1
    WHERE id = p_contest_id;
    
    -- Update the feedback record
    UPDATE user_contest_feedback
    SET feedback_type = 'dislike'
    WHERE user_id = p_user_id
      AND contest_id = p_contest_id;
      
  ELSIF p_previous_feedback = 'dislike' AND p_is_like THEN 
    -- Switching from dislike to like
    UPDATE contests
    SET likes = likes + 1,
        dislikes = GREATEST(0, dislikes - 1)
    WHERE id = p_contest_id;
    
    -- Update the feedback record
    UPDATE user_contest_feedback
    SET feedback_type = 'like'
    WHERE user_id = p_user_id
      AND contest_id = p_contest_id;
      
  ELSE 
    -- New feedback
    IF p_is_like THEN 
      -- New like
      UPDATE contests
      SET likes = likes + 1
      WHERE id = p_contest_id;
    ELSE 
      -- New dislike
      UPDATE contests
      SET dislikes = dislikes + 1
      WHERE id = p_contest_id;
    END IF;
    
    -- Insert new feedback record
    INSERT INTO user_contest_feedback (user_id, contest_id, feedback_type)
    VALUES (
      p_user_id,
      p_contest_id,
      CASE
        WHEN p_is_like THEN 'like'
        ELSE 'dislike'
      END
    );
  END IF;
  
  -- Return the updated contest
  RETURN QUERY
  SELECT *
  FROM contests
  WHERE id = p_contest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function is accessible to authenticated users
GRANT EXECUTE ON FUNCTION update_contest_feedback TO authenticated;
