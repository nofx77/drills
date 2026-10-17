import { ref, computed, watch } from 'vue'
import { storage } from '../lib/storage.js'

const stored = storage.get('plan', null)
const plan = ref(Array.isArray(stored?.items) ? stored : { title: '', items: [] })

watch(plan, (value) => storage.set('plan', value), { deep: true })

const totalMinutes = computed(() => plan.value.items.reduce((sum, it) => sum + (it.minutes ?? 0), 0))

export function usePlan() {
  const has = (id) => plan.value.items.some((it) => it.id === id)

  function add(id) {
    if (!has(id)) plan.value.items.push({ id, minutes: null })
  }

  function remove(id) {
    plan.value.items = plan.value.items.filter((it) => it.id !== id)
  }

  function move(index, delta) {
    const items = plan.value.items
    const target = index + delta
    if (target < 0 || target >= items.length) return
    ;[items[index], items[target]] = [items[target], items[index]]
  }

  function setMinutes(index, minutes) {
    plan.value.items[index].minutes = minutes
  }

  function replace(next) {
    plan.value = next
  }

  function clear() {
    plan.value = { title: '', items: [] }
  }

  return { plan, has, add, remove, move, setMinutes, totalMinutes, replace, clear }
}
