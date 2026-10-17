import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wcgfgdxsyfzwvgsgpjoi.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZ2ZnZHhzeWZ6d3Znc2dwam9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzcwOTgsImV4cCI6MjEwNzc1MzA5OH0.9La2u7GoDE6hue5Raoj2gsHlWAoXlNGEgkPB-y6OAJw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
})
