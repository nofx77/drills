<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNav from './components/AppNav.vue'
import { useAuth } from './composables/useAuth.js'
import { startPlanSync } from './composables/usePlanSync.js'
import { startFavoritesSync } from './composables/useFavoritesSync.js'
import { startCurrentPlanSync } from './composables/useCurrentPlanSync.js'
import LoginPanel from './components/LoginPanel.vue'

const router = useRouter()
const route = useRoute()
const { user, ready, cameFromEmail } = useAuth()
startPlanSync()
startFavoritesSync()
startCurrentPlanSync()

if (cameFromEmail) {
  const stop = watch(user, (u) => {
    if (!u) return
    router.replace({ name: 'plans' })
    stop()
  })
}
</script>

<template>
  <div v-if="!ready" class="grid min-h-dvh place-items-center text-navy/60 dark:text-ice/60">Chargement…</div>

  <main v-else-if="!user && !route.meta.public" class="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
    <p class="text-4xl font-bold tracking-tight"><span class="text-navy dark:text-white">Drill</span> <span class="text-royal dark:text-periwinkle">Hub</span></p>
    <LoginPanel class="w-full" />
  </main>

  <template v-else>
    <AppNav v-if="user" />
    <header v-else class="mx-auto flex max-w-3xl items-center justify-between px-4 pt-6 sm:px-6">
      <p class="text-xl font-bold tracking-tight"><span class="text-navy dark:text-white">Drill</span> <span class="text-royal dark:text-periwinkle">Hub</span></p>
      <RouterLink :to="{ name: 'account' }" class="rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:border-navy/40 dark:border-ice/20 dark:hover:border-ice/50">Se connecter</RouterLink>
    </header>
    <main class="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 md:pb-12">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.name === 'drill' ? route.fullPath : route.name" />
        </Transition>
      </RouterView>
    </main>
  </template>
</template>
