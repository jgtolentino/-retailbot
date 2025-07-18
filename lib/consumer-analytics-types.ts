// TypeScript types for Consumer Analytics Database
export interface Database {
  public: {
    Tables: {
      consumer_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          email: string | null;
          name: string | null;
          age: number | null;
          gender: string | null;
          location: string | null;
          income_bracket: string | null;
          lifestyle_segment: string | null;
          preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          name?: string | null;
          age?: number | null;
          gender?: string | null;
          location?: string | null;
          income_bracket?: string | null;
          lifestyle_segment?: string | null;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          name?: string | null;
          age?: number | null;
          gender?: string | null;
          location?: string | null;
          income_bracket?: string | null;
          lifestyle_segment?: string | null;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          consumer_id: string | null;
          transaction_id: string;
          amount: number;
          currency: string | null;
          category: string | null;
          subcategory: string | null;
          merchant: string | null;
          description: string | null;
          date: string;
          payment_method: string | null;
          status: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          consumer_id?: string | null;
          transaction_id: string;
          amount: number;
          currency?: string | null;
          category?: string | null;
          subcategory?: string | null;
          merchant?: string | null;
          description?: string | null;
          date: string;
          payment_method?: string | null;
          status?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          consumer_id?: string | null;
          transaction_id?: string;
          amount?: number;
          currency?: string | null;
          category?: string | null;
          subcategory?: string | null;
          merchant?: string | null;
          description?: string | null;
          date?: string;
          payment_method?: string | null;
          status?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      consumer_behavior: {
        Row: {
          id: string;
          consumer_id: string | null;
          behavior_type: string;
          category: string | null;
          subcategory: string | null;
          value: number | null;
          frequency: number | null;
          timestamp: string;
          session_id: string | null;
          device_type: string | null;
          location: string | null;
          context: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          consumer_id?: string | null;
          behavior_type: string;
          category?: string | null;
          subcategory?: string | null;
          value?: number | null;
          frequency?: number | null;
          timestamp?: string;
          session_id?: string | null;
          device_type?: string | null;
          location?: string | null;
          context?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          consumer_id?: string | null;
          behavior_type?: string;
          category?: string | null;
          subcategory?: string | null;
          value?: number | null;
          frequency?: number | null;
          timestamp?: string;
          session_id?: string | null;
          device_type?: string | null;
          location?: string | null;
          context?: Record<string, any>;
          created_at?: string;
        };
      };
      product_mix: {
        Row: {
          id: string;
          product_id: string;
          product_name: string;
          category: string;
          subcategory: string | null;
          brand: string | null;
          price: number | null;
          cost: number | null;
          margin: number | null;
          value: number | null;
          volume: number | null;
          popularity_score: number | null;
          seasonality_factor: number | null;
          inventory_level: number | null;
          supplier: string | null;
          launch_date: string | null;
          status: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          product_name: string;
          category: string;
          subcategory?: string | null;
          brand?: string | null;
          price?: number | null;
          cost?: number | null;
          margin?: number | null;
          value?: number | null;
          volume?: number | null;
          popularity_score?: number | null;
          seasonality_factor?: number | null;
          inventory_level?: number | null;
          supplier?: string | null;
          launch_date?: string | null;
          status?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          product_name?: string;
          category?: string;
          subcategory?: string | null;
          brand?: string | null;
          price?: number | null;
          cost?: number | null;
          margin?: number | null;
          value?: number | null;
          volume?: number | null;
          popularity_score?: number | null;
          seasonality_factor?: number | null;
          inventory_level?: number | null;
          supplier?: string | null;
          launch_date?: string | null;
          status?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      suggestion_acceptance: {
        Row: {
          id: string;
          consumer_id: string | null;
          suggestion_id: string;
          suggestion_type: string;
          suggested_item: string | null;
          acceptance_status: string;
          confidence_score: number | null;
          context: Record<string, any>;
          suggested_at: string;
          responded_at: string | null;
          conversion_value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          consumer_id?: string | null;
          suggestion_id: string;
          suggestion_type: string;
          suggested_item?: string | null;
          acceptance_status: string;
          confidence_score?: number | null;
          context?: Record<string, any>;
          suggested_at?: string;
          responded_at?: string | null;
          conversion_value?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          consumer_id?: string | null;
          suggestion_id?: string;
          suggestion_type?: string;
          suggested_item?: string | null;
          acceptance_status?: string;
          confidence_score?: number | null;
          context?: Record<string, any>;
          suggested_at?: string;
          responded_at?: string | null;
          conversion_value?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {
      consumer_analytics: {
        Row: {
          consumer_id: string;
          name: string | null;
          lifestyle_segment: string | null;
          total_transactions: number | null;
          total_spent: number | null;
          avg_transaction_value: number | null;
          categories_purchased: number | null;
          last_purchase_date: string | null;
        };
      };
      product_performance: {
        Row: {
          product_id: string;
          product_name: string;
          category: string;
          value: number | null;
          volume: number | null;
          popularity_score: number | null;
          transaction_count: number | null;
          total_revenue: number | null;
          avg_sale_price: number | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for common operations
export type ConsumerProfile = Database['public']['Tables']['consumer_profiles']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type ConsumerBehavior = Database['public']['Tables']['consumer_behavior']['Row'];
export type ProductMix = Database['public']['Tables']['product_mix']['Row'];
export type SuggestionAcceptance = Database['public']['Tables']['suggestion_acceptance']['Row'];

export type ConsumerAnalytics = Database['public']['Views']['consumer_analytics']['Row'];
export type ProductPerformance = Database['public']['Views']['product_performance']['Row'];

// Insert types for forms
export type ConsumerProfileInsert = Database['public']['Tables']['consumer_profiles']['Insert'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type ConsumerBehaviorInsert = Database['public']['Tables']['consumer_behavior']['Insert'];
export type ProductMixInsert = Database['public']['Tables']['product_mix']['Insert'];
export type SuggestionAcceptanceInsert = Database['public']['Tables']['suggestion_acceptance']['Insert'];

// Update types for forms
export type ConsumerProfileUpdate = Database['public']['Tables']['consumer_profiles']['Update'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];
export type ConsumerBehaviorUpdate = Database['public']['Tables']['consumer_behavior']['Update'];
export type ProductMixUpdate = Database['public']['Tables']['product_mix']['Update'];
export type SuggestionAcceptanceUpdate = Database['public']['Tables']['suggestion_acceptance']['Update'];

// Utility types
export interface DateRange {
  start: string;
  end: string;
}

export interface ConsumerInsight {
  consumer_id: string;
  total_spent: number;
  favorite_categories: string[];
  purchase_frequency: number;
  preferred_payment_method: string;
  risk_score: number;
}

export interface ProductRecommendation {
  product_id: string;
  product_name: string;
  category: string;
  confidence_score: number;
  reason: string;
  estimated_value: number;
}

export interface BehaviorPattern {
  behavior_type: string;
  category: string;
  frequency: number;
  value: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Dashboard metrics
export interface DashboardMetrics {
  total_consumers: number;
  total_transactions: number;
  total_revenue: number;
  avg_transaction_value: number;
  top_categories: Array<{
    category: string;
    revenue: number;
    transactions: number;
  }>;
  recent_activity: Array<{
    type: string;
    description: string;
    timestamp: string;
    value?: number;
  }>;
}

// Realtime subscription payloads
export interface RealtimePayload<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}

export type TransactionPayload = RealtimePayload<Transaction>;
export type ConsumerBehaviorPayload = RealtimePayload<ConsumerBehavior>;
export type SuggestionAcceptancePayload = RealtimePayload<SuggestionAcceptance>;