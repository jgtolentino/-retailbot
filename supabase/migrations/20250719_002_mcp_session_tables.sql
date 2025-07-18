-- MCP Session Storage and Audit Tables for ChipGPT Integration

-- Session logs for all MCP agent calls
CREATE TABLE IF NOT EXISTS mcp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_email TEXT,
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    input JSONB DEFAULT '{}',
    output JSONB DEFAULT '{}',
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    execution_time_ms INTEGER,
    request_id TEXT UNIQUE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Audit logs for security and compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'auth', 'agent_call', 'data_access', 'error'
    user_id TEXT,
    resource TEXT,
    action TEXT,
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'info', -- 'debug', 'info', 'warning', 'error', 'critical'
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- OAuth token storage (temporary, for refresh tokens)
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    token_type TEXT DEFAULT 'Bearer',
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Agent permissions mapping
CREATE TABLE IF NOT EXISTS user_agent_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    permissions JSONB DEFAULT '[]', -- ['read', 'write', 'execute']
    granted_by TEXT,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, agent_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_user_id ON mcp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_agent ON mcp_sessions(agent);
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_created_at ON mcp_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_request_id ON mcp_sessions(request_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);

-- Enable RLS
ALTER TABLE mcp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agent_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON mcp_sessions
    FOR SELECT USING (auth.uid()::text = user_id);

-- Only service role can insert sessions
CREATE POLICY "Service role can insert sessions" ON mcp_sessions
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Audit logs are read-only for users
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid()::text = user_id);

-- Service role has full access to audit logs
CREATE POLICY "Service role full access to audit" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- OAuth tokens are private to users
CREATE POLICY "Users can manage own tokens" ON oauth_tokens
    FOR ALL USING (auth.uid()::text = user_id);

-- Agent permissions are managed by service role
CREATE POLICY "View own agent permissions" ON user_agent_permissions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Service role manages permissions" ON user_agent_permissions
    FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- Delete sessions older than 30 days
    DELETE FROM mcp_sessions 
    WHERE created_at < TIMEZONE('utc', NOW()) - INTERVAL '30 days';
    
    -- Delete expired OAuth tokens
    DELETE FROM oauth_tokens 
    WHERE expires_at < TIMEZONE('utc', NOW());
    
    -- Delete expired agent permissions
    DELETE FROM user_agent_permissions 
    WHERE expires_at IS NOT NULL AND expires_at < TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');