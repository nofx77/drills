<script setup>
defineProps({ categories: { type: Array, required: true } })

const selected = defineModel({ type: Array, default: () => [] })

function toggle(category) {
  selected.value = selected.value.includes(category)
    ? selected.value.filter((c) => c !== category)
    : [...selected.value, category]
}
</script>

<template>
  <div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
    <button
      v-for="category in categories"
      :key="category"
      type="button"
      :aria-pressed="selected.includes(category)"
      class="shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-200"
      :class="
        selected.includes(category)
          ? 'border-royal bg-royal text-white dark:border-accent dark:bg-accent dark:text-on-accent'
          : 'border-navy/15 text-navy/70 hover:border-royal/50 hover:text-navy dark:border-ice/15 dark:text-ice/70 dark:hover:border-ice/40 dark:hover:text-ice'
      "
      @click="toggle(category)"
    >
      {{ category }}
    </button>
  </div>
</template>
