// Node-side simple telemetry simulator (OPTIONAL usage outside browser demos)
// Run with: bun run scripts/simulateTelemetry.ts  (after setting env vars)
const endpoint = process.env.INGEST_URL || 'http://localhost:54321/functions/v1/ingest'
const deviceId = process.env.DEVICE_ID || 'dev-1'
const deviceKey = process.env.DEVICE_KEY || 'dev-key-1'

function jitter(n=1){ return (Math.random()-0.5)*n }

async function sendBatch(){
  const now = Date.now()
  const events = Array.from({ length: 8 }, (_,i) => ({
    device_id: deviceId,
    metric: 'temp',
    value: 50 + jitter(30),
    ts: new Date(now + i*150).toISOString(),
    meta: { fw: '1.0.0' }
  }))
  const res = await fetch(endpoint, { method:'POST', headers: { 'content-type':'application/json', 'x-device-key': deviceKey }, body: JSON.stringify({ events }) })
  console.log('Sent batch', await res.json())
}

setInterval(sendBatch, 5000)
sendBatch()
