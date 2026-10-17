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
  return toBase64Url(JSON.stringify({ t: plan.title, i: plan.items.map((it) => [it.id, it.minutes]) }))
}

const isMinutes = (m) => m === null || (Number.isInteger(m) && m >= 0)

export function decodePlan(s) {
  try {
    const { t, i } = JSON.parse(fromBase64Url(s))
    if (typeof t !== 'string' || !Array.isArray(i)) return null
    if (!i.every((it) => Array.isArray(it) && typeof it[0] === 'string' && isMinutes(it[1]))) return null
    return { title: t, items: i.map(([id, minutes]) => ({ id, minutes })) }
  } catch {
    return null
  }
}

export function resolvePlan(plan, knownIds) {
  const items = plan.items.filter((it) => knownIds.has(it.id))
  return { plan: { title: plan.title, items }, missing: plan.items.length - items.length }
}
