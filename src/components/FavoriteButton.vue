<script setup>
import { computed } from 'vue'
import { useFavorites } from '../composables/useFavorites.js'

const props = defineProps({ id: { type: String, required: true } })

const { isFavorite, toggle } = useFavorites()
const active = computed(() => isFavorite(props.id))
</script>

<template>
  <button
    type="button"
    :aria-pressed="active"
    :aria-label="active ? 'Retirer des favoris' : 'Ajouter aux favoris'"
    class="grid size-10 place-items-center rounded-full transition-colors duration-200 hover:bg-royal/10 dark:hover:bg-ice/10"
    :class="active ? 'text-periwinkle' : 'text-navy/40 dark:text-ice/50'"
    @click.stop.prevent="toggle(id)"
  >
    <svg
      class="size-5 transition-transform duration-200"
      :class="active ? 'scale-110' : 'scale-100'"
      viewBox="0 0 24 24"
      :fill="active ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z" />
    </svg>
  </button>
</template>
