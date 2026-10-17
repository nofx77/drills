<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import AppNav from './components/AppNav.vue'
import { useAuth } from './composables/useAuth.js'
import { startPlanSync } from './composables/usePlanSync.js'
import { startFavoritesSync } from './composables/useFavoritesSync.js'

const router = useRouter()
const { user, cameFromEmail } = useAuth()
startPlanSync()
startFavoritesSync()

if (cameFromEmail) {
  const stop = watch(user, (u) => {
    if (!u) return
    router.replace({ name: 'plans' })
    stop()
  })
}
</script>

<template>
  <AppNav />
  <main class="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 md:pb-12">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.name === 'drill' ? route.fullPath : route.name" />
      </Transition>
    </RouterView>
  </main>
</template>
