'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import { useEscuelaReporteReact } from '@/mta_reports_v2/hooks'
import type { I_ReporteReactData, I_BoxplotReact } from '@/mta_reports_v2/hooks'

// ── Theme ─────────────────────────────────────────────────────────────────────
const C = {
  navy: '#041552', blue: '#0b2280',
  accent: '#00a6e6', barFill: '#1a3080', barMe: '#ff9800',
  white: '#fff', off: '#f4f5f8', bdr: '#dde0e8',
  txt: '#041552', tb: '#333', tm: '#7a8399',
  red: '#e84c4c', green: '#4caf50',
}
const F = "'Segoe UI',-apple-system,system-ui,sans-serif"

// ── Atoms ─────────────────────────────────────────────────────────────────────
function Badge({ v, dark }: { v: number | string; dark?: boolean }) {
  return (
    <div style={{
      background: dark ? C.navy : C.accent, color: C.white, fontWeight: 800, fontSize: 22,
      borderRadius: 6, padding: '6px 14px', display: 'inline-block', minWidth: 58, textAlign: 'center',
    }}>
      {typeof v === 'number' ? `${v}%` : v}
    </div>
  )
}

function Sel({ label, value, opts, set }: { label: string; value: string; opts: string[]; set: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => set(e.target.value)} style={{
          width: '100%', padding: '7px 10px', borderRadius: 4, border: 'none', fontSize: 13,
          color: C.tb, background: C.white, appearance: 'none', WebkitAppearance: 'none', paddingRight: 26, cursor: 'pointer',
        }}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 9, color: C.tm }}>▼</div>
      </div>
    </div>
  )
}

function Leg({ c, t }: { c: string; t: string }) {
  return (
    <span style={{ fontSize: 11, marginRight: 14 }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, background: c, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
      {t}
    </span>
  )
}

function HBar({ label, mi, todos, w = 200 }: { label: string; mi: number; todos: number; w?: number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: C.tb, marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <div style={{ height: 16, borderRadius: 2, background: C.accent, width: (mi / 100) * w }} />
        <span style={{ fontSize: 11, fontWeight: 600 }}>{mi}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ height: 16, borderRadius: 2, background: C.barFill, width: (todos / 100) * w }} />
        <span style={{ fontSize: 11, fontWeight: 600 }}>{todos}%</span>
      </div>
    </div>
  )
}

function BP({ d, w = 80, h = 240 }: { d: I_BoxplotReact; w?: number; h?: number }) {
  const pad = 24, ch = h - pad * 2
  const y = (v: number) => pad + ch - (v / 100) * ch
  const cx = w / 2, bw = 32
  return (
    <svg width={w} height={h}>
      {[0, 20, 40, 60, 80, 100].map(v => (
        <g key={v}>
          <line x1={14} y1={y(v)} x2={w - 2} y2={y(v)} stroke="#eaeaea" strokeWidth={0.5} />
          <text x={12} y={y(v) + 3} fontSize={7} fill={C.tm} textAnchor="end">{v}%</text>
        </g>
      ))}
      <line x1={cx} y1={y(d.max)} x2={cx} y2={y(d.q3)} stroke={C.accent} strokeWidth={1.5} />
      <line x1={cx} y1={y(d.q1)} x2={cx} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5} />
      <line x1={cx - 9} y1={y(d.max)} x2={cx + 9} y2={y(d.max)} stroke={C.accent} strokeWidth={1.5} />
      <line x1={cx - 9} y1={y(d.min)} x2={cx + 9} y2={y(d.min)} stroke={C.accent} strokeWidth={1.5} />
      <rect x={cx - bw / 2} y={y(d.q3)} width={bw} height={y(d.q1) - y(d.q3)} fill={C.accent} stroke={C.barFill} strokeWidth={1.5} rx={1} opacity={0.85} />
      <line x1={cx - bw / 2} y1={y(d.md)} x2={cx + bw / 2} y2={y(d.md)} stroke={C.white} strokeWidth={2} />
      <circle cx={cx} cy={y(d.av)} r={3} fill="#7a8a60" stroke={C.white} strokeWidth={1} />
    </svg>
  )
}

function SemDot({ diff }: { diff: number }) {
  const color = diff >= 5 ? C.green : diff >= -5 ? '#ff9800' : C.red
  const label = diff >= 5 ? 'Por encima del promedio' : diff >= -5 ? 'Dentro del promedio' : 'Por debajo del promedio'
  return <div title={label} style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block' }} />
}

// ── All-schools bar chart ─────────────────────────────────────────────────────
function AllSchoolsBarChart({ bars, miId }: { bars: { id: string; p: number }[]; miId: string }) {
  const sorted = [...bars].sort((a, b) => b.p - a.p)
  const prom = sorted.length
    ? Math.round(sorted.reduce((s, e) => s + e.p, 0) / sorted.length * 10) / 10
    : 0
  const n = sorted.length
  const vw = Math.max(400, n * 44 + 20), vh = 240
  const padL = 10, padB = 28, padT = 16, padR = 8
  const bw = (vw - padL - padR) / n
  const barH = (p: number) => ((vh - padT - padB) * p) / 100
  const by = (p: number) => vh - padB - barH(p)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ minWidth: Math.min(vw, 560), overflow: 'visible' }}>
        {[0, 20, 40, 60, 80, 100].map(v => {
          const lineY = vh - padB - ((vh - padT - padB) * v) / 100
          return (
            <g key={v}>
              <line x1={padL} y1={lineY} x2={vw - padR} y2={lineY} stroke="#eee" strokeWidth={0.8} />
              <text x={padL - 2} y={lineY + 3} fontSize={7} fill={C.tm} textAnchor="end">{v}%</text>
            </g>
          )
        })}
        {(() => {
          const lineY = vh - padB - ((vh - padT - padB) * prom) / 100
          return <line x1={padL} y1={lineY} x2={vw - padR} y2={lineY} stroke={C.red} strokeWidth={1} strokeDasharray="4 3" />
        })()}
        {sorted.map((e, i) => {
          const x = padL + i * bw + bw * 0.15
          const bWidth = bw * 0.7
          const isMe = e.id === miId
          const fill = isMe ? C.barMe : C.barFill
          return (
            <g key={e.id}>
              <rect x={x} y={by(e.p)} width={bWidth} height={barH(e.p)} fill={fill} rx={2} />
              <text x={x + bWidth / 2} y={by(e.p) - 3} fontSize={7} textAnchor="middle" fill={isMe ? '#c65000' : C.tb} fontWeight={isMe ? 800 : 600}>{e.p}%</text>
              <text x={x + bWidth / 2} y={vh - padB + 12} fontSize={7} textAnchor="middle" fill={isMe ? '#c65000' : C.tm} fontWeight={isMe ? 700 : 400}>{e.id}</text>
            </g>
          )
        })}
      </svg>
      <div style={{ fontSize: 11, color: C.tm, marginTop: 6 }}>
        <Leg c={C.barMe} t="Mi escuela" />
        <Leg c={C.barFill} t="Otras escuelas" />
        <span style={{ marginLeft: 4 }}>Promedio programa: <strong>{prom}%</strong></span>
      </div>
    </div>
  )
}

// ── Tab content ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'detalle', label: 'Contenido y competencia' },
]

function ResumenTab({ data }: { data: I_ReporteReactData }) {
  const g = data.general
  return (
    <>
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ background: C.navy, color: C.white, borderRadius: 8, padding: '16px 22px', flex: '0 0 auto' }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8 }}>Alumnos evaluados</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>Mi escuela</div><Badge v={String(g.muestra.mi)} /></div>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>Programa</div><Badge v={String(g.muestra.todos)} dark /></div>
          </div>
        </div>
        {([
          { label: '% correctas · 40 ítems', mi: g.pct40.mi, t: g.pct40.todos },
          { label: '% correctas · ítems PISA', mi: g.pctPISA.mi, t: g.pctPISA.todos },
          { label: '% correctas · 45 ítems', mi: g.pct45.mi, t: g.pct45.todos },
        ] as const).map(m => (
          <div key={m.label} style={{ background: C.white, borderRadius: 8, padding: '16px 18px', border: `1px solid ${C.bdr}`, flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 10 }}>{m.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div><div style={{ fontSize: 10, color: C.tm }}>Mi escuela</div><Badge v={m.mi} /></div>
                <div><div style={{ fontSize: 10, color: C.tm }}>Programa</div><Badge v={m.t} dark /></div>
              </div>
              <SemDot diff={m.mi - m.t} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.bdr}`, padding: '18px 18px 14px' }}>
        <div style={{ fontSize: 14, color: C.txt, marginBottom: 14, fontWeight: 500 }}>
          % correctas por escuela del programa (40 ítems)
        </div>
        <AllSchoolsBarChart bars={data.por_colegio.bars} miId={data.por_colegio.miId} />
      </div>
    </>
  )
}

function DetalleTab({ data }: { data: I_ReporteReactData }) {
  const d = data.detalle
  const isLenguaje = (d.lenComp?.length ?? 0) > 0
  const cont = isLenguaje ? (d.lenCont ?? []) : d.contenido
  const comp = isLenguaje ? (d.lenComp ?? []) : d.competencia

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 4 }}>
          {isLenguaje ? 'Resultados por tipo de texto' : 'Resultados por contenido'}
        </div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 8 }}>Mi escuela vs. Programa</div>
        <div style={{ marginBottom: 12 }}><Leg c={C.accent} t="Mi escuela" /><Leg c={C.barFill} t="Programa" /></div>
        {cont.length > 0
          ? cont.map(c => <HBar key={c.n} label={c.n} mi={c.mi} todos={c.t} />)
          : <div style={{ color: C.tm, fontSize: 12 }}>Sin datos</div>}
      </div>

      <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}`, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 14 }}>Distribución de calificaciones</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          <div><BP d={d.boxplotMi} /><div style={{ fontSize: 10, color: C.tm, marginTop: 2 }}>Mi escuela</div></div>
          <div><BP d={d.boxplotTodos} /><div style={{ fontSize: 10, color: C.tm, marginTop: 2 }}>Programa</div></div>
        </div>
      </div>

      <div style={{ background: C.white, borderRadius: 8, padding: '18px 22px', border: `1px solid ${C.bdr}`, gridColumn: 'span 2' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 4 }}>
          {isLenguaje ? 'Resultados por competencia lectora' : 'Resultados por competencia'}
        </div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 8 }}>Mi escuela vs. Programa</div>
        <div style={{ marginBottom: 12 }}><Leg c={C.accent} t="Mi escuela" /><Leg c={C.barFill} t="Programa" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
          {comp.length > 0
            ? comp.map(c => <HBar key={c.n} label={c.n} mi={c.mi} todos={c.t} w={160} />)
            : <div style={{ color: C.tm, fontSize: 12 }}>Sin datos</div>}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function InformeReactEscuelaPage() {
  const params = useParams<{ escuelaId: string }>()
  const escuelaId = params?.escuelaId ? Number(params.escuelaId) : null

  const [tab, setTab] = useState('resumen')
  const [materia, setMateria] = useState('Matemática')
  const [anio, setAnio] = useState('3ro')
  const [division, setDivision] = useState('Única')
  const [toma, setToma] = useState('')

  const { loading, error, tomas, getMaterias, getAnios, getDivisiones, getReporte } = useEscuelaReporteReact(escuelaId)

  // Auto-select latest toma once data arrives
  useEffect(() => {
    if (tomas.length > 0 && !toma) setToma(tomas[tomas.length - 1])
  }, [tomas]) // eslint-disable-line react-hooks/exhaustive-deps

  const materias = getMaterias(toma)
  const anios = getAnios(toma, materia)
  const divisiones = getDivisiones(materia, anio, toma)

  // Reset materia if not available for selected toma
  useEffect(() => {
    if (materias.length > 0 && !materias.includes(materia)) setMateria(materias[0])
  }, [materias]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset anio if not available for selected toma+materia
  useEffect(() => {
    if (anios.length > 0 && !anios.includes(anio)) setAnio(anios[0])
  }, [anios]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset division when the available options change
  useEffect(() => {
    if (divisiones.length > 0 && !divisiones.includes(division)) setDivision(divisiones[0])
  }, [divisiones]) // eslint-disable-line react-hooks/exhaustive-deps

  const data = toma ? getReporte({ materia, anio, division, toma }) : null

  const schoolName = data?.colegio ?? (loading ? 'Cargando…' : 'Escuela')

  const resetFilters = () => {
    setMateria('Matemática')
    setAnio('3ro')
    if (tomas.length > 0) setToma(tomas[tomas.length - 1])
  }

  return (
    <div style={{ fontFamily: F, display: 'flex', minHeight: '100vh', background: C.off }}>
      {/* Sidebar */}
      <div style={{
        width: 185, minHeight: '100vh', flexShrink: 0,
        background: `linear-gradient(180deg,${C.navy} 0%,${C.blue} 100%)`,
        padding: '18px 13px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>
          REPORTE ESCUELA
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.white, marginBottom: 20, lineHeight: 1.3 }}>{schoolName}</div>
        <Sel label="Materia" value={materia} opts={materias} set={setMateria} />
        <Sel label="Año" value={anio} opts={anios} set={setAnio} />
        {divisiones.length > 1 && (
          <Sel label="División" value={division} opts={divisiones} set={setDivision} />
        )}
        <Sel label="Toma" value={toma} opts={tomas.length > 0 ? tomas : [toma]} set={setToma} />
        <button
          onClick={resetFilters}
          style={{ marginTop: 4, padding: '8px 12px', borderRadius: 4, border: 'none', background: C.red, color: C.white, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
        >
          Borrar Filtros
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, display: 'flex', justifyContent: 'center' }}>
          <LogoAustral width={120} height={30} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', background: C.white, borderBottom: `2px solid ${C.bdr}` }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '13px 20px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: tab === t.key ? C.white : 'transparent',
              color: tab === t.key ? C.txt : C.tm,
              borderBottom: tab === t.key ? `3px solid ${C.accent}` : '3px solid transparent',
              marginBottom: -2,
            }}>
              {t.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 20 }}>
            <Logo width={80} height={26} />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '22px 24px 40px' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: C.tm, fontSize: 14 }}>
              Cargando reporte…
            </div>
          )}
          {!loading && error && (
            <div style={{ background: '#ffebee', border: '1px solid #f44336', borderRadius: 8, padding: 20, color: C.red }}>
              Error al cargar: {error}
            </div>
          )}
          {!loading && !error && data && (
            <>
              {tab === 'resumen' && <ResumenTab data={data} />}
              {tab === 'detalle' && <DetalleTab data={data} />}
            </>
          )}
          {!loading && !error && !data && toma && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: C.tm, fontSize: 14 }}>
              Sin datos para {materia} · {anio} · {toma}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', padding: '12px 28px', fontSize: 10, color: C.tm, borderTop: `1px solid ${C.bdr}`, background: C.white }}>
          Reportes React · Reporte por Escuela · Universidad Austral – Escuela de Educación
        </div>
      </div>
    </div>
  )
}

export default withAuth(InformeReactEscuelaPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
