<template>
  <div class="min-h-screen flex flex-col font-sans text-neutral-900 dark:text-neutral-100 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-2 rounded-md text-xs">Skip to content</a>
    <header class="sticky top-0 z-40 backdrop-blur border-b border-neutral-200/70 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-900/60">
      <nav class="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
        <RouterLink to="/" class="font-bold text-xl tracking-wide select-none">Portfolio</RouterLink>
        <div class="flex gap-6 text-sm">
          <RouterLink to="/" :class="[baseNav, route.path === '/' && activeNav]" :aria-current="route.path === '/' ? 'page' : undefined">Projects</RouterLink>
          <RouterLink to="/about" :class="[baseNav, route.path.startsWith('/about') && activeNav]" :aria-current="route.path.startsWith('/about') ? 'page' : undefined">About</RouterLink>
          <RouterLink to="/contact" :class="[baseNav, route.path.startsWith('/contact') && activeNav]" :aria-current="route.path.startsWith('/contact') ? 'page' : undefined">Contact</RouterLink>
        </div>
        <div class="ml-auto flex items-center gap-3 text-xs text-neutral-500">
          <slot name="header-extra" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
    <main id="main" class="grow mx-auto max-w-5xl w-full px-4 py-10" tabindex="-1">
      <slot />
    </main>
    <footer class="mt-auto py-8 text-center text-xs text-neutral-500">
      <p>© {{ new Date().getFullYear() }} Aine Dixon. Built with Vue 3 + Vite.</p>
    </footer>
  </div>
</template>
<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useRoute } from 'vue-router'

// Base + active nav pill styles (Tailwind utility strings)
const route = useRoute()
const baseNav = 'relative px-1 py-1 font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm transition-colors'
const activeNav = 'text-neutral-900 dark:text-white after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:rounded-full after:bg-gradient-to-r after:from-indigo-500 after:to-fuchsia-500'
</script>
