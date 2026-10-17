<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import Sortable from 'sortablejs'
import { drillById } from '../data/drills.js'
import { encodePlan, resolvePlan } from '../lib/planCodec.js'
import { usePlan } from '../composables/usePlan.js'
import { useAuth } from '../composables/useAuth.js'
import { useSavedPlans } from '../composables/useSavedPlans.js'
import { useSyncStatus, markSynced } from '../composables/usePlanSync.js'
import DrillImage from '../components/DrillImage.vue'
import NoteLink from '../components/NoteLink.vue'
import NoteThumb from '../components/NoteThumb.vue'

const { plan, remove, move, moveTo, setMinutes, totalMinutes, replace, clear, markSaved, addNote, updateNote } = usePlan()

const listRef = ref(null)
let sortable = null

watch(listRef, (list) => {
  sortable?.destroy()
  sortable = null
  if (!list?.$el) return
  sortable = Sortable.create(list.$el, {
    handle: '.drag-handle',
    animation: 150,
    forceFallback: true,
    fallbackTolerance: 3,
    ghostClass: 'drag-ghost',
    chosenClass: 'drag-chosen',
    onEnd({ item, from, oldIndex, newIndex }) {
      if (oldIndex === newIndex) return
      from.removeChild(item)
      from.insertBefore(item, from.children[oldIndex] ?? null)
      moveTo(oldIndex, newIndex)
    },
  })
})

onBeforeUnmount(() => sortable?.destroy())
const { user } = useAuth()
const { save } = useSavedPlans()
const saving = ref(false)
const syncStatus = useSyncStatus()
const syncLabel = { idle: 'Synchronisé', saved: 'Synchronisé', saving: 'Synchronisation…', error: 'Hors ligne — sera réessayé' }

const rows = computed(() =>
  plan.value.items.map((item) => ({ ...item, drill: drillById.get(item.id) })).filter((r) => r.kind === 'note' || r.drill),
)

function newNote() {
  const id = addNote()
  setTimeout(() => document.getElementById(`${id}-title`)?.focus(), 250)
}

function noteMinutes(id, value) {
  const n = parseInt(value, 10)
  updateNote(id, { minutes: Number.isNaN(n) || n < 0 ? null : n })
}

const label = (row) => (row.kind === 'note' ? row.title || 'Bloc commentaire' : row.drill.title)

const toast = ref('')
let toastTimer
function notify(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2500)
}

function onMinutes(index, value) {
  const n = parseInt(value, 10)
  setMinutes(index, Number.isNaN(n) || n < 0 ? null : n)
}

async function share() {
  const url = `${location.origin}${location.pathname}#/partage?p=${encodePlan(plan.value)}`
  const title = plan.value.title || 'Plan de pratique'
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    notify('Lien copié')
  } catch {
    window.prompt('Copie ce lien :', url)
  }
}

function printPlan() {
  window.print()
}

async function savePlan() {
  saving.value = true
  try {
    const id = await save(plan.value)
    markSynced(plan.value)
    markSaved(id)
    notify('Plan enregistré')
  } catch (e) {
    notify(`Échec de l’enregistrement : ${e.message}`)
  } finally {
    saving.value = false
  }
}

function newPlan() {
  if (!plan.value.items.length || confirm('Commencer un nouveau plan ? Le plan en cours sera vidé.')) clear()
}

const pruned = resolvePlan(plan.value, new Set(drillById.keys()))
if (pruned.missing) replace(pruned.plan)

</script>

<template>
  <div class="mx-auto max-w-3xl">
    <header class="mb-6 flex flex-col gap-4">
      <p class="text-sm font-medium tracking-wide text-royal uppercase print:hidden dark:text-periwinkle">Plan de pratique</p>
      <textarea
        v-model="plan.title"
        rows="1"
        placeholder="Pratique du …"
        aria-label="Titre du plan"
        class="field-sizing-content w-full resize-none rounded-xl bg-transparent text-2xl leading-tight font-bold tracking-tight break-words text-navy outline-none placeholder:text-navy/30 focus:ring-4 focus:ring-royal/15 sm:text-3xl dark:text-white dark:placeholder:text-ice/30 print:hidden"
        @keydown.enter.prevent
      ></textarea>
      <h1 class="hidden text-2xl font-bold break-words print:block">{{ plan.title || 'Plan de pratique' }}</h1>
      <p v-if="rows.length" class="text-navy/70 dark:text-ice/70">
        {{ rows.length }} exercice{{ rows.length > 1 ? 's' : '' }} · Durée totale : <strong class="text-navy dark:text-white">{{ totalMinutes }} min</strong>
      </p>
      <div v-if="rows.length" class="flex flex-wrap gap-2 print:hidden">
        <button type="button" class="inline-flex items-center gap-2 rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-royal/85 dark:bg-accent dark:text-on-accent dark:hover:bg-accent/85" @click="share">
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13" /></svg>
          Partager
        </button>
        <button type="button" class="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:border-navy/40 dark:border-ice/20 dark:hover:border-ice/50" @click="printPlan">
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
          Imprimer
        </button>
        <span v-if="user && plan.savedId" role="status" class="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-navy/60 dark:text-ice/60">
          <span class="size-2 rounded-full transition-colors duration-200" :class="syncStatus === 'error' ? 'bg-red-500' : syncStatus === 'saving' ? 'bg-amber-400' : 'bg-emerald-500'" aria-hidden="true"></span>
          {{ syncLabel[syncStatus] }}
        </span>
        <button v-else-if="user" type="button" :disabled="saving" class="inline-flex items-center gap-2 rounded-full border border-royal px-4 py-2 text-sm font-semibold text-royal transition-colors duration-200 hover:bg-royal/10 disabled:opacity-60 dark:border-periwinkle dark:text-periwinkle dark:hover:bg-periwinkle/10" @click="savePlan">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <RouterLink v-else :to="{ name: 'plans' }" class="inline-flex items-center rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:border-navy/40 dark:border-ice/20 dark:hover:border-ice/50">Se connecter pour enregistrer</RouterLink>
        <button type="button" class="ml-auto rounded-full px-4 py-2 text-sm font-medium text-navy/50 transition-colors duration-200 hover:text-navy dark:text-ice/50 dark:hover:text-ice" @click="newPlan">Nouveau plan</button>
      </div>
    </header>

    <TransitionGroup v-if="rows.length" ref="listRef" tag="ol" name="list" class="relative flex flex-col gap-3">
      <li
        v-for="(row, index) in rows"
        :key="row.id"
        class="plan-item flex flex-wrap items-start gap-3 rounded-2xl sm:flex-nowrap border border-navy/10 bg-white p-3 sm:gap-4 dark:border-ice/10 dark:bg-ice/5"
      >
        <div class="flex shrink-0 flex-col items-center gap-1">
          <span class="drag-handle grid size-7 cursor-grab touch-none place-items-center rounded-lg text-navy/40 transition-colors duration-200 hover:bg-navy/5 hover:text-navy active:cursor-grabbing print:hidden dark:text-ice/40 dark:hover:bg-ice/10 dark:hover:text-ice" :aria-label="`Glisser pour déplacer ${label(row)}`" title="Glisser pour déplacer">
            <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>
          </span>
          <span class="w-6 text-center text-lg font-bold text-royal dark:text-periwinkle">{{ index + 1 }}</span>
        </div>
        <template v-if="row.kind === 'note'">
          <NoteThumb :url="row.url" :title="row.title" />
          <div class="plan-text flex min-w-0 flex-1 flex-col gap-2">
            <textarea
              :id="`${row.id}-title`"
              :value="row.title"
              rows="1"
              placeholder="Titre du bloc"
              aria-label="Titre du bloc commentaire"
              class="field-sizing-content w-full resize-none rounded-lg border border-transparent bg-transparent px-1 py-0.5 leading-snug font-semibold break-words text-navy outline-none placeholder:text-navy/40 focus:border-navy/15 print:hidden dark:text-white dark:placeholder:text-ice/40 dark:focus:border-ice/20"
              @input="updateNote(row.id, { title: $event.target.value })"
              @keydown.enter.prevent
            ></textarea>
            <textarea
              :value="row.text"
              rows="2"
              placeholder="Description, consignes, points à souligner…"
              aria-label="Description du bloc commentaire"
              class="field-sizing-content min-h-12 w-full resize-none rounded-lg border border-navy/10 bg-transparent px-2 py-1.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-royal print:hidden dark:border-ice/15 dark:text-ice dark:placeholder:text-ice/40 dark:focus:border-periwinkle"
              @input="updateNote(row.id, { text: $event.target.value })"
            ></textarea>
            <input
              :value="row.url"
              type="url"
              inputmode="url"
              placeholder="Lien YouTube ou page web (facultatif)"
              aria-label="Lien du bloc commentaire"
              class="w-full rounded-lg border border-navy/10 bg-transparent px-2 py-1.5 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-royal print:hidden dark:border-ice/15 dark:text-ice dark:placeholder:text-ice/40 dark:focus:border-periwinkle"
              @input="updateNote(row.id, { url: $event.target.value })"
            />
            <p class="hidden font-semibold print:block">{{ row.title || 'Bloc commentaire' }}</p>
            <p class="hidden text-sm whitespace-pre-line print:block">{{ row.text }}</p>
            <NoteLink :url="row.url" />
            <label class="flex items-center gap-2 text-sm text-navy/60 dark:text-ice/60">
              <input
                :value="row.minutes ?? ''"
                type="number"
                min="0"
                inputmode="numeric"
                placeholder="–"
                :aria-label="`Durée de ${label(row)} en minutes`"
                class="w-16 rounded-lg border border-navy/15 bg-transparent px-2 py-1 text-center text-navy outline-none focus:border-royal print:hidden dark:border-ice/20 dark:text-ice dark:focus:border-periwinkle"
                @input="noteMinutes(row.id, $event.target.value)"
              />
              <span class="hidden print:inline">{{ row.minutes ?? '–' }}</span>
              min
            </label>
          </div>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'drill', params: { id: row.id } }" class="plan-thumb w-20 shrink-0 overflow-hidden rounded-xl sm:w-32">
            <DrillImage :src="row.drill.image" :alt="row.drill.title" />
          </RouterLink>
          <div class="plan-text flex min-w-0 flex-1 flex-col gap-2">
            <RouterLink :to="{ name: 'drill', params: { id: row.id } }" class="leading-snug font-semibold text-navy hover:underline dark:text-white">{{ row.drill.title }}</RouterLink>
            <label class="flex items-center gap-2 text-sm text-navy/60 dark:text-ice/60">
              <input
                :value="row.minutes ?? ''"
                type="number"
                min="0"
                inputmode="numeric"
                placeholder="–"
                :aria-label="`Durée de ${row.drill.title} en minutes`"
                class="w-16 rounded-lg border border-navy/15 bg-transparent px-2 py-1 text-center text-navy outline-none focus:border-royal print:hidden dark:border-ice/20 dark:text-ice dark:focus:border-periwinkle"
                @input="onMinutes(index, $event.target.value)"
              />
              <span class="hidden print:inline">{{ row.minutes ?? '–' }}</span>
              min
            </label>
          </div>
        </template>
        <div class="-mb-1 flex w-full shrink-0 items-center justify-end gap-1 border-t border-navy/10 pt-1 sm:mb-0 sm:w-auto sm:border-0 sm:pt-0 print:hidden dark:border-ice/10">
          <button type="button" :disabled="index === 0" aria-label="Monter" class="grid size-9 place-items-center rounded-full text-navy/60 transition-colors duration-200 hover:bg-navy/5 disabled:opacity-25 dark:text-ice/60 dark:hover:bg-ice/10" @click="move(index, -1)">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6" /></svg>
          </button>
          <button type="button" :disabled="index === rows.length - 1" aria-label="Descendre" class="grid size-9 place-items-center rounded-full text-navy/60 transition-colors duration-200 hover:bg-navy/5 disabled:opacity-25 dark:text-ice/60 dark:hover:bg-ice/10" @click="move(index, 1)">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <button type="button" :aria-label="`Retirer ${label(row)}`" class="grid size-9 place-items-center rounded-full text-navy/40 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500 dark:text-ice/40" @click="remove(row.id)">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </li>
    </TransitionGroup>

    <div v-else class="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-navy/15 px-6 py-16 text-center dark:border-ice/15">
      <p class="text-lg text-navy/70 dark:text-ice/70">Ton plan est vide.</p>
      <RouterLink :to="{ name: 'catalogue' }" class="rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white dark:bg-accent dark:text-on-accent">Choisir des exercices</RouterLink>
    </div>

    <div class="mt-3 flex gap-2 print:hidden">
      <button type="button" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 px-4 py-3 text-sm font-semibold text-navy/70 transition-colors duration-200 hover:border-royal hover:text-royal dark:border-ice/20 dark:text-ice/70 dark:hover:border-periwinkle dark:hover:text-periwinkle" @click="newNote">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        Ajouter un bloc commentaire
      </button>
      <RouterLink v-if="rows.length" :to="{ name: 'catalogue' }" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 px-4 py-3 text-sm font-semibold text-navy/70 transition-colors duration-200 hover:border-royal hover:text-royal dark:border-ice/20 dark:text-ice/70 dark:hover:border-periwinkle dark:hover:text-periwinkle">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        Ajouter des exercices
      </RouterLink>
    </div>

    <Transition name="page">
      <div v-if="toast" role="status" class="print:hidden fixed inset-x-0 bottom-24 z-40 mx-auto w-fit rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white shadow-xl ring-1 ring-ice/20 md:bottom-8 dark:bg-ice dark:text-navy">{{ toast }}</div>
    </Transition>
  </div>
</template>
