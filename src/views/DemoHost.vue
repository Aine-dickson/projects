<template>
  <BaseLayout>
    <div v-if="project" class="space-y-6">
      <nav class="text-[11px] text-neutral-500 flex flex-wrap gap-1">
        <RouterLink to="/" class="hover:underline">Projects</RouterLink>
        <span>/</span>
        <RouterLink :to="{ name: 'project-detail', params: { slug } }" class="hover:underline">{{ project.slug }}</RouterLink>
        <span>/</span>
        <span class="text-neutral-700 dark:text-neutral-300">Demo</span>
      </nav>
      <header class="flex items-start gap-4 flex-wrap">
        <div class="space-y-2">
          <h1 ref="headingEl" class="text-2xl font-semibold flex items-center gap-3">{{ project.name }}<span v-if="project.visibility==='prototype'" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Prototype</span></h1>
          <p class="text-sm text-neutral-600 dark:text-neutral-400 max-w-prose" v-if="project.tagline">{{ project.tagline }}</p>
        </div>
        <div class="ml-auto flex items-center gap-3 text-[11px] text-neutral-500">
          <button @click="resetDemo" class="underline">Reset demo state</button>
        </div>
      </header>
      <div class="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 min-h-[320px]">
        <component :is="demoComponent" v-if="demoComponent" />
        <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-else class="text-sm text-neutral-500">Loading demo...</p>
      </div>
      <div class="text-xs text-neutral-500">
        <p>These demos are intentionally lightweight to illustrate interaction / data flow concepts without full production polish. State persisted locally.</p>
      </div>
    </div>
    <div v-else>
      <p class="text-neutral-500">Demo not found.</p>
    </div>
  </BaseLayout>
</template>
<script setup lang="ts">
import { computed, shallowRef, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { getProjectBySlug } from '@/data/projects'
import { getDemoLoader } from '@/components/demo'
const route = useRoute()
const router = useRouter()
const slug = computed(()=> route.params.slug as string)
const project = computed(()=> getProjectBySlug(slug.value))
const demoComponent = shallowRef<any>(null)
const error = ref('')
const STORAGE_KEY = computed(()=> 'demo-state:'+slug.value)
async function load(){
  error.value = ''
  const loader = getDemoLoader(slug.value)
  if(!loader){ error.value = 'Demo loader not found for this project.'; return }
  try {
    const mod = await loader()
    demoComponent.value = mod.default
  } catch (e:any) { error.value = e?.message || 'Failed to load demo.' }
}
function resetDemo(){
  localStorage.removeItem(STORAGE_KEY.value)
  demoComponent.value = null
  load()
}
// Persist minimal presence (timestamp) to illustrate state saving
watch(demoComponent, (c)=>{ if(c) localStorage.setItem(STORAGE_KEY.value, Date.now().toString()) })
// Optional query param trigger to reset (?reset=1)
const headingEl = ref<HTMLElement | null>(null)
onMounted(async ()=> {
  if(project.value) document.title = project.value.name + ' Demo · Portfolio'
  if(route.query.reset){ resetDemo(); router.replace({ name:'project-demo', params:{ slug: slug.value } }) }
  await load()
  await nextTick()
  headingEl.value?.focus()
})
</script>
