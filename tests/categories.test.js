import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const drills = JSON.parse(readFileSync(new URL('../src/data/drills.json', import.meta.url)))
const categories = JSON.parse(readFileSync(new URL('../src/data/categories.json', import.meta.url)))

const ALLOWED = [
  'Réchauffement', 'Patinage', 'Passes', 'Tir', 'Angle / pression', 'Petits jeux',
  '1 vs 1', '2 vs 1', '2 vs 2', '3 vs 1', '3 vs 2', '3 vs 3', '4 vs 2',
  'Transition', 'Zone neutre', 'Sortie de zone', 'Entrée de zone', 'Jeu défensif', 'Avantage numérique', 'Gardien',
]

test('chaque exercice a 1 à 6 catégories connues', () => {
  for (const { id } of drills) {
    const list = categories[id]
    assert.ok(Array.isArray(list) && list.length >= 1 && list.length <= 6, `${id} : ${JSON.stringify(list)}`)
    for (const c of list) assert.ok(ALLOWED.includes(c), `${id} : catégorie inconnue « ${c} »`)
  }
})

test('aucune clé orpheline', () => {
  const ids = new Set(drills.map((d) => d.id))
  for (const key of Object.keys(categories)) assert.ok(ids.has(key), `clé orpheline ${key}`)
})

test('les situations de jeu du nom sont dans les catégories', () => {
  const byId = Object.fromEntries(drills.map((d) => [d.id, d.title]))
  assert.ok(categories['1-v-1-2-v-2-3-v-3'].includes('1 vs 1'))
  assert.ok(categories['1-v-1-2-v-2-3-v-3'].includes('2 vs 2'))
  assert.ok(categories['1-v-1-2-v-2-3-v-3'].includes('3 vs 3'))
  assert.ok(categories['2-v-2-net-front-corner-battles-with-support'].includes('2 vs 2'))
  assert.ok(!categories['2-v-2-net-front-corner-battles-with-support'].includes('1 vs 1'))
  assert.ok(!Object.values(categories).flat().includes('Batailles 1 c. 1'))
  assert.ok(byId)
})
