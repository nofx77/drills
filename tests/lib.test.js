import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encodePlan, decodePlan, resolvePlan } from '../src/lib/planCodec.js'
import { filterDrills } from '../src/lib/filter.js'
import { storage } from '../src/lib/storage.js'

const p = { title: 'U13 mardi — été', items: [{ id: 'cut-drop-warm-up', minutes: 10 }, { id: 'go-go', minutes: null }] }

test('encodePlan / decodePlan aller-retour (accents compris)', () => {
  assert.deepEqual(decodePlan(encodePlan(p)), p)
  assert.match(encodePlan(p), /^[A-Za-z0-9_-]+$/)
})

test('decodePlan rejette un lien corrompu', () => {
  assert.equal(decodePlan('!!!pas-un-plan'), null)
  assert.equal(decodePlan(encodePlan(p).slice(0, 10)), null)
  assert.equal(decodePlan(btoa('{"t":1}')), null)
  assert.equal(decodePlan(btoa('{"t":"x","i":[["a","10"]]}')), null)
  assert.equal(decodePlan(''), null)
  assert.equal(decodePlan(undefined), null)
})

test('resolvePlan ignore les exercices inconnus', () => {
  assert.deepEqual(resolvePlan(p, new Set(['go-go'])), { plan: { title: p.title, items: [{ id: 'go-go', minutes: null }] }, missing: 1 })
})

const D = [{ id: 'a', title: 'Défense rapide', categories: ['Transition'] }, { id: 'b', title: 'Go Go', categories: ['Tir'] }]
const none = new Set()

test('filterDrills par titre, sans casse ni accents', () => {
  assert.deepEqual(filterDrills(D, { query: 'DEFENSE', categories: [], favoritesOnly: false, favorites: none }).map((d) => d.id), ['a'])
})

test('filterDrills par catégories (OU)', () => {
  assert.deepEqual(filterDrills(D, { query: '', categories: ['Tir', 'Passes'], favoritesOnly: false, favorites: none }).map((d) => d.id), ['b'])
  assert.deepEqual(filterDrills(D, { query: '', categories: ['Tir', 'Transition'], favoritesOnly: false, favorites: none }).map((d) => d.id), ['a', 'b'])
})

test('filterDrills favoris seulement, combiné en ET', () => {
  assert.deepEqual(filterDrills(D, { query: '', categories: [], favoritesOnly: true, favorites: new Set(['a']) }).map((d) => d.id), ['a'])
  assert.deepEqual(filterDrills(D, { query: 'go', categories: [], favoritesOnly: true, favorites: new Set(['a']) }).map((d) => d.id), [])
})

test('storage survit à un localStorage qui lève', () => {
  globalThis.localStorage = { getItem() { throw new Error() }, setItem() { throw new Error() } }
  assert.equal(storage.get('x', 42), 42)
  assert.doesNotThrow(() => storage.set('x', 1))
})

test('storage lit et écrit du JSON', () => {
  const mem = {}
  globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v } }
  assert.equal(storage.get('absent', 'def'), 'def')
  storage.set('k', ['a'])
  assert.deepEqual(storage.get('k', null), ['a'])
})
