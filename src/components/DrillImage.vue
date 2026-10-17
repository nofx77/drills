<script setup>
defineProps({
  src: { type: String, default: null },
  alt: { type: String, required: true },
})

const base = import.meta.env.BASE_URL
</script>

<template>
  <img v-if="src" :src="base + src" :alt="alt" loading="lazy" decoding="async" class="aspect-2/1 w-full bg-white object-contain" />
  <div v-else class="grid aspect-2/1 w-full place-items-center bg-linear-to-br from-royal to-navy text-ice/70" role="img" :aria-label="alt">
    <svg class="h-1/2" viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <rect x="2" y="2" width="116" height="56" rx="20" />
      <path d="M60 2v56M30 2v56M90 2v56" />
      <circle cx="60" cy="30" r="9" />
    </svg>
  </div>
</template>
