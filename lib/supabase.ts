import { createClient } from '@supabase/supabase-js'

// Ensure we're in a browser environment before creating the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any

// Database types
export interface Transaction {
  id: string
  created_at: string
  volume: number
  revenue: number
  avg_basket: number
  duration: number
  units: number
  location: string
  category: string
  brand: string
}

export interface ProductMix {
  id: string
  category: string
  value: number
  skus: number
  revenue: number
  created_at: string
}

export interface ConsumerBehavior {
  id: string
  method: string
  value: number
  suggested: number
  accepted: number
  rate: number
  created_at: string
}

export interface ConsumerProfile {
  id: string
  age_group: string
  gender: string
  location: string
  income_level: string
  urban_rural: string
  created_at: string
}