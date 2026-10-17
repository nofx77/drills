import { createClient } from 'npm:@supabase/supabase-js@2'

const ADMIN_EMAIL = 'martinantel@me.com'
const SITE_URL = 'https://nofx77.github.io/drills/'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer /, '')
  const { data } = await admin.auth.getUser(token)
  if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL) return json({ error: 'Accès réservé à l’administrateur.' }, 403)

  const { email } = await req.json().catch(() => ({ email: null }))
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) return json({ error: 'Courriel invalide.' }, 400)

  const { error } = await admin.auth.admin.inviteUserByEmail(email.trim().toLowerCase(), { redirectTo: SITE_URL })
  if (error) return json({ error: error.message, code: error.code }, 400)
  return json({ ok: true })
})
