<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { drillById } from '../data/drills.js'
import { usePlan } from '../composables/usePlan.js'
import DrillImage from '../components/DrillImage.vue'
import FavoriteButton from '../components/FavoriteButton.vue'

const props = defineProps({ id: { type: String, required: true } })

const router = useRouter()
const { has, add, remove } = usePlan()
const drill = computed(() => drillById.get(props.id))
const base = import.meta.env.BASE_URL

function back() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'catalogue' })
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <button type="button" class="mb-6 inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 text-sm font-medium text-navy/60 transition-colors duration-200 hover:text-navy dark:text-ice/60 dark:hover:text-ice" @click="back">
      <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      Retour
    </button>

    <article v-if="drill" class="flex flex-col gap-6">
      <header class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-3">
          <h1 class="text-3xl font-bold tracking-tight text-navy sm:text-4xl dark:text-white">{{ drill.title }}</h1>
          <div class="flex flex-wrap gap-1.5">
            <RouterLink
              v-for="c in drill.categories"
              :key="c"
              :to="{ name: 'catalogue', query: { c } }"
              class="rounded-full bg-royal/10 px-3 py-1 text-sm font-medium text-royal transition-colors duration-200 hover:bg-royal/20 dark:bg-ice/10 dark:text-ice dark:hover:bg-ice/20"
            >{{ c }}</RouterLink>
          </div>
        </div>
        <FavoriteButton :id="drill.id" class="shrink-0" />
      </header>

      <a v-if="drill.image" :href="base + drill.image" target="_blank" rel="noopener" class="block overflow-hidden rounded-3xl border border-navy/10 dark:border-ice/10">
        <DrillImage :src="drill.image" :alt="drill.title" />
      </a>
      <div v-else class="overflow-hidden rounded-3xl"><DrillImage :src="null" :alt="drill.title" /></div>

      <div v-if="drill.variants.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <a v-for="(v, i) in drill.variants" :key="v" :href="base + v" target="_blank" rel="noopener" class="block overflow-hidden rounded-2xl border border-navy/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-royal/20 dark:border-ice/10">
          <DrillImage :src="v" :alt="`${drill.title} — variante ${i + 1}`" />
        </a>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <a
          v-if="drill.pdf"
          :href="base + drill.pdf"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 rounded-full bg-royal px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-royal/85 dark:bg-accent dark:text-on-accent dark:hover:bg-accent/85"
        >
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
          Ouvrir la fiche PDF
        </a>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-semibold transition-colors duration-200"
          :class="has(drill.id) ? 'border-navy/15 text-navy/70 hover:border-navy/40 dark:border-ice/20 dark:text-ice/70 dark:hover:border-ice/50' : 'border-royal text-royal hover:bg-royal/10 dark:border-periwinkle dark:text-periwinkle dark:hover:bg-periwinkle/10'"
          @click="has(drill.id) ? remove(drill.id) : add(drill.id)"
        >
          {{ has(drill.id) ? 'Retirer du plan' : 'Ajouter au plan' }}
        </button>
      </div>

      <a v-if="drill.sourceUrl" :href="drill.sourceUrl" target="_blank" rel="noopener" class="text-sm text-navy/50 underline-offset-4 hover:underline dark:text-ice/50">Voir sur icehockeysystems.com</a>
    </article>

    <div v-else class="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-navy/15 px-6 py-16 text-center dark:border-ice/15">
      <p class="text-lg text-navy/70 dark:text-ice/70">Exercice introuvable.</p>
      <RouterLink :to="{ name: 'catalogue' }" class="rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white dark:bg-accent dark:text-on-accent">Voir les exercices</RouterLink>
    </div>
  </div>
</template>
