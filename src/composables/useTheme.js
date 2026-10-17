import { ref } from 'vue'
import { storage } from '../lib/storage.js'

const isDark = ref(document.documentElement.classList.contains('dark'))

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    storage.set('theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, toggle }
}
