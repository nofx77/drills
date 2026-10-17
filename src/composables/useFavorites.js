import { ref, watch } from 'vue'
import { storage } from '../lib/storage.js'

const stored = storage.get('favorites', [])
const favorites = ref(new Set(Array.isArray(stored) ? stored : []))

watch(favorites, (value) => storage.set('favorites', [...value]), { deep: true })

export function useFavorites() {
  const isFavorite = (id) => favorites.value.has(id)

  function toggle(id) {
    if (favorites.value.has(id)) favorites.value.delete(id)
    else favorites.value.add(id)
  }

  return { favorites, isFavorite, toggle }
}
