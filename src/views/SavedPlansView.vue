<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useSavedPlans } from '../composables/useSavedPlans.js'
import { usePlan } from '../composables/usePlan.js'
import { fromRow } from '../lib/savedPlans.js'
import { markSynced } from '../composables/usePlanSync.js'

const router = useRouter()
const { user, ready, signIn, signOut } = useAuth()
const { plans, loading, refresh, remove, rename, duplicate } = useSavedPlans()
const { plan, replace } = usePlan()

const email = ref('')
const sent = ref(false)
const sending = ref(false)
const error = ref('')

const dateFormat = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium', timeStyle: 'short' })

async function guard(action) {
  error.value = ''
  try {
    await action()
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue.'
  }
}

watch(user, (u) => u && guard(refresh), { immediate: true })

function sendLink() {
  sending.value = true
  guard(async () => {
    await signIn(email.value.trim())
    sent.value = true
  }).finally(() => (sending.value = false))
}

function open(row) {
  const unsaved = plan.value.items.length && plan.value.savedId !== row.id
  if (unsaved && !confirm('Remplacer ton plan en cours par celui-ci ?')) return
  const opened = fromRow(row)
  markSynced(opened)
  replace(opened)
  router.push({ name: 'plan' })
}

function askRename(row) {
  const title = prompt('Nouveau titre :', row.title)
  if (title !== null) guard(() => rename(row.id, title.trim()))
}

function askRemove(row) {
  if (confirm(`Supprimer « ${row.title || 'Plan sans titre'} » ?`)) guard(() => remove(row.id))
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h1 class="text-3xl font-bold tracking-tight text-navy sm:text-4xl dark:text-white">Mes plans</h1>
      <div v-if="user" class="flex items-center gap-3 text-sm text-navy/60 dark:text-ice/60">
        <span class="truncate">{{ user.email }}</span>
        <button type="button" class="rounded-full border border-navy/15 px-3 py-1.5 font-medium transition-colors duration-200 hover:border-navy/40 hover:text-navy dark:border-ice/20 dark:hover:border-ice/50 dark:hover:text-ice" @click="signOut">Se déconnecter</button>
      </div>
    </header>

    <p v-if="error" role="alert" class="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">{{ error }}</p>

    <p v-if="!ready" class="text-navy/60 dark:text-ice/60">Chargement…</p>

    <section v-else-if="!user" class="rounded-3xl border border-navy/10 p-6 sm:p-8 dark:border-ice/10 dark:bg-ice/5">
      <template v-if="!sent">
        <h2 class="mb-2 text-xl font-semibold text-navy dark:text-white">Connexion</h2>
        <p class="mb-6 text-navy/70 dark:text-ice/70">Entre ton courriel : tu recevras un lien pour te connecter, sans mot de passe. Tes plans seront gardés sur tous tes appareils.</p>
        <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="sendLink">
          <label class="flex-1">
            <span class="sr-only">Courriel</span>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="toi@exemple.com"
              class="w-full rounded-2xl border border-navy/10 bg-navy/[0.03] px-4 py-3 text-base outline-none transition-colors duration-200 placeholder:text-navy/40 focus:border-royal focus:ring-4 focus:ring-royal/15 dark:border-ice/10 dark:bg-ice/5 dark:placeholder:text-ice/40 dark:focus:border-periwinkle dark:focus:ring-periwinkle/20"
            />
          </label>
          <button type="submit" :disabled="sending" class="rounded-2xl bg-royal px-5 py-3 font-semibold text-white transition-colors duration-200 hover:bg-royal/85 disabled:opacity-60 dark:bg-accent dark:text-on-accent dark:hover:bg-accent/85">
            {{ sending ? 'Envoi…' : 'Recevoir le lien' }}
          </button>
        </form>
      </template>
      <template v-else>
        <h2 class="mb-2 text-xl font-semibold text-navy dark:text-white">Vérifie tes courriels</h2>
        <p class="text-navy/70 dark:text-ice/70">Un lien de connexion a été envoyé à <strong class="text-navy dark:text-white">{{ email }}</strong>. Ouvre-le sur cet appareil.</p>
        <button type="button" class="mt-4 text-sm text-royal underline-offset-4 hover:underline dark:text-periwinkle" @click="sent = false">Utiliser une autre adresse</button>
      </template>
    </section>

    <template v-else>
      <p v-if="loading && !plans.length" class="text-navy/60 dark:text-ice/60">Chargement…</p>

      <TransitionGroup v-else-if="plans.length" tag="ul" name="list" class="relative flex flex-col gap-3">
        <li v-for="row in plans" :key="row.id" class="flex flex-wrap items-center gap-3 rounded-2xl border border-navy/10 bg-white p-4 dark:border-ice/10 dark:bg-ice/5">
          <button type="button" class="min-w-0 flex-1 text-left" @click="open(row)">
            <span class="block truncate font-semibold text-navy dark:text-white">{{ row.title || 'Plan sans titre' }}</span>
            <span class="text-sm text-navy/60 dark:text-ice/60">
              {{ row.items.length }} exercice{{ row.items.length > 1 ? 's' : '' }} · {{ dateFormat.format(new Date(row.updated_at)) }}
            </span>
          </button>
          <div class="flex items-center gap-1 text-sm">
            <button type="button" class="rounded-full bg-royal px-3.5 py-1.5 font-semibold text-white transition-colors duration-200 hover:bg-royal/85 dark:bg-accent dark:text-on-accent dark:hover:bg-accent/85" @click="open(row)">Ouvrir</button>
            <button type="button" class="rounded-full px-3 py-1.5 font-medium text-navy/60 transition-colors duration-200 hover:text-navy dark:text-ice/60 dark:hover:text-ice" @click="guard(() => duplicate(row))">Dupliquer</button>
            <button type="button" class="rounded-full px-3 py-1.5 font-medium text-navy/60 transition-colors duration-200 hover:text-navy dark:text-ice/60 dark:hover:text-ice" @click="askRename(row)">Renommer</button>
            <button type="button" class="rounded-full px-3 py-1.5 font-medium text-navy/40 transition-colors duration-200 hover:text-red-500 dark:text-ice/40" @click="askRemove(row)">Supprimer</button>
          </div>
        </li>
      </TransitionGroup>

      <div v-else class="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-navy/15 px-6 py-16 text-center dark:border-ice/15">
        <p class="text-lg text-navy/70 dark:text-ice/70">Aucun plan enregistré.</p>
        <RouterLink :to="{ name: 'plan' }" class="rounded-full bg-royal px-4 py-2 text-sm font-semibold text-white dark:bg-accent dark:text-on-accent">Aller au plan en cours</RouterLink>
      </div>
    </template>
  </div>
</template>
