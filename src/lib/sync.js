import { fromRow } from './savedPlans.js'

export const planKey = (plan) => JSON.stringify({ title: plan.title, items: plan.items })

export function remoteAction(event, current, sentKeys) {
  if (!current.savedId) return 'ignore'
  if (event.eventType === 'DELETE') return event.old?.id === current.savedId ? 'unlink' : 'ignore'
  if (event.new?.id !== current.savedId) return 'ignore'
  const key = planKey(fromRow(event.new))
  return sentKeys.has(key) || key === planKey(current) ? 'ignore' : 'apply'
}
