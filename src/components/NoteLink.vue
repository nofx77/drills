<script setup>
import { ref, computed, watch } from 'vue'
import { safeUrl, youtubeEmbed } from '../lib/links.js'

const props = defineProps({ url: { type: String, default: '' } })

const href = computed(() => safeUrl(props.url))
const video = computed(() => youtubeEmbed(props.url))
const host = computed(() => (href.value ? new URL(href.value).hostname.replace(/^www\./, '') : ''))
const playing = ref(false)

watch(() => props.url, () => (playing.value = false))
</script>

<template>
  <div v-if="href" class="flex flex-col gap-1">
    <template v-if="video">
      <div class="relative aspect-video w-full max-w-md overflow-hidden rounded-xl bg-black print:hidden">
        <iframe
          v-if="playing"
          :src="`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&start=${video.start}`"
          title="Vidéo YouTube"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
          class="absolute inset-0 size-full"
        ></iframe>
        <button v-else type="button" class="group absolute inset-0 size-full" aria-label="Lire la vidéo" @click="playing = true">
          <img :src="`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`" alt="" loading="lazy" class="size-full object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100" />
          <span class="absolute top-1/2 left-1/2 grid h-12 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-habs-red text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
            <svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7Z" /></svg>
          </span>
        </button>
      </div>
    </template>
    <a :href="href" target="_blank" rel="noopener noreferrer" class="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-royal underline-offset-4 hover:underline print:hidden dark:text-periwinkle">
      <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
      {{ video ? 'Ouvrir sur YouTube' : host }}
    </a>
    <span class="hidden text-sm break-all print:inline">{{ href }}</span>
  </div>
</template>
