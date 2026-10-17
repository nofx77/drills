import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toRow, fromRow, copyTitle } from '../src/lib/savedPlans.js'
import { encodePlan, decodePlan } from '../src/lib/planCodec.js'

test('toRow ne garde que le titre et les exercices', () => {
  assert.deepEqual(toRow({ title: 'U13', items: [{ id: 'go-go', minutes: 5 }], savedId: 'abc' }), {
    title: 'U13',
    items: [{ id: 'go-go', minutes: 5 }],
  })
})

test('fromRow donne un plan relié à sa sauvegarde', () => {
  assert.deepEqual(fromRow({ id: 'abc', title: 'U13', items: [{ id: 'go-go', minutes: null }], updated_at: 'x' }), {
    title: 'U13',
    items: [{ id: 'go-go', minutes: null }],
    savedId: 'abc',
  })
})

test('fromRow résiste à des items mal formés', () => {
  assert.deepEqual(fromRow({ id: 'abc', title: null, items: null }).items, [])
  assert.equal(fromRow({ id: 'abc', title: null, items: [] }).title, '')
})

test('copyTitle', () => {
  assert.equal(copyTitle('U13 mardi'), 'U13 mardi (copie)')
  assert.equal(copyTitle(''), 'Plan sans titre (copie)')
})

test('le lien de partage ne transporte pas le lien vers la sauvegarde', () => {
  const shared = decodePlan(encodePlan({ title: 'U13', items: [{ id: 'go-go', minutes: 5 }], savedId: 'abc' }))
  assert.equal(shared.savedId, undefined)
})
