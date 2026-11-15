import { Ic } from './ui'
import { calc, fmt } from './lib'

export function Hero({ onStart }: { onStart: () => void }) {
  const r = calc(320, 3.97)
  const [ip, dp] = fmt(r.total, 2).split('.')
  const tot = r.rows.reduce((s, x) => s + x.k, 0)
  const d = (n: number) => ({ animationDelay: n + 's' })
  const appHref = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/app`
  return (
    <section className="hero">
      <div className="hh rise" style={d(0)}>
        <div className="hlogo"><span style={{ color: '#ff9f0a' }}><Ic n="bolt" s={26} w={2.2} /></span>Watt Wise</div>
      </div>
      <div className="hmain">
        <div className="hl rise" style={d(0.9)}>
          <p>ประมาณการค่าไฟบ้านของคุณในไม่กี่วินาที เช็กหน่วยจากมิเตอร์ วิเคราะห์เครื่องใช้ไฟฟ้า และวางแผนประหยัด พร้อมบันทึกข้อมูลอัตโนมัติ</p>
          <a href={appHref} className="hmore" onClick={e => { e.preventDefault(); onStart() }}>ลองใช้เลย →</a>
        </div>
        <div className="hc"><div className="hcirc pop" />
          <div className="hrot"><div className="hph fl"><div className="bz"><div className="mps"><div className="mi" />
            <div className="mlt">ค่าไฟ</div><div className="mcap">ประมาณการต่อเดือน</div><div className="mbig">฿{ip}<small>.{dp}</small></div>
            <div className="mbar">{r.rows.map((x, i) => <i key={i} style={{ flex: x.k / tot, background: `color-mix(in srgb,#0a84ff ${30 + i * 14}%,#d8d8de)` }} />)}</div>
            <div className="mgrp"><div><span>แอร์</span><b>52%</b></div><div><span>ตู้เย็น</span><b>18%</b></div><div><span>ทีวี</span><b>9%</b></div></div>
            <div className="mdock"><div className="morb"><Ic n="calc" s={26} w={2.2} /></div></div>
          </div></div></div></div>
        </div>
        <div className="hr rise" style={d(1.1)}><h1>WATT<br />WISE</h1></div>
      </div>
      <footer className="hf rise" style={d(1.2)}>
        <div className="hs">{['github', 'mail', 'globe'].map(i => <a key={i} href="#" onClick={e => e.preventDefault()} aria-label={i}><Ic n={i} s={22} /></a>)}</div>
        <div>ประเทศไทย · อัตราค่าไฟบ้านอยู่อาศัย</div>
      </footer>
    </section>
  )
}
