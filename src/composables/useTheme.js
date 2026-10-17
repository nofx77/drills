import { ref } from 'vue'

const isDark = ref(document.documentElement.classList.contains('dark'))

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    try {
      localStorage.setItem('theme', JSON.stringify(isDark.value ? 'dark' : 'light'))
    } catch {}
  }

  return { isDark, toggle }
}
