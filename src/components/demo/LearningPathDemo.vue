<template>
  <div class="space-y-4 text-xs">
    <p class="text-neutral-600 dark:text-neutral-400">Skill milestones with computed progress scores.</p>
    <div class="space-y-3">
      <div v-for="m in milestones" :key="m.id" class="space-y-1">
        <div class="flex items-center justify-between"><span>{{ m.label }}</span><span>{{ m.progress }}%</span></div>
        <div class="h-2 rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div class="h-full bg-indigo-500" :style="{ width: m.progress+'%' }" />
        </div>
      </div>
    </div>
    <button @click="tick" class="px-3 py-2 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Simulate Event</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { usePersistedRef } from '@/composables/persistedState'
interface Milestone { id:string; label:string; progress:number }
const milestones = usePersistedRef<Milestone[]>({ key: 'demo:learning:milestones', defaultValue: [
  { id:'dsg',label:'Domain Modeling',progress:35 },
  { id:'rts',label:'Realtime Sync',progress:55 },
  { id:'agg',label:'Edge Aggregations',progress:20 }
]} )
function tick(){
  milestones.value = milestones.value.map(m=> ({...m, progress: Math.min(100, m.progress + (Math.random()*10)|0)}))
}
</script>
