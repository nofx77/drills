<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useSavedPlans } from '../composables/useSavedPlans.js'
import { usePlan } from '../composables/usePlan.js'
import { fromRow } from '../lib/savedPlans.js'
import { markSynced } from '../composables/usePlanSync.js'
import { useFavoritesSyncState } from '../composables/useFavoritesSync.js'
import { useFavorites } from '../composables/useFavorites.js'
import { authErrorMessage } from '../lib/auth.js'
import LoginPanel from '../components/LoginPanel.vue'
import PasswordForm from '../components/PasswordForm.vue'

const router = useRouter()
const { user, ready, signOut } = useAuth()
const { plans, loading, refresh, remove, rename, duplicate } = useSavedPlans()
const { plan, replace } = usePlan()
const favSync = useFavoritesSyncState()
const { favorites } = useFavorites()

const error = ref('')

const dateFormat = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium', timeStyle: 'short' })

async function guard(action) {
  error.value = ''
  try {
    await action()
  } catch (e) {
    error.value = authErrorMessage(e)
  }
}

watch(user, (u) => u && guard(refresh), { immediate: true })

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
      <div v-if="user" class="flex flex-wrap items-center gap-3 text-sm text-navy/60 dark:text-ice/60">
        <span class="truncate">{{ user.email }}</span>
        <PasswordForm />
        <button type="button" class="rounded-full border border-navy/15 px-3 py-1.5 font-medium transition-colors duration-200 hover:border-navy/40 hover:text-navy dark:border-ice/20 dark:hover:border-ice/50 dark:hover:text-ice" @click="signOut">Se déconnecter</button>
      </div>
    </header>

    <p v-if="user" class="mb-4 text-sm" :class="favSync.status === 'error' ? 'text-red-600 dark:text-red-300' : 'text-navy/60 dark:text-ice/60'">
      <template v-if="favSync.status === 'error'">Favoris non synchronisés — {{ favSync.error }}</template>
      <template v-else-if="favSync.status === 'ok'">{{ favorites.size }} favori{{ favorites.size > 1 ? 's' : '' }} synchronisé{{ favorites.size > 1 ? 's' : '' }}</template>
      <template v-else>Synchronisation des favoris…</template>
    </p>

    <p v-if="error" role="alert" class="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">{{ error }}</p>

    <p v-if="!ready" class="text-navy/60 dark:text-ice/60">Chargement…</p>

    <LoginPanel v-else-if="!user" />

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
