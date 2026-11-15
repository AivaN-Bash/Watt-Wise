import { ReactNode, useEffect, useRef, useState } from 'react'

const P: Record<string, string> = {
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z', home: 'M3 11l9-8 9 8v10H3zM9 21v-6h6v6',
  plug: 'M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5', gauge: 'M4 16a8 8 0 1 1 16 0M12 16l4-5',
  leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19c3-5 6-7 9-8', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  snow: 'M12 2v20M4.5 7l15 10M19.5 7l-15 10', fridge: 'M6 2h12v20H6zM6 10h12M9 5v2M9 13v3',
  monitor: 'M3 4h18v12H3zM8 21h8M12 16v5',
  fan: 'M12 12c0-5 2-8 5-8 0 3-1 6-5 8zM12 12c5 0 8 2 8 5-3 0-6-1-8-5zM12 12c0 5-2 8-5 8 0-3 1-6 5-8zM12 12c-5 0-8-2-8-5 3 0 6 1 8 5z',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z',
  flame: 'M12 22c4 0 7-3 7-7 0-4-3-6-4-10-3 2-5 5-5 8-1-1-2-2-2-4-2 2-3 4-3 6 0 4 3 7 7 7z',
  washer: 'M5 2h14v20H5zM5 7h14M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  github: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  calc: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01',
  phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 19h2',
  pad: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 19h2',
}
const TC: Record<string, string> = { snow: '#0a84ff', fridge: '#30b0c7', monitor: '#5e5ce6', fan: '#34c759', bulb: '#ffb800', flame: '#ff9f0a', washer: '#af52de' }

export const Ic = ({ n, s = 22, w = 1.7 }: { n: string; s?: number; w?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={P[n]} /></svg>
)
export const Tile = ({ n }: { n: string }) => (
  <div className="tile" style={{ background: TC[n] }}><Ic n={n} s={18} w={2} /></div>
)
export function Seg<T extends string>({ items, v, set }: { items: [T, string][]; v: T; set: (k: T) => void }) {
  return <div className="sg">{items.map(([k, l]) => <button key={k} className={v === k ? 'on' : ''} onClick={() => set(k)}>{l}</button>)}</div>
}
export const Row = ({ k, sub, children }: { k: ReactNode; sub?: ReactNode; children?: ReactNode }) => (
  <div className="li"><div className="k">{k}{sub && <div className="sub">{sub}</div>}</div>{children}</div>
)
export function Num({ v, set, step = 1, id, ariaLabel }: { v: number; set: (n: number) => void; step?: number; id?: string; ariaLabel?: string }) {
  const [t, setT] = useState(String(v))
  useEffect(() => { if (parseFloat(t) !== v) setT(String(v)) }, [v])
  return (
    <input id={id} aria-label={ariaLabel} className="num" type="number" inputMode="decimal" min={0} step={step} value={t}
      onChange={e => { setT(e.target.value); const n = parseFloat(e.target.value); if (!isNaN(n)) set(Math.max(0, n)) }} />
  )
}
export function useTween(v: number) {
  const [x, setX] = useState(v)
  const r = useRef(v)
  useEffect(() => {
    const s = r.current, t0 = performance.now()
    let id = 0
    const f = (t: number) => {
      const p = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - p, 3)
      r.current = s + (v - s) * e; setX(r.current)
      if (p < 1) id = requestAnimationFrame(f)
    }
    id = requestAnimationFrame(f)
    return () => cancelAnimationFrame(id)
  }, [v])
  return x
}
