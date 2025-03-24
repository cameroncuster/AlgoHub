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