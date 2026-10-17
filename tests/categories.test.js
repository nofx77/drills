import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const drills = JSON.parse(readFileSync(new URL('../src/data/drills.json', import.meta.url)))
const categories = JSON.parse(readFileSync(new URL('../src/data/categories.json', import.meta.url)))

const ALLOWED = [
  'Réchauffement', 'Patinage', 'Passes', 'Tir', 'Angle / pression', 'Batailles 1 c. 1', 'Petits jeux',
  'Transition', 'Zone neutre', 'Sortie de zone', 'Entrée de zone', 'Jeu défensif', 'Avantage numérique', 'Gardien',
]

test('chaque exercice a 1 à 3 catégories connues', () => {
  for (const { id } of drills) {
    const list = categories[id]
    assert.ok(Array.isArray(list) && list.length >= 1 && list.length <= 3, `${id} : ${JSON.stringify(list)}`)
    for (const c of list) assert.ok(ALLOWED.includes(c), `${id} : catégorie inconnue « ${c} »`)
  }
})

test('aucune clé orpheline', () => {
  const ids = new Set(drills.map((d) => d.id))
  for (const key of Object.keys(categories)) assert.ok(ids.has(key), `clé orpheline ${key}`)
})
