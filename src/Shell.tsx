import { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Ic } from './ui'
import { Appliances, History, Home, Meter, Save } from './screens'
import { THEMES, Tab } from './lib'
import { Store, useStore } from './store'

type Lay = 'phone' | 'pad' | 'pc' | 'full'
type Dev = 'phone' | 'ipad' | 'pc'

const TABS: [Tab, string, string][] = [['appl', 'plug', 'เครื่องใช้'], ['meter', 'gauge', 'มิเตอร์'], ['save', 'leaf', 'ประหยัด'], ['hist', 'clock', 'ประวัติ']]
const VIEWS = { home: Home, appl: Appliances, meter: Meter, save: Save, hist: History }

/** The app itself: floating dock with a big raised calculate button. */
export function App({ st, lay }: { st: Store; lay: Lay }) {
  const View = VIEWS[st.tab]
  const mainRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ y: number; scrollTop: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const pt = lay === 'phone' ? 12 : lay === 'pad' ? 32 : lay === 'full' ? 'calc(env(safe-area-inset-top,0px) + 20px)' : 20
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [st.tab])
  const startScroll = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    if ((e.target as HTMLElement).closest('button,input,a,select,textarea,summary,details,[role="button"],[contenteditable="true"]')) return
    dragRef.current = { y: e.clientY, scrollTop: e.currentTarget.scrollTop, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.classList.add('drag-scroll')
  }
  const moveScroll = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dy = e.clientY - drag.y
    if (Math.abs(dy) > 4) drag.moved = true
    if (drag.moved) e.currentTarget.scrollTop = drag.scrollTop - dy
  }
  const stopScroll = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    if (drag.moved) {
      suppressClick.current = true
      window.setTimeout(() => { suppressClick.current = false }, 250)
    }
    dragRef.current = null
    e.currentTarget.classList.remove('drag-scroll')
  }
  const preventDraggedClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return
    e.preventDefault()
    e.stopPropagation()
    suppressClick.current = false
  }
  const dk = ([k, i, l]: [Tab, string, string]) => (
    <button key={k} className={'dk' + (st.tab === k ? ' on' : '')} onClick={() => st.up({ tab: k })} aria-label={l}>
      <Ic n={i} s={lay === 'pc' ? 22 : 28} /><span>{l}</span>
    </button>
  )
  const cta = (
    <button key="home" className={'dk cta' + (st.tab === 'home' ? ' on' : '')} onClick={() => st.up({ tab: 'home' })} aria-label="คำนวณ">
      <span className="orb"><Ic n="calc" s={40} w={2.2} /><span className="bolt"><Ic n="bolt" s={15} w={2} /></span></span>
      <span className="l">คำนวณ</span>
    </button>
  )
  const cls = 'app ' + (lay === 'pc' ? 'pc-l' : 'bot-l' + (lay === 'phone' ? ' phone-l' : lay === 'full' ? ' full-l' : '')) + (lay === 'phone' || lay === 'full' ? '' : ' wide')
  return (
    <div className={cls}>
      <div ref={mainRef} className="main" style={{ paddingTop: pt }} onPointerDown={startScroll} onPointerMove={moveScroll} onPointerUp={stopScroll} onPointerCancel={stopScroll} onClickCapture={preventDraggedClick}><View key={st.tab} st={st} /></div>
      <nav className="dock">
        {lay === 'pc' && <div className="logo"><span style={{ color: 'var(--a)' }}><Ic n="bolt" /></span>Watt Wise</div>}
        {lay === 'pc' ? [cta, ...TABS.map(dk)] : [...TABS.slice(0, 2).map(dk), cta, ...TABS.slice(2).map(dk)]}
      </nav>
    </div>
  )
}

const SB = ({ big }: { big?: boolean }) => (
  <div className="sb" style={big ? { height: 54, padding: '18px 34px 0', fontSize: 15 } : { height: 28, padding: '8px 26px', fontSize: 12 }}>
    <span>9:41</span><span>5G ▮▮▮</span>
  </div>
)
const Phone = ({ children, cls = '' }: { children?: ReactNode; cls?: string }) => (
  <div className={'phone ' + cls}><i className="btn b1" /><i className="btn b2" /><i className="btn b3" />
    <div className="bz"><div className="scr">{children}<div className="isl" /></div></div></div>
)

/** Pick the device up by its frame: it lifts, follows your finger/cursor in 3D, and springs back when released. */
function Holdable({ scale, children }: { scale: number; children: ReactNode }) {
  const rest = { x: 0, y: 0, rx: 0, ry: 0 }
  const [p, setP] = useState(rest)
  const [held, setHeld] = useState(false)
  const [o, setO] = useState<{ x: number; y: number } | null>(null)
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.scr')) return // hold the frame, not the screen
    e.currentTarget.setPointerCapture(e.pointerId)
    setO({ x: e.clientX, y: e.clientY }); setHeld(true)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5
    if (o) {
      const dx = (e.clientX - o.x) / scale, dy = (e.clientY - o.y) / scale
      setP({ x: dx, y: dy, rx: -ny * 14 - dy * 0.03, ry: nx * 14 + dx * 0.04 })
    } else setP({ ...rest, rx: -ny * 8, ry: nx * 8 })
  }
  const up = () => { setO(null); setHeld(false); setP(rest) }
  return (
    <div className={'hold' + (held ? ' held' : '')} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={() => { if (!o) setP(rest) }}>
      <div className="holdin" style={{
        transform: `translate3d(${p.x}px,${p.y}px,0) rotateX(${p.rx}deg) rotateY(${p.ry}deg) scale(${held ? 1.035 : 1})`,
        transition: held ? 'transform .06s linear' : 'transform .7s cubic-bezier(.3,1.5,.5,1)',
      }}>{children}</div>
    </div>
  )
}

function useViewport() {
  const [v, setV] = useState({ w: innerWidth, h: innerHeight })
  useEffect(() => { const f = () => setV({ w: innerWidth, h: innerHeight }); addEventListener('resize', f); return () => removeEventListener('resize', f) }, [])
  return v
}
const SIZE: Record<Dev, [number, number]> = { phone: [418, 874], ipad: [780, 1040], pc: [1240, 800] }

export function Demo({ onBack }: { onBack: () => void }) {
  const st = useStore()
  const [dev, setDev] = useState<Dev>('phone')
  const vp = useViewport()
  const accent = { '--a': THEMES[st.th] } as CSSProperties
  // on a real phone: the app fills the screen like a native app (no mock frame)
  if (vp.w <= 520) {
    return <section id="demo" className="app-page mobile-app-page" style={accent}><div className="mobile-app-tools"><button className="back-link" onClick={onBack}>กลับสู่หน้าหลัก</button></div><div className="full"><App st={st} lay="full" /></div></section>
  }

  const [w, h] = SIZE[dev]
  const s = Math.max(0.35, Math.min(1, (vp.w - 32) / w, (vp.h - 180) / h))
  const device = dev === 'phone'
    ? <Phone><SB big /><App st={st} lay="phone" /><div className="hi" /></Phone>
    : dev === 'ipad'
      ? <div className="pad"><div className="bz"><div className="scr"><SB /><App st={st} lay="pad" /></div></div></div>
      : <div className="win"><div className="bar"><b style={{ background: '#ff5f57' }} /><b style={{ background: '#febc2e' }} /><b style={{ background: '#28c840' }} /><div className="url">wattwise.app</div></div><div className="scr"><App st={st} lay="pc" /></div></div>
  const ghosts = dev === 'phone' && vp.w > 900
  return (
    <section className="stage app-page" id="demo" style={accent}>
      <button className="back-link" onClick={onBack}>← Watt Wise</button>
      <div className="dh">ลองใช้งานจริง</div>
      <div className="ds">เลือกอุปกรณ์ที่อยากลอง แล้วทดลองได้เลย</div>
      <div className="ctl">
        <div className="glass">{([['phone', 'phone', 'iPhone'], ['ipad', 'pad', 'iPad'], ['pc', 'monitor', 'Mac']] as [Dev, string, string][]).map(([k, i, l]) => (
          <button key={k} className={dev === k ? 'on' : ''} onClick={() => setDev(k)}><Ic n={i} s={16} />{l}</button>
        ))}</div>
        <div className="glass dots">{THEMES.map((c, i) => <i key={i} className={st.th === i ? 'on' : ''} style={{ background: c }} onClick={() => st.up({ th: i })} />)}</div>
        <div className={'sync ' + st.sync}><i />{st.sync === 'ok' ? 'บันทึกในเครื่องแล้ว' : 'กำลังบันทึก…'}</div>
      </div>
      <div className="fit" style={{ width: w * s, height: h * s }}>
        <div className="sc" style={{ width: w, height: h, transform: `scale(${s})` }}>
          {ghosts && <div className="ghost" style={{ left: -300, top: 40, transform: 'rotate(-6deg)' }}><Phone /></div>}
          {ghosts && <div className="ghost" style={{ left: 300, top: 70, transform: 'rotate(4deg)' }}><Phone /></div>}
          <div style={{ position: 'relative', zIndex: 5 }}><Holdable scale={s}>{device}</Holdable></div>
        </div>
      </div>
      <div className="hint">จับที่ขอบเครื่องเพื่อยกและเอียงได้ เหมือนถือเครื่องจริง</div>
    </section>
  )
}
