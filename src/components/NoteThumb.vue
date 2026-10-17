<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { youtubeEmbed } from '../lib/links.js'

const props = defineProps({ url: { type: String, default: '' }, title: { type: String, default: '' } })

const video = computed(() => youtubeEmbed(props.url))
const open = ref(false)

function onKey(e) {
  if (e.key === 'Escape') open.value = false
}

watch(open, (value) => (value ? addEventListener('keydown', onKey) : removeEventListener('keydown', onKey)))
onBeforeUnmount(() => removeEventListener('keydown', onKey))
</script>

<template>
  <button
    v-if="video"
    type="button"
    class="plan-thumb group relative aspect-video w-20 shrink-0 overflow-hidden rounded-xl bg-black sm:w-32 print:hidden"
    :aria-label="`Lire la vidéo ${title}`"
    @click="open = true"
  >
    <img :src="`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`" alt="" loading="lazy" class="size-full object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100" />
    <span class="absolute top-1/2 left-1/2 grid h-7 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-habs-red text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
      <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7Z" /></svg>
    </span>
  </button>
  <div v-else class="plan-thumb hidden aspect-2/1 w-20 shrink-0 place-items-center rounded-xl bg-royal/10 text-royal sm:grid sm:w-32 print:hidden dark:bg-ice/10 dark:text-periwinkle" aria-hidden="true">
    <svg class="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /><path d="M8 9h8M8 13h5" /></svg>
  </div>

  <Teleport to="body">
    <Transition name="page">
      <div v-if="open && video" class="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" :aria-label="title || 'Vidéo'" @click.self="open = false">
        <div class="relative w-full max-w-4xl">
          <button type="button" class="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20" aria-label="Fermer la vidéo" @click="open = false">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <div class="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
            <iframe
              :src="`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&start=${video.start}`"
              :title="title || 'Vidéo YouTube'"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
              class="size-full"
            ></iframe>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
