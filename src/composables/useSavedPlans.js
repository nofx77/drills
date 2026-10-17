import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'
import { toRow, copyTitle } from '../lib/savedPlans.js'

const plans = ref([])
const loading = ref(false)

async function run(query) {
  const { data, error } = await query
  if (error) throw error
  return data
}

export function useSavedPlans() {
  async function refresh() {
    loading.value = true
    try {
      plans.value = await run(supabase.from('plans').select('id, title, items, updated_at').order('updated_at', { ascending: false }))
    } finally {
      loading.value = false
    }
  }

  async function save(plan) {
    const row = plan.savedId
      ? await run(supabase.from('plans').update(toRow(plan)).eq('id', plan.savedId).select('id').maybeSingle())
      : null
    if (row) return row.id
    const created = await run(supabase.from('plans').insert(toRow(plan)).select('id').single())
    return created.id
  }

  async function remove(id) {
    await run(supabase.from('plans').delete().eq('id', id))
    plans.value = plans.value.filter((p) => p.id !== id)
  }

  async function rename(id, title) {
    await run(supabase.from('plans').update({ title }).eq('id', id))
    await refresh()
  }

  async function duplicate(row) {
    await run(supabase.from('plans').insert({ title: copyTitle(row.title), items: row.items }))
    await refresh()
  }

  return { plans, loading, refresh, save, remove, rename, duplicate }
}
