import { test } from 'node:test'
import assert from 'node:assert/strict'

test('un plan ou des favoris mal formés en mémoire ne bloquent pas l’app', async () => {
  const mem = { plan: '{}', favorites: '5' }
  globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v } }
  const { usePlan } = await import('../src/composables/usePlan.js?shape')
  const { useFavorites } = await import('../src/composables/useFavorites.js?shape')
  assert.deepEqual(usePlan().plan.value, { title: '', items: [] })
  assert.equal(usePlan().totalMinutes.value, 0)
  assert.equal(useFavorites().favorites.value.size, 0)
})
