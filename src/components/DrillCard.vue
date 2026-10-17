<script setup>
import { usePlan } from '../composables/usePlan.js'
import DrillImage from './DrillImage.vue'
import FavoriteButton from './FavoriteButton.vue'

defineProps({ drill: { type: Object, required: true } })

const { has, add } = usePlan()
</script>

<template>
  <RouterLink
    :to="{ name: 'drill', params: { id: drill.id } }"
    class="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-royal/20 active:translate-y-0 dark:border-ice/10 dark:bg-ice/5 dark:hover:border-ice/20"
  >
    <DrillImage :src="drill.image" :alt="drill.title" />
    <div class="flex flex-1 flex-col gap-3 p-4">
      <h2 class="leading-snug font-semibold text-navy dark:text-white">{{ drill.title }}</h2>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="c in drill.categories" :key="c" class="rounded-full bg-royal/10 px-2.5 py-0.5 text-xs font-medium text-royal dark:bg-ice/10 dark:text-ice">{{ c }}</span>
      </div>
      <div class="mt-auto flex items-center justify-between pt-1">
        <button
          type="button"
          :disabled="has(drill.id)"
          class="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200"
          :class="has(drill.id) ? 'text-navy/50 dark:text-ice/50' : 'bg-royal text-white hover:bg-royal/85 dark:bg-periwinkle dark:text-navy dark:hover:bg-ice'"
          @click.stop.prevent="add(drill.id)"
        >
          {{ has(drill.id) ? '✓ Dans le plan' : '+ Plan' }}
        </button>
        <FavoriteButton :id="drill.id" />
      </div>
    </div>
  </RouterLink>
</template>
