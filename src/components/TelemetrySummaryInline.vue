<template>
  <div class="mt-8 space-y-4">
    <h2 class="text-lg font-semibold flex items-center gap-2">Live Demo Snapshot
      <span v-if="!initialized" class="animate-pulse text-xs text-neutral-500">warming…</span>
    </h2>
    <div class="grid sm:grid-cols-3 gap-3 text-xs">
      <div class="p-3 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 flex flex-col gap-1">
        <span class="text-neutral-500">Events</span>
        <span class="text-base font-semibold">{{ store.totalEvents }}</span>
      </div>
      <div class="p-3 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 flex flex-col gap-1">
        <span class="text-neutral-500">Devices</span>
        <span class="text-base font-semibold">{{ store.activeDevices }}</span>
      </div>
      <div class="p-3 rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 flex flex-col gap-1">
        <span class="text-neutral-500">Alerts</span>
        <span class="text-base font-semibold" :class="store.alertCount ? 'text-red-600 dark:text-red-400':'text-neutral-600'">{{ store.alertCount }}</span>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 text-[11px] items-center">
      <RouterLink :to="{ name: 'project-demo', params: { slug: 'telemetry-pipeline' } }" class="px-3 py-1 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium">Open Full Dashboard →</RouterLink>
      <button @click="ingestOnce" class="px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-800">Ingest Once</button>
      <label class="flex items-center gap-1">Auto
        <input type="checkbox" v-model="auto" />
      </label>
      <span class="text-neutral-500" v-if="auto">Streaming locally…</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTelemetryStore } from '@/stores/telemetry'
import { RouterLink } from 'vue-router'
const store = useTelemetryStore()
const initialized = ref(false)
const auto = ref(false)
let timer: any
function generateBatch(){
  const now = Date.now()
  const events: any[] = []
  const deviceCount = Math.min(store.simulator.deviceCount, 3) // small snapshot subset
  for (let d=0; d<deviceCount; d++){
    const deviceId = 'dev-'+(d+1).toString().padStart(2,'0')
    const ts = new Date(now).toISOString()
    const temp = 50 + (Math.random()-0.5)*store.simulator.tempNoise
    const cpu = 0.4 + Math.random()*0.7
    const mem = 30 + Math.random()*40
    events.push({ device_id: deviceId, metric: 'temp', value: temp, ts })
    events.push({ device_id: deviceId, metric: 'cpu', value: cpu, ts })
    events.push({ device_id: deviceId, metric: 'mem', value: mem, ts })
  }
  store.ingestLocalBatch(events)
}
function ingestOnce(){ generateBatch() }
onMounted(()=> {
  store.initRealtime()
  if (!store.rawEvents.length) generateBatch()
  initialized.value = true
  timer = setInterval(()=> { if(auto.value) generateBatch() }, store.simulator.intervalMs || 1500)
})
onBeforeUnmount(()=> clearInterval(timer))
</script>
