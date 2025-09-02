import type { Project } from '@/types/project'

// NOTE: Replace placeholder content with your real projects. Keep slugs stable once shared.
export const projects: Project[] = [
    // === Added from projects_overview PDFs (prototype summaries) ===
  {
    id: 'p6',
    slug: 'cashless-transport-platform',
    name: 'Cashless Transport Platform',
    tagline: 'Mobile money, offline trip ordering & settlement simulation',
    description: 'In-browser prototype of a cashless public transport flow for East Africa: Passengers top‑up via simulated mobile money providers (MTN, Airtel, card) with fee models, place trips (balance‑validated) that operators assign & start, dynamic surge fare + provider fee breakdown, offline event queue with replay, settlement batch aggregation & provider / route analytics.',
    highlights: [
      'Mobile money provider simulation (differential % + fixed fees + failure rate)',
      'Trip lifecycle: place → assign → start → complete / cancel (balance & fare validation)',
      'Dynamic surge pricing (peak hour multiplier) + fare/fee breakdown UI',
      'Offline-first event queue (pending → processed replay) for top-ups & trip events',
      'Settlement batch aggregation (gross / provider fees / net) + provider & route KPIs'
    ],
    responsibilities: [
      'Engineered Pinia store modeling events, trips, receipts & settlements',
      'Implemented provider fee algorithms + wallet credit & failure simulation',
      'Built passenger / driver / admin multi-role interfaces (ordering, assignment, KPIs)',
      'Added surge fare estimation & balance gating before trip placement',
      'Designed settlement aggregation + provider statistics reporting'
    ],
    stack: ['Vue 3', 'TypeScript', 'Pinia', 'TailwindCSS', 'Supabase (planned)', 'Edge Functions (planned)'],
    tags: [ { label: 'Payments', color: 'emerald-600' } ],
    links: [],
    documents: [ { label: 'Concept PDF', path: '/docs/Cashless-Transport.pdf' } ],
    featured: false,
    visibility: 'prototype',
    startDate: '2025-04-01',
    endDate: 'present',
  order: 6,
  supportsDemo: true
  },
  {
    id: 'p7',
    slug: 'fleet-manager',
    name: 'Fleet Manager',
    tagline: 'Interactive route-aware fleet tracking & geofence simulation',
    description: 'Rich in-browser fleet simulation: Uganda‑based map, predefined + user‑drawn routes, driver & route–gated movement (no drift when unassigned), editable geofences with real‑time entry/exit alerts, path history, clustering, ETAs, and CSV export. Backend (Supabase realtime & RLS) planned for persistence.',
    highlights: [
      'Route drawing & assignment with live progress + ETA/distance',
      'Driver + route gating: metrics only update while truly “in service”',
      'Editable circular geofences (drag center & radius) with alerts',
      'Per‑vehicle path history & colored polylines (Uganda focus)',
      'Lightweight marker clustering & CSV export (vehicles / alerts)'
    ],
    responsibilities: [
      'Designed simulation engine (movement interpolation & gating)',
      'Implemented custom route authoring & persistence layer',
      'Built geofence editing (drag/resize) & alert evaluation loop',
      'Added ETA/distance metrics + path history & clustering logic',
      'Planned Supabase realtime & RLS integration roadmap'
    ],
    stack: ['Vue 3', 'TypeScript', 'Pinia', 'Leaflet', 'TailwindCSS', 'Supabase (planned)'],
    tags: [  { label: 'Geospatial', color: 'lime-500' } ],
    links: [],
    documents: [ { label: 'Overview PDF', path: '/docs/Fleet-Manager.pdf' } ],
    featured: false,
    visibility: 'prototype',
    startDate: '2025-04-10',
    endDate: 'present',
  order: 7,
  supportsDemo: true
  },
  {
    id: 'p8',
    slug: 'telemetry-pipeline',
    name: 'Telemetry Pipeline',
    tagline: 'Unified ingest & enrichment for device metrics',
    description: 'Prototype ingestion + enrichment pipeline: devices push batched metrics; an edge function validates, enriches (derive deltas, health flags), and stores summaries + raw logs for future analytics.',
    highlights: [
      'Batch validation & partial accepted error reporting',
      'Derived metric enrichment (delta, rate, status flag)',
      'Partitioned table strategy (by month) planned for scale'
    ],
    responsibilities: [
      'Auth & channel design for device API keys',
      'Edge enrichment function (delta & status computation)',
      'Initial performance profiling & index selection'
    ],
    stack: ['Vue 3', 'Supabase', 'Edge Functions', 'TypeScript'],
    tags: [ { label: 'Data', color: 'amber-500' } ],
    links: [],
    documents: [ { label: 'Design PDF', path: '/docs/Telementry.pdf' } ],
    featured: false,
    visibility: 'prototype',
    startDate: '2025-04-15',
    endDate: 'present',
  order: 8,
  supportsDemo: true
  },

  // === Original projects ===
  {
    id: 'p1',
    slug: 'realtime-iot-dashboard',
    name: 'Realtime IoT Dashboard',
    tagline: 'Streaming telemetry & anomaly alerts for 1K+ devices',
    description: `A low-latency dashboard ingesting MQTT device telemetry, normalizing it through Supabase Edge Functions, and visualizing metrics with live charts. Implements role-based access and offline-friendly caching.`,
    highlights: [
      'Sub-2s end-to-end latency across 1,200 simulated devices',
      'Edge function transformation & alert rule engine',
      'Responsive, accessible data visualization components'
    ],
    responsibilities: [
      'Architected data flow & storage schema',
      'Implemented WebSocket/MQTT bridge & reconnection logic',
      'Designed alert evaluation engine'
    ],
    stack: ['Vue 3', 'TypeScript', 'Supabase', 'Edge Functions', 'TailwindCSS'],
    tags: [
      { label: 'IoT', color: 'cyan-500' },
      { label: 'Realtime', color: 'emerald-500' }
    ],
    links: [
      { label: 'GitHub', url: 'https://github.com/your-org/realtime-dashboard', kind: 'repo' }
    ],
    featured: true,
    visibility: 'public',
    startDate: '2024-03-01',
    endDate: 'present',
    heroImage: '/iot.png',
    gallery: ['/iot.png'],
  order: 1,
  supportsDemo: true
  },
  {
    id: 'p2',
    slug: 'fintech-risk-engine',
    name: 'Fintech Risk Scoring Engine',
    tagline: 'Deterministic + ML hybrid credit risk scoring',
    description: 'Pluggable rule + model hybrid engine producing creditworthiness scores with full audit trails and explainability.',
    highlights: [
      'Pluggable scoring pipeline (rules + model stages)',
      'Deterministic explainability output JSON',
      'Batch + streaming ingestion modes'
    ],
    responsibilities: [
      'Implemented pipeline orchestration & DAG executor',
      'Optimized performance (45% reduction in p95 latency)',
      'Designed JSON explainability schema'
    ],
    stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Supabase', 'Vue 3'],
    tags: [
      { label: 'Fintech', color: 'violet-500' },
      { label: 'Data', color: 'amber-500' }
    ],
    links: [
      { label: 'GitHub', url: 'https://github.com/your-org/fintech-risk-engine', kind: 'repo' }
    ],
    featured: false,
    visibility: 'hidden', // kept for reference, not shown to HR currently
    startDate: '2023-11-01',
    endDate: '2024-08-01',
    heroImage: '/fintech.svg',
    order: 2
  },
  // --- New placeholder public projects (replace with real content) ---
  {
    id: 'p3',
    slug: 'edge-media-optimizer',
    name: 'Edge Media Optimizer',
    tagline: 'On-the-fly image & asset transforms via Supabase Edge Functions',
    description: 'Lightweight media optimization layer: resize, format negotiate (WebP/AVIF fallback), and cache busting using Supabase storage + Edge Functions. Designed to reduce bandwidth & improve LCP for marketing pages.',
    highlights: [
      'Average image payload reduction ~48% on sample set',
      'Deterministic signed URL scheme prevents abuse',
      'Plug-in style transform registry (future: video thumbnails)'
    ],
    responsibilities: [
      'Designed signed URL validation & cache key strategy',
      'Implemented transform pipeline & sharp adapter',
      'Added monitoring events into Supabase logs'
    ],
    stack: ['Vue 3', 'Supabase Storage', 'Edge Functions', 'TypeScript', 'TailwindCSS'],
    tags: [ { label: 'Performance', color: 'green-500' } ],
    links: [],
    featured: true,
    visibility: 'public',
    startDate: '2025-01-10',
    endDate: 'present',
    order: 3
  },
  {
    id: 'p4',
    slug: 'collab-notes',
    name: 'Realtime Collaborative Notes',
    tagline: 'Presence, live cursors & conflict-free text sync',
    description: 'Prototype collaborative note editor leveraging Supabase Realtime channels with CRDT-inspired merge logic (lightweight operational transforms) for multi-user editing.',
    highlights: [
      'Latency-tolerant merge logic with OT fallback',
      'User presence & cursor broadcasting channels',
      'Optimistic UI with rollback on version mismatch'
    ],
    responsibilities: [
      'Implemented diff batching & reconciliation algorithm',
      'Designed channel naming & auth rules (RLS)',
      'Built presence avatars & cursor trail components'
    ],
    stack: ['Vue 3', 'Supabase Realtime', 'TypeScript', 'Edge Functions'],
    tags: [ { label: 'Realtime', color: 'emerald-500' }, { label: 'Collaboration', color: 'sky-500' } ],
    links: [],
    featured: false,
    visibility: 'public',
    startDate: '2025-02-15',
    endDate: 'present',
    order: 4
  },
  {
    id: 'p5',
    slug: 'learning-path-tracker',
    name: 'Learning Path Tracker',
    tagline: 'Personal skill milestones & progress analytics',
    description: 'Prototype app to define skill trees, log progress events, and compute streaks & competency scores using Edge Functions for aggregation.',
    highlights: [
      'Dynamic skill graph definition with parent-child weighting',
      'Edge aggregation reducing client compute overhead',
      'Row Level Security policies for per-user isolation'
    ],
    responsibilities: [
      'Schema & RLS policy design',
      'Progress event ingestion edge function',
      'Frontend progress visualization components'
    ],
    stack: ['Vue 3', 'Supabase', 'Edge Functions', 'TypeScript', 'TailwindCSS'],
    tags: [ { label: 'Productivity', color: 'indigo-500' } ],
    links: [],
    featured: false,
    visibility: 'prototype',
    startDate: '2025-03-05',
    endDate: 'present',
  order: 5,
  supportsDemo: true
  },
  
]

export function getProjectBySlug (slug: string) {
  return projects.find(p => p.slug === slug)
}

export function listProjects (opts?: { featuredOnly?: boolean, includePrototypes?: boolean, includeHidden?: boolean, sortBy?: 'order' | 'name' }) {
  let list = [...projects]
  if (!opts?.includeHidden) list = list.filter(p => p.visibility !== 'hidden')
  if (!opts?.includePrototypes) list = list.filter(p => p.visibility !== 'prototype')
  if (opts?.featuredOnly) list = list.filter(p => p.featured)
  if (opts?.sortBy === 'order') {
    list = list.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } else if (opts?.sortBy === 'name') {
    list = list.slice().sort((a, b) => a.name.localeCompare(b.name))
  }
  // Default: respect declaration order
  return list
}

export function listTags () {
  const map = new Map<string, string | undefined>()
  projects.forEach(p => p.tags?.forEach(t => {
    if (!map.has(t.label)) map.set(t.label, t.color)
  }))
  return Array.from(map.entries()).map(([label, color]) => ({ label, color }))
}
