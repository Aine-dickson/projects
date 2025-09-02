import { ref, watch } from 'vue'
import type { Ref } from 'vue'

interface PersistOptions<T> {
  key: string
  defaultValue: T
  throttleMs?: number
  serialize?: (v: T) => string
  deserialize?: (raw: string) => T
}

export function usePersistedRef<T>(opts: PersistOptions<T>): Ref<T> {
  const {
    key,
    defaultValue,
    throttleMs = 250,
    serialize = (v: T) => JSON.stringify(v),
    deserialize = (raw: string) => JSON.parse(raw) as T,
  } = opts
  let initial = defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (raw) initial = deserialize(raw)
  } catch (_) { /* ignore parse issues */ }
  const r = ref(initial) as Ref<T>
  let t: number | undefined
  watch(r, (val) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => {
      try { localStorage.setItem(key, serialize(val)) } catch (_) { /* quota */ }
    }, throttleMs)
  }, { deep: true })
  return r
}
