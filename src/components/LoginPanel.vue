<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { authErrorMessage } from '../lib/auth.js'

const { signIn, signInWithPassword, signUp } = useAuth()

const mode = ref('login')
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const info = ref('')

const titles = { login: 'Connexion', signup: 'Créer un compte', link: 'Recevoir un lien par courriel' }
const buttons = { login: 'Se connecter', signup: 'Créer mon compte', link: 'Recevoir le lien' }
const needsPassword = computed(() => mode.value !== 'link')

function switchTo(next) {
  mode.value = next
  error.value = ''
  info.value = ''
}

async function submit() {
  busy.value = true
  error.value = ''
  info.value = ''
  const address = email.value.trim()
  try {
    if (mode.value === 'login') await signInWithPassword(address, password.value)
    if (mode.value === 'link') {
      await signIn(address)
      info.value = `Un lien de connexion a été envoyé à ${address}. Ouvre-le sur cet appareil.`
    }
    if (mode.value === 'signup') {
      const { needsConfirmation } = await signUp(address, password.value)
      if (needsConfirmation) info.value = `Presque fini : confirme ton adresse avec le lien envoyé à ${address}, puis connecte-toi.`
    }
  } catch (e) {
    error.value = authErrorMessage(e)
  } finally {
    busy.value = false
  }
}

const input =
  'w-full rounded-2xl border border-navy/10 bg-navy/[0.03] px-4 py-3 text-base outline-none transition-colors duration-200 placeholder:text-navy/40 focus:border-royal focus:ring-4 focus:ring-royal/15 dark:border-ice/10 dark:bg-ice/5 dark:placeholder:text-ice/40 dark:focus:border-periwinkle dark:focus:ring-periwinkle/20'
</script>

<template>
  <section class="mx-auto max-w-md rounded-3xl border border-navy/10 p-6 sm:p-8 dark:border-ice/10 dark:bg-ice/5">
    <h2 class="mb-1 text-xl font-semibold text-navy dark:text-white">{{ titles[mode] }}</h2>
    <p class="mb-6 text-sm text-navy/70 dark:text-ice/70">Connecte-toi pour accéder aux exercices et à tes plans.</p>

    <form class="flex flex-col gap-3" @submit.prevent="submit">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-navy/80 dark:text-ice/80">Courriel</span>
        <input v-model="email" type="email" name="email" required autocomplete="username" inputmode="email" placeholder="toi@exemple.com" :class="input" />
      </label>
      <label v-if="needsPassword" class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-navy/80 dark:text-ice/80">Mot de passe</span>
        <input
          v-model="password"
          type="password"
          name="password"
          required
          minlength="6"
          :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
          placeholder="••••••••"
          :class="input"
        />
      </label>

      <p v-if="error" role="alert" class="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
      <p v-if="info" role="status" class="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{{ info }}</p>

      <button type="submit" :disabled="busy" class="mt-1 rounded-2xl bg-royal px-5 py-3 font-semibold text-white transition-colors duration-200 hover:bg-royal/85 disabled:opacity-60 dark:bg-accent dark:text-on-accent dark:hover:bg-accent/85">
        {{ busy ? '…' : buttons[mode] }}
      </button>
    </form>

    <div class="mt-5 flex flex-col items-center gap-2 text-sm">
      <button v-if="mode !== 'login'" type="button" class="text-royal underline-offset-4 hover:underline dark:text-periwinkle" @click="switchTo('login')">J’ai déjà un mot de passe</button>
      <button v-if="mode !== 'signup'" type="button" class="text-royal underline-offset-4 hover:underline dark:text-periwinkle" @click="switchTo('signup')">Créer un compte</button>
      <button v-if="mode !== 'link'" type="button" class="text-navy/60 underline-offset-4 hover:underline dark:text-ice/60" @click="switchTo('link')">Mot de passe oublié ? Recevoir un lien par courriel</button>
    </div>
  </section>
</template>
