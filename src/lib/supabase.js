import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SB_ENDPOINT
const supabaseAnonKey = import.meta.env.VITE_SB_TOKEN

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check Vercel environment variables.')
}

// Fallback to empty strings to avoid crash on createClient(undefined)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
