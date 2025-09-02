<template>
  <div class="space-y-4 text-sm">
    <p class="text-xs text-neutral-600 dark:text-neutral-400">Enter an image URL to simulate edge optimization (format negotiation + resizing).</p>
    <form @submit.prevent="optimize" class="flex gap-2">
      <input v-model="url" placeholder="https://example.com/image.png" class="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs" />
      <button class="px-3 py-2 text-xs rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Preview</button>
    </form>
    <div v-if="result" class="grid md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <h3 class="font-semibold text-xs uppercase tracking-wide">Original (simulated)</h3>
        <div class="aspect-video rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px]">{{ basename }}</div>
      </div>
      <div class="space-y-2">
        <h3 class="font-semibold text-xs uppercase tracking-wide">Optimized</h3>
        <div class="aspect-video rounded border border-dashed border-emerald-400/50 flex flex-col items-center justify-center text-[10px] gap-1">
          <span>{{ targetFormat }}</span>
          <span>{{ targetWidth }}w</span>
          <span class="text-emerald-600">~{{ savings }}% smaller</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePersistedRef } from '@/composables/persistedState'
const url = usePersistedRef<string>({ key: 'demo:media:url', defaultValue: '' })
const result = usePersistedRef<boolean>({ key: 'demo:media:result', defaultValue: false })
const targetFormat = computed(()=> url.value.endsWith('.png') ? 'webp' : 'avif')
const targetWidth =  computed(()=> 800)
const savings = computed(()=> 45 + Math.round(Math.random()*15))
const basename = computed(()=> url.value.split('/').pop() || 'image.png')
function optimize(){ if(url.value) result.value = true }
</script>
