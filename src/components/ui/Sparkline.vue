<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" fill="none" stroke="currentColor" class="overflow-visible">
    <polyline v-if="points.length" :points="pointsAttr" :stroke="color" :stroke-width="strokeWidth" fill="none" stroke-linejoin="round" stroke-linecap="round" />
    <template v-if="showArea && points.length">
      <polygon :points="areaPoints" :fill="color" :opacity="0.15" />
    </template>
  </svg>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ values: number[]; width?: number; height?: number; color?: string; strokeWidth?: number; showArea?: boolean }>(), {
  width: 80,
  height: 24,
  color: 'currentColor',
  strokeWidth: 1.5,
  showArea: false
})
const points = computed(()=>{
  const v = props.values.slice(-50)
  if (!v.length) return [] as [number,number][]
  const min = Math.min(...v)
  const max = Math.max(...v)
  const range = max - min || 1
  return v.map((val,i)=> [ i*(props.width/(v.length-1 || 1)), props.height - ((val - min)/range)*props.height ]) as [number,number][]
})
const pointsAttr = computed(()=> points.value.map(p=> p.join(',')).join(' '))
const areaPoints = computed(()=> {
  if (!points.value.length) return ''
  return pointsAttr.value + ` ${props.width},${props.height} 0,${props.height}`
})
</script>
<style scoped>
svg { display:block }
</style>
