<script setup>
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import PasswordForm from '../components/PasswordForm.vue'

const route = useRoute()
const { user, signOut } = useAuth()
</script>

<template>
  <div class="mx-auto max-w-md">
    <h1 class="mb-6 text-3xl font-bold tracking-tight text-navy sm:text-4xl dark:text-white">Compte</h1>
    <section v-if="user" class="flex flex-col gap-6 rounded-3xl border border-navy/10 p-6 sm:p-8 dark:border-ice/10 dark:bg-ice/5">
      <p v-if="route.query.bienvenue" class="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">Bienvenue ! Choisis ton mot de passe pour te connecter facilement la prochaine fois.</p>
      <div>
        <p class="text-sm text-navy/60 dark:text-ice/60">Connecté en tant que</p>
        <p class="truncate text-lg font-semibold text-navy dark:text-white">{{ user.email }}</p>
      </div>
      <PasswordForm />
      <button type="button" class="rounded-2xl border border-navy/15 px-5 py-3 font-semibold text-navy/70 transition-colors duration-200 hover:border-navy/40 hover:text-navy dark:border-ice/20 dark:text-ice/70 dark:hover:border-ice/50 dark:hover:text-ice" @click="signOut">Se déconnecter</button>
    </section>
  </div>
</template>
