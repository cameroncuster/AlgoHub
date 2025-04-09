# AlgoHub Database Schema

This directory contains the SQL files that define the database schema for AlgoHub.

## Directory Structure

- `init.sql` - Main initialization file that includes all other SQL files
- `auth/` - Authentication and user management
  - `user_roles.sql` - User roles table and policies
  - `user_triggers.sql` - Triggers for new user creation
- `problems/` - Problem-related tables and functions
  - `problems.sql` - Problems table and policies
  - `user_problem_feedback.sql` - User feedback for problems
  - `user_solved_problems.sql` - Tracking solved problems
  - `problem_functions.sql` - Functions for problem operations
- `contests/` - Contest-related tables and functions
  - `contests.sql` - Contests table and policies
  - `user_contest_participation.sql` - Contest participation tracking
  - `user_contest_feedback.sql` - User feedback for contests
  - `contest_functions.sql` - Functions for contest operations
- `common/` - Common utility functions
  - `utility_functions.sql` - Common utility functions

## Usage

To initialize the database schema, run the `init.sql` file in your Supabase SQL editor or using the Supabase CLI:

```bash
psql -h your-supabase-host -U postgres -d postgres -f sql/init.sql
```

Or in the Supabase SQL editor, you can run:

```sql
\i init.sql
```

Note that the paths in `init.sql` are relative to the `sql` directory, so you should run it from within that directory.

## Schema Overview

The database schema consists of several related tables:

1. **User Management**
   - `user_roles` - Stores user roles (admin, user)

2. **Problems**
   - `problems` - Stores programming problems
   - `user_problem_feedback` - Tracks user likes/dislikes for problems
   - `user_solved_problems` - Tracks which problems users have solved

3. **Contests**
   - `contests` - Stores programming contests
   - `user_contest_participation` - Tracks which contests users have participated in
   - `user_contest_feedback` - Tracks user likes/dislikes for contests

Each table has appropriate Row Level Security (RLS) policies to ensure data security.
