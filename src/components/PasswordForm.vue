<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { authErrorMessage } from '../lib/auth.js'

const { user, setPassword } = useAuth()

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
  } catch (e) {
    failed.value = true
    message.value = authErrorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="submit">
    <input :value="user?.email" type="email" name="email" autocomplete="username" readonly hidden />
    <label class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-navy/80 dark:text-ice/80">Nouveau mot de passe</span>
      <input
        v-model="password"
        type="password"
        name="new-password"
        required
        minlength="6"
        autocomplete="new-password"
        placeholder="Au moins 6 caractères"
        class="w-full rounded-2xl border border-navy/10 bg-navy/[0.03] px-4 py-3 text-base outline-none transition-colors duration-200 placeholder:text-navy/40 focus:border-royal focus:ring-4 focus:ring-royal/15 dark:border-ice/10 dark:bg-ice/5 dark:placeholder:text-ice/40 dark:focus:border-periwinkle dark:focus:ring-periwinkle/20"
      />
    </label>
    <p v-if="message" role="status" class="rounded-2xl px-4 py-3 text-sm" :class="failed ? 'bg-red-500/10 text-red-600 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'">{{ message }}</p>
    <button type="submit" :disabled="busy" class="rounded-2xl bg-royal px-5 py-3 font-semibold text-white transition-colors duration-200 hover:bg-royal/85 disabled:opacity-60 dark:bg-accent dark:text-on-accent dark:hover:bg-accent/85">
      {{ busy ? '…' : 'Enregistrer le mot de passe' }}
    </button>
  </form>
</template>
