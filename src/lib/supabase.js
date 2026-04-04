import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SB_ENDPOINT
const supabaseAnonKey = import.meta.env.VITE_SB_TOKEN

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing from .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
