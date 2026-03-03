import { createClient } from '@supabase/supabase-js'

// Estas llaves las sacas de Settings > API en tu panel de Supabase
const supabaseUrl = 'https://tu-url-de-supabase.supabase.co'
const supabaseAnonKey = 'tu-llave-anon-de-supabase'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)