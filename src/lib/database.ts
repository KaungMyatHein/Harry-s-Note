import { createClient } from '@supabase/supabase-js'

// Environment-based database configuration
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

// Supabase client for production
let supabase: ReturnType<typeof createClient> | null = null

if (isProduction && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )
}

export { supabase }

// Database URL configuration based on environment
export function getDatabaseUrl(): string {
  if (isProduction && process.env.SUPABASE_DATABASE_URL) {
    return process.env.SUPABASE_DATABASE_URL
  }
  
  // Default to development SQLite database
  return process.env.DATABASE_URL || "file:./dev.db"
}

// Environment info for debugging
export const dbConfig = {
  environment: process.env.NODE_ENV,
  isDevelopment,
  isProduction,
  databaseUrl: getDatabaseUrl(),
  hasSupabaseConfig: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
}