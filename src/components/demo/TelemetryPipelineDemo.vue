<template>
  <div class="space-y-4 text-xs">
    <p class="text-neutral-600 dark:text-neutral-400">Batch ingestion & enrichment (delta + status flags).</p>
    <div class="flex gap-3">
      <button @click="ingest" class="px-3 py-2 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Ingest Batch</button>
      <span class="text-neutral-500 self-center" v-if="batches.length">{{ batches.length }} batches</span>
    </div>
    <ul class="space-y-2 max-h-60 overflow-auto pr-1">
      <li v-for="b in batches" :key="b.id" class="p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div class="flex justify-between items-center mb-1"><span class="font-mono">{{ b.id }}</span><span class="text-[10px] text-neutral-400">{{ b.readings.length }} readings</span></div>
        <div class="grid grid-cols-5 gap-1 text-[10px]">
          <div v-for="r in b.readings" :key="r.id" :class="r.status==='OK' ? 'text-emerald-600' : 'text-red-600'">{{ r.delta.toFixed(1) }} {{ r.status }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { usePersistedRef } from '@/composables/persistedState'
interface Reading { id:string; value:number; delta:number; status:'OK'|'ALERT' }
interface Batch { id:string; readings:Reading[] }
const lastValue = usePersistedRef<number>({ key: 'demo:telemetry:last', defaultValue: 50 })
const batches = usePersistedRef<Batch[]>({ key: 'demo:telemetry:batches', defaultValue: [] })
function ingest(){
  const readings:Reading[] = Array.from({length:10},(_,i)=>{ const raw= lastValue.value + (Math.random()-0.5)*10; const delta = raw - lastValue.value; lastValue.value = raw; return { id:'R'+Date.now()+i, value: raw, delta, status: Math.abs(delta) > 6 ? 'ALERT' : 'OK' } })
  batches.value.unshift({ id: 'B'+ Date.now().toString().slice(-5), readings })
  if(batches.value.length>25) batches.value.pop()
}
</script>
