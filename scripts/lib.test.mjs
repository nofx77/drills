import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slugify, titleFromFolder, extractSourceUrl, buildDrill, dropDuplicateImages } from './lib.mjs'

test('slugify produit une URL propre', () => {
  assert.equal(slugify('Cut_&_Drop_Warm_Up'), 'cut-drop-warm-up')
  assert.equal(slugify('1_v_1,_to_2_v_2_to_3_v_3'), '1-v-1-to-2-v-2-to-3-v-3')
  assert.equal(slugify('3_vs._3_Corner_Drill'), '3-vs-3-corner-drill')
  assert.equal(slugify('1_v_1_to_2_v_2_(Stick_vs_No_Stick)'), '1-v-1-to-2-v-2-stick-vs-no-stick')
  assert.equal(slugify('Bing Bang Bong 2 v 1'), 'bing-bang-bong-2-v-1')
})

test('titleFromFolder', () => {
  assert.equal(titleFromFolder('3_v_3__Neutral_Zone_Break_Game'), '3 v 3 Neutral Zone Break Game')
})

test('extractSourceUrl', () => {
  assert.equal(extractSourceUrl('<meta http-equiv="refresh" content="0; url=https://x.com/a">'), 'https://x.com/a')
  assert.equal(extractSourceUrl('<p>rien</p>'), null)
})

test('buildDrill avec variantes, sans mp4', () => {
  const { drill, copies } = buildDrill('1_on_1_Retrievals',
    ['1_ON_1_RETRIEVALS.png', 'drill-maker-1.png', 'field_content_image.png', 'drill.pdf', 'a.mp4', 'open_in_browser.html'])
  assert.equal(drill.id, '1-on-1-retrievals')
  assert.equal(drill.title, '1 on 1 Retrievals')
  assert.equal(drill.image, 'drills/1-on-1-retrievals/main.png')
  assert.deepEqual(drill.variants, ['drills/1-on-1-retrievals/variant-1.png', 'drills/1-on-1-retrievals/variant-2.png'])
  assert.equal(drill.pdf, 'drills/1-on-1-retrievals/fiche.pdf')
  assert.ok(copies.every(([from]) => !from.endsWith('.mp4') && !from.endsWith('.html')))
  assert.deepEqual(copies[0], ['1_ON_1_RETRIEVALS.png', 'main.png'])
})

test('buildDrill sans PDF ou sans PNG', () => {
  assert.equal(buildDrill('X', ['X.png']).drill.pdf, null)
  assert.equal(buildDrill('Y', ['ihs-print-1.pdf']).drill.image, null)
  assert.equal(buildDrill('Y', ['ihs-print-1.pdf']).drill.pdf, 'drills/y/fiche.pdf')
  assert.equal(buildDrill('Z', ['drill-maker-9.png']).drill.image, 'drills/z/main.png')
})

test('buildDrill lit sourceUrl du html', () => {
  const html = '<meta http-equiv="refresh" content="0; url=https://www.icehockeysystems.com/hockey-drills/go-go">'
  assert.equal(buildDrill('Go_Go', ['GO_GO.png'], html).drill.sourceUrl, 'https://www.icehockeysystems.com/hockey-drills/go-go')
  assert.equal(buildDrill('Go_Go', ['GO_GO.png']).drill.sourceUrl, null)
})

test('dropDuplicateImages garde le schéma principal et retire les copies identiques', () => {
  const hash = { 'A.png': 'h1', 'drill-maker-1.png': 'h1', 'field_content_image.png': 'h2', 'drill.pdf': 'h3' }
  assert.deepEqual(
    dropDuplicateImages(['drill-maker-1.png', 'A.png', 'field_content_image.png', 'drill.pdf'], (f) => hash[f]),
    ['A.png', 'field_content_image.png', 'drill.pdf'],
  )
})

test('titleFromFolder met en casse de titre un nom tout en majuscules', () => {
  assert.equal(titleFromFolder('1 ON 0 WITH BACKCHECKER'), '1 on 0 with Backchecker')
  assert.equal(titleFromFolder("HOWIE'S WARM UP SKATING EVALUATION DRILL"), "Howie's Warm Up Skating Evaluation Drill")
  assert.equal(titleFromFolder('2 ON 0 INTO 1 VS. 1'), '2 on 0 into 1 vs. 1')
  assert.equal(titleFromFolder('SIMPLE BREAKOUT - D TO D TO 1 ON 1'), 'Simple Breakout - D to D to 1 on 1')
  assert.equal(titleFromFolder('Go_Go'), 'Go Go')
})

test('buildDrill accepte les JPG et garde leur extension', () => {
  const { drill, copies } = buildDrill('PIVOT, GIVE & GO', ['pivot-give-go.jpg', 'pivot-give-go.pdf', 'Notes.rtf', 'Swiffy output.html', 'a.mp4'])
  assert.equal(drill.id, 'pivot-give-go')
  assert.equal(drill.title, 'Pivot, Give & Go')
  assert.equal(drill.image, 'drills/pivot-give-go/main.jpg')
  assert.equal(drill.pdf, 'drills/pivot-give-go/fiche.pdf')
  assert.deepEqual(copies, [['pivot-give-go.jpg', 'main.jpg'], ['pivot-give-go.pdf', 'fiche.pdf']])
})

test('buildDrill choisit le nom le plus court comme schéma principal', () => {
  const { drill, copies } = buildDrill('EAST COAST 2 ON 0', ['east-coast-2-on-0-#2.jpg', 'east-coast-2-on-0.jpg', 'east-coast-2-on-0.pdf'])
  assert.deepEqual(copies[0], ['east-coast-2-on-0.jpg', 'main.jpg'])
  assert.deepEqual(drill.variants, ['drills/east-coast-2-on-0/variant-1.jpg'])
})

test('buildDrill normalise .jpeg et les majuscules d’extension', () => {
  assert.equal(buildDrill('X', ['a.JPEG']).drill.image, 'drills/x/main.jpg')
})
