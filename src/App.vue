<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import AppNav from './components/AppNav.vue'
import { useAuth } from './composables/useAuth.js'
import { startPlanSync } from './composables/usePlanSync.js'
import { startFavoritesSync } from './composables/useFavoritesSync.js'
import { startCurrentPlanSync } from './composables/useCurrentPlanSync.js'
import LoginPanel from './components/LoginPanel.vue'

const router = useRouter()
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

  <main v-else-if="!user" class="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
    <p class="text-4xl font-bold tracking-tight"><span class="text-navy dark:text-white">Drill</span> <span class="text-royal dark:text-periwinkle">Hub</span></p>
    <LoginPanel class="w-full" />
  </main>

  <template v-else>
    <AppNav />
    <main class="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 md:pb-12">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.name === 'drill' ? route.fullPath : route.name" />
        </Transition>
      </RouterView>
    </main>
  </template>
</template>
