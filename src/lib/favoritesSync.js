export function diffSets(before, after) {
  return {
    added: [...after].filter((id) => !before.has(id)),
    removed: [...before].filter((id) => !after.has(id)),
  }
}

export function reconcile(remote, lastSynced, local) {
  const { added, removed } = diffSets(lastSynced, local)
  const result = new Set(remote)
  added.forEach((id) => result.add(id))
  removed.forEach((id) => result.delete(id))
  return result
}
