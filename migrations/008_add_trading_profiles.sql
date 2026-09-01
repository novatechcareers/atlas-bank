-- Create trading_profiles table for storing risk profiles per user
CREATE TABLE IF NOT EXISTS trading_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL DEFAULT 'balanced' CHECK (profile_type IN ('conservative', 'balanced', 'aggressive')),
  win_rate DECIMAL(5, 2) NOT NULL DEFAULT 45.00 CHECK (win_rate >= 0 AND win_rate <= 100),
  loss_rate DECIMAL(5, 2) NOT NULL DEFAULT 55.00 CHECK (loss_rate >= 0 AND loss_rate <= 100),
  min_profit DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  max_loss DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_trading_profiles_user_id ON trading_profiles(user_id);

-- Create RLS policies
ALTER TABLE trading_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view own trading profile" ON trading_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own trading profile" ON trading_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role has full access" ON trading_profiles
  FOR ALL USING (true)
  WITH CHECK (true);
