<script setup>
import AppNav from './components/AppNav.vue'
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
