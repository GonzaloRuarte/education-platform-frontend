'use client'

/**
 * Variante de InformeMETAPage para la ruta
 * /dashboard/reportes/meta/escuela/[escuelaId]
 *
 * Idéntica al ReportEditPage pero lee el param `escuelaId` del URL.
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Spinner from '@/shared/components/Spinner'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import { useReporteMETA } from '@/mta_reports/hooks'
import type { I_BoxplotMETA, I_ItemMETA } from '@/mta_reports/hooks'

// Re-export the full page, swapping only the URL param name.
// All visual components live in ReportEditPage to avoid duplication;
// here we just wire up the correct param.

const C = {
  navyDeep: '#031148', navy: '#041552', blue: '#0b2280',
  accent: '#00a6e6', cardBlue: '#0071ce', barFill: '#1a3080', barHi: '#29b6f6',
  white: '#fff', off: '#f4f5f8', bdr: '#dde0e8',
  txt: '#041552', tb: '#333', tm: '#7a8399', red: '#e84c4c',
}
const F = "'Segoe UI',-apple-system,system-ui,sans-serif"

interface T_Bar { id: string; p: number }
interface T_D {
  col: string; miId: string
  mu: { mi: number; todos: number }
  p40: { mi: number; todos: number }
  pP:  { mi: number; todos: number }
  p45: { mi: number; todos: number }
  matCont: I_ItemMETA[]; matComp: I_ItemMETA[]
  bpMi: I_BoxplotMETA;   bpAll: I_BoxplotMETA
  lenComp: I_ItemMETA[]; lenCont: I_ItemMETA[]
  bpMiL: I_BoxplotMETA | null; bpAllL: I_BoxplotMETA | null
}
interface T_Filters {
  materia: string; anio: string; division: string; toma: string
  setMateria: (v: string) => void; setAnio: (v: string) => void
  setDivision: (v: string) => void; setToma: (v: string) => void
}

// Minimal inline atoms needed here (same logic as ReportEditPage)
function calcSemaforo(mi: number, todos: number) {
  const d = mi - todos
  if (d >= 5) return 'verde'; if (d >= -5) return 'amarillo'; return 'rojo'
}
const semColors: Record<string, { bg: string; fg: string; label: string }> = {
  verde:    { bg: '#e8f5e9', fg: '#4caf50', label: 'Por encima de lo esperado' },
  amarillo: { bg: '#fff8e1', fg: '#ff9800', label: 'Dentro de lo esperado'     },
  rojo:     { bg: '#ffebee', fg: '#f44336', label: 'Por debajo de lo esperado' },
}

function Badge({ v, dark }: { v: number | string; dark?: boolean }) {
  return <div style={{ background: dark ? C.navy : C.cardBlue, color: C.white, fontWeight: 800, fontSize: 24, borderRadius: 6, padding: '7px 16px', display: 'inline-block', minWidth: 62, textAlign: 'center' }}>{typeof v === 'number' && v > 1 ? `${v} %` : v}</div>
}
function Sel({ label, value, opts, set }: { label: string; value: string; opts: string[]; set: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 5 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={(e) => set(e.target.value)} style={{ width: '100%', padding: '8px 11px', borderRadius: 4, border: 'none', fontSize: 13, color: C.tb, background: C.white, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', paddingRight: 28 }}>
          {opts.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 9, color: C.tm }}>▼</div>
      </div>
    </div>
  )
}
function MetCol({ title, sub, mi, todos, showSemaforo }: { title: string; sub?: string; mi: number | string; todos: number | string; showSemaforo?: boolean }) {
  const semDot = showSemaforo && typeof mi === 'number' && mi > 1 && typeof todos === 'number'
    ? (() => { const s = calcSemaforo(mi, todos); const sc = semColors[s]; return <div title={sc.label} style={{ width: 14, height: 14, borderRadius: '50%', background: sc.fg, boxShadow: `0 0 6px ${sc.fg}88`, display: 'inline-block', marginBottom: 6 }} /> })()
    : null
  return (
    <div style={{ flex: 1, minWidth: 150, padding: '0 10px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 1, lineHeight: 1.3 }}>{title}</div>
      {sub && <div style={{ fontSize: 10, color: C.accent, marginBottom: 9, opacity: 0.8 }}>{sub}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-end' }}>
        <div><div style={{ fontSize: 10, color: C.tm, marginBottom: 3 }}>Mi colegio</div><Badge v={mi} /></div>
        <div><div style={{ fontSize: 10, color: C.tm, marginBottom: 3 }}>Todos los colegios</div><Badge v={todos} dark /></div>
        {semDot}
      </div>
    </div>
  )
}
function HBar({ label, mi, todos, w = 220 }: { label: string; mi: number; todos: number; w?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: C.tb, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
        <div style={{ height: 18, borderRadius: 2, background: C.accent, width: (mi / 100) * w, transition: 'width 0.5s' }} />
        <span style={{ fontSize: 11, fontWeight: 600 }}>{mi} %</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ height: 18, borderRadius: 2, background: C.barFill, width: (todos / 100) * w, transition: 'width 0.5s' }} />
        <span style={{ fontSize: 11, fontWeight: 600 }}>{todos} %</span>
      </div>
    </div>
  )
}
function Leg({ c, t }: { c: string; t: string }) {
  return <span style={{ fontSize: 11, marginRight: 14 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: c, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />{t}</span>
}
function BP({ d, w = 85, h = 260 }: { d: I_BoxplotMETA; w?: number; h?: number }) {
  const pad = 26, ch = h - pad * 2, y = (v: number) => pad + ch - (v / 100) * ch, cx = w / 2, bw = 34
  return (
    <svg width={w} height={h}>
      {[0, 20, 40, 60, 80, 100].map((v) => <g key={v}><line x1={14} y1={y(v)} x2={w - 2} y2={y(v)} stroke="#eaeaea" strokeWidth={0.5} /><text x={12} y={y(v) + 3} fontSize={8} fill={C.tm} textAnchor="end">{v}%</text></g>)}
      <line x1={cx} y1={y(d.max)} x2={cx} y2={y(d.q3)} stroke={C.accent} strokeWidth={1.5} />
      <line x1={cx} y1={y(d.q1)} x2={cx} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5} />
      <line x1={cx - 10} y1={y(d.max)} x2={cx + 10} y2={y(d.max)} stroke={C.accent} strokeWidth={1.5} />
      <line x1={cx - 10} y1={y(d.min)} x2={cx + 10} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5} />
      <rect x={cx - bw / 2} y={y(d.q3)} width={bw} height={y(d.q1) - y(d.q3)} fill={C.accent} stroke={C.barFill} strokeWidth={1.5} rx={1} opacity={0.85} />
      <line x1={cx - bw / 2} y1={y(d.md)} x2={cx + bw / 2} y2={y(d.md)} stroke={C.white} strokeWidth={2} />
      <circle cx={cx} cy={y(d.av)} r={3.5} fill="#7a8a60" stroke={C.white} strokeWidth={1} />
    </svg>
  )
}
function SemaforoRow({ items, title }: { items: I_ItemMETA[]; title: string }) {
  return (
    <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.bdr}`, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.txt, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => {
          const s = calcSemaforo(item.mi, item.t); const sc = semColors[s]
          return (
            <div key={item.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: sc.bg, border: `1px solid ${sc.fg}22` }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: sc.fg, boxShadow: `0 0 6px ${sc.fg}66`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13, color: C.txt }}>{item.n}</div><div style={{ fontSize: 11, color: C.tm }}>{sc.label}</div></div>
              <div style={{ textAlign: 'right', fontSize: 12 }}><span style={{ fontWeight: 700, color: sc.fg }}>{item.mi}%</span><span style={{ color: C.tm, margin: '0 4px' }}>vs</span><span style={{ color: C.tm }}>{item.t}%</span></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function AllSchoolsBarChart({ bars, miId }: { bars: T_Bar[]; miId: string }) {
  const vw = 700, vh = 260, padL = 8, padB = 28, padT = 22, padR = 6
  const bw = (vw - padL - padR) / bars.length
  const barH = (p: number) => ((vh - padT - padB) * p) / 100
  const by = (p: number) => vh - padB - barH(p)
  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ overflow: 'visible' }}>
      {[0, 20, 40, 60, 80, 100].map((v) => { const ly = vh - padB - ((vh - padT - padB) * v) / 100; return <line key={v} x1={padL} y1={ly} x2={vw - padR} y2={ly} stroke="#eee" strokeWidth={0.8} /> })}
      {bars.map((e, i) => { const x = padL + i * bw + bw * 0.1, bWidth = bw * 0.8, fill = e.id === miId ? C.barHi : C.barFill; return <g key={e.id}><rect x={x} y={by(e.p)} width={bWidth} height={barH(e.p)} fill={fill} rx={2} /><text x={x + bWidth / 2} y={by(e.p) - 3} fontSize={6} textAnchor="middle" fill={C.tb} fontWeight={600}>{e.p}%</text><text x={x + bWidth / 2} y={vh - padB + 12} fontSize={6} textAnchor="middle" fill={C.tm}>{e.id}</text></g> })}
    </svg>
  )
}

function Sidebar({ filters, showMateria = true }: { filters: T_Filters; showMateria?: boolean }) {
  const { materia, anio, division, toma, setMateria, setAnio, setDivision, setToma } = filters
  return (
    <div style={{ width: 185, minHeight: '100vh', flexShrink: 0, background: `linear-gradient(180deg,${C.navy} 0%,${C.blue} 100%)`, padding: '18px 13px', display: 'flex', flexDirection: 'column' }}>
      {showMateria && <Sel label="Materia" value={materia} opts={['Matemática', 'Prácticas del Lenguaje']} set={setMateria} />}
      <Sel label="Año" value={anio} opts={['3ro', '6to', '9no', '12mo']} set={setAnio} />
      <Sel label="División" value={division} opts={['Única', 'A', 'B']} set={setDivision} />
      <Sel label="Toma" value={toma} opts={['1-2022', '2-2022', '1-2023', '2-2023']} set={setToma} />
      <button onClick={() => { setMateria('Matemática'); setAnio('3ro'); setDivision('Única'); setToma('2-2023') }} style={{ marginTop: 4, padding: '9px 14px', borderRadius: 4, border: 'none', background: C.red, color: C.white, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Borrar Filtros</button>
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, display: 'flex', justifyContent: 'center' }}><LogoAustral width={120} height={30} /></div>
    </div>
  )
}
function MetricsRow({ D }: { D: T_D }) {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: C.white, borderRadius: 8, border: `1px solid ${C.bdr}`, padding: '16px 6px' }}>
      <MetCol title="Datos de la muestra" sub="Cantidad de alumnos participantes" mi={D.mu.mi} todos={D.mu.todos} />
      <div style={{ width: 1, background: C.bdr, margin: '0 3px' }} />
      <MetCol title="% de respuestas correctas" sub="40 ítems"   mi={D.p40.mi} todos={D.p40.todos} showSemaforo />
      <div style={{ width: 1, background: C.bdr, margin: '0 3px' }} />
      <MetCol title="% de respuestas correctas" sub="ítems PISA" mi={D.pP.mi}  todos={D.pP.todos}  showSemaforo />
      <div style={{ width: 1, background: C.bdr, margin: '0 3px' }} />
      <MetCol title="% de respuestas correctas" sub="45 ítems"   mi={D.p45.mi} todos={D.p45.todos} showSemaforo />
    </div>
  )
}

const PAGE_LABELS = ['Portada', 'Introducción', 'Matemática', 'Lenguaje', 'PISA', 'Divider', 'Res. Generales', 'Det. Matemática', 'Det. Lenguaje', 'Cierre']

function Nav({ pg, total, go }: { pg: number; total: number; go: (n: number) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(4,17,72,0.92)', backdropFilter: 'blur(8px)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <button onClick={() => go(Math.max(0, pg - 1))} disabled={pg === 0} style={{ background: 'none', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', opacity: pg === 0 ? 0.3 : 1, padding: '0 10px' }}>‹</button>
      {Array.from({ length: total }).map((_, i) => <div key={i} onClick={() => go(i)} title={PAGE_LABELS[i]} style={{ width: pg === i ? 28 : 8, height: 8, borderRadius: 4, cursor: 'pointer', background: pg === i ? C.accent : 'rgba(255,255,255,0.3)', transition: 'all 0.2s' }} />)}
      <button onClick={() => go(Math.min(total - 1, pg + 1))} disabled={pg === total - 1} style={{ background: 'none', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', opacity: pg === total - 1 ? 0.3 : 1, padding: '0 10px' }}>›</button>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginLeft: 12, minWidth: 80 }}>{pg + 1}/{total} — {PAGE_LABELS[pg] ?? ''}</span>
    </div>
  )
}

function InformeMETAEscuelaPageInner() {
  const params = useParams()
  const escuelaId = params?.escuelaId ? Number(params.escuelaId) : null

  const [pg, setPg]             = useState(0)
  const [materia, setMateria]   = useState('Matemática')
  const [anio, setAnio]         = useState('3ro')
  const [division, setDivision] = useState('Única')
  const [toma, setToma]         = useState('2-2023')

  const { data, loading, error } = useReporteMETA(escuelaId, { materia, anio, division, toma })

  const f: T_Filters = { materia, anio, division, toma, setMateria, setAnio, setDivision, setToma }

  if (!escuelaId) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: F, color: C.tm, fontSize: 15 }}>No se especificó una escuela.</div>
  }
  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 20, background: `linear-gradient(135deg,${C.navyDeep} 0%,${C.blue} 100%)` }}><Spinner /><div style={{ color: C.white, fontFamily: F, fontSize: 15 }}>Cargando informe...</div></div>
  }
  if (error || !data) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: F, color: C.red, fontSize: 15 }}>{error ?? 'No se pudo cargar el reporte.'}</div>
  }

  const D: T_D = {
    col: data.colegio, miId: data.por_colegio.miId,
    mu:  { mi: data.general.muestra.mi,  todos: data.general.muestra.todos },
    p40: { mi: data.general.pct40.mi,    todos: data.general.pct40.todos   },
    pP:  { mi: data.general.pctPISA.mi,  todos: data.general.pctPISA.todos },
    p45: { mi: data.general.pct45.mi,    todos: data.general.pct45.todos   },
    matCont: data.detalle.contenido, matComp: data.detalle.competencia,
    bpMi: data.detalle.boxplotMi, bpAll: data.detalle.boxplotTodos,
    lenComp: data.detalle.lenComp ?? [], lenCont: data.detalle.lenCont ?? [],
    bpMiL: data.detalle.boxplotMiLenguaje ?? null, bpAllL: data.detalle.boxplotTodosLenguaje ?? null,
  }
  const allBars: T_Bar[] = data.por_colegio.bars
  const total = 10

  const pages = [
    // P1 – Portada
    <div key={0} style={{ minHeight: '100vh', background: `linear-gradient(135deg,${C.navyDeep} 0%,${C.blue} 100%)`, color: C.white, fontFamily: F, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 30, left: 40 }}><LogoAustral width={120} height={30} /></div>
      <div style={{ position: 'relative', zIndex: 2, padding: '0 80px 90px' }}>
        <div style={{ marginBottom: 28 }}><Logo width={180} height={56} variant="white" /></div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>Segunda Toma 2023</div>
        <div style={{ fontSize: 22, marginTop: 12, opacity: 0.8 }}>{D.col}</div>
      </div>
    </div>,

    // P2 – Resultados generales (con sidebar)
    <div key={1} style={{ minHeight: '100vh', fontFamily: F, display: 'flex', background: C.off }}>
      <Sidebar filters={f} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.white, borderBottom: `1px solid ${C.bdr}`, padding: '14px 24px', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.txt, borderBottom: `3px solid ${C.accent}`, display: 'inline-block', paddingBottom: 4 }}>Resultados generales</h2>
            <div style={{ marginTop: 5, fontSize: 13 }}><span style={{ color: C.tm }}>Colegio:</span><span style={{ fontSize: 22, fontWeight: 700, color: C.txt, marginLeft: 10 }}>{D.col}</span></div>
          </div>
          <Logo width={80} height={26} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 40px' }}>
          <MetricsRow D={D} />
          <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.bdr}`, padding: '18px 18px 10px' }}>
            <div style={{ fontSize: 14, color: C.txt, marginBottom: 14, fontWeight: 500 }}>Porcentaje de respuesta correcta por colegios sobre los 40 ítems</div>
            <AllSchoolsBarChart bars={allBars} miId={D.miId} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}><Leg c={C.barHi} t="Mi colegio" /><Leg c={C.barFill} t="Todos los colegios" /></div>
          </div>
        </div>
      </div>
    </div>,

    // P3 – Detalle Matemática
    <div key={2} style={{ minHeight: '100vh', fontFamily: F, display: 'flex', background: C.off }}>
      <Sidebar filters={f} showMateria={false} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.white, borderBottom: `1px solid ${C.bdr}`, padding: '14px 24px', justifyContent: 'space-between' }}>
          <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.txt }}><span style={{ color: C.accent, textDecoration: 'underline' }}>Matemática</span><span style={{ color: C.tm, margin: '0 8px', fontWeight: 400 }}>&gt;</span>{D.col}</h2><div style={{ fontSize: 14, color: C.txt, marginTop: 4 }}>{f.anio} &gt; {f.division}</div></div>
          <Logo width={80} height={26} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 40px' }}>
          <SemaforoRow title="Semáforo por contenido" items={D.matCont} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 5 }}>Resultados por contenido</div>
              <div style={{ marginBottom: 12 }}><Leg c={C.accent} t="Mi colegio" /><Leg c={C.barFill} t="Todos los colegios" /></div>
              {D.matCont.map((c) => <HBar key={c.n} label={c.n} mi={c.mi} todos={c.t} />)}
            </div>
            <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 14, textAlign: 'center' }}>Distribución de calificaciones</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}><BP d={D.bpMi} /><div style={{ fontSize: 10, color: C.tm, marginTop: 4 }}>Mi colegio</div></div>
                <div style={{ textAlign: 'center' }}><BP d={D.bpAll} /><div style={{ fontSize: 10, color: C.tm, marginTop: 4 }}>Todos</div></div>
              </div>
            </div>
            <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 5 }}>Resultados por competencia</div>
              <div style={{ marginBottom: 12 }}><Leg c={C.accent} t="Mi colegio" /><Leg c={C.barFill} t="Todos los colegios" /></div>
              {D.matComp.map((c) => <HBar key={c.n} label={c.n} mi={c.mi} todos={c.t} />)}
            </div>
          </div>
        </div>
      </div>
    </div>,

    // P4 – Detalle Lenguaje
    <div key={3} style={{ minHeight: '100vh', fontFamily: F, display: 'flex', background: C.off }}>
      <Sidebar filters={f} showMateria={false} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.white, borderBottom: `1px solid ${C.bdr}`, padding: '14px 24px', justifyContent: 'space-between' }}>
          <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.txt }}><span style={{ color: C.accent, textDecoration: 'underline' }}>Prácticas del Lenguaje</span><span style={{ color: C.tm, margin: '0 8px', fontWeight: 400 }}>&gt;</span>{D.col}</h2><div style={{ fontSize: 14, color: C.txt, marginTop: 4 }}>{f.anio} &gt; {f.division}</div></div>
          <Logo width={80} height={26} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 40px' }}>
          {D.lenComp.length > 0 && <SemaforoRow title="Semáforo por competencia" items={D.lenComp} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 5 }}>Resultados por competencia</div>
              <div style={{ marginBottom: 12 }}><Leg c={C.accent} t="Mi colegio" /><Leg c={C.barFill} t="Todos los colegios" /></div>
              {D.lenComp.map((c) => <HBar key={c.n} label={c.n} mi={c.mi} todos={c.t} />)}
            </div>
            {D.bpMiL && D.bpAllL && (
              <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 14, textAlign: 'center' }}>Distribución de calificaciones</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'center' }}><BP d={D.bpMiL} /><div style={{ fontSize: 10, color: C.tm, marginTop: 4 }}>Mi colegio</div></div>
                  <div style={{ textAlign: 'center' }}><BP d={D.bpAllL} /><div style={{ fontSize: 10, color: C.tm, marginTop: 4 }}>Todos</div></div>
                </div>
              </div>
            )}
            <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 5 }}>Resultados por tipo de texto</div>
              <div style={{ marginBottom: 12 }}><Leg c={C.accent} t="Mi colegio" /><Leg c={C.barFill} t="Todos los colegios" /></div>
              {D.lenCont.map((c) => <HBar key={c.n} label={c.n} mi={c.mi} todos={c.t} />)}
            </div>
          </div>
        </div>
      </div>
    </div>,

    // Páginas estáticas restantes…
    ...Array.from({ length: total - 4 }, (_, i) => (
      <div key={4 + i} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg,${C.navyDeep} 0%,${C.blue} 100%)`, color: C.white, fontFamily: F, fontSize: 28, fontWeight: 700 }}>
        {PAGE_LABELS[4 + i] ?? `Página ${4 + i + 1}`}
      </div>
    )),
  ]

  return (
    <div style={{ paddingBottom: 50 }}>
      {pages[pg]}
      <Nav pg={pg} total={total} go={setPg} />
    </div>
  )
}

export default withAuth(InformeMETAEscuelaPageInner, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
