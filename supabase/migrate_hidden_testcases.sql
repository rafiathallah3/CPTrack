-- Migration: Add hidden test cases & submission votes
-- Run this in the Supabase SQL Editor.

-- 1. Add hidden_test_cases column to problems table
ALTER TABLE problems
ADD COLUMN IF NOT EXISTS hidden_test_cases JSONB DEFAULT '[]'::JSONB;

-- 2. Create submission_votes table for like/dislike ratings
CREATE TABLE IF NOT EXISTS submission_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (submission_id, user_id)
);

-- 3. Enable RLS on submission_votes (mirror your existing RLS policies)
ALTER TABLE submission_votes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all votes
CREATE POLICY "Anyone can view votes"
    ON submission_votes FOR SELECT
    USING (true);

-- Allow authenticated users to insert their own votes
CREATE POLICY "Users can insert own votes"
    ON submission_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own votes
CREATE POLICY "Users can update own votes"
    ON submission_votes FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own votes
CREATE POLICY "Users can delete own votes"
    ON submission_votes FOR DELETE
    USING (auth.uid() = user_id);
