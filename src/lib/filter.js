const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function filterDrills(drills, { query, categories, favoritesOnly, favorites }) {
  const q = normalize(query.trim())
  return drills.filter(
    (d) =>
      (!q || normalize(d.title).includes(q)) &&
      (!categories.length || d.categories.some((c) => categories.includes(c))) &&
      (!favoritesOnly || favorites.has(d.id)),
  )
}
