import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planKey, remoteAction } from '../src/lib/sync.js'

const current = { title: 'U13', items: [{ id: 'go-go', minutes: 5 }], savedId: 'abc' }
const row = (over) => ({ id: 'abc', title: 'U13', items: [{ id: 'go-go', minutes: 5 }], ...over })

test('planKey ignore savedId', () => {
  assert.equal(planKey(current), planKey({ title: 'U13', items: [{ id: 'go-go', minutes: 5 }] }))
})

test('une modification venant d’un autre appareil est appliquée', () => {
  assert.equal(remoteAction({ eventType: 'UPDATE', new: row({ title: 'U13 jeudi' }) }, current, new Set()), 'apply')
})

test('l’écho de ma propre sauvegarde est ignoré, même s’il est plus ancien', () => {
  const sent = new Set([planKey({ title: 'U13 ma', items: current.items }), planKey(current)])
  assert.equal(remoteAction({ eventType: 'UPDATE', new: row({ title: 'U13 ma' }) }, current, sent), 'ignore')
})

test('un contenu identique est ignoré', () => {
  assert.equal(remoteAction({ eventType: 'UPDATE', new: row() }, current, new Set()), 'ignore')
})

test('un autre plan que celui en cours est ignoré', () => {
  assert.equal(remoteAction({ eventType: 'UPDATE', new: row({ id: 'zzz', title: 'Autre' }) }, current, new Set()), 'ignore')
  assert.equal(remoteAction({ eventType: 'UPDATE', new: row({ title: 'X' }) }, { ...current, savedId: undefined }, new Set()), 'ignore')
})

test('la suppression du plan en cours ailleurs le détache', () => {
  assert.equal(remoteAction({ eventType: 'DELETE', old: { id: 'abc' } }, current, new Set()), 'unlink')
  assert.equal(remoteAction({ eventType: 'DELETE', old: { id: 'zzz' } }, current, new Set()), 'ignore')
})

test('un bloc commentaire ajouté sur un appareil est appliqué sur l’autre', async () => {
  const { toRow, fromRow } = await import('../src/lib/savedPlans.js')
  const onB = { title: 'U13', items: [{ id: 'go-go', minutes: 5 }], savedId: 'abc' }
  const onA = { ...onB, items: [...onB.items, { kind: 'note', id: 'note-x', title: 'Pause', text: '', url: '', minutes: 2 }] }
  const event = { eventType: 'UPDATE', new: { id: 'abc', ...toRow(onA) } }
  assert.equal(remoteAction(event, onB, new Set()), 'apply')
  assert.deepEqual(fromRow(event.new).items[1], onA.items[1])
})
