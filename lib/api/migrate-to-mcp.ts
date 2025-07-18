// API Migration Helper - Replace Supabase calls with MCP
import { agents } from '@/lib/mcp/agent-client';
import { supabase } from '@/lib/supabaseClient';

// Legacy Supabase API wrapper that redirects to MCP
export class MCPMigrationAdapter {
  // Retail insights - previously from Supabase views
  static async getRetailInsights(filters: any) {
    // Try MCP first
    const mcpResult = await agents.retailBot.getInsights(filters);
    
    if (mcpResult.success) {
      return mcpResult.data;
    }
    
    // Fallback to Supabase if MCP fails
    console.warn('MCP call failed, falling back to Supabase');
    const { data, error } = await supabase
      .from('consumer_analytics')
      .select('*')
      .match(filters);
    
    if (error) throw error;
    return data;
  }

  // Transaction analysis - hybrid approach
  static async analyzeTransactions(params: any) {
    // Get raw data from Supabase
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', params.startDate)
      .lte('date', params.endDate);
    
    if (error) throw error;
    
    // Send to MCP for AI analysis
    const analysis = await agents.retailBot.analyzeTrends({
      transactions,
      metrics: params.metrics,
    });
    
    return {
      rawData: transactions,
      insights: analysis.data,
    };
  }

  // Product recommendations
  static async getProductRecommendations(userId: string) {
    // Get user profile from Supabase
    const { data: profile } = await supabase
      .from('consumer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get recommendations from LearnBot
    const recommendations = await agents.learnBot.recommendContent({
      userProfile: profile,
      type: 'products',
    });
    
    return recommendations.data;
  }

  // Campaign generation
  static async generateAdCampaign(brief: any) {
    // Direct MCP call to AdsBot
    return agents.adsBot.generateCampaign(brief);
  }

  // Dashboard orchestration
  static async getDashboardData(config: any) {
    // Use Dash agent to orchestrate multiple data sources
    const result = await agents.dash.orchestrate({
      workflow: 'dashboard_load',
      config,
      sources: ['supabase', 'mcp', 'cache'],
    });
    
    return result.data;
  }
}

// Drop-in replacement functions for existing code
export const api = {
  // Replace: supabase.from('consumer_profiles').select()
  async getConsumerProfiles(filters?: any) {
    return MCPMigrationAdapter.getRetailInsights({
      ...filters,
      entity: 'consumer_profiles',
    });
  },
  
  // Replace: supabase.from('transactions').select()
  async getTransactions(params: any) {
    return MCPMigrationAdapter.analyzeTransactions(params);
  },
  
  // Replace: custom insight queries
  async getInsights(type: string, params: any) {
    switch (type) {
      case 'retail':
        return agents.retailBot.getInsights(params);
      case 'advertising':
        return agents.adsBot.optimizeAds(params);
      case 'creative':
        return agents.gagambi.generateCreative(params);
      default:
        throw new Error(`Unknown insight type: ${type}`);
    }
  },
  
  // New: Process feedback through Echo
  async submitFeedback(feedback: any) {
    return agents.echo.processFeedback(feedback);
  },
};

// React Query hooks for MCP
export function useMCPQuery(agentName: string, action: string, params: any) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await mcpClient.executeAgent({
          agent: agentName as any,
          action,
          input: params,
        });
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [agentName, action, JSON.stringify(params)]);
  
  return { data, loading, error };
}