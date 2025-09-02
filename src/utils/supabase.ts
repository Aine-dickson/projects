import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | undefined

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

if (url && key) {
  _supabase = createClient(url, key)
  if (import.meta.env.DEV) console.info('[supabase] client initialized')
} else {
  if (import.meta.env.DEV) console.warn('[supabase] env vars missing – realtime features disabled')
}

export const supabase = _supabase
export function hasSupabase () { return !!_supabase }
