import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(url && key)

// Usa placeholder se env vars não estiverem configuradas para não crashar o app
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key',
)
