<template>
  <div class="min-h-screen flex flex-col font-sans text-neutral-900 dark:text-neutral-100 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-2 rounded-md text-xs">Skip to content</a>
    <header class="sticky top-0 z-40 backdrop-blur border-b border-neutral-200/70 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-900/60">
      <nav class="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
        <RouterLink to="/" class="font-bold tracking-wide">Portfolio</RouterLink>
        <div class="flex gap-4 text-sm">
          <RouterLink to="/" class="hover:underline">Projects</RouterLink>
          <RouterLink to="/about" class="hover:underline">About</RouterLink>
          <RouterLink to="/contact" class="hover:underline">Contact</RouterLink>
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
      <p>© {{ new Date().getFullYear() }} Your Name. Built with Vue 3 + Vite.</p>
    </footer>
  </div>
</template>
<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>
