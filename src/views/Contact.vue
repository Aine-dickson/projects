<template>
  <BaseLayout>
    <div class="space-y-6 max-w-md">
      <h1 class="text-3xl font-semibold">Contact</h1>
      <p class="text-neutral-600 dark:text-neutral-300 text-sm">Feel free to reach out through any of the channels below.</p>
      <ul class="space-y-3 text-sm">
        <li><span class="font-medium">Email:</span> <a href="mailto:you@example.com" class="underline">you@example.com</a></li>
        <li><span class="font-medium">GitHub:</span> <a href="https://github.com/your-handle" target="_blank" rel="noopener" class="underline">@your-handle</a></li>
        <li><span class="font-medium">LinkedIn:</span> <a href="https://linkedin.com/in/your-handle" target="_blank" rel="noopener" class="underline">/in/your-handle</a></li>
      </ul>
    </div>
  </BaseLayout>
</template>
<script setup lang="ts">
import BaseLayout from '@/layouts/BaseLayout.vue'
</script>
