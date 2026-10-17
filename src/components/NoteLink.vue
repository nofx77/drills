<script setup>
import { computed } from 'vue'
import { safeUrl, youtubeEmbed } from '../lib/links.js'

const props = defineProps({ url: { type: String, default: '' } })

const href = computed(() => safeUrl(props.url))
const isVideo = computed(() => Boolean(youtubeEmbed(props.url)))
const host = computed(() => (href.value ? new URL(href.value).hostname.replace(/^www\./, '') : ''))
</script>

<template>
  <div v-if="href" class="flex flex-col gap-1">
    <a :href="href" target="_blank" rel="noopener noreferrer" class="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-royal underline-offset-4 hover:underline print:hidden dark:text-periwinkle">
      <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
      {{ isVideo ? 'Ouvrir sur YouTube' : host }}
    </a>
    <span class="hidden text-sm break-all print:inline">{{ href }}</span>
  </div>
</template>
