<template>
  <article class="group border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex flex-col gap-3 hover:shadow-sm transition bg-white/70 dark:bg-neutral-900 backdrop-blur-sm">
    <div class="flex items-start justify-between gap-3">
      <h3 class="font-semibold text-lg leading-snug">
        <RouterLink :to="to" class="hover:underline decoration-2 underline-offset-4">{{ project.name }}</RouterLink>
      </h3>
      <div class="flex flex-wrap gap-1 shrink-0">
        <span v-if="project.visibility==='prototype'" class="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Prototype</span>
        <span v-for="tag in project.tags" :key="tag.label" :class="tagClass(tag)" class="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide">{{ tag.label }}</span>
      </div>
    </div>
    <p v-if="project.tagline" class="text-sm text-neutral-600 dark:text-neutral-400">{{ project.tagline }}</p>
    <div class="flex flex-wrap gap-2 mt-1">
      <span v-for="s in project.stack.slice(0,6)" :key="s" class="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{{ s }}</span>
      <span v-if="project.stack.length>6" class="text-xs text-neutral-500">+{{ project.stack.length - 6 }}</span>
    </div>
    <footer class="mt-auto pt-2 flex gap-3 flex-wrap">
      <a v-for="l in project.links" :key="l.url" :href="l.url" target="_blank" rel="noopener" class="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1">
        <span>{{ l.label }}</span>
        <span aria-hidden>↗</span>
      </a>
      <RouterLink :to="to" class="text-xs text-neutral-500 hover:text-neutral-700 ml-auto">Details →</RouterLink>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/types/project'

const props = defineProps<{ project: Project }>()
const to = computed(() => ({ name: 'project-detail', params: { slug: props.project.slug } }))

function tagClass(tag: NonNullable<Project['tags']>[number]) {
  if (!tag.color) return 'bg-neutral-200/60 text-neutral-700'
  const [color] = tag.color.split('-')
  return `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/40 dark:text-${color}-300`
}
</script>

<style scoped>
</style>
