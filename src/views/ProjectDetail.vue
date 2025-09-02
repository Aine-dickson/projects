<template>
  <BaseLayout>
    <div v-if="project" class="space-y-10">
      <div class="flex flex-col gap-6 md:flex-row md:items-start">
        <div class="flex-1 space-y-4">
          <RouterLink to="/" class="text-xs text-neutral-500 hover:underline">← Back to projects</RouterLink>
          <h1 class="text-3xl font-semibold leading-tight">{{ project.name }}</h1>
          <p v-if="project.tagline" class="text-lg text-neutral-600 dark:text-neutral-300 max-w-prose">{{ project.tagline }}</p>
          <div v-if="project.visibility==='prototype'" class="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
            <span>Prototype</span>
            <span class="font-normal text-amber-600 dark:text-amber-300/80">(Early stage – scope intentionally limited)</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-for="t in project.tags" :key="t.label" class="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded-full">{{ t.label }}</span>
          </div>
          <div v-if="project.supportsDemo" class="pt-2">
            <RouterLink :to="{ name: 'project-demo', params: { slug: project.slug } }" class="px-4 py-2 inline-block rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-medium">Open Interactive Demo →</RouterLink>
          </div>
        </div>
        <div class="w-full md:w-72 space-y-4 order-first md:order-last">
          <img v-if="project.heroImage" :src="project.heroImage" :alt="project.name" class="rounded-lg border border-neutral-200 dark:border-neutral-800 w-full object-cover" />
          <div class="flex flex-wrap gap-3">
            <a v-for="l in project.links" :key="l.url" :href="l.url" target="_blank" rel="noopener" class="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1">
              <span>{{ l.label }}</span><span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>
      <section class="prose dark:prose-invert max-w-none">
        <p class="leading-relaxed">{{ project.description }}</p>
        <div v-if="project.slug==='telemetry-pipeline'" class="mt-6 space-y-6 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-5 bg-neutral-50 dark:bg-neutral-900/40">
          <div class="space-y-2">
            <h2 class="text-lg font-semibold">Architecture Snapshot</h2>
            <ul class="text-sm list-disc ml-5 space-y-1">
              <li>Edge Function ingestion: validates batch, enriches metrics (delta, status flags), persists raw + minute aggregates.</li>
              <li>Client Pinia store simulates realtime ingestion & maintains rolling series (last 50 samples per metric/device).</li>
              <li>Alert engine: threshold (temp / cpu) + stale device detection with configurable rules.</li>
              <li>Export utilities: recent events & alerts downloadable as CSV for quick offline inspection.</li>
            </ul>
          </div>
          <div class="space-y-2">
            <h3 class="text-base font-semibold">Interactive Demo Features</h3>
            <ul class="text-sm list-disc ml-5 space-y-1">
              <li>Configurable synthetic device simulator (count, interval, batch size, noise).</li>
              <li>Realtime status badges + per-device sparklines (temp & CPU).</li>
              <li>Editable alert thresholds with debounced persisted saves (visual feedback).</li>
              <li>On-demand CSV export (events / alerts) for analysis.</li>
            </ul>
            <p class="text-xs text-neutral-500">Supabase Realtime wiring is scaffolded; local simulation keeps the prototype self-contained.</p>
          </div>
          <TelemetrySummaryInline />
        </div>
        <div v-if="project.highlights?.length" class="mt-6">
          <h2 class="text-lg font-semibold mb-2">Highlights</h2>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="h in project.highlights" :key="h">{{ h }}</li>
          </ul>
        </div>
        <div v-if="project.responsibilities?.length" class="mt-6">
          <h2 class="text-lg font-semibold mb-2">My Responsibilities</h2>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="r in project.responsibilities" :key="r">{{ r }}</li>
          </ul>
        </div>
        <div class="mt-6">
          <h2 class="text-lg font-semibold mb-2">Tech Stack</h2>
          <div class="flex flex-wrap gap-2">
            <span v-for="s in project.stack" :key="s" class="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{{ s }}</span>
          </div>
        </div>
        <div v-if="project.gallery?.length" class="mt-6 grid gap-4 md:grid-cols-2">
            <img v-for="g in project.gallery" :key="g" :src="g" :alt="project.name + ' screenshot'" class="rounded-lg border border-neutral-200 dark:border-neutral-800"/>
        </div>
        <div v-if="project.documents?.length" class="mt-6">
          <h2 class="text-lg font-semibold mb-2">Documents & Artifacts</h2>
          <ul class="space-y-2 text-sm">
            <li v-for="d in project.documents" :key="d.path">
              <a :href="d.path" target="_blank" rel="noopener" class="underline">{{ d.label }}</a>
            </li>
          </ul>
          <p class="text-xs text-neutral-500 mt-2">(Ensure PDFs are placed in <code>public/docs</code> with matching filenames.)</p>
        </div>
      </section>
      
    </div>
    <div v-else class="text-center">
      <p class="text-neutral-500 mb-4">Project not found.</p>
      <RouterLink to="/" class="text-sm underline">Go back</RouterLink>
    </div>
  </BaseLayout>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectBySlug } from '@/data/projects'
import BaseLayout from '@/layouts/BaseLayout.vue'
import TelemetrySummaryInline from '@/components/TelemetrySummaryInline.vue'
const route = useRoute()
const slug = computed(() => route.params.slug as string)
const project = computed(() => getProjectBySlug(slug.value))
watch(project, (p) => { if (p) document.title = `${p!.name} · Portfolio` })
</script>
