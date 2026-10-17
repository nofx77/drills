<script>
import { ref } from 'vue'

const PAGE = 24
const shown = ref(PAGE)
</script>

<script setup>
import { computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { drills, allCategories } from '../data/drills.js'
import { filterDrills } from '../lib/filter.js'
import { useFavorites } from '../composables/useFavorites.js'
import CategoryChips from '../components/CategoryChips.vue'
import DrillCard from '../components/DrillCard.vue'

const props = defineProps({ favoritesOnly: { type: Boolean, default: false } })

const route = useRoute()
const router = useRouter()
const { favorites } = useFavorites()

const query = computed({
  get: () => route.query.q ?? '',
  set: (q) => router.replace({ query: { ...route.query, q: q || undefined } }),
})

const selected = computed({
  get: () => (route.query.c ? route.query.c.split(',') : []),
  set: (c) => router.replace({ query: { ...route.query, c: c.length ? c.join(',') : undefined } }),
})

const results = computed(() =>
  filterDrills(drills, { query: query.value, categories: selected.value, favoritesOnly: props.favoritesOnly, favorites: favorites.value }),
)

const visible = computed(() => results.value.slice(0, shown.value))

watch([query, selected, () => props.favoritesOnly], () => (shown.value = PAGE))

const sentinel = ref(null)
const observer = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting || shown.value >= results.value.length) return
    shown.value += PAGE
    observer.unobserve(entry.target)
    nextTick(() => sentinel.value && observer.observe(sentinel.value))
  },
  { rootMargin: '800px 0px' },
)

watch(sentinel, (el, old) => {
  if (old) observer.unobserve(old)
  if (el) observer.observe(el)
})

onBeforeUnmount(() => observer.disconnect())

const hasFilters = computed(() => query.value || selected.value.length)

function clearFilters() {
  router.replace({ query: {} })
}
</script>

<template>
  <div>
    <header class="mb-6 flex flex-col gap-4">
      <div class="flex items-end justify-between gap-4">
        <h1 class="text-3xl font-bold tracking-tight text-navy sm:text-4xl dark:text-white">{{ favoritesOnly ? 'Favoris' : 'Exercices' }}</h1>
        <p class="pb-1 text-sm text-navy/60 dark:text-ice/60">{{ results.length }} exercice{{ results.length > 1 ? 's' : '' }}</p>
      </div>
      <label class="relative block">
        <span class="sr-only">Rechercher un exercice</span>
        <svg class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-navy/40 dark:text-ice/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          v-model="query"
          type="search"
          placeholder="Rechercher par nom…"
          class="w-full rounded-2xl border border-navy/10 bg-navy/[0.03] py-3 pr-4 pl-12 text-base outline-none transition-colors duration-200 placeholder:text-navy/40 focus:border-royal focus:ring-4 focus:ring-royal/15 dark:border-ice/10 dark:bg-ice/5 dark:placeholder:text-ice/40 dark:focus:border-periwinkle dark:focus:ring-periwinkle/20"
        />
      </label>
      <CategoryChips v-model="selected" :categories="allCategories" />
      <button
        v-if="hasFilters"
        type="button"
        class="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-royal transition-colors duration-200 hover:bg-royal/10 dark:text-periwinkle dark:hover:bg-periwinkle/10"
        @click="clearFilters"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        Effacer les filtres
      </button>
    </header>

    <TransitionGroup v-if="results.length" tag="div" name="list" class="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <DrillCard v-for="drill in visible" :key="drill.id" :drill="drill" />
    </TransitionGroup>
    <div v-if="visible.length < results.length" ref="sentinel" class="h-px" aria-hidden="true"></div>

    <div v-if="!results.length" class="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-navy/15 px-6 py-16 text-center dark:border-ice/15">
      <p class="text-lg text-navy/70 dark:text-ice/70">
        {{ favoritesOnly && !hasFilters ? 'Touche le cœur d’un exercice pour le retrouver ici.' : 'Aucun exercice ne correspond.' }}
      </p>
      <button v-if="hasFilters" type="button" class="rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white dark:bg-accent dark:text-on-accent" @click="clearFilters">Effacer les filtres</button>
      <RouterLink v-else-if="favoritesOnly" :to="{ name: 'catalogue' }" class="rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white dark:bg-accent dark:text-on-accent">Voir les exercices</RouterLink>
    </div>
  </div>
</template>
