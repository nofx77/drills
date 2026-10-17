<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { drillById } from '../data/drills.js'
import { decodePlan, resolvePlan } from '../lib/planCodec.js'
import { useAuth } from '../composables/useAuth.js'
import { useSavedPlans } from '../composables/useSavedPlans.js'
import DrillImage from '../components/DrillImage.vue'
import NoteLink from '../components/NoteLink.vue'
import NoteThumb from '../components/NoteThumb.vue'

const route = useRoute()
const base = import.meta.env.BASE_URL
const { user } = useAuth()
const { save } = useSavedPlans()

const decoded = computed(() => decodePlan(route.query.p))
const resolved = computed(() => decoded.value && resolvePlan(decoded.value, new Set(drillById.keys())))
const shared = computed(() => resolved.value?.plan)
const missing = computed(() => resolved.value?.missing ?? 0)
const rows = computed(() => (shared.value?.items ?? []).map((item) => ({ ...item, drill: drillById.get(item.id) })))
const totalMinutes = computed(() => rows.value.reduce((sum, r) => sum + (r.minutes ?? 0), 0))

const saving = ref(false)
const saved = ref(false)
const error = ref('')

async function saveCopy() {
  saving.value = true
  error.value = ''
  try {
    await save({ title: shared.value.title, items: shared.value.items })
    saved.value = true
  } catch (e) {
    error.value = `Échec de l’enregistrement : ${e.message}`
  } finally {
    saving.value = false
  }
}

function printPlan() {
  window.print()
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div v-if="!shared" class="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-navy/15 px-6 py-16 text-center dark:border-ice/15">
      <p class="text-lg text-navy/70 dark:text-ice/70">Lien de plan invalide.</p>
      <RouterLink :to="{ name: 'catalogue' }" class="rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white dark:bg-accent dark:text-on-accent">Voir les exercices</RouterLink>
    </div>

    <template v-else>
      <header class="mb-6 flex flex-col gap-4">
        <p class="text-sm font-medium tracking-wide text-royal uppercase print:hidden dark:text-periwinkle">Plan partagé · lecture seule</p>
        <h1 class="text-2xl leading-tight font-bold tracking-tight break-words text-navy sm:text-3xl dark:text-white">{{ shared.title || 'Plan de pratique' }}</h1>
        <p class="text-navy/70 dark:text-ice/70">
          {{ rows.length }} exercice{{ rows.length > 1 ? 's' : '' }} · Durée totale : <strong class="text-navy dark:text-white">{{ totalMinutes }} min</strong>
        </p>
        <p v-if="missing" class="text-sm text-navy/60 print:hidden dark:text-ice/60">{{ missing }} exercice{{ missing > 1 ? 's' : '' }} introuvable{{ missing > 1 ? 's' : '' }} ignoré{{ missing > 1 ? 's' : '' }}.</p>
        <div class="flex flex-wrap items-center gap-2 print:hidden">
          <button type="button" class="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:border-navy/40 dark:border-ice/20 dark:hover:border-ice/50" @click="printPlan">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
            Imprimer
          </button>
          <template v-if="user">
            <RouterLink v-if="saved" :to="{ name: 'plans' }" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-royal dark:text-periwinkle">✓ Copie enregistrée — voir Mes plans</RouterLink>
            <button v-else type="button" :disabled="saving" class="inline-flex items-center gap-2 rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-royal/85 disabled:opacity-60 dark:bg-accent dark:text-on-accent dark:hover:bg-accent/85" @click="saveCopy">
              {{ saving ? 'Enregistrement…' : 'Enregistrer une copie dans mes plans' }}
            </button>
          </template>
          <RouterLink v-else :to="{ name: 'plans' }" class="inline-flex items-center rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:border-navy/40 dark:border-ice/20 dark:hover:border-ice/50">Se connecter pour enregistrer une copie</RouterLink>
        </div>
        <p v-if="error" role="alert" class="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
      </header>

      <ol class="flex flex-col gap-3">
        <li v-for="(row, index) in rows" :key="`${row.id}-${index}`" class="plan-item flex items-start gap-3 rounded-2xl border border-navy/10 bg-white p-3 sm:gap-4 dark:border-ice/10 dark:bg-ice/5">
          <span class="w-6 shrink-0 pt-1 text-center text-lg font-bold text-royal dark:text-periwinkle">{{ index + 1 }}</span>
          <template v-if="row.kind === 'note'">
            <NoteThumb :url="row.url" :title="row.title" />
            <div class="plan-text flex min-w-0 flex-1 flex-col gap-1">
              <p class="leading-snug font-semibold text-navy dark:text-white">{{ row.title || 'Bloc commentaire' }}</p>
              <p v-if="row.text" class="text-sm whitespace-pre-line text-navy/80 dark:text-ice/80">{{ row.text }}</p>
              <NoteLink :url="row.url" />
              <span class="text-sm text-navy/60 dark:text-ice/60">{{ row.minutes ?? '–' }} min</span>
            </div>
          </template>
          <template v-else>
            <component :is="user ? RouterLink : 'div'" :to="{ name: 'drill', params: { id: row.id } }" class="plan-thumb w-20 shrink-0 overflow-hidden rounded-xl sm:w-32">
              <DrillImage :src="row.drill.image" :alt="row.drill.title" />
            </component>
            <div class="plan-text flex min-w-0 flex-1 flex-col gap-1">
              <component :is="user ? RouterLink : 'p'" :to="{ name: 'drill', params: { id: row.id } }" class="leading-snug font-semibold text-navy dark:text-white" :class="{ 'hover:underline': user }">{{ row.drill.title }}</component>
              <span class="text-sm text-navy/60 dark:text-ice/60">{{ row.minutes ?? '–' }} min</span>
              <a v-if="row.drill.pdf" :href="base + row.drill.pdf" target="_blank" rel="noopener" class="w-fit text-sm font-medium text-royal underline-offset-4 hover:underline print:hidden dark:text-periwinkle">Fiche PDF</a>
            </div>
          </template>
        </li>
      </ol>
    </template>
  </div>
</template>
