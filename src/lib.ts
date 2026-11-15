export type Ap = { id: number; ic: string; name: string; w: number; h: number; q: number; enabled?: boolean }
export type Hist = { m: string; u: number; b: number }
export type Tab = 'home' | 'appl' | 'meter' | 'save' | 'hist'
export type Src = 'appl' | 'meter' | 'manual'
export type Persist = {
  ft: number; src: Src; manual: number; target: number; th: number
  meter: { prev: number; cur: number; days: number }
  ap: Ap[]; hist: Hist[]
}
export type Tier = { from: number; to: number; k: number; r: number; c: number }

// อัตราค่าไฟบ้านอยู่อาศัย (ประมาณการ) 1.1.1 (<=150 หน่วย) และ 1.1.2 (>150 หน่วย)
const A: [number, number][] = [[15, 2.3488], [10, 2.9882], [10, 3.2405], [65, 3.6237], [50, 3.7171], [250, 4.2218], [1e9, 4.4217]]
const B: [number, number][] = [[150, 3.2484], [250, 4.2218], [1e9, 4.4217]]

export const fmt = (n: number, d = 2) =>
  n.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d })

export function calc(u: number, ft: number) {
  u = Math.max(0, u)
  const T = u <= 150 ? A : B
  let left = u, from = 0
  const rows: Tier[] = []
  for (const [n, r] of T) {
    if (left <= 0) break
    const k = Math.min(left, n)
    rows.push({ from: from + 1, to: from + k, k, r, c: k * r })
    from += k; left -= k
  }
  const en = rows.reduce((s, x) => s + x.c, 0)
  const sv = u <= 150 ? 8.19 : 24.62
  const f = u * ft
  const sub = en + sv + f
  const vat = sub * 0.07
  return { rows, en, sv, f, vat, total: sub + vat }
}

export function unitsFor(target: number, ft: number) {
  let lo = 0, hi = 3000
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2
    calc(m, ft).total > target ? (hi = m) : (lo = m)
  }
  return lo
}

export type Preset = [string, string, number, number, number]
export const PRESETS: Preset[] = [
  ['snow', 'แอร์ 12,000 BTU', 1100, 8, 1], ['fridge', 'ตู้เย็น', 90, 24, 1], ['monitor', 'ทีวี', 100, 5, 1],
  ['fan', 'พัดลม', 45, 6, 1], ['bulb', 'หลอด LED', 9, 5, 6], ['flame', 'เครื่องทำน้ำอุ่น', 3500, 0.3, 1],
  ['monitor', 'คอมพิวเตอร์', 200, 6, 1], ['washer', 'เครื่องซักผ้า', 500, 0.7, 1],
  ['flame', 'หม้อหุงข้าว', 700, 0.8, 1], ['flame', 'กาต้มน้ำ', 1500, 0.3, 1],
]
let nid = 10
export const bumpId = (n: number) => { nid = Math.max(nid, n) }
export const mk = (p: Preset): Ap => ({ id: nid++, ic: p[0], name: p[1], w: p[2], h: p[3], q: p[4] })
export const kwh = (a: Ap) => a.enabled === false ? 0 : (a.w * a.h * a.q * 30) / 1000
export const THEMES = ['#0a84ff', '#30d158', '#ff9f0a', '#ff375f', '#bf5af2', '#8e8e93']
