import { test } from 'node:test'
import assert from 'node:assert/strict'
import { diffSets, reconcile } from '../src/lib/favoritesSync.js'

const S = (...a) => new Set(a)
const sorted = (s) => [...s].sort()

test('diffSets donne les ajouts et les retraits', () => {
  assert.deepEqual(diffSets(S('a', 'b'), S('b', 'c')), { added: ['c'], removed: ['a'] })
})

test('première connexion : les favoris de l’appareil s’ajoutent à ceux du compte', () => {
  assert.deepEqual(sorted(reconcile(S('x', 'y'), S(), S('y', 'z'))), ['x', 'y', 'z'])
})

test('retour sur l’appareil : un favori retiré ailleurs disparaît', () => {
  assert.deepEqual(sorted(reconcile(S('a'), S('a', 'b'), S('a', 'b'))), ['a'])
})

test('les changements locaux pas encore envoyés sont conservés', () => {
  assert.deepEqual(sorted(reconcile(S('a', 'b'), S('a', 'b'), S('a', 'c'))), ['a', 'c'])
})
