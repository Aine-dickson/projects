<template>
  <div class="space-y-5 text-xs">
    <p class="text-neutral-600 dark:text-neutral-400 max-w-prose">Mini fleet management prototype: simulated vehicle telemetry (location, fuel, engine temperature) with basic alerts and map visualization.</p>
    <div class="grid lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-5">
        <div class="h-72 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden relative z-10">
          <div ref="mapEl" class="absolute inset-0 z-10"></div>
          <div v-if="!mapReady" class="absolute inset-0 flex items-center justify-center text-neutral-500">Loading map…</div>
          <div class="absolute top-2 left-2 flex gap-2 flex-wrap z-20">
            <button @click="exportVehicles" class="px-2 py-0.5 rounded bg-white/80 dark:bg-neutral-800/80 text-[10px] border border-neutral-300 dark:border-neutral-600 backdrop-blur">Export Vehicles CSV</button>
            <button @click="exportAlerts" class="px-2 py-0.5 rounded bg-white/80 dark:bg-neutral-800/80 text-[10px] border border-neutral-300 dark:border-neutral-600 backdrop-blur">Export Alerts CSV</button>
          </div>
          <div class="absolute bottom-2 left-2 z-20 bg-white/80 dark:bg-neutral-800/80 backdrop-blur rounded p-2 border border-neutral-300 dark:border-neutral-600">
            <div class="text-[10px] font-semibold mb-1">Routes</div>
            <ul class="space-y-0.5 text-[10px] max-w-[160px]">
              <li v-for="(c,label) in routeLegend" :key="label" class="flex items-center gap-1"><span class="inline-block w-3 h-1 rounded" :style="{background:c}"></span>{{ label }}</li>
            </ul>
          </div>
        </div>
        <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-2">
          <div class="flex items-center gap-3 flex-wrap">
            <h3 class="font-semibold text-sm">Vehicles</h3>
            <div class="flex gap-2 text-[10px] items-center">
              <label class="flex items-center gap-1">Auto <input type="checkbox" v-model="auto" /></label>
              <button @click="step" class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">Tick</button>
              <button @click="reset" class="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Reset</button>
            </div>
            <div class="ml-auto flex gap-3 text-[10px] text-neutral-500">
              <span>Avg Fuel {{ store.avgFuel.toFixed(1) }}%</span>
              <span>Alerts {{ store.vehicleAlertCount }}</span>
              <span>Dist Σ {{ store.totalDistanceToday.toFixed(1) }}km</span>
            </div>
          </div>
          <div class="overflow-auto max-h-56 thin-scroll">
            <table class="w-full text-[11px]">
              <thead class="text-neutral-500">
                <tr class="text-left">
                  <th class="py-1 pr-2 font-medium">ID</th>
                  <th class="py-1 pr-2 font-medium">Driver</th>
                  <th class="py-1 pr-2 font-medium">Route</th>
                  <th class="py-1 pr-2 font-medium">Fuel</th>
                  <th class="py-1 pr-2 font-medium">Temp</th>
                  <th class="py-1 pr-2 font-medium">Updated</th>
                  <th class="py-1 pr-2 font-medium">ETA</th>
                  <th class="py-1 pr-2 font-medium">Alert</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in store.vehicles" :key="v.id" class="border-t border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40" @click="openDetail(v.id)">
                  <td class="py-1 pr-2 font-mono">{{ v.id }}</td>
                  <td class="py-1 pr-2">
                    <select v-model="v.driver" class="w-24 bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-1 py-0.5">
                      <option value="" disabled>Assign…</option>
                      <option v-for="d in store.drivers" :key="d" :value="d">{{ d }}</option>
                    </select>
                  </td>
                  <td class="py-1 pr-2">
                    <select v-model="v.route" class="w-32 bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-1 py-0.5" @click.stop>
                      <option value="">None</option>
                      <option v-for="r in store.allRouteNames()" :key="r" :value="r">{{ r }}</option>
                    </select>
                  </td>
                  <td class="py-1 pr-2">{{ v.fuel.toFixed(1) }}%</td>
                  <td class="py-1 pr-2" :class="v.engineTemp>store.config.engineTempHigh ? 'text-red-600 dark:text-red-400':''">{{ v.engineTemp.toFixed(1) }}°C</td>
                  <td class="py-1 pr-2">{{ timeAgo(v.lastUpdate) }}</td>
                  <td class="py-1 pr-2 whitespace-nowrap">
                    <span v-if="v.route">
                      <span v-if="routeStats(v.id).etaSeconds !== null">{{ prettyEta(routeStats(v.id).etaSeconds!) }}</span>
                      <span v-else class="text-neutral-400">—</span>
                    </span>
                    <span v-else class="text-neutral-400">—</span>
                  </td>
                  <td class="py-1 pr-2">
                    <span v-if="v.alert" :class="v.alert==='ENGINE' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300':'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'" class="px-2 py-0.5 rounded-full text-[10px] font-medium">{{ v.alert }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="space-y-5">
  <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-3">
          <h3 class="font-semibold text-sm">Alerts</h3>
          <ul class="space-y-1 max-h-40 overflow-auto thin-scroll">
            <li v-for="a in store.activeAlerts" :key="a.id" class="flex items-center gap-2 text-[11px]">
              <span class="font-mono text-neutral-400">{{ shortTime(a.ts) }}</span>
              <span class="font-semibold">{{ a.vehicleId }}</span>
              <span :class="a.type==='ENGINE' ? 'text-red-600 dark:text-red-400':'text-amber-600 dark:text-amber-400'">{{ a.message }}</span>
            </li>
          </ul>
        </div>
        <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-3">
          <h3 class="font-semibold text-sm">Config</h3>
          <div class="flex flex-col gap-2 text-[11px]">
            <label class="flex items-center gap-1">Vehicles <input type="number" min="1" max="20" v-model.number="store.config.vehicleCount" class="w-16 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" /></label>
            <label class="flex items-center gap-1">Engine High <input type="number" v-model.number="store.config.engineTempHigh" class="w-20 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" /></label>
            <label class="flex items-center gap-1">Fuel Warn <input type="number" v-model.number="store.config.minFuelWarn" class="w-20 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" /></label>
            <div class="flex items-center gap-1">
              <input v-model="newDriver" placeholder="New driver" class="flex-1 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" />
              <button @click="addDriver" class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">Add</button>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleDrawRoute" :class="['px-2 py-0.5 rounded text-[10px]', drawingRoute ? 'bg-emerald-600 text-white':'bg-neutral-200 dark:bg-neutral-800']">{{ drawingRoute? 'Finish Route':'Draw Route' }}</button>
              <input v-if="drawingRoute" v-model="newRouteName" placeholder="Route name" class="flex-1 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" />
            </div>
            <p v-if="drawingRoute" class="text-[10px] text-emerald-600">Click map to add points ({{ routeDraft.length }}). Enter a name, then Finish to save.</p>
            <p v-else class="text-[10px] text-neutral-500">Need a new path? Click Draw Route, map-click to trace, then Finish.</p>
          </div>
          <p class="text-[10px] text-neutral-500">Adjust thresholds & reinitialize to apply to all vehicles.</p>
          <button @click="reinit" class="px-3 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[11px] font-medium">Reinitialize</button>
        </div>
        <div class="p-4 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 space-y-3">
          <h3 class="font-semibold text-sm">Geofences</h3>
          <ul class="space-y-1 max-h-32 overflow-auto thin-scroll">
            <li v-for="g in store.geofences" :key="g.id" class="flex items-center gap-2 text-[11px]">
              <input v-model="g.name" class="px-1 py-0.5 w-24 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" />
              <input type="number" v-model.number="g.radiusM" class="w-20 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" />
              <button @click="removeGeofence(g.id)" class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">✕</button>
            </li>
          </ul>
          <div class="flex items-center gap-1 text-[11px]"><input v-model.number="newGeofenceRadius" type="number" class="w-20 px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent" /><button @click="addGeofence" class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">Add Fence</button></div>
          <p class="text-[10px] text-neutral-500">Click on map to add geofence center (radius meters).</p>
        </div>
      </div>
    </div>
  </div>
  <div v-if="detailVehicle" class="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/40 backdrop-blur-sm" @keydown.esc="closeDetail" @click.self="closeDetail">
    <div class="w-full max-w-lg rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 space-y-4 relative">
      <button @click="closeDetail" class="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200" aria-label="Close">✕</button>
      <h2 class="text-lg font-semibold flex items-center gap-2">{{ detailVehicle.id }} <span class="text-xs font-normal text-neutral-500">{{ detailVehicle.name }}</span></h2>
      <div class="grid grid-cols-2 gap-4 text-[11px]">
        <div class="space-y-1">
          <div><span class="text-neutral-500">Driver:</span> {{ detailVehicle.driver || '—' }}</div>
          <div><span class="text-neutral-500">Route:</span> {{ detailVehicle.route || '—' }}</div>
          <div><span class="text-neutral-500">Fuel:</span> {{ detailVehicle.fuel.toFixed(1) }}%</div>
          <div><span class="text-neutral-500">Engine:</span> {{ detailVehicle.engineTemp.toFixed(1) }}°C</div>
        </div>
        <div class="space-y-1">
          <div><span class="text-neutral-500">Odometer:</span> {{ detailVehicle.odometerKm.toFixed(1) }} km</div>
          <div><span class="text-neutral-500">Updated:</span> {{ timeAgo(detailVehicle.lastUpdate) }}</div>
          <div><span class="text-neutral-500">Alert:</span> <span v-if="detailVehicle.alert" :class="detailVehicle.alert==='ENGINE' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'">{{ detailVehicle.alert }}</span><span v-else>OK</span></div>
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="text-sm font-medium">Recent Path ({{ pathHistory.length }} pts)</h3>
        <Sparkline :values="pathHistoryLat" :width="220" :height="40" color="#6366f1" :show-area="true" />
        <Sparkline :values="pathHistoryLng" :width="220" :height="40" color="#10b981" :show-area="true" />
        <p class="text-[10px] text-neutral-500">Latitude / Longitude variation (not to scale).</p>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="closeDetail" class="px-3 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-[11px]">Close</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useFleetStore } from '@/stores/fleet'
import Sparkline from '@/components/ui/Sparkline.vue'
const store = useFleetStore()
const mapEl = ref<HTMLDivElement | null>(null)
let map: any
let markers: any[] = []
let polylines: any[] = []
let geofenceLayers: any[] = []
let routeDraftLayer: any | null = null
const drawingRoute = ref(false)
const routeDraft: [number,number][] = []
const newRouteName = ref('')
function applyClustering(L:any){
  if(store.vehicles.length < 25) return
  const grid: Record<string,{lat:number;lng:number;count:number}> = {}
  const size = 0.01
  store.vehicles.forEach(v=> { const key = Math.round(v.lat/size)+':'+Math.round(v.lng/size); const cell = grid[key] || (grid[key]={lat:0,lng:0,count:0}); cell.lat+=v.lat; cell.lng+=v.lng; cell.count++ })
  Object.values(grid).forEach(c=> { c.lat/=c.count; c.lng/=c.count; const div = L.divIcon({ className:'cluster-marker', html:`<div class='px-2 py-1 text-[10px] rounded-full bg-indigo-600 text-white border border-white shadow'>${c.count}</div>` }); L.marker([c.lat,c.lng], { icon:div }).addTo(map) })
}
const mapReady = ref(false)
const auto = ref(true)
let interval: any
const detailId = ref<string | null>(null)
const detailVehicle = computed(()=> store.vehicles.find(v=> v.id===detailId.value))
const pathHistory = computed(()=> detailId.value ? (store.history[detailId.value] || []) : [])
const pathHistoryLat = computed(()=> pathHistory.value.map(p=> p[0]))
const pathHistoryLng = computed(()=> pathHistory.value.map(p=> p[1]))
function routeStats(id:string){ return store.routeMetrics(id) }
function prettyEta(sec:number){ if(sec<60) return sec.toFixed(0)+'s'; const m=sec/60; if(m<60) return m.toFixed(0)+'m'; const h=m/60; return h.toFixed(1)+'h' }

function shortTime(iso: string){ return new Date(iso).toLocaleTimeString([], { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' }) }
function timeAgo(iso:string){ const diff=(Date.now()-new Date(iso).getTime())/1000; if(diff<60) return diff.toFixed(0)+'s'; const m=diff/60; if(m<60) return m.toFixed(0)+'m'; return (m/60).toFixed(1)+'h' }

async function ensureMap(){
  if(!mapEl.value) return
  try {
    const L = await import('leaflet')
    // Basic CSS injection if not already
    if(!document.getElementById('leaflet-css')){
      const link=document.createElement('link'); link.id='leaflet-css'; link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link)
    }
  map = L.map(mapEl.value).setView([store.vehicles[0]?.lat || 0.3476, store.vehicles[0]?.lng || 32.5825], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
    mapReady.value = true
    refreshMarkers(L)
  map.on('click', (e:any)=> { 
    lastClickLat.value = e.latlng.lat; lastClickLng.value = e.latlng.lng
    if(drawingRoute.value){
      routeDraft.push([e.latlng.lat, e.latlng.lng])
      if(routeDraftLayer){ routeDraftLayer.addLatLng(e.latlng) } else { routeDraftLayer = L.polyline(routeDraft, { color:'#0ea5e9', weight:3, dashArray:'4 3' }).addTo(map) }
    }
  })
  } catch(e){
    mapReady.value = false
  }
}

function refreshMarkers(L:any){
  if(!map) return
  markers.forEach(m=> m.remove())
  polylines.forEach(p=> p.remove())
  geofenceLayers.forEach(g=> g.remove())
  markers = store.vehicles.map(v=> {
    const icon = L.divIcon({ className:'vehicle-marker', html:`<div class='w-3 h-3 rounded-full ${v.alert? 'bg-red-500 animate-pulse':'bg-emerald-500'} border border-white shadow'></div>` })
    const m = L.marker([v.lat, v.lng], { icon })
    m.addTo(map).bindTooltip(`${v.id} ${v.alert? '⚠️':''}`)
    return m
  })
  const colorFor = (route:string|undefined, idx:number)=> route ? routeColor(route) : fallbackColors[idx % fallbackColors.length]
  polylines = store.vehicles.map((v,idx)=> {
    const pts = store.history[v.id]
    if(!pts || pts.length<2) return null
    const poly = L.polyline(pts, { color: colorFor(v.route, idx), weight:2, opacity:0.6 })
    poly.addTo(map)
    return poly
  }).filter(Boolean)
  // Geofences
  geofenceLayers = store.geofences.map(gf=> {
    const circle = L.circle([gf.lat, gf.lng], { radius: gf.radiusM, color:'#10b981', weight:1, opacity:0.6, fillOpacity:0.08 })
    circle.addTo(map)
    // crude drag: add a small marker at center
    const centerIcon = L.divIcon({ className:'geofence-center', html:"<div class='w-2 h-2 rounded-full bg-emerald-500 border border-white shadow'></div>" })
    const centerMarker = L.marker([gf.lat, gf.lng], { draggable:true, icon:centerIcon })
    centerMarker.addTo(map)
    centerMarker.on('drag', (e:any)=> {
      const latlng = e.target.getLatLng(); circle.setLatLng(latlng)
    })
    centerMarker.on('dragend', (e:any)=> {
      const latlng = e.target.getLatLng(); store.updateGeofenceCenter(gf.id, latlng.lat, latlng.lng)
    })
    // radius handle (placed east of center)
    const handleIcon = L.divIcon({ className:'geofence-handle', html:"<div class='w-2 h-2 rounded-full bg-white border border-emerald-600 shadow'></div>" })
    const handleMarker = L.marker(offsetPoint(gf.lat, gf.lng, gf.radiusM, 90), { draggable:true, icon:handleIcon })
    handleMarker.addTo(map)
    handleMarker.on('drag', (e:any)=> {
      const latlng = e.target.getLatLng();
      const r = haversineMeters(circle.getLatLng().lat, circle.getLatLng().lng, latlng.lat, latlng.lng)
      circle.setRadius(r)
    })
    handleMarker.on('dragend', (e:any)=> {
      const latlng = e.target.getLatLng();
      const r = haversineMeters(circle.getLatLng().lat, circle.getLatLng().lng, latlng.lat, latlng.lng)
      store.updateGeofenceRadius(gf.id, Math.round(r))
    })
    return [circle, centerMarker, handleMarker]
  }).flat()
  applyClustering(L)
}

function step(){ store.simulateStep(); if(map) import('leaflet').then(L=> refreshMarkers(L)) }
function reset(){ store.clear(); store.initIfEmpty(); if(map) import('leaflet').then(L=> refreshMarkers(L)) }
function reinit(){ reset() }

function openDetail(id:string){ detailId.value = id }
function closeDetail(){ detailId.value = null }

function exportVehicles(){ const csv = store.exportVehiclesCsv(); downloadCsv(`fleet-vehicles-${Date.now()}.csv`, csv) }
function exportAlerts(){ const csv = store.exportAlertsCsv(); downloadCsv(`fleet-alerts-${Date.now()}.csv`, csv) }
function downloadCsv(name:string, content:string){ const blob=new Blob([content],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url) }
// Driver & geofence additions
const newDriver = ref('')
function addDriver(){ if(newDriver.value.trim()){ store.addDriver(newDriver.value.trim()); newDriver.value='' } }
const lastClickLat = ref<number | null>(null)
const lastClickLng = ref<number | null>(null)
const newGeofenceRadius = ref(500)
function addGeofence(){ if(lastClickLat.value && lastClickLng.value){ store.addGeofence('Fence '+(store.geofences.length+1), lastClickLat.value, lastClickLng.value, newGeofenceRadius.value) ; import('leaflet').then(L=> refreshMarkers(L)) } }
function removeGeofence(id:string){ store.removeGeofence(id); import('leaflet').then(L=> refreshMarkers(L)) }
const fallbackColors = ['#6366f1','#f59e0b','#10b981','#ef4444','#0ea5e9','#8b5cf6']
function routeColor(route:string){ let hash=0; for (let i=0;i<route.length;i++) hash = ((hash<<5)-hash)+route.charCodeAt(i); const idx=Math.abs(hash)%fallbackColors.length; return fallbackColors[idx] }
const routeLegend = computed(()=> {
  const mapColors: Record<string,string> = {}
  store.vehicles.forEach((v,idx)=> { if(v.route){ mapColors[v.route] = routeColor(v.route) } })
  return mapColors
})
function haversineMeters(lat1:number, lon1:number, lat2:number, lon2:number){
  const R=6371000, toRad=(d:number)=> d*Math.PI/180
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1)
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}
// offset point by distance (m) and bearing (deg)
function offsetPoint(lat:number, lng:number, distM:number, bearingDeg:number):[number,number]{
  const R=6371000; const br = bearingDeg*Math.PI/180
  const latR=lat*Math.PI/180, lngR=lng*Math.PI/180
  const newLat = Math.asin(Math.sin(latR)*Math.cos(distM/R) + Math.cos(latR)*Math.sin(distM/R)*Math.cos(br))
  const newLng = lngR + Math.atan2(Math.sin(br)*Math.sin(distM/R)*Math.cos(latR), Math.cos(distM/R)-Math.sin(latR)*Math.sin(newLat))
  return [newLat*180/Math.PI, newLng*180/Math.PI]
}
function toggleDrawRoute(){
  if(!drawingRoute.value){ drawingRoute.value = true; routeDraft.length=0; newRouteName.value='' }
  else {
    if(newRouteName.value.trim() && routeDraft.length>1){ store.addCustomRoute(newRouteName.value.trim(), [...routeDraft]); import('leaflet').then(L=> { if(routeDraftLayer){ routeDraftLayer.remove(); routeDraftLayer=null } refreshMarkers(L) }) }
    else if(routeDraftLayer){ routeDraftLayer.remove(); routeDraftLayer=null }
    drawingRoute.value = false
  }
}
function debounce<F extends (...a:any[])=>void>(fn:F, ms:number){ let t:any; return (...args:any[])=>{ clearTimeout(t); t=setTimeout(()=> fn(...args), ms) } }
const debouncedRename = debounce((id:string, name:string)=> store.renameGeofence(id,name), 300)
const debouncedRadius = debounce((id:string, r:number)=> { if(!isNaN(r)) store.updateGeofenceRadius(id,r); import('leaflet').then(L=> refreshMarkers(L)) }, 300)
// clustering hooked within refreshMarkers (definition placed earlier)

onMounted(()=> {
  store.initIfEmpty()
  ensureMap()
  interval = setInterval(()=> { if(auto.value) step() }, 1500)
})
onBeforeUnmount(()=> clearInterval(interval))
watch(()=> store.config.vehicleCount, ()=> { reset() })
</script>
<style scoped>
.thin-scroll{ scrollbar-width: thin; }
/* Elevation fixes */
.vehicle-marker, .geofence-center, .geofence-handle { z-index: 400 !important; }
/* Leaflet container should sit under modals */
:deep(.leaflet-container){ z-index: 0; }
</style>
