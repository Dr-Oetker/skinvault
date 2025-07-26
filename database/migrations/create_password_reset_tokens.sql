-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own tokens (for cleanup)
CREATE POLICY "Users can view their own reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow service role to manage all tokens
CREATE POLICY "Service role can manage all reset tokens" ON password_reset_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired tokens (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_tokens TO service_role; 