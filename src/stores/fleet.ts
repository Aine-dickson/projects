import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Vehicle {
  id: string
  name: string
  lat: number
  lng: number
  fuel: number // percentage
  engineTemp: number // C
  odometerKm: number
  lastUpdate: string
  alert?: 'MAINT' | 'ENGINE' | null
  driver?: string
  route?: string
}

export interface FleetConfig {
  vehicleCount: number
  autoSimulate: boolean
  engineTempHigh: number
  minFuelWarn: number
}

export const useFleetStore = defineStore('fleet', () => {
  const config = ref<FleetConfig>({ vehicleCount: 6, autoSimulate: true, engineTempHigh: 95, minFuelWarn: 12 })
  const vehicles = ref<Vehicle[]>([])
  const alerts = ref<{ id:string; vehicleId:string; type:string; message:string; ts:string }[]>([])
  const history = ref<Record<string, [number, number][]>>({})
  const geofences = ref<{ id:string; name:string; lat:number; lng:number; radiusM:number }[]>([
    { id: 'gf1', name: 'Depot', lat: 0.3476, lng: 32.5825, radiusM: 800 },
  ])
  const drivers = ref<string[]>(['Amina','Brian','Claire','David','Esther','Felix'])

  // Predefined routes
  const baseRoutes: Record<string, [number, number][]> = {
    'Kampala Loop': [
      [0.3476,32.5825],[0.3505,32.6000],[0.3350,32.6100],[0.3200,32.6000],[0.3260,32.5850],[0.3400,32.5750],[0.3476,32.5825]
    ],
    'Kampala–Entebbe': [
      [0.3476,32.5825],[0.3000,32.5600],[0.2500,32.5200],[0.1800,32.5000],[0.1000,32.4800],[0.0500,32.4600],[0.0400,32.4500]
    ],
    'Kampala–Jinja': [
      [0.3476,32.5825],[0.3600,32.6500],[0.3700,32.7200],[0.3800,32.8000],[0.3900,32.9000],[0.4200,33.0000]
    ],
    'Northern Bypass': [
      [0.3700,32.5500],[0.3650,32.5700],[0.3600,32.5900],[0.3550,32.6100],[0.3500,32.6300]
    ]
  }
  const customRoutes = ref<{ name:string; points:[number,number][] }[]>([])
  const routeProgress: Record<string,{seg:number; t:number}> = {}
  const speedMps: Record<string, number> = {}
  const routeLengths: Record<string, number> = {}

  function allRouteNames(){ return [...Object.keys(baseRoutes), ...customRoutes.value.map(r=> r.name)] }
  function getRoutePoints(name:string): [number,number][] | undefined { return baseRoutes[name] || customRoutes.value.find(r=> r.name===name)?.points }
  function addCustomRoute(name:string, points:[number,number][]) { if(!getRoutePoints(name)) customRoutes.value.push({ name, points }) }
  function removeCustomRoute(name:string){ const idx=customRoutes.value.findIndex(r=> r.name===name); if(idx>=0) customRoutes.value.splice(idx,1) }
  function computeRouteLength(name:string){
    if(routeLengths[name] != null) return routeLengths[name]
    const pts = getRoutePoints(name)
    if(!pts || pts.length<2) return routeLengths[name]=0
    let total=0
    for(let i=0;i<pts.length-1;i++) total += haversineMeters(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1])
    return routeLengths[name]=total
  }
  function routeMetrics(vehicleId:string){
    const v = vehicles.value.find(v=> v.id===vehicleId)
    if(!v || !v.route) return { distanceTraveledM:0,totalDistanceM:0,remainingM:0,etaSeconds:null as number|null }
    const pts = getRoutePoints(v.route)
    if(!pts) return { distanceTraveledM:0,totalDistanceM:0,remainingM:0,etaSeconds:null }
    const prog = routeProgress[v.id]
    const total = computeRouteLength(v.route)
    if(!prog || total===0) return { distanceTraveledM:0,totalDistanceM:total,remainingM:total,etaSeconds:null }
    let dist = 0
    for(let i=0;i<prog.seg;i++) dist += haversineMeters(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1])
    const a = pts[prog.seg]; const b = pts[(prog.seg+1)%pts.length]
    dist += haversineMeters(a[0],a[1],b[0],b[1]) * prog.t
    const remaining = Math.max(0, total - dist)
    const speed = speedMps[v.id] || 0
    const etaSeconds = speed>0.3 ? remaining / speed : null
    return { distanceTraveledM: dist, totalDistanceM: total, remainingM: remaining, etaSeconds }
  }

  function initIfEmpty(){
    if (!vehicles.value.length){
      const baseLat = 0.3476, baseLng = 32.5825
      for (let i=0;i<config.value.vehicleCount;i++){
        vehicles.value.push({
          id: 'V'+(i+1),
          name: 'Vehicle '+(i+1),
          lat: baseLat + (Math.random()-0.5)*0.02,
          lng: baseLng + (Math.random()-0.5)*0.02,
          fuel: 40 + Math.random()*50,
          engineTemp: 70 + Math.random()*10,
          odometerKm: 10_000 + Math.random()*5_000,
          lastUpdate: new Date().toISOString(),
          alert: null
        })
      }
    }
  }

  function simulateStep(){
    const now = Date.now()
    vehicles.value = vehicles.value.map(v => {
      const routePts = v.route && getRoutePoints(v.route)
      const moving = !!(routePts && routePts.length>1 && v.driver)
      let newLat = v.lat
      let newLng = v.lng
      if(moving){
        const state = routeProgress[v.id] || (routeProgress[v.id] = { seg:0, t:0 })
        const a = routePts![state.seg]
        const b = routePts![(state.seg+1)%routePts!.length]
        const step = 0.18 + Math.random()*0.08
        state.t += step * 0.1
        if(state.t >= 1){ state.t -= 1; state.seg = (state.seg+1)%routePts!.length }
        const a2 = routePts![state.seg]
        const b2 = routePts![(state.seg+1)%routePts!.length]
        newLat = a2[0] + (b2[0]-a2[0]) * state.t + (Math.random()-0.5)*0.0003
        newLng = a2[1] + (b2[1]-a2[1]) * state.t + (Math.random()-0.5)*0.0003
      }
      let engineTemp = v.engineTemp
      let fuel = v.fuel
      let odometerKm = v.odometerKm
      let alert: Vehicle['alert'] = null
      if(moving){
        const fuelUse = 0.02 + Math.random()*0.05
        const tempDelta = (Math.random()-0.5) * 1.5 + (Math.random()<0.05 ? 8 : 0)
        engineTemp = Math.max(60, engineTemp + tempDelta)
        fuel = Math.max(0, fuel - fuelUse)
        odometerKm = odometerKm + 0.2 + Math.random()*0.15
        if (engineTemp > config.value.engineTempHigh) alert = 'ENGINE'
        else if (fuel < config.value.minFuelWarn) alert = 'MAINT'
        if (alert){ pushAlert(v.id, alert, alert==='ENGINE' ? `High engine temp ${engineTemp.toFixed(1)}°C` : `Low fuel ${fuel.toFixed(1)}%`) }
      }
      // Speed estimate
      const prevTime = new Date(v.lastUpdate).getTime()
      const dt = (now - prevTime)/1000 || 1
      const distMoved = haversineMeters(v.lat, v.lng, newLat, newLng)
      const instSpeed = distMoved / dt
      speedMps[v.id] = speedMps[v.id] != null ? speedMps[v.id]*0.7 + instSpeed*0.3 : instSpeed
      if(moving){
        const h = history.value[v.id] || (history.value[v.id] = [])
        h.push([newLat, newLng])
        if (h.length > 120) h.splice(0, h.length - 120)
        for (const gf of geofences.value){
          const dist = haversineMeters(gf.lat, gf.lng, newLat, newLng)
          if (dist > gf.radiusM * 4 && Math.random()<0.005){
            pushAlert(v.id, 'GEOFENCE', `${v.id} far from ${gf.name} (${(dist/1000).toFixed(1)}km)`) 
          }
        }
      }
      return { ...v, lat: newLat, lng: newLng, fuel, engineTemp, odometerKm, lastUpdate: new Date(now).toISOString(), alert }
    })
  }

  function pushAlert(vehicleId: string, type: string, message: string){
    alerts.value.unshift({ id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), vehicleId, type, message, ts: new Date().toISOString() })
    if (alerts.value.length > 200) alerts.value.splice(200)
  }

  function assignRoute(id: string, route: string){ const v = vehicles.value.find(v=>v.id===id); if (v) v.route = route }
  function assignDriver(id: string, driver: string){ const v = vehicles.value.find(v=>v.id===id); if (v) v.driver = driver }

  const activeAlerts = computed(()=> alerts.value.slice(0,50))
  const vehicleAlertCount = computed(()=> vehicles.value.filter(v=>v.alert).length )
  const avgFuel = computed(()=> vehicles.value.length ? vehicles.value.reduce((a,v)=>a+v.fuel,0)/vehicles.value.length : 0)
  const totalDistanceToday = computed(()=> vehicles.value.reduce((a,v)=> a + (v.odometerKm % 50), 0))

  function clear(){ vehicles.value=[]; alerts.value=[]; history.value={} }

  function haversineMeters(lat1:number, lon1:number, lat2:number, lon2:number){
    const R=6371000, toRad = (d:number)=> d*Math.PI/180
    const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1)
    const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
    return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
  }

  function exportVehiclesCsv(){
    const header = ['id','driver','route','lat','lng','fuel','engineTemp','odometerKm','alert','lastUpdate']
    const rows = vehicles.value.map(v=> [v.id,v.driver||'',v.route||'',v.lat.toFixed(6),v.lng.toFixed(6),v.fuel.toFixed(1),v.engineTemp.toFixed(1),v.odometerKm.toFixed(1),v.alert||'',v.lastUpdate])
    return toCsv([header, ...rows])
  }
  function exportAlertsCsv(){
    const header = ['ts','vehicleId','type','message']
    const rows = alerts.value.slice(0,500).map(a=> [a.ts,a.vehicleId,a.type,a.message])
    return toCsv([header, ...rows])
  }
  function toCsv(rows: string[][]){ return rows.map(r=> r.map(f=> /[",\n]/.test(f)? '"'+f.replace(/"/g,'""')+'"' : f).join(',')).join('\n') }
  function addGeofence(name:string, lat:number, lng:number, radiusM:number){ geofences.value.push({ id: 'gf'+Date.now().toString(36), name, lat, lng, radiusM }) }
  function updateGeofenceRadius(id:string, radiusM:number){ const g=geofences.value.find(g=>g.id===id); if(g) g.radiusM = radiusM }
  function updateGeofenceCenter(id:string, lat:number, lng:number){ const g=geofences.value.find(g=>g.id===id); if(g){ g.lat=lat; g.lng=lng } }
  function renameGeofence(id:string, name:string){ const g=geofences.value.find(g=>g.id===id); if(g) g.name = name }
  function removeGeofence(id:string){ const idx=geofences.value.findIndex(g=>g.id===id); if(idx>=0) geofences.value.splice(idx,1) }
  function addDriver(name:string){ if(!drivers.value.includes(name)) drivers.value.push(name) }

  return { config, vehicles, alerts, history, geofences, drivers, customRoutes, activeAlerts, vehicleAlertCount, avgFuel, totalDistanceToday, initIfEmpty, simulateStep, assignDriver, assignRoute, clear, exportVehiclesCsv, exportAlertsCsv, addGeofence, updateGeofenceRadius, updateGeofenceCenter, renameGeofence, removeGeofence, addDriver, allRouteNames, addCustomRoute, removeCustomRoute, getRoutePoints, routeMetrics }
}, { persist: { key:'fleet', paths:['config','geofences','drivers','customRoutes'] as any } as any })
