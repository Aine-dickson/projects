<template>
  <button
    @click="toggle"
    :aria-pressed="isDark ? 'true' : 'false'"
    aria-label="Toggle dark mode"
    class="relative inline-flex items-center justify-center w-9 h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 text-sm"
  >
    <span v-if="isDark" class="flex items-center" aria-hidden>☀️</span>
    <span v-else class="flex items-center" aria-hidden>🌙</span>
  </button>
</template>
<script setup lang="ts">
import { useTheme } from '@/composables/theme'
const { isDark, toggle } = useTheme()
</script>
