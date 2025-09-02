<template>
  <div class="flex flex-wrap gap-2">
    <button
      class="px-3 py-1 rounded-full text-xs font-medium border"
      :class="!activeTag ? activeClasses : inactiveClasses"
      @click="$emit('update:modelValue', undefined)"
    >All</button>
    <button
      v-for="t in tags"
      :key="t.label"
      class="px-3 py-1 rounded-full text-xs font-medium border"
      :class="t.label===activeTag ? activeClasses : inactiveClasses"
      @click="$emit('update:modelValue', t.label)"
    >{{ t.label }}</button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { listTags } from '@/data/projects'
const tags = listTags()
const props = defineProps<{ modelValue?: string }>()
defineEmits<{ (e:'update:modelValue', value: string | undefined): void }>()
const activeTag = computed(() => props.modelValue)
const activeClasses = 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
const inactiveClasses = 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
</script>
