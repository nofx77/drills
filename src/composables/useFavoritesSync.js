import { watch } from 'vue'
import { supabase } from '../lib/supabase.js'
import { diffSets, reconcile } from '../lib/favoritesSync.js'
import { useAuth } from './useAuth.js'
import { useFavorites } from './useFavorites.js'

export function startFavoritesSync() {
  const { user } = useAuth()
  const { favorites } = useFavorites()
  let lastSynced = null
  let channel = null
  let pushing = Promise.resolve()

  async function fetchRemote() {
    const { data, error } = await supabase.from('favorites').select('drill_id')
    if (error) throw error
    return new Set(data.map((r) => r.drill_id))
  }

  async function resync() {
    if (!user.value) return
    try {
      const remote = await fetchRemote()
      favorites.value = reconcile(remote, lastSynced ?? new Set(), favorites.value)
      lastSynced = remote
      push()
    } catch {}
  }

  function push() {
    pushing = pushing.then(async () => {
      if (!user.value || !lastSynced) return
      const target = new Set(favorites.value)
      const { added, removed } = diffSets(lastSynced, target)
      try {
        if (added.length) {
          const { error } = await supabase.from('favorites').upsert(added.map((drill_id) => ({ drill_id })), { onConflict: 'user_id,drill_id', ignoreDuplicates: true })
          if (error) throw error
          added.forEach((id) => lastSynced.add(id))
        }
        if (removed.length) {
          const { error } = await supabase.from('favorites').delete().in('drill_id', removed)
          if (error) throw error
          removed.forEach((id) => lastSynced.delete(id))
        }
      } catch {}
    })
  }

  function onRemote(event) {
    if (!lastSynced) return
    const row = event.eventType === 'DELETE' ? event.old : event.new
    if (row?.user_id !== user.value?.id) return
    if (event.eventType === 'INSERT') {
      lastSynced.add(event.new.drill_id)
      favorites.value.add(event.new.drill_id)
    }
    if (event.eventType === 'DELETE') {
      lastSynced.delete(event.old.drill_id)
      favorites.value.delete(event.old.drill_id)
    }
  }

  watch(
    user,
    (u) => {
      if (channel) supabase.removeChannel(channel)
      channel = null
      lastSynced = null
      if (!u) return
      channel = supabase
        .channel(`favorites-${u.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, onRemote)
        .subscribe()
      resync()
    },
    { immediate: true },
  )

  watch(favorites, push, { deep: true })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resync()
  })
}
