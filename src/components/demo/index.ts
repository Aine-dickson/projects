// Dynamic demo component loaders keyed by project slug.
export const demoLoaders: Record<string, () => Promise<any>> = {
  'realtime-iot-dashboard': () => import('./RealtimeIotDemo.vue'),
  'edge-media-optimizer': () => import('./EdgeMediaOptimizerDemo.vue'),
  'collab-notes': () => import('./CollabNotesDemo.vue'),
  'learning-path-tracker': () => import('./LearningPathDemo.vue'),
  'cashless-transport-platform': () => import('./CashlessTransportDemo.vue'),
  'fleet-manager': () => import('./FleetManagerDemo.vue'),
  'telemetry-pipeline': () => import('./TelemetryDashboard.vue'),
}

export function getDemoLoader(slug: string) {
  return demoLoaders[slug]
}
