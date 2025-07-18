// MCP Agent Client for Scout Dashboard
import { getSession } from 'next-auth/react';

export interface AgentRequest {
  agent: 'retailbot' | 'adsbot' | 'learnbot' | 'dash' | 'gagambi' | 'echo';
  action: string;
  input: any;
  context?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    agentVersion: string;
    requestId: string;
  };
}

export class MCPAgentClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = process.env.NEXT_PUBLIC_CHIPGPT_MCP_URL || '') {
    this.baseUrl = baseUrl;
  }

  async executeAgent(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Get current session for auth token
      const session = await getSession();
      
      if (!session?.accessToken) {
        throw new Error('Unauthorized: No valid session');
      }

      const response = await fetch(`${this.baseUrl}/mcp/${request.agent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Agent-Version': '1.0',
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({
          action: request.action,
          input: request.input,
          context: {
            ...request.context,
            userId: session.user?.id,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent execution failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log to session storage for audit
      await this.logAgentCall(request, data);
      
      return {
        success: true,
        data: data.result,
        metadata: {
          executionTime: data.executionTime || 0,
          agentVersion: data.agentVersion || '1.0',
          requestId: data.requestId || this.generateRequestId(),
        },
      };
    } catch (error) {
      console.error('MCP Agent execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logAgentCall(request: AgentRequest, response: any): Promise<void> {
    try {
      // Log to Supabase or session storage
      const logEntry = {
        agent: request.agent,
        action: request.action,
        input: request.input,
        output: response,
        timestamp: new Date().toISOString(),
      };

      // Store in session storage for now
      const logs = JSON.parse(sessionStorage.getItem('mcp_agent_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('mcp_agent_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log agent call:', error);
    }
  }
}

// Singleton instance
export const mcpClient = new MCPAgentClient();

// Agent-specific helpers
export const agents = {
  retailBot: {
    async getInsights(filters: any) {
      return mcpClient.executeAgent({
        agent: 'retailbot',
        action: 'getInsights',
        input: filters,
      });
    },
    
    async analyzeTrends(data: any) {
      return mcpClient.executeAgent({
        agent: 'retailbot',
        action: 'analyzeTrends',
        input: data,
      });
    },
  },
  
  adsBot: {
    async generateCampaign(brief: any) {
      return mcpClient.executeAgent({
        agent: 'adsbot',
        action: 'generateCampaign',
        input: brief,
      });
    },
    
    async optimizeAds(campaignData: any) {
      return mcpClient.executeAgent({
        agent: 'adsbot',
        action: 'optimizeAds',
        input: campaignData,
      });
    },
  },
  
  learnBot: {
    async recommendContent(userProfile: any) {
      return mcpClient.executeAgent({
        agent: 'learnbot',
        action: 'recommendContent',
        input: userProfile,
      });
    },
    
    async trackProgress(learningData: any) {
      return mcpClient.executeAgent({
        agent: 'learnbot',
        action: 'trackProgress',
        input: learningData,
      });
    },
  },
  
  dash: {
    async orchestrate(workflow: any) {
      return mcpClient.executeAgent({
        agent: 'dash',
        action: 'orchestrate',
        input: workflow,
      });
    },
  },
  
  gagambi: {
    async generateCreative(brief: any) {
      return mcpClient.executeAgent({
        agent: 'gagambi',
        action: 'generateCreative',
        input: brief,
      });
    },
  },
  
  echo: {
    async processFeedback(feedback: any) {
      return mcpClient.executeAgent({
        agent: 'echo',
        action: 'processFeedback',
        input: feedback,
      });
    },
  },
};