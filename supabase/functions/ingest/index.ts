// Supabase Edge Function (Deno) - Telemetry Ingest (Stub)
// @ts-nocheck  -- Uses Deno runtime & URL imports not resolvable in local TS config
// Deploy via: supabase functions deploy ingest
// Invoke local: supabase functions serve ingest
// NOTE: Replace placeholder logic; keep small & auditable for showcase.

import { serve } from 'https://deno.land/std@0.223.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TelemetryEvent { device_id: string; metric: string; value: number; ts?: string; meta?: Record<string, unknown> }

serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method Not Allowed' })
  const key = req.headers.get('x-device-key')
  if (!key || !isValidDeviceKey(key)) return json(401, { error: 'Unauthorized' })
  let body: { events?: TelemetryEvent[] }
  try { body = await req.json() } catch { return json(400, { error: 'Invalid JSON' }) }
  const events = (body.events || []).filter(isValidEvent)
  if (!events.length) return json(200, { accepted: 0, rejected: (body.events || []).length })

  const supabase = createClient<Deno.Kv>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Insert raw events
  const rows = events.map(e => ({
    device_id: e.device_id,
    metric: e.metric,
    value: e.value,
    ts: e.ts ?? new Date().toISOString(),
    meta: e.meta || {}
  }))
  const { error: insertErr } = await supabase.from('raw_events').insert(rows)
  if (insertErr) return json(500, { error: insertErr.message })

  // Aggregate (minute bucket simple pass) - placeholder sample (optimize server-side SQL later)
  // NOTE: For simplicity we just compute stats per metric+device for this batch's minute; real impl would merge with existing row.
  const aggregates = computeAggregates(rows)
  for (const agg of aggregates) {
    await supabase.from('metric_minute_agg').upsert(agg)
  }

  // Update device state (very naive merge)
  const deviceStateMap = buildDeviceState(rows)
  for (const s of deviceStateMap) {
    await supabase.from('device_state').upsert(s)
  }

  return json(200, { accepted: events.length, rejected: (body.events || []).length - events.length })
})

function isValidDeviceKey(_k: string) { return true } // TODO: implement allowlist
function isValidEvent(e: TelemetryEvent) { return e && e.device_id && e.metric && typeof e.value === 'number' }

function computeAggregates(rows: any[]) {
  const map: Record<string, { bucket_start: string; device_id: string; metric: string; values: number[] }> = {}
  for (const r of rows) {
    const ts = new Date(r.ts)
    const bucket = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate(), ts.getHours(), ts.getMinutes()).toISOString()
    const key = bucket + '|' + r.device_id + '|' + r.metric
    if (!map[key]) map[key] = { bucket_start: bucket, device_id: r.device_id, metric: r.metric, values: [] }
    map[key].values.push(r.value)
  }
  return Object.values(map).map(x => ({
    bucket_start: x.bucket_start,
    device_id: x.device_id,
    metric: x.metric,
    count: x.values.length,
    avg_val: x.values.reduce((a,b)=>a+b,0)/x.values.length,
    min_val: Math.min(...x.values),
    max_val: Math.max(...x.values)
  }))
}

function buildDeviceState(rows: any[]) {
  const byDevice: Record<string, { device_id: string; last_event_ts: string; last_values: Record<string, number>; status: string }> = {}
  for (const r of rows) {
    if (!byDevice[r.device_id]) byDevice[r.device_id] = { device_id: r.device_id, last_event_ts: r.ts, last_values: {}, status: 'OK' }
    byDevice[r.device_id].last_values[r.metric] = r.value
    byDevice[r.device_id].last_event_ts = r.ts
    if (r.metric === 'temp' && r.value > 75) byDevice[r.device_id].status = 'ALERT'
  }
  return Object.values(byDevice)
}

function json(code: number, data: unknown) {
  return new Response(JSON.stringify(data), { status: code, headers: { 'content-type':'application/json' } })
}
