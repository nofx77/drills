import { test } from 'node:test'
import assert from 'node:assert/strict'

const mem = {}
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v } }
const { usePlan } = await import('../src/composables/usePlan.js')

test('usePlan : sans doublon, déplacement borné, total des minutes', () => {
  const { plan, add, move, setMinutes, totalMinutes, remove } = usePlan()
  add('a')
  add('b')
  add('a')
  assert.deepEqual(plan.value.items.map((it) => it.id), ['a', 'b'])
  move(0, -1)
  move(1, 1)
  assert.deepEqual(plan.value.items.map((it) => it.id), ['a', 'b'])
  move(0, 1)
  assert.deepEqual(plan.value.items.map((it) => it.id), ['b', 'a'])
  setMinutes(0, 10)
  assert.equal(totalMinutes.value, 10)
  remove('b')
  assert.deepEqual(plan.value.items, [{ id: 'a', minutes: null }])
})

test('usePlan : nouveau plan oublie la sauvegarde, replace la garde', () => {
  const { plan, replace, clear, markSaved } = usePlan()
  replace({ title: 'X', items: [], savedId: 'abc' })
  assert.equal(plan.value.savedId, 'abc')
  markSaved('def')
  assert.equal(plan.value.savedId, 'def')
  clear()
  assert.equal(plan.value.savedId, undefined)
})
