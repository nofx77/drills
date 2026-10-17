export const currentKey = (plan) => JSON.stringify({ title: plan.title, items: plan.items, savedId: plan.savedId ?? null })

const isPlan = (p) => p && typeof p.title === 'string' && Array.isArray(p.items)

export function incomingAction(remote, local, sentKeys) {
  if (!isPlan(remote)) return 'ignore'
  const key = currentKey(remote)
  return sentKeys.has(key) || key === currentKey(local) ? 'ignore' : 'apply'
}

export function initialAction(remote, local) {
  if (!isPlan(remote)) return 'push'
  return currentKey(remote) === currentKey(local) ? 'none' : 'pull'
}
