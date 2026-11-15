import { Num, Row, Tile, useTween } from './ui'
import { calc, fmt, kwh, mk, PRESETS, THEMES, unitsFor } from './lib'
import type { Store } from './store'

type P = { st: Store }

export function Home({ st }: P) {
  const { r, U, ft, src, up, manual, hist } = st
  const v = useTween(r.total)
  const [ip, dp] = fmt(v, 2).split('.')
  const mon = new Date().toISOString().slice(0, 7)
  const logIt = () => up({ hist: [...hist.filter(h => h.m !== mon), { m: mon, u: Math.round(U), b: Math.round(r.total) }].sort((a, b) => (a.m < b.m ? -1 : 1)).slice(-24) })
  return (
    <div className="view">
      <div className="lt">ประมาณค่าไฟ</div>
      <p className="intro">ไม่ต้องรู้สูตรค่าไฟ เลือกข้อมูลที่คุณมี แล้วเราช่วยคำนวณให้</p>
      <div className="grid2">
        <div>
          <section className="estimate-card" aria-live="polite">
            <div className="eyebrow">ค่าไฟโดยประมาณต่อเดือน</div>
            <div className="big">฿{ip}<small>.{dp}</small></div>
            <div className="estimate-meta">ประมาณ {fmt(U, 0)} หน่วย/เดือน · เฉลี่ย ฿{fmt(r.total / 30, 0)} ต่อวัน</div>
            <p className="estimate-note">{src === 'appl' ? 'เริ่มจากรายการเครื่องใช้ตัวอย่าง ปรับรายการให้ตรงกับบ้านก่อน' : 'รวมค่าบริการและภาษีแล้ว ยอดจริงอาจต่างจากนี้เล็กน้อย'}</p>
            <button className="save-link" onClick={logIt}>บันทึกยอดนี้ไว้ดูภายหลัง</button>
          </section>
          <div className="helper-card">
            <strong>ทำยอดให้ใกล้เคียงบ้านคุณ</strong>
            <p>แตะปุ่มด้านล่าง แล้วเอาเครื่องใช้ที่ไม่มีออกได้เลย เราใส่ค่าเริ่มต้นให้แล้ว</p>
            <button className="primary-action" onClick={() => up({ src: 'appl', tab: 'appl' })}>เริ่มจากเครื่องใช้ในบ้าน <span aria-hidden="true">→</span></button>
          </div>
          <details className="other-methods"><summary>อยากใส่เลขจากบิลหรือมิเตอร์เอง?</summary>
          <button className="secondary-action" onClick={() => up({ src: 'meter', tab: 'meter' })}>ฉันมีเลขมิเตอร์</button>
          <button className="secondary-action" onClick={() => up({ src: 'manual' })}>ฉันรู้จำนวนหน่วยต่อเดือน</button>
          {src === 'manual' && <div className="helper-card">
            <label className="field-label" htmlFor="monthly-units">ใช้ไฟกี่หน่วยในหนึ่งเดือน?</label>
            <p>ถ้ามีบิล ดูบรรทัด “จำนวนหน่วย” หรือ “kWh”</p>
            <div className="unit-input"><Num id="monthly-units" ariaLabel="จำนวนหน่วยที่ใช้ต่อเดือน" v={manual} set={x => up({ manual: x })} /><span>หน่วย/เดือน</span></div>
          </div>}
          </details>
        </div>
        <div className="extra-column">
          <details className="disclosure">
            <summary>อยากดูหรือปรับรายละเอียดค่าไฟ?</summary>
            <p className="disclosure-copy">คำนวณจากจำนวนหน่วยที่ใช้ รวมค่าไฟตามขั้น ค่าบริการ ค่า Ft และภาษี 7% ใช้เป็นยอดประมาณการ</p>
            <div className="grp">
              {r.rows.map((x, i) => <Row key={i} k={`${fmt(x.from, 0)}–${fmt(x.to, 0)} หน่วย`} sub={`${fmt(x.k, 0)} หน่วย × ฿${fmt(x.r, 4)}`}><div>฿{fmt(x.c)}</div></Row>)}
              <Row k="ค่าบริการ"><div>฿{fmt(r.sv)}</div></Row>
              <Row k="ค่า Ft"><div>฿{fmt(r.f)}</div></Row>
              <Row k="ภาษี 7%"><div>฿{fmt(r.vat)}</div></Row>
              <Row k={<b>รวมประมาณ</b>}><div className="b">฿{fmt(r.total)}</div></Row>
            </div>
            <div className="grp settings-group"><Row k="ค่า Ft (บาท/หน่วย)" sub="ปรับได้ถ้าทราบจากบิล"><Num v={ft} step={0.01} set={x => up({ ft: x })} /></Row></div>
          </details>
          <div className="mobile-theme-settings"><details className="theme-menu"><summary><span>เลือกสีของแอป</span><span className="theme-current"><i style={{ background: THEMES[st.th] }} />{['น้ำเงิน', 'เขียว', 'ส้ม', 'ชมพู', 'ม่วง', 'เทา'][st.th]}</span></summary><div className="theme-options">{THEMES.map((c, i) => <button key={c} aria-pressed={st.th === i} onClick={() => up({ th: i })}><i style={{ background: c }} /><span>{['น้ำเงิน', 'เขียว', 'ส้ม', 'ชมพู', 'ม่วง', 'เทา'][i]}</span>{st.th === i && <b aria-hidden="true">✓</b>}</button>)}</div></details></div>
        </div>
      </div>
    </div>
  )
}

export function Appliances({ st }: P) {
  const { ap, up, applU, ft } = st
  const tot = calc(applU, ft).total
  const set = (id: number, p: Partial<(typeof ap)[number]>) => up({ ap: ap.map(a => (a.id === id ? { ...a, ...p } : a)) })
  const sorted = [...ap].sort((a, b) => kwh(b) - kwh(a))
  return (
    <div className="view">
      <div className="lt">เครื่องใช้ในบ้าน</div>
      <p className="intro">เพิ่มของที่คุณมี แล้วเลือกเวลาใช้งานคร่าวๆ ได้เลย ค่ากำลังไฟมีค่าเริ่มต้นให้</p>
      <div className="grid2">
        <div>
          <div className="helper-card compact"><strong>รายการเริ่มต้นเป็นตัวอย่าง</strong><p>เอาของที่ไม่มีออก แล้วเพิ่มของที่มีจริงเพื่อให้ยอดใกล้เคียงขึ้น</p></div>
          <div className="gh section-heading">เพิ่มเครื่องใช้</div>
          <div className="preset-grid">
            {PRESETS.map((p, i) => <button key={i} className="preset-button" onClick={() => up({ ap: [...ap, mk(p)] })}><Tile n={p[0]} /><span>{p[1]}</span><b aria-hidden="true">+</b></button>)}
          </div>
          <div className="gh">เช็กเครื่องใช้ที่มี <span className="count">{ap.filter(a => a.enabled !== false).length} รายการที่รวมแล้ว</span></div>
          <p className="field-help">เอาเครื่องหมายออกเพื่อไม่นับเครื่องนั้น ยอดด้านบนจะเปลี่ยนตามทันที</p>
          {ap.length === 0 && <div className="empty-state">ยังไม่มีเครื่องใช้ เลือกจากรายการด้านบนเพื่อเริ่มคำนวณ</div>}
          {ap.map(a => {
            const k = kwh(a), c = applU ? (tot * k) / applU : 0
            return (
              <section className={'appliance-card' + (a.enabled === false ? ' unchecked' : '')} key={a.id}>
                <div className="appliance-heading"><input className="check-appliance" type="checkbox" checked={a.enabled !== false} aria-label={`รวม${a.name}ในการคำนวณ`} onChange={e => set(a.id, { enabled: e.target.checked })} /><Tile n={a.ic} /><input className="nm" aria-label="ชื่อเครื่องใช้ไฟฟ้า" value={a.name} onChange={e => set(a.id, { name: e.target.value })} /><button className="link" onClick={() => up({ ap: ap.filter(z => z.id !== a.id) })}>ลบ</button></div>
                <div className="appliance-controls"><label htmlFor={`hours-${a.id}`}>ใช้วันละกี่ชั่วโมง?</label><div className="unit-input"><Num id={`hours-${a.id}`} ariaLabel={`ชั่วโมงใช้งานต่อวัน: ${a.name}`} v={a.h} step={0.5} set={x => set(a.id, { h: Math.min(24, x) })} /><span>ชม./วัน</span></div></div>
                <div className="appliance-footer"><span>คิดเป็น {fmt(k, 1)} หน่วย/เดือน</span><strong>ประมาณ ฿{fmt(c, 0)}</strong></div>
                <details className="appliance-advanced"><summary>ปรับจำนวนหรือกำลังไฟ (ถ้าทราบ)</summary>
                  <Row k="จำนวนเครื่อง"><div className="stp"><button aria-label="ลดจำนวน" onClick={() => set(a.id, { q: Math.max(1, a.q - 1) })}>−</button><span>{a.q}</span><button aria-label="เพิ่มจำนวน" onClick={() => set(a.id, { q: a.q + 1 })}>+</button></div></Row>
                  <Row k="กำลังไฟ"><Num v={a.w} set={x => set(a.id, { w: x })} /><span className="field-suffix">วัตต์</span></Row>
                </details>
              </section>
            )
          })}
        </div>
        <aside className="extra-column">
          <div className="gh section-heading">สรุปการใช้ไฟ</div>
          <div className="grp">
            {sorted.map(a => <Row key={a.id} k={a.name}><div className="meter"><i style={{ width: (applU ? (kwh(a) / applU) * 100 : 0) + '%' }} /></div><div className="v percentage">{applU ? fmt((kwh(a) / applU) * 100, 0) : 0}%</div></Row>)}
            <Row k={<b>รวมต่อเดือน</b>}><div className="b">{fmt(applU, 0)} หน่วย</div></Row>
          </div>
          <div className="helper-card compact"><strong>ไม่แน่ใจว่าใช้กี่ชั่วโมง?</strong><p>ลองใส่เวลาโดยประมาณก่อน แก้ไขภายหลังได้ ยอดค่าไฟจะอัปเดตทันที</p></div>
          <button className="primary-action" onClick={() => up({ tab: 'home' })}>ดูค่าไฟโดยประมาณ <span aria-hidden="true">→</span></button>
        </aside>
      </div>
    </div>
  )
}

export function Meter({ st }: P) {
  const { meter: m, up, meterU, ft } = st
  const set = (p: Partial<typeof m>) => up({ meter: { ...m, ...p } })
  const used = Math.max(0, m.cur - m.prev)
  return (
    <div className="view"><div className="lt">คำนวณจากเลขมิเตอร์</div>
      <p className="intro">เลขมิเตอร์คือตัวเลขบนเครื่องวัดไฟ ใช้วิธีนี้ได้ถ้าคุณมีเลขอ่าน 2 ครั้ง</p>
      <div className="grid2"><div>
      <div className="estimate-card meter-result"><div className="eyebrow">ใช้ไฟไปแล้ว</div><div className="big">{fmt(used, 0)}<small> หน่วย</small></div><div className="estimate-meta">เฉลี่ย {fmt(used / Math.max(1, m.days), 1)} หน่วยต่อวัน</div></div>
      <div className="gh">กรอกเลขที่อ่านได้</div>
      <p className="field-help">ดูเลขครั้งก่อนและเลขล่าสุดจากบิล หรือจดเลขบนมิเตอร์คนละวัน</p>
      <div className="step-list">
        <div><span>1</span><p>กรอกเลขครั้งก่อน <small>ดูได้จากบิลรอบก่อน</small></p></div>
        <div><span>2</span><p>กรอกเลขล่าสุด <small>อ่านจากมิเตอร์ตอนนี้</small></p></div>
        <div><span>3</span><p>กรอกจำนวนวันที่ผ่านไป</p></div>
      </div>
      <div className="grp">
        <Row k="เลขครั้งก่อน"><Num v={m.prev} set={x => set({ prev: x })} /></Row>
        <Row k="เลขล่าสุด"><Num v={m.cur} set={x => set({ cur: x })} /></Row>
        <Row k="จำนวนวันที่ผ่านไป"><Num v={m.days} set={x => set({ days: Math.max(1, x) })} /></Row>
      </div>
    </div><div>
      <div className="gh section-heading">ประมาณการทั้งเดือน</div>
      <div className="grp">
        <Row k="คาดว่าใช้ไฟ"><div className="b">{fmt(meterU, 0)} หน่วย</div></Row>
        <Row k="ค่าไฟโดยประมาณ"><div className="b">฿{fmt(calc(meterU, ft).total)}</div></Row>
      </div>
      <button className="primary-action" onClick={() => up({ src: 'meter', tab: 'home' })}>ดูค่าไฟโดยประมาณ <span aria-hidden="true">→</span></button>
      <div className="helper-card compact"><strong>ไม่มีเลขมิเตอร์ก็ไม่เป็นไร</strong><p>กลับไปเลือกเครื่องใช้ในบ้านเพื่อประเมินแทน</p><button className="action-link" onClick={() => up({ src: 'appl', tab: 'home' })}>ใช้รายการเครื่องใช้ <span aria-hidden="true">→</span></button></div>
    </div></div></div>
  )
}

export function Save({ st }: P) {
  const { ap, U, ft, r, target, up } = st
  const need = unitsFor(target, ft), cut = Math.max(0, U - need)
  const tips = [...ap].filter(a => a.h < 24 && a.h >= 1 && kwh(a) > 0).sort((a, b) => kwh(b) - kwh(a)).slice(0, 4)
    .map(a => ({ ic: a.ic, t: `ลด ${a.name} ลง 1 ชม./วัน`, s: r.total - calc(U - (a.w * a.q * 30) / 1000, ft).total }))
  return (
    <div className="view"><div className="lt">แผนประหยัดค่าไฟ</div><p className="intro">ตั้งยอดที่อยากจ่าย แล้วดูวิธีลดค่าไฟจากเครื่องใช้ที่เลือกไว้</p><div className="grid2"><div>
      <section className="target-card">
        <div className="target-instructions"><strong>ตั้งงบค่าไฟต่อเดือน</strong><span>เลื่อนแถบให้ตรงกับยอดที่อยากจ่าย</span></div>
        <div className="target-value"><span>เป้าหมายของคุณ</span><strong>฿{fmt(target, 0)}</strong></div>
        <label className="target-slider"><input aria-label="ยอดค่าไฟเป้าหมายต่อเดือน" type="range" min={200} max={5000} step={50} value={target} onChange={e => up({ target: +e.target.value })} /><span><span>฿200</span><span>฿5,000</span></span></label>
      </section>
      <div className="gh target-summary-title">แผนของคุณ</div>
      <div className="grp">
        <Row k="ปัจจุบัน"><div>฿{fmt(r.total)}</div></Row>
        <Row k="ใช้ได้ไม่เกิน"><div className="b">{fmt(need, 0)} หน่วย</div></Row>
        <Row k="ต้องลดลง"><div className="save">{cut > 0 ? `${fmt(cut, 0)} หน่วย · ${fmt((cut / Math.max(U, 1)) * 100, 0)}%` : 'ถึงเป้าแล้ว'}</div></Row>
      </div>
    </div><div>
      <div className="gh" style={{ marginTop: 0 }}>2. ลองทำตามวิธีเหล่านี้</div>
      <div className="grp">
        {tips.map((t, i) => <div className="li" key={i}><Tile n={t.ic} /><div className="k">{t.t}</div><div className="save">−฿{fmt(t.s, 0)}</div></div>)}
        <Row k="ตั้งแอร์ 26°C และล้างแอร์ทุก 6 เดือน" /><Row k="เปลี่ยนเป็นหลอด LED และปิดไฟเมื่อไม่ใช้" /><Row k="ถอดปลั๊กอุปกรณ์ที่ไม่ใช้ ลดไฟแฝง" />
      </div>
    </div></div></div>
  )
}

export function History({ st }: P) {
  const { hist, up } = st
  const mx = Math.max(1, ...hist.map(h => h.b))
  return (
    <div className="view"><div className="lt">ยอดที่บันทึกไว้</div><p className="intro">เก็บยอดค่าไฟแต่ละเดือนไว้เทียบกัน ดูได้ว่าค่าไฟเพิ่มหรือลด</p>
      {hist.length === 0 ? <div className="helper-card"><strong>ยังไม่มีรายการที่บันทึก</strong><p>กลับไปหน้าค่าไฟ แล้วกด “บันทึกยอดเดือนนี้ไว้ดูภายหลัง”</p><button className="primary-action" onClick={() => up({ tab: 'home' })}>กลับไปหน้าค่าไฟ <span aria-hidden="true">→</span></button></div> : (
        <div>
          <div className="grp"><div className="bars">{hist.map(h => <div key={h.m}><span>฿{h.b}</span><i style={{ height: (h.b / mx) * 100 + '%' }} /><span>{h.m.slice(5)}</span></div>)}</div></div>
          <div className="gh">รายเดือน</div>
          <div className="grp">
            {[...hist].reverse().map(h => (
              <Row key={h.m} k={h.m} sub={`${h.u} หน่วย`}><div className="b">฿{fmt(h.b, 0)}</div><button className="link" onClick={() => up({ hist: hist.filter(z => z.m !== h.m) })}>ลบ</button></Row>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
