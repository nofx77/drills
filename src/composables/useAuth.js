import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

const user = ref(null)
const ready = ref(false)
const cameFromEmail = new URLSearchParams(location.search).has('code')

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null
  ready.value = true
  if (session && new URLSearchParams(location.search).has('code')) {
    history.replaceState(history.state, '', `${location.pathname}${location.hash}`)
  }
})

export function useAuth() {
  async function signIn(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}${location.pathname}`, shouldCreateUser: false },
    })
    if (error) throw error
  }

  async function signInWithPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function setPassword(password) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, ready, cameFromEmail, signIn, signInWithPassword, setPassword, signOut }
}
