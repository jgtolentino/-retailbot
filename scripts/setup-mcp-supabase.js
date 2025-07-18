#!/usr/bin/env node

/**
 * Setup Supabase MCP Server
 * Configures and tests the official @modelcontextprotocol/server-supabase
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase MCP Server...\n');

// Check if MCP config exists
const mcpConfigPath = path.join(process.cwd(), '.mcp', 'servers.json');
if (!fs.existsSync(mcpConfigPath)) {
  console.error('❌ MCP configuration not found at .mcp/servers.json');
  process.exit(1);
}

console.log('✅ MCP configuration found');

// Install the MCP server
console.log('\n📦 Installing @modelcontextprotocol/server-supabase...');

const install = spawn('npm', ['install', '-g', '@modelcontextprotocol/server-supabase'], {
  stdio: 'inherit',
  shell: true
});

install.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to install MCP server');
    process.exit(1);
  }
  
  console.log('✅ MCP server installed');
  
  // Test the server
  console.log('\n🧪 Testing MCP server connection...');
  
  const env = {
    ...process.env,
    SUPABASE_URL: 'https://cxzllzyxwpyptfretryc.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTAwMDAwMCwiZXhwIjoyMDA0NTY4MDAwfQ.-tR8ZrwA95dvqV_uBnCZwEi1ScpZ9M7YpIEMCNYFiRU'
  };
  
  const test = spawn('npx', ['-y', '@modelcontextprotocol/server-supabase', 'test'], {
    env,
    stdio: 'pipe'
  });
  
  let output = '';
  
  test.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  test.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
  });
  
  test.on('close', (code) => {
    if (code === 0 || output.includes('connected')) {
      console.log('✅ MCP server connection successful');
      
      console.log('\n📋 Next steps:');
      console.log('1. Run the schema fix: node scripts/deploy-mcp-fix.js');
      console.log('2. Start your app with MCP: npm run dev');
      console.log('3. The MCP server will handle all Supabase operations');
    } else {
      console.error('❌ MCP server test failed');
      console.log('Output:', output);
    }
  });
});