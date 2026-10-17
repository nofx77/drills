<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../composables/useAuth.js'
import { isAdmin } from '../lib/auth.js'

const { user, ready } = useAuth()
const users = ref([])
const loading = ref(false)
const error = ref('')

const dateFormat = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium', timeStyle: 'short' })
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : 'Jamais')

async function load() {
  loading.value = true
  error.value = ''
  const { data, error: e } = await supabase.rpc('admin_list_users')
  loading.value = false
  if (e) error.value = e.message
  else users.value = data
}

watch(user, (u) => isAdmin(u) && load(), { immediate: true })
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h1 class="text-3xl font-bold tracking-tight text-navy sm:text-4xl dark:text-white">Usagers</h1>
      <button v-if="isAdmin(user)" type="button" class="rounded-full border border-navy/15 px-3 py-1.5 text-sm font-medium text-navy/60 transition-colors duration-200 hover:border-navy/40 hover:text-navy dark:border-ice/20 dark:text-ice/60 dark:hover:border-ice/50 dark:hover:text-ice" @click="load">Rafraîchir</button>
    </header>

    <p v-if="!ready" class="text-navy/60 dark:text-ice/60">Chargement…</p>
    <p v-else-if="!isAdmin(user)" class="text-navy/70 dark:text-ice/70">Cette page est réservée à l’administrateur.</p>

    <template v-else>
      <p v-if="error" role="alert" class="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
      <p v-if="loading && !users.length" class="text-navy/60 dark:text-ice/60">Chargement…</p>
      <template v-else-if="users.length">
        <p class="mb-3 text-sm text-navy/60 dark:text-ice/60">{{ users.length }} usager{{ users.length > 1 ? 's' : '' }}</p>
        <ul class="flex flex-col gap-2">
          <li v-for="u in users" :key="u.id" class="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl border border-navy/10 bg-white px-4 py-3 dark:border-ice/10 dark:bg-ice/5">
            <span class="min-w-0 flex-1 truncate font-semibold text-navy dark:text-white">{{ u.email }}</span>
            <span class="text-sm text-navy/60 dark:text-ice/60">Dernière connexion : <strong class="font-medium text-navy dark:text-ice">{{ formatDate(u.last_sign_in_at) }}</strong></span>
            <span class="text-sm text-navy/60 dark:text-ice/60">Inscrit : {{ formatDate(u.created_at) }}</span>
            <span class="text-sm text-navy/60 dark:text-ice/60">{{ u.plan_count }} plan{{ u.plan_count > 1 ? 's' : '' }}</span>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>
