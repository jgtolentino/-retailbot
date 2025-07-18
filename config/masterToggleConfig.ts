import { MasterToggleConfig } from '../services/masterToggleAgent'

export const defaultMasterToggleConfig: MasterToggleConfig = {
  dimensions: {
    // Geographic dimensions
    region: {
      sourceTable: 'transactions',
      sourceColumn: 'region',
      masterTable: 'master_regions',
      enabled: true
    },
    province: {
      sourceTable: 'transactions',
      sourceColumn: 'province',
      masterTable: 'master_provinces',
      enabled: true
    },
    city: {
      sourceTable: 'transactions',
      sourceColumn: 'city_municipality',
      masterTable: 'master_cities',
      enabled: true
    },
    barangay: {
      sourceTable: 'transactions',
      sourceColumn: 'barangay',
      masterTable: 'master_barangays',
      enabled: true
    },
    
    // Store dimensions
    store_type: {
      sourceTable: 'transactions',
      sourceColumn: 'store_type',
      masterTable: 'master_store_types',
      enabled: true
    },
    store_class: {
      sourceTable: 'transactions',
      sourceColumn: 'store_economic_class',
      masterTable: 'master_store_classes',
      enabled: true
    },
    
    // Product dimensions
    brand: {
      sourceTable: 'transactions',
      sourceColumn: 'brand',
      masterTable: 'master_brands',
      enabled: true
    },
    category: {
      sourceTable: 'transactions',
      sourceColumn: 'product_category',
      masterTable: 'master_categories',
      enabled: true
    },
    subcategory: {
      sourceTable: 'transactions',
      sourceColumn: 'product_subcategory',
      masterTable: 'master_subcategories',
      enabled: true
    },
    
    // Customer dimensions
    customer_class: {
      sourceTable: 'transactions',
      sourceColumn: 'customer_economic_class',
      masterTable: 'master_customer_classes',
      enabled: true
    },
    age_group: {
      sourceTable: 'transactions',
      sourceColumn: 'age_bracket',
      masterTable: 'master_age_groups',
      enabled: true
    },
    gender: {
      sourceTable: 'transactions',
      sourceColumn: 'gender',
      masterTable: 'master_genders',
      enabled: true
    },
    
    // Transaction dimensions
    payment_method: {
      sourceTable: 'transactions',
      sourceColumn: 'payment_method',
      masterTable: 'master_payment_methods',
      enabled: true
    },
    
    // Temporal dimensions
    hour_of_day: {
      sourceTable: 'transactions',
      sourceColumn: 'hour_of_day',
      masterTable: 'master_hours',
      enabled: true
    },
    day_of_week: {
      sourceTable: 'transactions',
      sourceColumn: 'day_of_week',
      masterTable: 'master_days',
      enabled: true
    },
    
    // Contextual dimensions
    weather: {
      sourceTable: 'transactions',
      sourceColumn: 'weather_condition',
      masterTable: 'master_weather_conditions',
      enabled: true
    }
  },
  
  // WebSocket server port for real-time updates
  websocketPort: 8080,
  
  // Pruning interval in milliseconds (5 minutes)
  pruneInterval: 300000
}

// Schema-aware configurations for different environments
export const masterToggleConfigs = {
  development: {
    ...defaultMasterToggleConfig,
    websocketPort: 8080,
    pruneInterval: 60000 // 1 minute for dev
  },
  
  staging: {
    ...defaultMasterToggleConfig,
    websocketPort: 8081,
    pruneInterval: 300000 // 5 minutes
  },
  
  production: {
    ...defaultMasterToggleConfig,
    websocketPort: 8082,
    pruneInterval: 600000 // 10 minutes
  }
}

// Helper function to get config based on environment
export function getMasterToggleConfig(env: string = 'development'): MasterToggleConfig {
  const config = masterToggleConfigs[env as keyof typeof masterToggleConfigs]
  if (!config) {
    console.warn(`Unknown environment: ${env}, using development config`)
    return masterToggleConfigs.development
  }
  return config
}

// Extended configurations for Scout Dash enterprise features
export const enterpriseMasterToggleConfig: MasterToggleConfig = {
  ...defaultMasterToggleConfig,
  dimensions: {
    ...defaultMasterToggleConfig.dimensions,
    
    // Scout Dash specific dimensions
    handshake_type: {
      sourceTable: 'transactions',
      sourceColumn: 'handshake_type',
      masterTable: 'master_handshake_types',
      enabled: true
    },
    handshake_result: {
      sourceTable: 'transactions',
      sourceColumn: 'handshake_result',
      masterTable: 'master_handshake_results',
      enabled: true
    },
    tbwa_client: {
      sourceTable: 'transactions',
      sourceColumn: 'tbwa_client_name',
      masterTable: 'master_tbwa_clients',
      enabled: true
    },
    
    // Socioeconomic dimensions
    poverty_level: {
      sourceTable: 'transactions',
      sourceColumn: 'poverty_level_category',
      masterTable: 'master_poverty_levels',
      enabled: true
    },
    urbanization_level: {
      sourceTable: 'transactions',
      sourceColumn: 'urbanization_category',
      masterTable: 'master_urbanization_levels',
      enabled: true
    },
    
    // Store facility dimensions
    store_facilities: {
      sourceTable: 'transactions',
      sourceColumn: 'store_facilities',
      masterTable: 'master_store_facilities',
      enabled: true
    },
    
    // Customer behavior dimensions
    shopping_frequency: {
      sourceTable: 'transactions',
      sourceColumn: 'shopping_frequency',
      masterTable: 'master_shopping_frequencies',
      enabled: true
    },
    price_sensitivity: {
      sourceTable: 'transactions',
      sourceColumn: 'price_sensitivity',
      masterTable: 'master_price_sensitivities',
      enabled: true
    }
  }
}