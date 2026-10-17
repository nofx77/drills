<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { isAdmin } from '../lib/auth.js'

const router = useRouter()
const { user, signOut } = useAuth()
const open = ref(false)
const root = ref(null)

const initial = computed(() => user.value?.email?.charAt(0).toUpperCase() ?? '')

function go(name) {
  open.value = false
  router.push({ name })
}

async function logout() {
  open.value = false
  await signOut()
  router.push({ name: 'catalogue' })
}

function onDocument(e) {
  if (e.type === 'keydown' ? e.key === 'Escape' : !root.value?.contains(e.target)) open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocument)
  document.addEventListener('keydown', onDocument)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocument)
  document.removeEventListener('keydown', onDocument)
})

const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-navy transition-colors duration-200 hover:bg-navy/5 dark:text-ice dark:hover:bg-ice/10'
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="grid size-9 place-items-center rounded-full transition-colors duration-200 sm:size-10"
      :class="user ? '' : 'text-navy/60 hover:bg-navy/5 hover:text-navy dark:text-ice/60 dark:hover:bg-ice/10 dark:hover:text-ice'"
      :aria-label="user ? `Compte : ${user.email}` : 'Compte'"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <span v-if="user" class="grid size-7 place-items-center rounded-full bg-royal text-sm font-bold text-white sm:size-8 dark:bg-accent dark:text-on-accent">{{ initial }}</span>
      <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
    </button>

    <Transition name="page">
      <div v-if="open" role="menu" class="absolute right-0 bottom-full z-40 mb-2 w-64 rounded-2xl border border-navy/10 bg-white p-2 shadow-2xl md:top-full md:bottom-auto md:mt-2 md:mb-0 dark:border-ice/15 dark:bg-navy">
          <p class="truncate px-3 pt-2 pb-3 text-sm text-navy/60 dark:text-ice/60">{{ user.email }}</p>
          <button type="button" role="menuitem" :class="item" @click="go('account')">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            Mot de passe
          </button>
          <button v-if="isAdmin(user)" type="button" role="menuitem" :class="item" @click="go('admin')">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6Z" /></svg>
            Admin
          </button>
          <button type="button" role="menuitem" :class="item" @click="logout">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Se déconnecter
          </button>
      </div>
    </Transition>
  </div>
</template>
