import { createClient } from '@supabase/supabase-js'
import { parseAuthHash } from './auth.js'

const SUPABASE_URL = 'https://wcgfgdxsyfzwvgsgpjoi.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZ2ZnZHhzeWZ6d3Znc2dwam9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzcwOTgsImV4cCI6MjEwNzc1MzA5OH0.9La2u7GoDE6hue5Raoj2gsHlWAoXlNGEgkPB-y6OAJw'

const fromLink = parseAuthHash(location.hash)
const welcome = fromLink?.type === 'invite' || fromLink?.type === 'recovery'

export const authLinkError = fromLink?.error ?? null

if (fromLink) history.replaceState(null, '', `${location.pathname}${location.search}${welcome ? '#/compte?bienvenue=1' : '#/'}`)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
})

if (fromLink?.access_token) supabase.auth.setSession({ access_token: fromLink.access_token, refresh_token: fromLink.refresh_token })
