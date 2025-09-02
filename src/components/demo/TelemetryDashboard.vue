<template>
  <div class="space-y-6 text-xs">
    <section class="grid gap-3 sm:grid-cols-3">
      <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 flex flex-col gap-1">
        <span class="text-neutral-500">Events</span>
        <span class="text-lg font-semibold">{{ store.totalEvents }}</span>
      </div>
      <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 flex flex-col gap-1">
        <span class="text-neutral-500">Devices</span>
        <span class="text-lg font-semibold">{{ store.activeDevices }}</span>
      </div>
      <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 flex flex-col gap-1">
        <span class="text-neutral-500">Alerts</span>
        <span class="text-lg font-semibold" :class="store.alertCount ? 'text-red-600 dark:text-red-400':'text-neutral-600'">{{ store.alertCount }}</span>
      </div>
    </section>
    <section class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-4">
      <div class="flex flex-wrap gap-6">
        <div class="space-y-2 flex-1 min-w-[320px]">
          <header class="flex items-center gap-4 flex-wrap">
            <h2 class="font-semibold text-sm">Ingestion Simulator</h2>
            <div class="flex items-center gap-2 flex-wrap text-[11px]">
              <label class="flex items-center gap-1">Devices <input type="number" min="1" max="50" v-model.number="store.simulator.deviceCount" class="w-16 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1 py-0.5" /></label>
              <label class="flex items-center gap-1">Interval(ms) <input type="number" min="500" step="100" v-model.number="store.simulator.intervalMs" class="w-20 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1 py-0.5" /></label>
              <label class="flex items-center gap-1">Batch <input type="number" min="1" max="100" v-model.number="store.simulator.batchSize" class="w-16 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1 py-0.5" /></label>
              <label class="flex items-center gap-1">Temp Noise <input type="number" step="1" v-model.number="store.simulator.tempNoise" class="w-16 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1 py-0.5" /></label>
            </div>
            <div class="ml-auto flex gap-2">
              <button @click="toggle" class="px-3 py-1 rounded-md text-xs font-medium" :class="running ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'">{{ running ? 'Stop' : 'Start' }}</button>
              <button @click="oneShot" class="px-3 py-1 rounded-md text-xs font-medium bg-neutral-200 dark:bg-neutral-700">Ingest Once</button>
              <button @click="store.clearAll" class="px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800">Clear</button>
            </div>
          </header>
          <p class="text-neutral-500 text-[11px]">Synthetic metrics (temp °C, cpu 0-1, mem MB). Realtime subscription auto-enables if backend tables exist.</p>
        </div>
        <div class="space-y-2 flex-1 min-w-[280px]">
          <h3 class="font-semibold text-sm flex items-center gap-2">Alert Rules <span v-if="saveLabel" :class="saveClass" class="text-[10px] px-2 py-0.5 rounded-full">{{ saveLabel }}</span></h3>
          <div class="flex flex-wrap gap-2 text-[11px] items-end">
            <label class="flex flex-col">Temp High
              <input type="number" v-model.number="store.thresholds.tempHigh" class="mt-0.5 w-20 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1 py-0.5" />
            </label>
            <label class="flex flex-col">CPU High
              <input type="number" step="0.01" v-model.number="store.thresholds.cpuHigh" class="mt-0.5 w-20 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1 py-0.5" />
            </label>
            <label class="flex flex-col">Stale (s)
              <input type="number" min="10" step="5" v-model.number="staleSeconds" class="mt-0.5 w-24 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-1 py-0.5" />
            </label>
            <button @click="resetRules" class="px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800">Reset</button>
          </div>
          <p class="text-neutral-500 text-[11px]">Adjust thresholds; changes persist locally.</p>
        </div>
      </div>
    </section>
    <section class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-2">
          <h3 class="font-semibold text-sm">Recent Aggregates (Minute Buckets)</h3>
          <div class="overflow-auto max-h-64 thin-scroll">
            <table class="w-full text-[11px]">
              <thead class="text-neutral-500">
                <tr class="text-left">
                  <th class="font-medium py-1 pr-2">Bucket</th>
                  <th class="font-medium py-1 pr-2">Device</th>
                  <th class="font-medium py-1 pr-2">Metric</th>
                  <th class="font-medium py-1 pr-2">Cnt</th>
                  <th class="font-medium py-1 pr-2">Avg</th>
                  <th class="font-medium py-1 pr-2">Min</th>
                  <th class="font-medium py-1 pr-2">Max</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in store.minuteAggs.slice(0,50)" :key="a.bucket_start+a.device_id+a.metric" class="border-t border-neutral-100 dark:border-neutral-800">
                  <td class="py-1 pr-2 whitespace-nowrap">{{ shortTime(a.bucket_start) }}</td>
                  <td class="py-1 pr-2">{{ a.device_id }}</td>
                  <td class="py-1 pr-2 uppercase">{{ a.metric }}</td>
                  <td class="py-1 pr-2">{{ a.count }}</td>
                  <td class="py-1 pr-2">{{ a.avg_val.toFixed(1) }}</td>
                  <td class="py-1 pr-2">{{ a.min_val.toFixed(1) }}</td>
                  <td class="py-1 pr-2">{{ a.max_val.toFixed(1) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-2">
          <h3 class="font-semibold text-sm">Raw Events (Most Recent)</h3>
          <div class="overflow-auto max-h-64 thin-scroll">
            <table class="w-full text-[11px]">
              <thead class="text-neutral-500">
                <tr class="text-left">
                  <th class="font-medium py-1 pr-2">TS</th>
                  <th class="font-medium py-1 pr-2">Device</th>
                  <th class="font-medium py-1 pr-2">Metric</th>
                  <th class="font-medium py-1 pr-2">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in store.rawEvents.slice(0,60)" :key="r.ts+r.device_id+r.metric" class="border-t border-neutral-100 dark:border-neutral-800">
                  <td class="py-1 pr-2 whitespace-nowrap">{{ shortTime(r.ts) }}</td>
                  <td class="py-1 pr-2">{{ r.device_id }}</td>
                  <td class="py-1 pr-2 uppercase">{{ r.metric }}</td>
                  <td class="py-1 pr-2" :class="r.metric==='temp' && r.value>75 || r.metric==='cpu' && r.value>0.85 ? 'text-red-600 dark:text-red-400' : ''">{{ formatValue(r) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-3">
          <h3 class="font-semibold text-sm">Device State</h3>
          <div class="overflow-auto max-h-32 thin-scroll">
            <table class="w-full text-[11px] mb-2">
              <thead class="text-neutral-500">
                <tr class="text-left">
                  <th class="py-1 pr-2 font-medium">Device</th>
                  <th class="py-1 pr-2 font-medium">Status</th>
                  <th class="py-1 pr-2 font-medium">Temp</th>
                  <th class="py-1 pr-2 font-medium">CPU</th>
                  <th class="py-1 pr-2 font-medium">Mem</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in deviceStates" :key="s.device_id" class="border-t border-neutral-100 dark:border-neutral-800">
                  <td class="py-1 pr-2">{{ s.device_id }}</td>
                  <td class="py-1 pr-2"><span :class="statusClass(s.status)" class="px-2 py-0.5 rounded-full">{{ s.status }}</span></td>
                  <td class="py-1 pr-2">{{ (s.last_values.temp ?? 0).toFixed(1) }}</td>
                  <td class="py-1 pr-2">{{ ((s.last_values.cpu ?? 0)*100).toFixed(0) }}%</td>
                  <td class="py-1 pr-2">{{ (s.last_values.mem ?? 0).toFixed(0) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="space-y-2">
            <h4 class="font-medium text-[11px] text-neutral-500">Temp (Last 50 samples)</h4>
            <div class="flex flex-wrap gap-2">
              <div v-for="s in deviceStates" :key="s.device_id+'-temp'" class="flex items-center gap-1 text-[10px]">
                <span class="w-10 text-neutral-500">{{ s.device_id }}</span>
                <Sparkline :values="store.getSeries(s.device_id,'temp')" :color="seriesColor(s.status)" />
              </div>
            </div>
            <h4 class="font-medium text-[11px] text-neutral-500 pt-1">CPU</h4>
            <div class="flex flex-wrap gap-2">
              <div v-for="s in deviceStates" :key="s.device_id+'-cpu'" class="flex items-center gap-1 text-[10px]">
                <span class="w-10 text-neutral-500">{{ s.device_id }}</span>
                <Sparkline :values="store.getSeries(s.device_id,'cpu')" :color="seriesColor(s.status)" />
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-2">
          <h3 class="font-semibold text-sm flex items-center justify-between">Alerts
            <span class="flex gap-1">
              <button @click="exportEvents" class="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px]">Export Events</button>
              <button @click="exportAlerts" class="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px]">Export Alerts</button>
            </span>
          </h3>
          <ul class="space-y-1 max-h-64 overflow-auto thin-scroll">
            <li v-for="a in store.recentAlerts" :key="a.id" class="flex items-center gap-2 text-[11px]">
              <span class="font-mono text-neutral-400">{{ shortTime(a.ts) }}</span>
              <span class="font-medium">{{ a.device_id }}</span>
              <span class="uppercase">{{ a.metric }}</span>
              <span :class="a.severity==='crit' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">{{ a.message }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useTelemetryStore } from '@/stores/telemetry'
import Sparkline from '@/components/ui/Sparkline.vue'
const store = useTelemetryStore()
// Bind simulator config to local refs for faster access (still persisted in store)
const running = ref(false)
let timer: any
const staleSeconds = computed({
  get: () => Math.round(store.thresholds.staleMs / 1000),
  set: (v: number) => store.thresholds.staleMs = v * 1000
})
function resetRules(){
  store.thresholds.tempHigh = 75
  store.thresholds.cpuHigh = 0.85
  store.thresholds.staleMs = 120_000
}
// Debounced save indicator
const saveState = ref<'idle'|'saving'|'saved'>('idle')
let saveTimer: any, fadeTimer: any
watch(()=> ({...store.thresholds}), () => {
  if (fadeTimer){ clearTimeout(fadeTimer); fadeTimer=null }
  saveState.value = 'saving'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(()=> {
    saveState.value = 'saved'
    fadeTimer = setTimeout(()=> saveState.value='idle', 2000)
  }, 600)
}, { deep: true })
const saveLabel = computed(()=> saveState.value === 'idle' ? '' : saveState.value === 'saving' ? 'Saving…' : 'Saved')
const saveClass = computed(()=> saveState.value === 'saving' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300')

function shortTime(iso: string){ return new Date(iso).toLocaleTimeString([], { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' }) }
function statusClass(s: string){
  if (s==='ALERT') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  if (s==='STALE') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
}
function formatValue(r: any){ return r.metric==='cpu' ? (r.value*100).toFixed(0)+'%' : r.value.toFixed(1) }

function generateBatch(){
  const now = Date.now()
  const events = [] as any[]
  for (let d=0; d<store.simulator.deviceCount; d++){
    const deviceId = 'dev-'+(d+1).toString().padStart(2,'0')
    for (let i=0; i<store.simulator.batchSize; i++){
      const ts = new Date(now + i*50).toISOString()
      const temp = 50 + (Math.random()-0.5)*store.simulator.tempNoise
      const cpu = 0.4 + Math.random()*0.7
      const mem = 30 + Math.random()*40
      events.push({ device_id: deviceId, metric: 'temp', value: temp, ts })
      events.push({ device_id: deviceId, metric: 'cpu', value: cpu, ts })
      events.push({ device_id: deviceId, metric: 'mem', value: mem, ts })
    }
  }
  store.ingestLocalBatch(events)
}

function oneShot(){ generateBatch() }
function toggle(){
  running.value = !running.value
  if (running.value) {
    start()
  } else {
    stop()
  }
}
function start(){ if (timer) return; generateBatch(); timer = setInterval(generateBatch, store.simulator.intervalMs) }
function stop(){ if (timer){ clearInterval(timer); timer=null } }

// React to interval change
let intervalWatcher: any
onMounted(()=> {
  store.initRealtime()
  // Auto ingest one batch so the dashboard isn't empty on first visit
  if (!store.rawEvents.length) {
    generateBatch()
  }
  intervalWatcher = setInterval(()=>{ if (running.value){ stop(); start() } }, 5_000)
})
onBeforeUnmount(()=> { stop(); clearInterval(intervalWatcher) })

const deviceStates = computed(()=> Object.values(store.deviceState))
function seriesColor(status: string){
  if (status==='ALERT') return '#dc2626'
  if (status==='STALE') return '#d97706'
  return '#059669'
}
// Export
function toCsv(rows: string[][]){
  return rows.map(r=> r.map(field => /[",\n]/.test(field) ? '"'+field.replace(/"/g,'""')+'"' : field).join(',')).join('\n')
}
function download(filename: string, content: string, mime='text/csv'){
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
function exportEvents(){
  if (!store.rawEvents.length) return
  const header = ['ts','device_id','metric','value']
  const rows = [header, ...store.rawEvents.slice(0,500).map(e=> [e.ts, e.device_id, e.metric, String(e.value)])]
  download(`telemetry-events-${Date.now()}.csv`, toCsv(rows))
}
function exportAlerts(){
  if (!store.alerts.length) return
  const header = ['ts','device_id','metric','severity','message']
  const rows = [header, ...store.alerts.slice(0,200).map(a=> [a.ts, a.device_id, a.metric, a.severity, a.message])]
  download(`telemetry-alerts-${Date.now()}.csv`, toCsv(rows))
}
</script>
