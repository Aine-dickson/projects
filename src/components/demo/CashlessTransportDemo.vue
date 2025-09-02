<template>
  <div class="space-y-5 text-xs">
    <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">Prototype cashless transport workflow: passenger wallet top‑up & trip lifecycle, driver boarding validation, offline queue replay, and operator revenue analytics (all simulated locally).</p>
    <div class="flex flex-wrap gap-2 text-[11px]">
  <button v-for="t in tabs" :key="t" @click="tab = t as any" class="px-3 py-1 rounded border" :class="tab===t ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'">{{ t }}</button>
      <div class="ml-auto flex items-center gap-2">
        <label class="inline-flex items-center gap-1 cursor-pointer"><input type="checkbox" v-model="store.offline" class="accent-amber-600"><span :class="store.offline? 'text-amber-600':'text-neutral-500'">Offline</span></label>
        <button v-if="store.offline && store.pendingEvents.length" @click="store.processPending()" class="px-2 py-1 rounded bg-amber-600 text-white">Process ({{ store.pendingEvents.length }})</button>
      </div>
    </div>

    <!-- Passenger Portal -->
    <div v-if="tab==='Passenger'" class="space-y-4">
        <div class="flex flex-wrap items-end gap-3">
            <div>
                <label class="block text-[10px] uppercase tracking-wide mb-1">Passenger Name</label>
                <input v-model="passengerName" placeholder="e.g. Amina" class="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
            </div>
            <button @click="login()" class="px-3 py-2 rounded bg-emerald-600 text-white" :disabled="!passengerName.trim()">{{ store.authPassenger ? 'Switch' : 'Login' }}</button>
            <button v-if="store.authPassenger" @click="store.logoutPassenger()" class="px-3 py-2 rounded bg-neutral-200 dark:bg-neutral-800">Logout</button>
            <div class="ml-auto text-[11px]" v-if="store.authPassenger">
                <span class="font-semibold">Wallet:</span> UGX {{ store.authPassenger.wallet.toLocaleString() }}
            </div>
        </div>
        <div v-if="store.authPassenger" class="space-y-3">
            <div class="flex flex-wrap gap-2 items-end">
                <div>
                    <label class="block text-[10px] uppercase mb-1">Amount (UGX)</label>
                    <input type="number" v-model.number="topupAmount" class="w-32 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800" placeholder="Top-up" />
                </div>
                <div>
                    <label class="block text-[10px] uppercase mb-1">Provider</label>
                    <select v-model="provider" class="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                    <option>MTN Momo</option>
                    <option>Airtel Money</option>
                    <option>MockCard</option>
                    </select>
                </div>
                <div v-if="feePreview" class="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Fee {{ feePreview.fee }} → Credit <span class="font-semibold">{{ feePreview.credited }}</span>
                </div>
                <button @click="doTopup" class="px-3 py-1.5 rounded bg-indigo-600 text-white" :disabled="topupAmount<=0">Top Up</button>
            </div>
            <div class="flex flex-wrap gap-3 items-end">
                <div>
                    <label class="block text-[10px] uppercase mb-1">Route</label>
                    <select v-model="route" class="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                    <option disabled value="">Select route</option>
                    <option v-for="r in store.routes" :key="r.name" :value="r.name">{{ r.name }}</option>
                    </select>
                </div>
                <div v-if="routeEstimate" class="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Est: UGX {{ routeEstimate.estimatedFare }} <span class="ml-1" :class="routeEstimate.surgeMultiplier>1? 'text-amber-600':''">(surge x{{ routeEstimate.surgeMultiplier }})</span>
                </div>
                <button @click="placeTrip" class="px-3 py-1.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" :disabled="!route || !!store.authPassenger?.activeTripId || !canAffordEstimate">Place Trip</button>
                <button v-if="placedOwnTrips.length" @click="cancelTrip(placedOwnTrips[0].id)" class="px-3 py-1.5 rounded bg-rose-600 text-white">Cancel</button>
                <button v-if="activeTrip" @click="endTrip(activeTrip.id)" class="px-3 py-1.5 rounded bg-rose-500 text-white">End Trip</button>
            </div>
            <p v-if="route && !canAffordEstimate" class="text-rose-600 text-[11px]">Insufficient balance for estimated fare.</p>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <h3 class="font-semibold mb-1">My Trips</h3>
                <table class="w-full text-[11px] border-separate border-spacing-y-1">
                    <thead class="text-neutral-500">
                    <tr>
                        <th class="text-left">Trip</th><th class="text-left">Route</th><th>Est</th><th>Fare</th><th>Status</th><th>Start</th><th>End</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="t in passengerTrips" :key="t.id" class="bg-white dark:bg-neutral-800">
                        <td class="px-2 py-1 font-mono">{{ t.id }}</td>
                        <td class="px-2 py-1">{{ t.route }}</td>
                        <td class="px-2 py-1 text-right">UGX {{ t.fareEstimate }}</td>
                        <td class="px-2 py-1 text-right">{{ t.fare? ('UGX '+t.fare) : '-' }}</td>
                        <td class="px-2 py-1">
                        <span :class="statusClass(t.status)" class="px-1.5 py-0.5 rounded">{{ t.status }}</span>
                        </td>
                        <td class="px-2 py-1">{{ formatTime(t.startTs) }}</td>
                        <td class="px-2 py-1">{{ t.endTs? formatTime(t.endTs): '-' }}</td>
                    </tr>
                    </tbody>
                </table>
                </div>
                <div>
                    <h3 class="font-semibold mb-1">Top-Ups</h3>
                    <table class="w-full text-[11px] border-separate border-spacing-y-1">
                    <thead class="text-neutral-500"><tr><th>Ts</th><th>Prov</th><th>Amt</th><th>Fee</th><th>Credited</th><th>Status</th></tr></thead>
                    <tbody>
                        <tr v-for="r in topUpHistory" :key="r.id" class="bg-white dark:bg-neutral-800">
                        <td class="px-2 py-1">{{ formatTime(r.ts) }}</td>
                        <td class="px-2 py-1">{{ r.provider }}</td>
                        <td class="px-2 py-1 text-right">{{ r.amountOriginal }}</td>
                        <td class="px-2 py-1 text-right">{{ r.fee }}</td>
                        <td class="px-2 py-1 text-right">{{ r.amountCredited }}</td>
                        <td class="px-2 py-1"><span :class="r.status==='failed' ? 'text-rose-600':'text-emerald-600'">{{ r.status }}</span></td>
                        </tr>
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
        <p v-else class="text-neutral-500">Login or create a passenger to begin.</p>
    </div>

    <!-- Driver/Conductor View -->
    <div v-else-if="tab==='Driver'" class="space-y-4">
      <p class="text-neutral-500">Placed trips awaiting assignment / start and active trips per vehicle.</p>
      <div class="p-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <h3 class="font-semibold text-[12px] mb-2">Unassigned Placed Trips ({{ store.placedTrips.length }})</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="t in store.placedTrips" :key="t.id" class="text-[11px] px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2">
            <span class="font-mono">{{ shortId(t.id) }}</span>
            <span>{{ t.route }}</span>
            <select v-model="assignVehicle[t.id]" class="px-1 py-0.5 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700">
              <option disabled value="">Vehicle</option>
              <option v-for="v in store.vehicles" :key="v.id" :value="v.id">{{ v.label }}</option>
            </select>
            <button @click="assign(t.id)" class="px-2 py-0.5 rounded bg-indigo-600 text-white" :disabled="!assignVehicle[t.id]">Assign</button>
            <button v-if="t.vehicleId" @click="startAssigned(t.id)" class="px-2 py-0.5 rounded bg-emerald-600 text-white">Start</button>
          </div>
          <p v-if="!store.placedTrips.length" class="text-neutral-400 text-[11px]">None</p>
        </div>
      </div>
      <div class="grid md:grid-cols-3 gap-4">
        <div v-for="veh in store.vehicles" :key="veh.id" class="p-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-2">
          <h3 class="font-semibold text-[12px] flex items-center justify-between">{{ veh.label }} <span class="text-[10px] text-neutral-400">{{ store.activeTripsForVehicle(veh.id).length }} active</span></h3>
          <ul class="space-y-1 max-h-36 overflow-auto pr-1">
            <li v-for="t in store.activeTripsForVehicle(veh.id)" :key="t.id" class="text-[11px] flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 rounded px-2 py-1">
              <span class="truncate">{{ t.route }} • {{ shortId(t.passengerId) }}</span>
              <button @click="endTrip(t.id)" class="text-rose-600 hover:underline">End</button>
            </li>
            <li v-if="!store.activeTripsForVehicle(veh.id).length" class="text-neutral-400 text-[11px]">No active trips</li>
          </ul>
          <p class="text-[11px] text-neutral-500">Trips must be placed then assigned.</p>
        </div>
      </div>
    </div>

    <!-- Admin / Operator -->
  <div v-else-if="tab==='Admin'" class="space-y-4">
      <div class="grid md:grid-cols-3 gap-4">
        <div class="p-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-2">
          <h3 class="font-semibold text-[12px]">KPIs</h3>
          <ul class="space-y-1">
            <li>Total Revenue: <strong>UGX {{ store.totalRevenue.toLocaleString() }}</strong></li>
      <li>Provider Fees: <strong>UGX {{ store.totalProviderFees.toLocaleString() }}</strong></li>
            <li>Completed Trips: <strong>{{ store.tripsCompleted }}</strong></li>
            <li>Avg Fare: <strong>UGX {{ Math.round(store.avgFare) }}</strong></li>
            <li>Pending Events: <strong>{{ store.pendingEvents.length }}</strong></li>
          </ul>
        </div>
        <div class="p-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-2">
          <h3 class="font-semibold text-[12px]">Route Revenue</h3>
          <ul class="space-y-1 max-h-40 overflow-auto pr-1">
            <li v-for="r in store.routeRevenue" :key="r.route" class="flex justify-between"><span>{{ r.route }}</span><span class="font-mono">UGX {{ r.revenue }}</span></li>
            <li v-if="!store.routeRevenue.length" class="text-neutral-400">No data</li>
          </ul>
        </div>
        <div class="p-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-2">
          <h3 class="font-semibold text-[12px]">Provider Stats</h3>
          <ul class="space-y-1 max-h-40 overflow-auto pr-1">
            <li v-for="p in store.providerStats" :key="p.provider" class="flex justify-between"><span>{{ p.provider }}</span><span class="font-mono">{{ p.count }} • UGX {{ p.volume }}</span></li>
            <li v-if="!store.providerStats.length" class="text-neutral-400">No data</li>
          </ul>
        </div>
        <div class="p-3 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-2">
          <h3 class="font-semibold text-[12px]">Trips / Hour</h3>
          <div class="grid grid-cols-6 gap-1 text-[9px]">
            <div v-for="(v,i) in store.hourBuckets" :key="i" class="h-8 flex flex-col justify-end"><div :style="{height: Math.min(100, v*10)+'%' }" class="w-full bg-emerald-500/70 rounded"></div><span class="text-center mt-0.5 text-neutral-500">{{ i }}</span></div>
          </div>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="p-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-2">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-[12px]">Settlement Batches</h3>
            <button @click="store.settle()" class="ml-auto px-2 py-1 rounded bg-indigo-600 text-white text-[11px]">Run Settlement</button>
          </div>
          <table class="w-full text-[11px] border-separate border-spacing-y-1">
            <thead class="text-neutral-500">
              <tr><th class="text-left">Batch</th><th>Trips</th><th>Gross</th><th>Fees</th><th>Net</th><th>Ts</th></tr>
            </thead>
            <tbody>
              <tr v-for="s in store.settlements.slice(0,8)" :key="s.id" class="bg-white dark:bg-neutral-800">
                <td class="px-2 py-1 font-mono">{{ s.id }}</td>
                <td class="px-2 py-1 text-right">{{ s.trips }}</td>
                <td class="px-2 py-1 text-right">{{ s.gross }}</td>
                <td class="px-2 py-1 text-right">{{ s.providerFees }}</td>
                <td class="px-2 py-1 text-right">{{ s.net }}</td>
                <td class="px-2 py-1">{{ formatTime(s.ts) }}</td>
              </tr>
              <tr v-if="!store.settlements.length"><td colspan="6" class="text-center text-neutral-400 py-2">No settlements yet</td></tr>
            </tbody>
          </table>
        </div>
        <div class="p-3 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-2">
          <h3 class="font-semibold text-[12px]">Fare Components (Example)</h3>
          <p class="text-[11px] text-neutral-500">Estimates combine base fare * surge multiplier. Provider fee (1.5% approx) + fixed mobile money fee (1%) deducted at top-up time; per-trip provider fee applied at settlement.</p>
          <ul class="space-y-1">
            <li v-if="routeEstimate">Base: UGX {{ routeEstimate.baseFare }} • Surge x{{ routeEstimate.surgeMultiplier }} → Est UGX {{ routeEstimate.estimatedFare }}</li>
            <li>Provider fee (trip): ~1.5% of fare</li>
            <li>Top-up fee: 1% + 50 UGX base</li>
          </ul>
        </div>
      </div>
      <div>
        <h3 class="font-semibold mb-1">Recent Events ({{ store.events.length }})</h3>
        <ul class="space-y-1 max-h-48 overflow-auto pr-1 font-mono">
          <li v-for="e in store.events.slice(0,80)" :key="e.id" class="px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center gap-2">
            <span :class="e.status==='failed' ? 'text-rose-600' : e.status==='pending' ? 'text-amber-600' : 'text-emerald-600'">{{ e.type }}</span>
            <span class="text-neutral-500">{{ e.id }}</span>
            <span class="ml-auto text-neutral-400">{{ timeAgo(e.ts) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useTransportStore } from '@/stores/transport'
const store = useTransportStore()
const tabs = ['Passenger','Driver','Admin']
const tab = ref<'Passenger'|'Driver'|'Admin'>('Passenger')

// Passenger state
const passengerName = ref('')
const topupAmount = ref(5000)
const provider = ref('MTN Momo')
const feePreview = computed(()=> topupAmount.value>0 ? store.computeTopUpFees(provider.value, topupAmount.value) : null)
const route = ref('')
const routeEstimate = computed(()=> route.value ? store.routes.find(r=> r.name===route.value) ? store.fareEstimate(store.routes.find(r=> r.name===route.value)!) : null : null)
const canAffordEstimate = computed(()=> store.authPassenger && routeEstimate.value ? store.authPassenger.wallet >= routeEstimate.value.estimatedFare : false)
function login(){ if(passengerName.value.trim()) store.loginPassenger(passengerName.value.trim()) }
function doTopup(){ if(store.authPassenger) { store.topUp(store.authPassenger.id, topupAmount.value, provider.value); topupAmount.value = 5000 } }
const topUpHistory = computed(()=> store.topUps.filter(t=> store.authPassenger?.id === t.passengerId).slice(0,12))
function placeTrip(){ if(store.authPassenger && route.value){ store.placeTrip(store.authPassenger.id, route.value) } }
function cancelTrip(id:string){ store.cancelTrip(id) }
function endTrip(id:string){ store.endTrip(id) }
const activeTrip = computed(()=> store.authPassenger?.activeTripId ? store.trips.find(t=> t.id===store.authPassenger!.activeTripId) : null)
const passengerTrips = computed(()=> store.trips.filter(t=> t.passengerId===store.authPassenger?.id).slice(0,12))
const placedOwnTrips = computed(()=> store.trips.filter(t=> t.passengerId===store.authPassenger?.id && t.status==='placed'))

// Driver helpers
const assignVehicle = reactive<Record<string,string>>({})
function assign(id:string){ const veh = assignVehicle[id]; if(veh) store.assignTrip(id, veh) }
function startAssigned(id:string){ const veh = store.trips.find(t=> t.id===id)?.vehicleId || assignVehicle[id]; if(veh) store.startTrip(id, veh) }

// Formatting helpers
function formatTime(ts?:string){ if(!ts) return '-'; const d=new Date(ts); return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }
function statusClass(s:string){ return s==='completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : s==='failed'||s==='cancelled' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' : s==='placed' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' }
function timeAgo(ts:string){ const sec = (Date.now()-new Date(ts).getTime())/1000; if(sec<60) return Math.floor(sec)+'s'; if(sec<3600) return Math.floor(sec/60)+'m'; return Math.floor(sec/3600)+'h' }
function shortId(id:string){ return id.slice(0,6) }
</script>
