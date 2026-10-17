import { ref } from 'vue'
import { storage } from '../lib/storage.js'

const THEMES = ['dark', 'light', 'habs']

const stored = storage.get('theme', 'dark')
const theme = ref(THEMES.includes(stored) ? stored : 'dark')

function setTheme(name) {
  theme.value = name
  document.documentElement.classList.toggle('dark', name !== 'light')
  document.documentElement.classList.toggle('habs', name === 'habs')
  storage.set('theme', name)
}

export function useTheme() {
  const toggleLight = () => setTheme(theme.value === 'light' ? 'dark' : 'light')
  const toggleHabs = () => setTheme(theme.value === 'habs' ? 'dark' : 'habs')

  return { theme, toggleLight, toggleHabs }
}
