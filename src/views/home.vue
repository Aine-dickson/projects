<template>
    <BaseLayout>
        <div class="space-y-10">
            <section class="space-y-6">
                <div class="space-y-4 max-w-2xl">
                    <h1 class="text-4xl font-bold tracking-tight">Project Showcase</h1>
                    <p class="text-neutral-600 dark:text-neutral-300 leading-relaxed">Curated selection of projects demonstrating architecture design, performance focus, DX improvements, and product impact. Filter and explore details below.</p>
                </div>
                        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <TagFilter v-model="activeTag" />
                            <label class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 select-none cursor-pointer self-start md:self-auto">
                                <input type="checkbox" v-model="hidePrototypes" class="accent-neutral-900" /> Hide prototypes
                            </label>
                        </div>
            </section>
            <section>
                <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <ProjectCard v-for="p in filtered" :key="p.id" :project="p" />
                </div>
                <p v-if="filtered.length===0" class="text-sm text-neutral-500 mt-8">No projects match this tag yet.</p>
            </section>
        </div>
    </BaseLayout>
</template>
<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { listProjects } from '@/data/projects'
import ProjectCard from '@/components/ProjectCard.vue'
import TagFilter from '@/components/TagFilter.vue'
const activeTag = ref<string | undefined>()
// Show prototypes by default; user can hide them.
const hidePrototypes = ref(false)
const projects = computed(() => hidePrototypes.value
    ? listProjects({ includePrototypes: false })
    : listProjects({ includePrototypes: true }))
const filtered = computed(() => {
    const list = projects.value
    return activeTag.value ? list.filter(p => p.tags?.some(t => t.label === activeTag.value)) : list
})
watchEffect(() => { document.title = 'Projects · Portfolio' })
</script>
