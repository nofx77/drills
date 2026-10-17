import { watch } from 'vue'
import { supabase } from '../lib/supabase.js'
import { currentKey, incomingAction, initialAction } from '../lib/currentPlanSync.js'
import { useAuth } from './useAuth.js'
import { usePlan } from './usePlan.js'
import { markSynced } from './usePlanSync.js'

const stored = (plan) => ({ title: plan.title, items: plan.items, ...(plan.savedId ? { savedId: plan.savedId } : {}) })

export function startCurrentPlanSync() {
  const { user } = useAuth()
  const { plan, replace } = usePlan()
  const sentKeys = new Set()
  let channel = null
  let timer = null
  let ready = false
  let appliedKey = null

  function remember(key) {
    sentKeys.add(key)
    if (sentKeys.size > 30) sentKeys.delete(sentKeys.values().next().value)
  }

  function apply(remote) {
    const next = structuredClone(stored(remote))
    appliedKey = currentKey(next)
    markSynced(next)
    replace(next)
  }

  async function fetchRemote() {
    const { data, error } = await supabase.from('current_plans').select('plan').maybeSingle()
    if (error) throw error
    return data?.plan ?? null
  }

  async function push() {
    if (!user.value || !ready) return
    const body = stored(plan.value)
    remember(currentKey(body))
    const { error } = await supabase
      .from('current_plans')
      .upsert({ user_id: user.value.id, plan: body, updated_at: new Date().toISOString() })
    if (error) timer = setTimeout(push, 5000)
  }

  function onRemote(payload) {
    if (!ready || payload.new?.user_id !== user.value?.id) return
    if (incomingAction(payload.new.plan, plan.value, sentKeys) === 'apply') apply(payload.new.plan)
  }

  async function start() {
    ready = false
    try {
      const remote = await fetchRemote()
      const action = initialAction(remote, plan.value)
      if (action === 'pull') apply(remote)
      ready = true
      if (action === 'push') push()
    } catch {
      setTimeout(() => user.value && start(), 5000)
    }
  }

  async function resync() {
    if (!user.value || !ready) return
    try {
      const remote = await fetchRemote()
      if (incomingAction(remote, plan.value, sentKeys) === 'apply') apply(remote)
    } catch {}
  }

  watch(
    user,
    (u) => {
      if (channel) supabase.removeChannel(channel)
      channel = null
      ready = false
      if (!u) return
      channel = supabase
        .channel(`current-plan-${u.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'current_plans' }, onRemote)
        .subscribe()
      start()
    },
    { immediate: true },
  )

  watch(
    plan,
    () => {
      if (!ready || !user.value || currentKey(plan.value) === appliedKey) return
      clearTimeout(timer)
      timer = setTimeout(push, 400)
    },
    { deep: true },
  )

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resync()
  })
}
