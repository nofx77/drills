import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encodePlan, decodePlan, resolvePlan } from '../src/lib/planCodec.js'

const note = { kind: 'note', id: 'note-1', title: 'Pause eau', text: 'Hydratation — 2 lignes', minutes: 2 }
const plan = { title: 'U13', items: [{ id: 'go-go', minutes: 10 }, note] }

test('un bloc commentaire survit au lien de partage (accents compris)', () => {
  const back = decodePlan(encodePlan(plan))
  assert.deepEqual(back.items[0], { id: 'go-go', minutes: 10 })
  assert.equal(back.items[1].kind, 'note')
  assert.equal(back.items[1].title, 'Pause eau')
  assert.equal(back.items[1].text, 'Hydratation — 2 lignes')
  assert.equal(back.items[1].minutes, 2)
  assert.match(back.items[1].id, /^note-/)
})

test('un bloc commentaire mal formé rend le lien invalide', () => {
  assert.equal(decodePlan(btoa(JSON.stringify({ t: 'x', i: [['#', null, 5, 'a']] }))), null)
})

test('resolvePlan garde les blocs commentaire', () => {
  const { plan: out, missing } = resolvePlan({ title: 'U13', items: [note, { id: 'inconnu', minutes: 1 }] }, new Set())
  assert.deepEqual(out.items, [note])
  assert.equal(missing, 1)
})
