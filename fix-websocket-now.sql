-- Just fix the fucking WebSocket 404 errors
-- Run this in Supabase SQL Editor

-- Enable Realtime on the existing transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- That's it. Your WebSocket 404s should be gone.