export const toRow = (plan) => ({ title: plan.title, items: plan.items })

export const fromRow = (row) => ({
  title: row.title ?? '',
  items: Array.isArray(row.items) ? row.items : [],
  savedId: row.id,
})

export const copyTitle = (title) => `${title || 'Plan sans titre'} (copie)`
