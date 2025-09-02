<template>
  <div class="space-y-3 text-xs">
    <p class="text-neutral-600 dark:text-neutral-400">Simulated collaborative note (random remote edits + cursors).</p>
    <div class="relative">
      <textarea v-model="text" class="w-full h-40 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 font-mono resize-none"></textarea>
      <div class="absolute inset-0 pointer-events-none">
        <div v-for="c in cursors" :key="c.id" :style="{ top: c.y+'%', left: c.x+'%' }" class="absolute translate-x-[-50%] -translate-y-1/2 flex items-center gap-1">
          <span class="w-2 h-2 rounded-full" :style="{ background: c.color }"></span>
          <span class="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded px-1 py-0.5">{{ c.id }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { usePersistedRef } from '@/composables/persistedState'
const text = usePersistedRef<string>({ key: 'demo:collab:text', defaultValue: 'Shared note content...' })
interface Cursor { id: string; x: number; y: number; color: string }
const cursors = usePersistedRef<Cursor[]>({ key: 'demo:collab:cursors', defaultValue: Array.from({length:3},(_,i)=>({id:'u'+(i+1),x:10+i*20,y:30+i*10,color:['#ec4899','#3b82f6','#10b981'][i]})) })
let t:any
onMounted(()=>{ t=setInterval(()=>{ cursors.value = cursors.value.map(c=>({...c,x:(c.x+Math.random()*10)%90,y:(c.y+Math.random()*15)%90})) },1200) })
onBeforeUnmount(()=> clearInterval(t))
</script>
