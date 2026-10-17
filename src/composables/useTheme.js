import { ref } from 'vue'
import { storage } from '../lib/storage.js'

export const THEMES = ['dark', 'light', 'habs']
export const THEME_LABELS = { dark: 'Sombre', light: 'Clair', habs: 'Canadiens' }

const stored = storage.get('theme', 'dark')
const theme = ref(THEMES.includes(stored) ? stored : 'dark')

export function applyTheme(name) {
  const root = document.documentElement
  root.classList.toggle('dark', name !== 'light')
  root.classList.toggle('habs', name === 'habs')
}

export function useTheme() {
  function cycle() {
    theme.value = THEMES[(THEMES.indexOf(theme.value) + 1) % THEMES.length]
    applyTheme(theme.value)
    storage.set('theme', theme.value)
  }

  return { theme, cycle }
}
