import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Event types captured for offline-first queue processing
export type TransportEventType = 'TOP_UP' | 'PLACE_TRIP' | 'ASSIGN_TRIP' | 'START_TRIP' | 'END_TRIP' | 'CANCEL_TRIP' | 'SETTLE'
export interface TransportEvent {
  id: string
  type: TransportEventType
  payload: any
  ts: string
  status: 'pending' | 'processed' | 'failed'
  error?: string
}

export interface Passenger { id: string; name: string; wallet: number; created: string; activeTripId?: string }
export interface Vehicle { id: string; label: string }
export interface Trip { id: string; passengerId: string; vehicleId?: string; route: string; placedTs: string; startTs?: string; endTs?: string; fareEstimate: number; fare?: number; status: 'placed' | 'in_progress' | 'completed' | 'cancelled' | 'failed'; surgeMultiplier: number }
export interface Receipt { id: string; tripId: string; passengerId: string; route: string; fare: number; providerFee: number; net: number; ts: string }
export interface SettlementBatch { id: string; ts: string; trips: number; gross: number; providerFees: number; net: number }
export interface TopUpRecord { id: string; passengerId: string; provider: string; amountOriginal: number; fee: number; amountCredited: number; ts: string; status: 'success' | 'failed' }

interface RouteFare { name: string; baseFare: number; distanceKm: number }

export const useTransportStore = defineStore('transport', () => {
  // Core entities (persisted)
  const passengers = ref<Passenger[]>([])
  const vehicles = ref<Vehicle[]>([
    { id: 'veh-1', label: 'Bus 1' },
    { id: 'veh-2', label: 'Mini 2' },
    { id: 'veh-3', label: 'Taxi 3' }
  ])
  const routes = ref<RouteFare[]>([
    { name: 'Central Loop', baseFare: 1500, distanceKm: 5.2 },
    { name: 'Airport Express', baseFare: 8000, distanceKm: 42 },
    { name: 'Kampala – Suburb', baseFare: 2500, distanceKm: 12.5 },
    { name: 'Late Night', baseFare: 1800, distanceKm: 6.3 }
  ])
  const trips = ref<Trip[]>([])
  const receipts = ref<Receipt[]>([])
  const topUps = ref<TopUpRecord[]>([])
  const settlements = ref<SettlementBatch[]>([])
  const events = ref<TransportEvent[]>([])
  const offline = ref(false)
  const authPassengerId = ref<string | null>(null)

  // Derived / reports
  const totalRevenue = computed(() => receipts.value.reduce((a, r) => a + r.fare, 0))
  const totalProviderFees = computed(() => receipts.value.reduce((a, r) => a + r.providerFee, 0))
  const tripsCompleted = computed(() => trips.value.filter(t => t.status === 'completed').length)
  const avgFare = computed(() => {
    const n = receipts.value.length
    return n ? totalRevenue.value / n : 0
  })
  const routeRevenue = computed(() => {
    const map: Record<string, { revenue: number; trips: number }> = {}
    for (const r of receipts.value) {
      const m = map[r.route] || (map[r.route] = { revenue: 0, trips: 0 })
      m.revenue += r.fare
      m.trips++
    }
    return Object.entries(map).map(([route, v]) => ({ route, ...v })).sort((a, b) => b.revenue - a.revenue)
  })
  const hourBuckets = computed(() => {
    const arr = Array.from({ length: 24 }, () => 0)
    for (const t of trips.value) {
      if (t.endTs && t.status === 'completed') {
        const h = new Date(t.endTs).getHours()
        arr[h]++
      }
    }
    return arr
  })
  const pendingEvents = computed(() => events.value.filter(e => e.status === 'pending'))
  const authPassenger = computed(() => passengers.value.find(p => p.id === authPassengerId.value) || null)
  const activeTripsForVehicle = (vehicleId: string) => trips.value.filter(t => t.vehicleId === vehicleId && t.status === 'in_progress')
  const placedTrips = computed(() => trips.value.filter(t => t.status === 'placed'))
  const providerStats = computed(() => {
    const map: Record<string,{count:number;volume:number;fees:number}> = {}
    for(const t of topUps.value){
      const m = map[t.provider] || (map[t.provider]={count:0,volume:0,fees:0})
      if(t.status==='success'){ m.count++; m.volume += t.amountOriginal; m.fees += t.fee }
    }
    return Object.entries(map).map(([provider,v])=> ({ provider, ...v })).sort((a,b)=> b.volume - a.volume)
  })

  // Utilities
  function makeId(prefix: string) { return prefix + Math.random().toString(36).slice(2, 9) }

  function ensurePassenger(name: string) {
    const existing = passengers.value.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing
    const p: Passenger = { id: 'P' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name, wallet: 0, created: new Date().toISOString() }
    passengers.value.push(p)
    return p
  }
  function loginPassenger(name: string) { const p = ensurePassenger(name); authPassengerId.value = p.id }
  function logoutPassenger() { authPassengerId.value = null }

  // Event queue & processing
  function enqueue(type: TransportEventType, payload: any) {
    const ev: TransportEvent = { id: makeId('EV_'), type, payload, ts: new Date().toISOString(), status: offline.value ? 'pending' : 'processed' }
    events.value.unshift(ev)
    if (!offline.value) processEvent(ev)
  }

  function processEvent(ev: TransportEvent) {
    try {
      if (ev.type === 'TOP_UP') {
        const p = passengers.value.find(p => p.id === ev.payload.passengerId)
        // 5% simulated provider failure rate (only when online)
        const failed = !offline.value && Math.random()<0.05
        if (p && !failed) p.wallet += ev.payload.amountCredited
        topUps.value.unshift({ id: makeId('TU_'), passengerId: ev.payload.passengerId, provider: ev.payload.provider, amountOriginal: ev.payload.amountOriginal, fee: ev.payload.fee, amountCredited: ev.payload.amountCredited, ts: ev.ts, status: failed? 'failed':'success' })
        if(failed) throw new Error('Provider declined transaction')
      } else if (ev.type === 'PLACE_TRIP') {
        const p = passengers.value.find(p => p.id === ev.payload.passengerId)
        if (!p) throw new Error('Passenger missing')
        if (p.activeTripId) throw new Error('Passenger already in trip')
        const r = routes.value.find(r => r.name === ev.payload.route)
        if (!r) throw new Error('Route missing')
        const est = fareEstimate(r)
        if (p.wallet < est.estimatedFare) throw new Error('Insufficient balance for estimate')
        const trip: Trip = { id: makeId('T_'), passengerId: p.id, route: r.name, placedTs: ev.ts, fareEstimate: est.estimatedFare, status: 'placed', surgeMultiplier: est.surgeMultiplier }
        trips.value.unshift(trip)
      } else if (ev.type === 'ASSIGN_TRIP') {
        const trip = trips.value.find(t => t.id === ev.payload.tripId)
        if (!trip || trip.status !== 'placed') throw new Error('Trip not placeable')
        trip.vehicleId = ev.payload.vehicleId
      } else if (ev.type === 'START_TRIP') {
        const trip = trips.value.find(t => t.id === ev.payload.tripId)
        if (!trip || trip.status !== 'placed') throw new Error('Trip not ready')
        if (!trip.vehicleId) trip.vehicleId = ev.payload.vehicleId
        trip.startTs = ev.ts
        trip.status = 'in_progress'
        const p = passengers.value.find(p => p.id === trip.passengerId)
        if (p) p.activeTripId = trip.id
      } else if (ev.type === 'END_TRIP') {
        const trip = trips.value.find(t => t.id === ev.payload.tripId)
        if (!trip || (trip.status !== 'in_progress')) return
        const passenger = passengers.value.find(p => p.id === trip.passengerId)
        const r = routes.value.find(r => r.name === trip.route)
        const est = r ? fareEstimate(r, trip.surgeMultiplier) : { estimatedFare: 1000, surgeMultiplier: 1, baseFare: 1000 }
        if (!passenger) throw new Error('Passenger missing')
        // Deduct actual fare (could vary slightly)
        const finalFare = est.estimatedFare
        if (passenger.wallet < finalFare) {
          trip.status = 'failed'
          trip.endTs = new Date().toISOString()
        } else {
          passenger.wallet -= finalFare
          const providerFee = Math.round(finalFare * 0.015)
          const net = finalFare - providerFee
            trip.fare = finalFare
          trip.endTs = new Date().toISOString()
          trip.status = 'completed'
          passenger.activeTripId = undefined
          const receipt: Receipt = { id: makeId('R_'), tripId: trip.id, passengerId: trip.passengerId, route: trip.route, fare: finalFare, providerFee, net, ts: trip.endTs }
          receipts.value.unshift(receipt)
        }
      } else if (ev.type === 'CANCEL_TRIP') {
        const trip = trips.value.find(t => t.id === ev.payload.tripId)
        if (!trip || !(trip.status === 'placed' || trip.status === 'in_progress')) return
        trip.status = 'cancelled'
        trip.endTs = new Date().toISOString()
        const p = passengers.value.find(p => p.id === trip.passengerId)
        if (p && p.activeTripId === trip.id) p.activeTripId = undefined
      } else if (ev.type === 'SETTLE') {
        // Aggregate un-settled receipts since last settlement
        const since = settlements.value[0]?.ts
        const newReceipts = receipts.value.filter(r => (since ? r.ts > since : true))
        if (!newReceipts.length) return
        const gross = newReceipts.reduce((a, r) => a + r.fare, 0)
        const fees = newReceipts.reduce((a, r) => a + r.providerFee, 0)
        settlements.value.unshift({ id: makeId('SB_'), ts: ev.ts, trips: newReceipts.length, gross, providerFees: fees, net: gross - fees })
      }
      ev.status = 'processed'
    } catch (e: any) {
      ev.status = 'failed'
      ev.error = e?.message || 'error'
    }
  }

  function processPending() { for (const ev of events.value.slice().reverse()) if (ev.status === 'pending') processEvent(ev) }
  function toggleOffline() { offline.value = !offline.value; if (!offline.value) processPending() }

  // Fare calculation (simulate surge / distance weighting)
  function dynamicFare(r: RouteFare, fixedMultiplier?: number) {
    const hour = new Date().getHours()
    const surge = fixedMultiplier ?? (((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) ? 1.25 : 1)
    return { baseFare: r.baseFare, surgeMultiplier: surge, estimatedFare: Math.round(r.baseFare * surge) }
  }
  function fareEstimate(r: RouteFare, fixedMultiplier?: number){ return dynamicFare(r, fixedMultiplier) }

  // Public API wrappers
  // Provider fee models
  function computeTopUpFees(provider: string, amount:number){
    const models: Record<string,{percent:number; fixed:number}> = {
      'MTN Momo': { percent: 0.01, fixed: 50 },
      'Airtel Money': { percent: 0.008, fixed: 30 },
      'MockCard': { percent: 0.012, fixed: 0 }
    }
    const m = models[provider] || models['MTN Momo']
    const fee = Math.round(amount * m.percent) + m.fixed
    const credited = Math.max(0, amount - fee)
    return { fee, credited }
  }
  function topUp(passengerId: string, amount: number, provider: string) { const { fee, credited } = computeTopUpFees(provider, amount); enqueue('TOP_UP', { passengerId, amountOriginal: amount, fee, amountCredited: credited, provider }) }
  function placeTrip(passengerId: string, route: string) { enqueue('PLACE_TRIP', { passengerId, route }) }
  function assignTrip(tripId: string, vehicleId: string) { enqueue('ASSIGN_TRIP', { tripId, vehicleId }) }
  function startTrip(tripId: string, vehicleId: string) { enqueue('START_TRIP', { tripId, vehicleId }) }
  function endTrip(tripId: string) { enqueue('END_TRIP', { tripId }) }
  function cancelTrip(tripId: string) { enqueue('CANCEL_TRIP', { tripId }) }
  function settle() { enqueue('SETTLE', {}) }

  return { passengers, vehicles, routes, trips, receipts, settlements, topUps, events, offline, authPassengerId, authPassenger, totalRevenue, totalProviderFees, tripsCompleted, avgFare, routeRevenue, hourBuckets, pendingEvents, activeTripsForVehicle, placedTrips, providerStats, fareEstimate, computeTopUpFees, loginPassenger, logoutPassenger, topUp, placeTrip, assignTrip, startTrip, endTrip, cancelTrip, settle, toggleOffline, processPending }
}, { persist: { key: 'transport', paths: ['passengers', 'vehicles', 'routes', 'trips', 'receipts', 'events', 'settlements', 'topUps'] as any } as any })
