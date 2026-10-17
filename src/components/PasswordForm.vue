<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { authErrorMessage } from '../lib/auth.js'

const { user, setPassword } = useAuth()

const open = ref(false)
const password = ref('')
const busy = ref(false)
const message = ref('')
const failed = ref(false)

async function submit() {
  busy.value = true
  message.value = ''
  try {
    await setPassword(password.value)
    failed.value = false
    message.value = 'Mot de passe enregistré.'
    password.value = ''
    open.value = false
  } catch (e) {
    failed.value = true
    message.value = authErrorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="text-sm">
    <button v-if="!open" type="button" class="rounded-full border border-navy/15 px-3 py-1.5 font-medium text-navy/60 transition-colors duration-200 hover:border-navy/40 hover:text-navy dark:border-ice/20 dark:text-ice/60 dark:hover:border-ice/50 dark:hover:text-ice" @click="open = true">
      Mot de passe
    </button>
    <form v-else class="flex flex-wrap items-center gap-2" @submit.prevent="submit">
      <input :value="user?.email" type="email" name="email" autocomplete="username" readonly hidden />
      <input
        v-model="password"
        type="password"
        name="new-password"
        required
        minlength="6"
        autocomplete="new-password"
        placeholder="Nouveau mot de passe"
        aria-label="Nouveau mot de passe"
        class="w-48 rounded-full border border-navy/15 bg-transparent px-3 py-1.5 outline-none focus:border-royal dark:border-ice/20 dark:focus:border-periwinkle"
      />
      <button type="submit" :disabled="busy" class="rounded-full bg-royal px-3 py-1.5 font-semibold text-white disabled:opacity-60 dark:bg-accent dark:text-on-accent">Enregistrer</button>
      <button type="button" class="px-2 py-1.5 text-navy/50 dark:text-ice/50" @click="open = false">Annuler</button>
    </form>
    <p v-if="message" role="status" class="mt-1" :class="failed ? 'text-red-600 dark:text-red-300' : 'text-emerald-600 dark:text-emerald-300'">{{ message }}</p>
  </div>
</template>
