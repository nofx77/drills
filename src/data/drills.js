import raw from './drills.json'
import categoryMap from './categories.json'

export const drills = raw.map((d) => ({ ...d, categories: categoryMap[d.id] ?? [] }))

export const drillById = new Map(drills.map((d) => [d.id, d]))

export const allCategories = [...new Set(drills.flatMap((d) => d.categories))].sort((a, b) => a.localeCompare(b, 'fr'))
