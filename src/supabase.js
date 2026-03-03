import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xhkbqemxlnkabaueunsa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoa2JxZW14bG5rYWJhdWV1bnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTA5NjIsImV4cCI6MjA4Nzk4Njk2Mn0.qkuJwJljSnJkfUlULyP7-pg98WkoF2LiZtmIWMiGar8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)