import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeUrl, youtubeEmbed } from '../src/lib/links.js'

test('safeUrl accepte http(s) et ajoute https au besoin', () => {
  assert.equal(safeUrl('https://hockeycanada.ca/fr'), 'https://hockeycanada.ca/fr')
  assert.equal(safeUrl('  www.youtube.com/watch?v=abc123DEF_-  '), 'https://www.youtube.com/watch?v=abc123DEF_-')
})

test('safeUrl refuse le reste', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null)
  assert.equal(safeUrl('data:text/html,x'), null)
  assert.equal(safeUrl(''), null)
  assert.equal(safeUrl('pas une adresse'), null)
})

test('youtubeEmbed reconnaît les formats YouTube', () => {
  assert.deepEqual(youtubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), { id: 'dQw4w9WgXcQ', start: 0 })
  assert.deepEqual(youtubeEmbed('https://youtu.be/dQw4w9WgXcQ?t=42'), { id: 'dQw4w9WgXcQ', start: 42 })
  assert.deepEqual(youtubeEmbed('https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=1m5s'), { id: 'dQw4w9WgXcQ', start: 65 })
  assert.deepEqual(youtubeEmbed('https://www.youtube.com/shorts/dQw4w9WgXcQ'), { id: 'dQw4w9WgXcQ', start: 0 })
  assert.deepEqual(youtubeEmbed('youtube.com/embed/dQw4w9WgXcQ'), { id: 'dQw4w9WgXcQ', start: 0 })
})

test('youtubeEmbed ignore les autres liens', () => {
  assert.equal(youtubeEmbed('https://vimeo.com/123'), null)
  assert.equal(youtubeEmbed('https://www.youtube.com/@chaine'), null)
  assert.equal(youtubeEmbed('https://evil.com/watch?v=dQw4w9WgXcQ'), null)
})
