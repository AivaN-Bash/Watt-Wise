import { useEffect, useRef, useState } from 'react'
import { PRESETS, Persist, Tab, bumpId, calc, kwh, mk } from './lib'

/** Swap this for Supabase / Firebase / your API: just implement load() and save(). */
export interface Storage {
  load(): Promise<Partial<Persist> | null>
  save(d: Persist): Promise<void>
}
const KEY = 'watt-wise:v1'
export const localStorageAdapter: Storage = {
  async load() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null } catch { return null } },
  async save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* ignore */ } },
}

type State = Persist & { tab: Tab }

export function useStore(storage: Storage = localStorageAdapter) {
  const [s, S] = useState<State>(() => ({
    tab: 'home', th: 0, ft: 3.97, src: 'appl', manual: 300, target: 1000, hist: [],
    meter: { prev: 12450, cur: 12700, days: 30 }, ap: PRESETS.slice(0, 7).map(mk),
  }))
  const [sync, setSync] = useState<'ok' | 's'>('s')
  const loaded = useRef(false)
  const up = (p: Partial<State>) => S(o => ({ ...o, ...p }))

  useEffect(() => {
    storage.load().then(d => {
      if (d) { if (d.ap?.length) bumpId(Math.max(...d.ap.map(a => a.id)) + 1); S(o => ({ ...o, ...d })) }
      loaded.current = true; setSync('ok')
    })
  }, [])

  useEffect(() => {
    if (!loaded.current) return
    setSync('s')
    const t = setTimeout(async () => { const { tab, ...d } = s; await storage.save(d); setSync('ok') }, 500)
    return () => clearTimeout(t)
  }, [s])

  const applU = s.ap.reduce((t, a) => t + kwh(a), 0)
  const meterU = (Math.max(0, s.meter.cur - s.meter.prev) / Math.max(1, s.meter.days)) * 30
  const U = s.src === 'appl' ? applU : s.src === 'meter' ? meterU : s.manual
  return { ...s, up, sync, applU, meterU, U, r: calc(U, s.ft) }
}
export type Store = ReturnType<typeof useStore>
