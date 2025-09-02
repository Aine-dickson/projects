<template>
  <div class="space-y-4">
    <p class="text-xs text-neutral-600 dark:text-neutral-400">Simulated device telemetry updating every second. Demonstrates list virtualization potential + anomaly flagging.</p>
    <div class="grid gap-2 max-h-72 overflow-auto pr-1 text-xs">
      <div v-for="d in devices" :key="d.id" class="flex items-center justify-between rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2">
        <span class="font-mono">{{ d.id }}</span>
        <span :class="d.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">{{ d.temp.toFixed(1) }}°C</span>
        <span class="font-medium" :class="d.ok ? 'text-neutral-400' : 'text-red-500 animate-pulse'">{{ d.ok ? 'OK' : 'ALERT' }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { usePersistedRef } from '@/composables/persistedState'
interface Device { id: string; temp: number; ok: boolean }
const devices = usePersistedRef<Device[]>({ key: 'demo:realtime-iot:devices', defaultValue: Array.from({ length: 24 }, (_, i) => ({ id: 'dev-' + (i+1).toString().padStart(2,'0'), temp: 20 + Math.random()*5, ok: true })) })
let t: any
onMounted(() => {
  t = setInterval(() => {
    devices.value = devices.value.map(d => {
      const delta = (Math.random()-0.5) * 1.4
      const temp = d.temp + delta
      return { ...d, temp, ok: temp < 25 }
    })
  }, 1000)
})
onBeforeUnmount(()=> clearInterval(t))
</script>
