import { computed, watchEffect } from 'vue'
import { usePersistedRef } from '@/composables/persistedState'

export type ThemeMode = 'light' | 'dark'

const themeRef = usePersistedRef<ThemeMode>({
  key: 'pref:theme',
  defaultValue: (() => {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    } catch (_) { /* no-op */ }
    return 'light'
  })()
})

export function useTheme() {
  const mode = themeRef
  const isDark = computed(() => mode.value === 'dark')
  function toggle() { mode.value = mode.value === 'dark' ? 'light' : 'dark' }
  function set(value: ThemeMode) { mode.value = value }
  watchEffect(() => {
    const root = document.documentElement
    if (mode.value === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  })
  return { mode, isDark, toggle, set }
}
