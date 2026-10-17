import { test } from 'node:test'
import assert from 'node:assert/strict'
import { currentKey, incomingAction, initialAction } from '../src/lib/currentPlanSync.js'

const a = { title: 'U13', items: [{ id: 'go-go', minutes: 5 }] }
const b = { title: 'U13', items: [{ id: 'go-go', minutes: 5 }, { id: 'oreo', minutes: null }], savedId: 'abc' }
const empty = { title: '', items: [] }

test('currentKey tient compte du plan enregistré ouvert', () => {
  assert.notEqual(currentKey(a), currentKey({ ...a, savedId: 'abc' }))
})

test('un changement venant de l’autre appareil est appliqué', () => {
  assert.equal(incomingAction(b, a, new Set()), 'apply')
})

test('mon propre écho ou un contenu identique est ignoré', () => {
  assert.equal(incomingAction(b, a, new Set([currentKey(b)])), 'ignore')
  assert.equal(incomingAction(a, a, new Set()), 'ignore')
})

test('un plan reçu mal formé est ignoré', () => {
  assert.equal(incomingAction({ title: 'x' }, a, new Set()), 'ignore')
  assert.equal(incomingAction(null, a, new Set()), 'ignore')
})

test('à la connexion : le plan du compte gagne, sinon on envoie celui de l’appareil', () => {
  assert.equal(initialAction(b, a), 'pull')
  assert.equal(initialAction(b, empty), 'pull')
  assert.equal(initialAction(null, a), 'push')
  assert.equal(initialAction(a, a), 'none')
})
