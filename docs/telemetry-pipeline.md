# Telemetry Pipeline (Showcase Adaptation)

Purpose: Present a realistic, production-inspired telemetry ingestion + processing + visualization system using only the stack available here (Vue 3 + Supabase Free Tier: Postgres, Realtime, Edge Functions). All heavier infra (Kafka, Redis, Timescale, etc.) is simulated so reviewers see architectural thinking without costly dependencies.

---
## High-Level Flow

Device (Simulated) → Edge Function (ingest) → Postgres (raw + aggregates) → Realtime Channels (fan-out) → Vue Dashboard (live UI, alerts)

```
+-----------+      HTTPS (batched JSON)      +-----------------+      SQL / RPC      +--------------+
| Simulated |  -->  /functions/v1/ingest  --> |  Edge Function  |  -->  raw_events   |              |
|  Devices  |                                |  (validate &    |  -->  min_agg      |   Supabase   |
| (CLI/WEB) | <--  401 if bad key            |  enrich + agg)  |  -->  device_state |   Postgres   |
+-----------+                                +-----------------+         |          |              |
       |                                              |                   |          +--------------+
       |                                              |  Realtime insert  |                 |
       |                                              +-------------------+-----------------+
       |                                                                                Realtime
       v                                                                                     |
  Local log tail                                                             +-------------------------------+
                                                                              | Vue Dashboard (Subscriptions) |
                                                                              |  - Live charts                |
                                                                              |  - Device table               |
                                                                              |  - Alerts panel               |
                                                                              +-------------------------------+
```

---
## Core Components (Implemented vs Simulated)

| Area | Real Implementation | Simulated Portion |
|------|---------------------|-------------------|
 Ingestion | Supabase Edge Function `/ingest` | Queue/broker (in-memory batch in function) |
 Processing | Validation + enrichment + aggregation logic inside function | Distributed workers |
 Storage | Postgres tables (raw, minute aggregates, device state) | Time-series optimized DB (Timescale) |
 Streaming | Supabase Realtime table broadcasts | Kafka topics / partitions |
 Alerts | Simple rule evaluation (threshold) at aggregation time | Sophisticated rule engine |
 Devices | Node/Browser simulator script | Real hardware / fleets |

---
## Database Schema (SQL)

```sql
-- Raw telemetry events (append-only)
create table if not exists raw_events (
  id bigserial primary key,
  device_id text not null,
  ts timestamptz not null default now(),
  metric text not null,
  value double precision not null,
  meta jsonb default '{}'::jsonb
);
create index if not exists raw_events_device_ts_idx on raw_events(device_id, ts desc);

-- Minute aggregates per device & metric
create table if not exists metric_minute_agg (
  bucket_start timestamptz not null,
  device_id text not null,
  metric text not null,
  count int not null,
  avg_val double precision not null,
  min_val double precision not null,
  max_val double precision not null,
  primary key(bucket_start, device_id, metric)
);

-- Current device runtime state (last heartbeat, status)
create table if not exists device_state (
  device_id text primary key,
  last_event_ts timestamptz not null,
  last_values jsonb not null,
  status text not null -- OK | STALE | ALERT
);

-- Basic Row Level Security (optional later)
-- alter table raw_events enable row level security;
```

Realtime: Enable on `raw_events`, `metric_minute_agg`, `device_state` to push inserts/updates to dashboard.

---
## Edge Function (Ingest) Outline

Located (stub) at `supabase/functions/ingest/index.ts`.

Responsibilities:
1. Authenticate via an `x-device-key` header (compare against a small allow list in Edge Function secret or table cache).
2. Parse body `{ events: TelemetryEvent[] }`.
3. Validate shape (device_id, metric, value numeric).
4. Insert raw rows in bulk.
5. Perform incremental minute aggregation (UPSERT into `metric_minute_agg`).
6. Update / insert `device_state` (last timestamp + last values + status classification).
7. Return summary `{ accepted, rejected, alertsTriggered }`.

Status Classification Example:
```
if metric == 'temp' and value > 75 => ALERT
else if now - last_event_ts > interval '2 minutes' => STALE
else OK
```

---
### Edge Function Pseudocode
```ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TelemetryEvent { device_id: string; metric: string; value: number; ts?: string; meta?: Record<string, unknown> }

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const key = req.headers.get('x-device-key')
  if (!key || !isValidDeviceKey(key)) return new Response('Unauthorized', { status: 401 })
  let payload: { events: TelemetryEvent[] }
  try { payload = await req.json() } catch { return resp(400, { error: 'Invalid JSON' }) }
  const events = (payload.events || []).filter(e => isValid(e))
  if (!events.length) return resp(200, { accepted: 0, rejected: 0 })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // Bulk insert raw
  const { error: rawErr } = await supabase.from('raw_events').insert(events.map(e => ({
    device_id: e.device_id,
    metric: e.metric,
    value: e.value,
    ts: e.ts ?? new Date().toISOString(),
    meta: e.meta || {}
  })))
  if (rawErr) return resp(500, { error: rawErr.message })

  // Aggregate (simple minute bucket)
  const byKey = aggregate(events)
  for (const k of Object.keys(byKey)) {
    const row = byKey[k]
    await supabase.from('metric_minute_agg').upsert(row)
  }

  // Update device state
  const stateMap = buildState(events)
  for (const id of Object.keys(stateMap)) {
    await supabase.from('device_state').upsert(stateMap[id])
  }

  return resp(200, { accepted: events.length, rejected: payload.events.length - events.length })
})

function resp(code: number, body: unknown) { return new Response(JSON.stringify(body), { status: code, headers: { 'content-type':'application/json' } }) }
function isValidDeviceKey(_k: string) { return true } // TODO: replace
function isValid(e: TelemetryEvent) { return !!e.device_id && !!e.metric && typeof e.value === 'number' }
function aggregate(events: TelemetryEvent[]) { /* build minute bucket stats */ return {} }
function buildState(events: TelemetryEvent[]) { /* compute statuses */ return {} }
```

---
## Frontend (Vue) Components (Planned)

| Component | Purpose |
|-----------|---------|
| `TelemetryDashboard.vue` | High-level layout: charts, stats, alerts table |
| `LiveChart.vue` | Realtime rolling graph (Recharts / Chart.js or lightweight custom) |
| `BatchList.vue` | Display recent aggregated minute buckets |
| `DeviceTable.vue` | Device status (OK / STALE / ALERT) with last seen & metrics |
| `AlertsPanel.vue` | Recent triggered alerts (from device_state classification) |
| `IngestionSimulator.vue` | UI to push synthetic events (batch size, noise, frequency) |

Current `TelemetryPipelineDemo.vue` will evolve into / be replaced by a full page under its project demo route.

Realtime Subscription Example (Pseudo):
```ts
const channel = supabase.channel('public:metric_minute_agg')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'metric_minute_agg' }, (payload) => {
      // update chart store
  })
  .subscribe()
```

---
## Simulation Strategy

Instead of external queue + worker:
1. Browser / Node script batches telemetry (N readings) → POST ingest.
2. Edge Function does validation + enrichment (single step) → DB.
3. Realtime drives UI updates.

Device Simulator (Planned file): `scripts/simulateTelemetry.ts`
```ts
import 'dotenv/config'
const DEVICE_KEY = process.env.DEVICE_KEY || 'dev-key-1'
const endpoint = process.env.INGEST_URL || 'http://localhost:54321/functions/v1/ingest'
function rand(n=1){ return (Math.random()-0.5)*n }
async function sendBatch(deviceId: string){
  const now = Date.now()
  const events = Array.from({length:10},(_,i)=>({ device_id: deviceId, metric: 'temp', value: 50 + rand(20), ts: new Date(now + i*100).toISOString() }))
  await fetch(endpoint, { method:'POST', headers:{ 'content-type':'application/json', 'x-device-key': DEVICE_KEY }, body: JSON.stringify({ events }) })
  console.log('sent', deviceId, events.length)
}
setInterval(()=> sendBatch('dev-1'), 4000)
```

---
## Alert Logic (Initial)

| Rule | Action |
|------|--------|
| temp > 75 (any event) | mark device ALERT + push realtime update |
| no events in >120s | mark device STALE |

Later: Compose rules with small DSL or JSON config.

---
## Roadmap (Scoped)

Phase 1 (MVP): schema SQL doc, edge function stub, demo page upgrade, basic ingestion simulator (frontend), realtime table subscription.

Phase 2: alerts panel, charts, device status transitions, rule evaluation refactor.

Phase 3: multi-metric support, per-metric threshold config, export raw to CSV.

Phase 4: optional performance notes (index usage, retention policy cron).

---
## Reviewer Takeaways (Why It Matters)

* Demonstrates end-to-end thinking (data modeling → ingestion → UX feedback loop).
* Shows pragmatic adaptation: trading full infra for Supabase + simulation while keeping architecture extensible.
* Highlights ability to design incremental rollout & observability (alerts, state tracking).

---
## Next Implementation Steps (Actionable)
1. Add SQL migration execution path (manual psql sheet or Supabase SQL editor paste).
2. Implement real `TelemetryDashboard.vue` page (replace current demo file gradually).
3. Create Pinia store for telemetry state (raw recent, aggregates, device map, alerts).
4. Wire Realtime subscriptions for `device_state` and `metric_minute_agg`.
5. Build ingestion simulator UI (controls: device count, batch size, interval, metric variants).
6. Flesh out edge function (validation + aggregation logic code above).
7. Add alert badge rendering & rule evaluation tests (optional).

---
Feel free to refine or request automation scripts next; I can start implementing Phase 1 immediately.
