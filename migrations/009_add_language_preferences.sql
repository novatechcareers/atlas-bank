-- Create language_preferences table to store user language settings
CREATE TABLE IF NOT EXISTS language_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'pt-BR')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_language_preferences_user_id ON language_preferences(user_id);

-- Create RLS policies
ALTER TABLE language_preferences ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own language preference
CREATE POLICY "Users can view own language preference" ON language_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to update their own language preference
CREATE POLICY "Users can update own language preference" ON language_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to insert their language preference
CREATE POLICY "Users can insert own language preference" ON language_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role has full access" ON language_preferences
  FOR ALL USING (true)
  WITH CHECK (true);
