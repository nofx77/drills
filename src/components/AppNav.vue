<script setup>
import { useTheme } from '../composables/useTheme.js'

const { isDark, toggle } = useTheme()

const links = [
  { to: { name: 'catalogue' }, label: 'Exercices', icon: 'M4 6h16M4 12h16M4 18h10' },
  { to: { name: 'favoris' }, label: 'Favoris', icon: 'M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z' },
  { to: { name: 'plan' }, label: 'Plan', icon: 'M9 5h10M9 12h10M9 19h10M5 5h.01M5 12h.01M5 19h.01' },
]
const planCount = 0
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-navy/10 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b dark:border-ice/10 dark:bg-navy/80 print:hidden">
    <div class="mx-auto flex max-w-7xl items-center px-4 sm:px-6">
      <RouterLink :to="{ name: 'catalogue' }" class="mr-8 hidden items-center gap-2 py-4 text-lg font-semibold tracking-tight md:flex">
        <span class="grid size-8 place-items-center rounded-xl bg-royal text-sm text-white">🏒</span>
        Exercices de hockey
      </RouterLink>
      <div class="flex flex-1 justify-around md:flex-none md:gap-1">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          exact-active-class="!text-royal dark:!text-periwinkle md:bg-royal/10 dark:md:bg-periwinkle/15"
          class="relative flex flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-medium text-navy/60 transition-colors duration-200 hover:text-navy md:flex-row md:gap-2 md:text-sm dark:text-ice/60 dark:hover:text-ice"
        >
          <svg class="size-6 md:size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="link.icon" /></svg>
          {{ link.label }}
          <span v-if="link.label === 'Plan' && planCount" class="absolute top-1 right-2 grid min-w-5 place-items-center rounded-full bg-royal px-1 text-[10px] font-semibold text-white md:static">{{ planCount }}</span>
        </RouterLink>
      </div>
      <button
        type="button"
        class="ml-2 grid size-10 place-items-center rounded-xl text-navy/60 transition-colors duration-200 hover:bg-navy/5 hover:text-navy md:ml-auto dark:text-ice/60 dark:hover:bg-ice/10 dark:hover:text-ice"
        :aria-label="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
        @click="toggle"
      >
        <svg v-if="isDark" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      </button>
    </div>
  </nav>
</template>
