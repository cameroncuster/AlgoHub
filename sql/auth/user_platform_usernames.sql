-- Create user_platform_usernames table to store user's platform usernames
CREATE TABLE IF NOT EXISTS user_platform_usernames (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codeforces_username TEXT,
  kattis_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create RLS policies for user_platform_usernames table
ALTER TABLE user_platform_usernames ENABLE ROW LEVEL SECURITY;

-- Users can read their own platform usernames
CREATE POLICY "Users can read their own platform usernames" ON user_platform_usernames FOR
SELECT USING (auth.uid() = user_id);

-- Users can insert their own platform usernames
CREATE POLICY "Users can insert their own platform usernames" ON user_platform_usernames FOR
INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own platform usernames
CREATE POLICY "Users can update their own platform usernames" ON user_platform_usernames FOR
UPDATE USING (auth.uid() = user_id);

-- Users can delete their own platform usernames
CREATE POLICY "Users can delete their own platform usernames" ON user_platform_usernames FOR 
DELETE USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON user_platform_usernames TO authenticated;
