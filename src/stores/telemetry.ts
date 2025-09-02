import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// Supabase realtime temporarily disabled (all simulation is local)
// import type { RealtimeChannel } from '@supabase/supabase-js'
// import { supabase } from '@/utils/supabase'

export interface TelemetryEvent { device_id: string; metric: string; value: number; ts: string }
export interface MinuteAggregate { bucket_start: string; device_id: string; metric: string; count: number; avg_val: number; min_val: number; max_val: number }
export interface DeviceState { device_id: string; last_event_ts: string; last_values: Record<string, number>; status: 'OK'|'STALE'|'ALERT' }
export interface AlertEntry { id: string; ts: string; device_id: string; metric: string; message: string; severity: 'warn'|'crit' }

export const useTelemetryStore = defineStore('telemetry', () => {
  // Volatile in-memory buffers (NOT persisted)
  const rawEvents = ref<TelemetryEvent[]>([])
  const minuteAggs = ref<MinuteAggregate[]>([])
  const deviceState = ref<Record<string, DeviceState>>({})
  const alerts = ref<AlertEntry[]>([])
  const series = ref<Record<string, number[]>>({})

  // Configurable (persisted) settings
  const thresholds = ref({ tempHigh: 75, cpuHigh: 0.85, staleMs: 120_000 })
  const simulator = ref({ deviceCount: 5, intervalMs: 1500, batchSize: 10, tempNoise: 30 })

  const initialized = ref(false)
  const realtimeEnabled = ref(false)
  // let channel: RealtimeChannel | null = null // disabled

  const totalEvents = computed(() => rawEvents.value.length)
  const activeDevices = computed(() => Object.keys(deviceState.value).length)
  const alertCount = computed(() => alerts.value.length)
  const recentAlerts = computed(() => alerts.value.slice(0, 50))

  function ingestLocalBatch(events: TelemetryEvent[]) {
    if (!events.length) return
    // Append raw (cap 500)
    rawEvents.value.unshift(...events)
    if (rawEvents.value.length > 500) rawEvents.value.splice(500)
    // Update aggregates
    const aggMap: Record<string, MinuteAggregate> = {}
    for (const ev of events) {
      const d = new Date(ev.ts)
      const bucket = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()).toISOString()
      const key = bucket + '|' + ev.device_id + '|' + ev.metric
      if (!aggMap[key]) aggMap[key] = { bucket_start: bucket, device_id: ev.device_id, metric: ev.metric, count: 0, avg_val: 0, min_val: ev.value, max_val: ev.value }
      const a = aggMap[key]
      a.count++
      a.avg_val += ev.value
      if (ev.value < a.min_val) a.min_val = ev.value
      if (ev.value > a.max_val) a.max_val = ev.value
    }
    for (const a of Object.values(aggMap)) {
      a.avg_val = a.avg_val / a.count
      const existingIdx = minuteAggs.value.findIndex(x => x.bucket_start === a.bucket_start && x.device_id === a.device_id && x.metric === a.metric)
      if (existingIdx >= 0) minuteAggs.value[existingIdx] = a
      else minuteAggs.value.unshift(a)
    }
    if (minuteAggs.value.length > 500) minuteAggs.value.splice(500)
    // Update device state & alerts
    for (const ev of events) {
      const skey = ev.device_id + '|' + ev.metric
      let arr = series.value[skey]
      if (!arr) arr = series.value[skey] = []
      arr.push(ev.value)
      if (arr.length > 50) arr.splice(0, arr.length - 50)
      const state = deviceState.value[ev.device_id] || { device_id: ev.device_id, last_event_ts: ev.ts, last_values: {}, status: 'OK' as const }
      state.last_values[ev.metric] = ev.value
      state.last_event_ts = ev.ts
      // Status evaluation
      let status: DeviceState['status'] = 'OK'
  if ((state.last_values['temp'] ?? 0) > thresholds.value.tempHigh || (state.last_values['cpu'] ?? 0) > thresholds.value.cpuHigh) status = 'ALERT'
      state.status = status
      deviceState.value[ev.device_id] = state
      if (status === 'ALERT') {
        pushAlert({ device_id: ev.device_id, metric: ev.metric, value: ev.value, kind: 'threshold' })
      }
    }
  }

  function pushAlert(opts: { device_id: string; metric: string; value: number; kind: string }) {
    const entry: AlertEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ts: new Date().toISOString(),
      device_id: opts.device_id,
      metric: opts.metric,
      message: `${opts.metric} ${opts.kind === 'stale' ? 'stale' : 'exceeded'} (${opts.value.toFixed(2)})`,
      severity: opts.kind === 'threshold' ? 'crit' : 'warn'
    }
    alerts.value.unshift(entry)
    if (alerts.value.length > 200) alerts.value.splice(200)
  }

  function evaluateStale(thresholdMs = thresholds.value.staleMs) {
    const now = Date.now()
    for (const s of Object.values(deviceState.value)) {
      const age = now - new Date(s.last_event_ts).getTime()
      if (age > thresholdMs && s.status !== 'ALERT') {
        s.status = 'STALE'
        pushAlert({ device_id: s.device_id, metric: 'heartbeat', value: age / 1000, kind: 'stale' })
      }
    }
  }

  async function initRealtime() {
    // No-op stub while Supabase integration is paused.
    // Previous implementation left here for future reference:
    /*
    if (initialized.value) return
    if (!supabase) { initialized.value = true; realtimeEnabled.value = false; return }
    try {
      channel = supabase.channel('telemetry-stream')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'raw_events' }, (payload) => { ... })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'device_state' }, (payload) => { ... })
        .subscribe((status) => { realtimeEnabled.value = status === 'SUBSCRIBED' })
    } catch { realtimeEnabled.value = false }
    initialized.value = true
    */
    initialized.value = true
    realtimeEnabled.value = false
  }

  function clearAll() {
    rawEvents.value = []
    minuteAggs.value = []
    deviceState.value = {}
  alerts.value = []
  series.value = {}
  }

  // Periodic stale evaluation
  setInterval(() => evaluateStale(), 15_000)

  return {
    rawEvents, minuteAggs, deviceState, alerts,
  thresholds, simulator,
  series,
    totalEvents, activeDevices, alertCount, recentAlerts,
  ingestLocalBatch, clearAll, initRealtime, realtimeEnabled,
  getSeries(deviceId: string, metric: string){ return series.value[deviceId + '|' + metric] || [] }
  }
}, {
  persist: {
    key: 'telemetry',
    paths: ['thresholds', 'simulator'] as any
  } as any
})
