<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl flex flex-col overflow-hidden">
      <header class="px-5 py-3 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700">
        <h2 class="font-semibold text-sm tracking-wide flex items-center gap-2">
          <slot name="icon" />
          <span>{{ title }}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" v-if="prototype">Prototype Demo</span>
        </h2>
        <span class="ml-auto text-xs text-neutral-500" v-if="loading">Loading…</span>
        <button @click="emit('close')" class="ml-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-sm">✕</button>
      </header>
      <div class="grow overflow-auto p-5 bg-neutral-50/60 dark:bg-neutral-950/40">
        <component :is="component" v-if="component" />
        <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-else class="text-sm text-neutral-500">Initializing…</p>
      </div>
      <footer class="px-5 py-2 border-t border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-500 flex items-center justify-between">
        <span>Lightweight simulation for interview preview – not production.</span>
        <button @click="emit('close')" class="underline">Close</button>
      </footer>
    </div>
  </div>
</template>
<script setup lang="ts">
import { shallowRef, watch, ref } from 'vue'
const props = defineProps<{ open: boolean; loader: () => Promise<any>; title: string; prototype?: boolean }>()
const emit = defineEmits<{ (e:'close'): void }>()
const component = shallowRef<any>()
const loading = ref(false)
const error = ref('')
watch(() => props.open, async (val) => {
  if (val) {
    error.value = ''
    if (!component.value) {
      loading.value = true
      try {
        const mod = await props.loader()
        component.value = mod.default
      } catch (e: any) {
        error.value = e?.message || 'Failed to load demo'
      } finally {
        loading.value = false
      }
    }
  }
})
</script>
