-- Create user_roles table for managing admin users
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
-- Create RLS policies for user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- Allow users to read their own role
CREATE POLICY "Users can read their own role" ON user_roles FOR
SELECT USING (auth.uid() = user_id);
-- Only allow super admins to insert/update roles
-- Note: The first admin will need to be created manually by a database administrator
CREATE POLICY "Only super admins can insert roles" ON user_roles FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
CREATE POLICY "Only super admins can update roles" ON user_roles FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
-- Disable deletion of user roles entirely
-- We don't want to allow deletion of user roles at all
-- Create function to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.user_roles (user_id, role)
VALUES (NEW.id, 'user');
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Create problems table if it doesn't exist
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tags TEXT [] NOT NULL DEFAULT '{}',
  difficulty INTEGER,
  url TEXT NOT NULL,
  type TEXT,
  solved INTEGER DEFAULT 0,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT NOT NULL,
  added_by_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0
);
-- Create RLS policies for problems table
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
-- Allow anyone to read problems
CREATE POLICY "Anyone can read problems" ON problems FOR
SELECT USING (true);
-- Only admins can insert problems
CREATE POLICY "Only admins can insert problems" ON problems FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
-- Only admins can update problems
CREATE POLICY "Only admins can update problems" ON problems FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
-- Disable deletion of problems entirely
-- We don't want to allow deletion of problems at all
-- Create user_problem_feedback table to store user likes/dislikes
CREATE TABLE IF NOT EXISTS user_problem_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);
-- Create RLS policies for user_problem_feedback table
ALTER TABLE user_problem_feedback ENABLE ROW LEVEL SECURITY;
-- Users can read all feedback (needed for displaying aggregated likes/dislikes)
CREATE POLICY "Anyone can read feedback" ON user_problem_feedback FOR
SELECT USING (true);
-- Users can only insert/update their own feedback
CREATE POLICY "Users can insert their own feedback" ON user_problem_feedback FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON user_problem_feedback FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feedback" ON user_problem_feedback FOR DELETE USING (auth.uid() = user_id);
-- Create trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger for user_problem_feedback table
CREATE TRIGGER update_user_problem_feedback_updated_at BEFORE
UPDATE ON user_problem_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create stored procedure for updating problem feedback in a transaction
CREATE OR REPLACE FUNCTION update_problem_feedback(
    p_problem_id UUID,
    p_user_id UUID,
    p_is_like BOOLEAN,
    p_is_undo BOOLEAN DEFAULT FALSE,
    p_previous_feedback TEXT DEFAULT NULL
  ) RETURNS SETOF problems AS $$
DECLARE v_problem problems %ROWTYPE;
v_feedback_exists BOOLEAN;
v_feedback_type TEXT;
BEGIN -- Lock the problem record for update to prevent race conditions
SELECT * INTO v_problem
FROM problems
WHERE id = p_problem_id FOR
UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Problem with ID % not found',
p_problem_id;
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
IF p_is_undo THEN -- Undoing previous action
IF p_is_like THEN -- Undo a like
UPDATE problems
SET likes = GREATEST(0, likes - 1)
WHERE id = p_problem_id;
ELSE -- Undo a dislike
UPDATE problems
SET dislikes = GREATEST(0, dislikes - 1)
WHERE id = p_problem_id;
END IF;
-- Remove the feedback record
DELETE FROM user_problem_feedback
WHERE user_id = p_user_id
  AND problem_id = p_problem_id;
ELSIF p_previous_feedback = 'like'
AND NOT p_is_like THEN -- Switching from like to dislike
UPDATE problems
SET likes = GREATEST(0, likes - 1),
  dislikes = dislikes + 1
WHERE id = p_problem_id;
-- Update the feedback record
UPDATE user_problem_feedback
SET feedback_type = 'dislike'
WHERE user_id = p_user_id
  AND problem_id = p_problem_id;
ELSIF p_previous_feedback = 'dislike'
AND p_is_like THEN -- Switching from dislike to like
UPDATE problems
SET likes = likes + 1,
  dislikes = GREATEST(0, dislikes - 1)
WHERE id = p_problem_id;
-- Update the feedback record
UPDATE user_problem_feedback
SET feedback_type = 'like'
WHERE user_id = p_user_id
  AND problem_id = p_problem_id;
ELSE -- New feedback
IF p_is_like THEN -- New like
UPDATE problems
SET likes = likes + 1
WHERE id = p_problem_id;
ELSE -- New dislike
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
-- Create user_solved_problems table to track which problems users have solved
CREATE TABLE IF NOT EXISTS user_solved_problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  solved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);
-- Create RLS policies for user_solved_problems table
ALTER TABLE user_solved_problems ENABLE ROW LEVEL SECURITY;
-- Users can read all solved problems (needed for displaying statistics)
CREATE POLICY "Anyone can read solved problems" ON user_solved_problems FOR
SELECT USING (true);
-- Users can only mark their own problems as solved
CREATE POLICY "Users can mark their own solved problems" ON user_solved_problems FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can only update their own solved problems
CREATE POLICY "Users can update their own solved problems" ON user_solved_problems FOR
UPDATE USING (auth.uid() = user_id);
-- Users can only delete their own solved problems
CREATE POLICY "Users can delete their own solved problems" ON user_solved_problems FOR DELETE USING (auth.uid() = user_id);
-- Grant access to authenticated users
GRANT ALL ON user_solved_problems TO authenticated;
-- Create contests table to track programming contests
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  duration_seconds INTEGER NOT NULL,
  difficulty INTEGER,
  added_by TEXT NOT NULL,
  added_by_url TEXT NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0
);
-- Create RLS policies for contests table
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
-- Allow anyone to read contests
CREATE POLICY "Anyone can read contests" ON contests FOR
SELECT USING (true);
-- Only admins can insert contests
CREATE POLICY "Only admins can insert contests" ON contests FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
-- Only admins can update contests
CREATE POLICY "Only admins can update contests" ON contests FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
-- Create user_contest_participation table to track which contests users have participated in
CREATE TABLE IF NOT EXISTS user_contest_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  participated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contest_id)
);
-- Create RLS policies for user_contest_participation table
ALTER TABLE user_contest_participation ENABLE ROW LEVEL SECURITY;
-- Users can read all contest participation data
CREATE POLICY "Anyone can read contest participation" ON user_contest_participation FOR
SELECT USING (true);
-- Users can only register themselves for contests
CREATE POLICY "Users can register for contests" ON user_contest_participation FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can only update their own participation data
CREATE POLICY "Users can update their own participation" ON user_contest_participation FOR
UPDATE USING (auth.uid() = user_id);
-- Users can only delete their own participation data
CREATE POLICY "Users can delete their own participation" ON user_contest_participation FOR DELETE USING (auth.uid() = user_id);
-- Grant access to authenticated users
GRANT ALL ON contests TO authenticated;
GRANT ALL ON user_contest_participation TO authenticated;