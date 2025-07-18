// Consumer Analytics Data Service
import { createClient } from '@supabase/supabase-js';
import type { 
  Database, 
  ConsumerProfile, 
  Transaction, 
  ConsumerBehavior, 
  ProductMix, 
  SuggestionAcceptance,
  ConsumerAnalytics,
  ProductPerformance,
  ConsumerProfileInsert,
  TransactionInsert,
  ConsumerBehaviorInsert,
  ProductMixInsert,
  SuggestionAcceptanceInsert,
  DashboardMetrics,
  DateRange
} from './consumer-analytics-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Consumer Profiles Service
export class ConsumerProfileService {
  static async getAll(): Promise<ConsumerProfile[]> {
    const { data, error } = await supabase
      .from('consumer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consumer profiles:', error);
      return [];
    }

    return data;
  }

  static async getById(id: string): Promise<ConsumerProfile | null> {
    const { data, error } = await supabase
      .from('consumer_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching consumer profile:', error);
      return null;
    }

    return data;
  }

  static async create(profile: ConsumerProfileInsert): Promise<ConsumerProfile | null> {
    const { data, error } = await supabase
      .from('consumer_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error creating consumer profile:', error);
      return null;
    }

    return data;
  }

  static async update(id: string, updates: Partial<ConsumerProfileInsert>): Promise<ConsumerProfile | null> {
    const { data, error } = await supabase
      .from('consumer_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating consumer profile:', error);
      return null;
    }

    return data;
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('consumer_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting consumer profile:', error);
      return false;
    }

    return true;
  }
}

// Transactions Service
export class TransactionService {
  static async getAll(limit?: number): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data;
  }

  static async getByConsumer(consumerId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('consumer_id', consumerId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching consumer transactions:', error);
      return [];
    }

    return data;
  }

  static async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by date range:', error);
      return [];
    }

    return data;
  }

  static async getByCategory(category: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by category:', error);
      return [];
    }

    return data;
  }

  static async create(transaction: TransactionInsert): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    return data;
  }

  static async getTotalsByCategory(): Promise<Array<{ category: string; total: number; count: number }>> {
    const { data, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching transaction totals:', error);
      return [];
    }

    const totals = data.reduce((acc, transaction) => {
      const category = transaction.category!;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += transaction.amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(totals).map(([category, { total, count }]) => ({
      category,
      total,
      count
    }));
  }
}

// Consumer Behavior Service
export class ConsumerBehaviorService {
  static async getAll(limit?: number): Promise<ConsumerBehavior[]> {
    let query = supabase
      .from('consumer_behavior')
      .select('*')
      .order('timestamp', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching consumer behavior:', error);
      return [];
    }

    return data;
  }

  static async getByConsumer(consumerId: string): Promise<ConsumerBehavior[]> {
    const { data, error } = await supabase
      .from('consumer_behavior')
      .select('*')
      .eq('consumer_id', consumerId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching consumer behavior:', error);
      return [];
    }

    return data;
  }

  static async getByType(behaviorType: string): Promise<ConsumerBehavior[]> {
    const { data, error } = await supabase
      .from('consumer_behavior')
      .select('*')
      .eq('behavior_type', behaviorType)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching behavior by type:', error);
      return [];
    }

    return data;
  }

  static async create(behavior: ConsumerBehaviorInsert): Promise<ConsumerBehavior | null> {
    const { data, error } = await supabase
      .from('consumer_behavior')
      .insert(behavior)
      .select()
      .single();

    if (error) {
      console.error('Error creating consumer behavior:', error);
      return null;
    }

    return data;
  }

  static async getBehaviorSummary(): Promise<Array<{ behavior_type: string; count: number; avg_value: number }>> {
    const { data, error } = await supabase
      .from('consumer_behavior')
      .select('behavior_type, value');

    if (error) {
      console.error('Error fetching behavior summary:', error);
      return [];
    }

    const summary = data.reduce((acc, behavior) => {
      const type = behavior.behavior_type;
      if (!acc[type]) {
        acc[type] = { count: 0, totalValue: 0 };
      }
      acc[type].count += 1;
      acc[type].totalValue += behavior.value || 0;
      return acc;
    }, {} as Record<string, { count: number; totalValue: number }>);

    return Object.entries(summary).map(([behavior_type, { count, totalValue }]) => ({
      behavior_type,
      count,
      avg_value: totalValue / count
    }));
  }
}

// Product Mix Service
export class ProductMixService {
  static async getAll(): Promise<ProductMix[]> {
    const { data, error } = await supabase
      .from('product_mix')
      .select('*')
      .order('value', { ascending: false });

    if (error) {
      console.error('Error fetching product mix:', error);
      return [];
    }

    return data;
  }

  static async getByCategory(category: string): Promise<ProductMix[]> {
    const { data, error } = await supabase
      .from('product_mix')
      .select('*')
      .eq('category', category)
      .order('value', { ascending: false });

    if (error) {
      console.error('Error fetching product mix by category:', error);
      return [];
    }

    return data;
  }

  static async getTopPerformers(limit: number = 10): Promise<ProductMix[]> {
    const { data, error } = await supabase
      .from('product_mix')
      .select('*')
      .order('popularity_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top performers:', error);
      return [];
    }

    return data;
  }

  static async create(product: ProductMixInsert): Promise<ProductMix | null> {
    const { data, error } = await supabase
      .from('product_mix')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    return data;
  }

  static async update(id: string, updates: Partial<ProductMixInsert>): Promise<ProductMix | null> {
    const { data, error } = await supabase
      .from('product_mix')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return data;
  }
}

// Suggestion Acceptance Service
export class SuggestionAcceptanceService {
  static async getAll(): Promise<SuggestionAcceptance[]> {
    const { data, error } = await supabase
      .from('suggestion_acceptance')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suggestion acceptance:', error);
      return [];
    }

    return data;
  }

  static async getByConsumer(consumerId: string): Promise<SuggestionAcceptance[]> {
    const { data, error } = await supabase
      .from('suggestion_acceptance')
      .select('*')
      .eq('consumer_id', consumerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consumer suggestions:', error);
      return [];
    }

    return data;
  }

  static async getAcceptanceRate(): Promise<{ status: string; count: number; percentage: number }[]> {
    const { data, error } = await supabase
      .from('suggestion_acceptance')
      .select('acceptance_status');

    if (error) {
      console.error('Error fetching acceptance rates:', error);
      return [];
    }

    const total = data.length;
    const statusCounts = data.reduce((acc, suggestion) => {
      const status = suggestion.acceptance_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / total) * 100
    }));
  }

  static async create(suggestion: SuggestionAcceptanceInsert): Promise<SuggestionAcceptance | null> {
    const { data, error } = await supabase
      .from('suggestion_acceptance')
      .insert(suggestion)
      .select()
      .single();

    if (error) {
      console.error('Error creating suggestion acceptance:', error);
      return null;
    }

    return data;
  }
}

// Analytics Views Service
export class AnalyticsService {
  static async getConsumerAnalytics(): Promise<ConsumerAnalytics[]> {
    const { data, error } = await supabase
      .from('consumer_analytics')
      .select('*')
      .order('total_spent', { ascending: false });

    if (error) {
      console.error('Error fetching consumer analytics:', error);
      return [];
    }

    return data;
  }

  static async getProductPerformance(): Promise<ProductPerformance[]> {
    const { data, error } = await supabase
      .from('product_performance')
      .select('*')
      .order('total_revenue', { ascending: false });

    if (error) {
      console.error('Error fetching product performance:', error);
      return [];
    }

    return data;
  }

  static async getDashboardMetrics(): Promise<DashboardMetrics | null> {
    try {
      // Get basic counts
      const [
        { count: totalConsumers },
        { count: totalTransactions },
        transactionData,
        categoryData
      ] = await Promise.all([
        supabase.from('consumer_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount'),
        TransactionService.getTotalsByCategory()
      ]);

      const totalRevenue = transactionData.data?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Get recent activity
      const recentTransactions = await TransactionService.getAll(10);
      const recentActivity = recentTransactions.map(t => ({
        type: 'transaction',
        description: `${t.category} purchase at ${t.merchant}`,
        timestamp: t.created_at,
        value: t.amount
      }));

      return {
        total_consumers: totalConsumers || 0,
        total_transactions: totalTransactions || 0,
        total_revenue: totalRevenue,
        avg_transaction_value: avgTransactionValue,
        top_categories: categoryData.slice(0, 5).map(c => ({
          category: c.category,
          revenue: c.total,
          transactions: c.count
        })),
        recent_activity: recentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return null;
    }
  }
}

// Realtime subscriptions
export class RealtimeService {
  static subscribeToTransactions(callback: (payload: any) => void) {
    return supabase
      .channel('transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, callback)
      .subscribe();
  }

  static subscribeToConsumerBehavior(callback: (payload: any) => void) {
    return supabase
      .channel('consumer_behavior')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consumer_behavior'
      }, callback)
      .subscribe();
  }

  static subscribeToSuggestionAcceptance(callback: (payload: any) => void) {
    return supabase
      .channel('suggestion_acceptance')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'suggestion_acceptance'
      }, callback)
      .subscribe();
  }

  static unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  }
}

// Export all services
export {
  ConsumerProfileService,
  TransactionService,
  ConsumerBehaviorService,
  ProductMixService,
  SuggestionAcceptanceService,
  AnalyticsService,
  RealtimeService
};