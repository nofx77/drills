import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase.js'
import { planKey, remoteAction } from '../lib/sync.js'
import { fromRow } from '../lib/savedPlans.js'
import { useAuth } from './useAuth.js'
import { usePlan } from './usePlan.js'
import { useSavedPlans } from './useSavedPlans.js'

const syncStatus = ref('idle')
const sentKeys = new Set()
let lastSyncedKey = null

function remember(key) {
  sentKeys.add(key)
  if (sentKeys.size > 20) sentKeys.delete(sentKeys.values().next().value)
}

export function useSyncStatus() {
  return syncStatus
}

export function markSynced(plan) {
  lastSyncedKey = planKey(plan)
}

export function startPlanSync() {
  const { user } = useAuth()
  const { plan, replace, markSaved } = usePlan()
  const { save, refresh } = useSavedPlans()
  let channel = null
  let timer = null

  function handle(event) {
    const action = remoteAction(event, plan.value, sentKeys)
    if (action === 'apply') {
      const incoming = fromRow(event.new)
      lastSyncedKey = planKey(incoming)
      replace(incoming)
    }
    if (action === 'unlink') markSaved(undefined)
    refresh().catch(() => {})
  }

  watch(
    user,
    (u) => {
      if (channel) supabase.removeChannel(channel)
      channel = null
      if (!u) return
      channel = supabase
        .channel(`plans-${u.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, handle)
        .subscribe()
    },
    { immediate: true },
  )

  watch(
    plan,
    () => {
      if (!user.value || !plan.value.savedId) return
      if (planKey(plan.value) === lastSyncedKey) return
      clearTimeout(timer)
      syncStatus.value = 'saving'
      timer = setTimeout(push, 700)
    },
    { deep: true },
  )

  async function push() {
    if (!user.value || !plan.value.savedId) return
    const key = planKey(plan.value)
    remember(key)
    try {
      const id = await save(plan.value)
      lastSyncedKey = key
      if (id !== plan.value.savedId) markSaved(id)
      syncStatus.value = 'saved'
    } catch {
      syncStatus.value = 'error'
      timer = setTimeout(push, 5000)
    }
  }

  async function resync() {
    if (!user.value) return
    refresh().catch(() => {})
    const id = plan.value.savedId
    if (!id) return
    const { data, error } = await supabase.from('plans').select('id, title, items').eq('id', id).maybeSingle()
    if (error) return
    handle(data ? { eventType: 'UPDATE', new: data } : { eventType: 'DELETE', old: { id } })
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resync()
  })
}
