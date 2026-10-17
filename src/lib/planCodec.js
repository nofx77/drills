function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s) {
  const binary = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

export function encodePlan(plan) {
  const encodeItem = (it) => (it.kind === 'note' ? [NOTE, it.minutes, it.title, it.text, ...(it.url ? [it.url] : [])] : [it.id, it.minutes])
  return toBase64Url(JSON.stringify({ t: plan.title, i: plan.items.map(encodeItem) }))
}

const NOTE = '#'

export const newNoteId = () => `note-${Math.random().toString(36).slice(2, 10)}`

const isMinutes = (m) => m === null || (Number.isInteger(m) && m >= 0)

const isValidItem = (it) =>
  Array.isArray(it) &&
  typeof it[0] === 'string' &&
  isMinutes(it[1]) &&
  (it[0] !== NOTE || (typeof it[2] === 'string' && typeof it[3] === 'string' && (it[4] === undefined || typeof it[4] === 'string')))

const decodeItem = ([id, minutes, title, text, url = '']) =>
  id === NOTE ? { kind: 'note', id: newNoteId(), title, text, url, minutes } : { id, minutes }

export function decodePlan(s) {
  try {
    const { t, i } = JSON.parse(fromBase64Url(s))
    if (typeof t !== 'string' || !Array.isArray(i)) return null
    if (!i.every(isValidItem)) return null
    return { title: t, items: i.map(decodeItem) }
  } catch {
    return null
  }
}

export function resolvePlan(plan, knownIds) {
  const items = plan.items.filter((it) => it.kind === 'note' || knownIds.has(it.id))
  return { plan: { title: plan.title, items }, missing: plan.items.length - items.length }
}
