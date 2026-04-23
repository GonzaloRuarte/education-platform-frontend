'use client'

import { useState, useEffect } from 'react'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Spinner from '@/shared/components/Spinner'

/* ═══════════════════════════════════════════
   COLORS & THEME
   ═══════════════════════════════════════════ */
const COLORS = {
  escuela: '#2563eb',
  regional: '#94a3b8',
  nacional: '#cbd5e1',
  verde: '#16a34a',
  amarillo: '#ca8a04',
  rojo: '#dc2626',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  histBar: '#6366f1',
  boxFill: '#dbeafe',
  boxStroke: '#2563eb',
  trendLine: '#2563eb',
  trendDot: '#1d4ed8',
}
const FONT = "'Segoe UI', system-ui, -apple-system, sans-serif"

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */
const MOCK_DATA = {
  escuela: { id: 123, nombre: 'Escuela Benito Juárez', region: 'Norte' },
  periodo: '2025-2',
  metricas: {
    puntajes_por_materia: [
      { materia: 'Matemáticas', promedio_escuela: 72.5, promedio_regional: 68.3, promedio_nacional: 65.1, semaforo: 'verde' },
      { materia: 'Lectura', promedio_escuela: 58.2, promedio_regional: 62.0, promedio_nacional: 64.8, semaforo: 'rojo' },
      { materia: 'Ciencias', promedio_escuela: 70.1, promedio_regional: 69.5, promedio_nacional: 67.2, semaforo: 'amarillo' },
      { materia: 'Historia', promedio_escuela: 65.8, promedio_regional: 63.2, promedio_nacional: 62.0, semaforo: 'verde' },
      { materia: 'Inglés', promedio_escuela: 55.0, promedio_regional: 60.4, promedio_nacional: 61.2, semaforo: 'rojo' },
    ],
    tendencia: [
      { periodo: '2024-1', promedio: 62.4 },
      { periodo: '2024-2', promedio: 64.8 },
      { periodo: '2025-1', promedio: 67.1 },
      { periodo: '2025-2', promedio: 71.3 },
    ],
    distribucion: {
      'Matemáticas': [
        { rango: '0-20', frecuencia: 2 }, { rango: '21-40', frecuencia: 5 },
        { rango: '41-60', frecuencia: 18 }, { rango: '61-80', frecuencia: 42 },
        { rango: '81-100', frecuencia: 13 },
      ],
      'Lectura': [
        { rango: '0-20', frecuencia: 5 }, { rango: '21-40', frecuencia: 12 },
        { rango: '41-60', frecuencia: 30 }, { rango: '61-80', frecuencia: 25 },
        { rango: '81-100', frecuencia: 8 },
      ],
    } as Record<string, Array<{ rango: string; frecuencia: number }>>,
    boxplots: [
      { materia: 'Matemáticas', min: 12, q1: 55, median: 72, q3: 83, max: 98 },
      { materia: 'Lectura', min: 8, q1: 42, median: 58, q3: 71, max: 92 },
      { materia: 'Ciencias', min: 20, q1: 58, median: 70, q3: 80, max: 95 },
      { materia: 'Historia', min: 15, q1: 50, median: 66, q3: 78, max: 94 },
      { materia: 'Inglés', min: 10, q1: 38, median: 55, q3: 68, max: 88 },
    ],
  },
}

type T_MockData = typeof MOCK_DATA

/* ═══════════════════════════════════════════
   SEMÁFORO
   ═══════════════════════════════════════════ */
const bgMap: Record<string, string> = { verde: '#dcfce7', amarillo: '#fef9c3', rojo: '#fee2e2' }
const fgMap: Record<string, string> = { verde: COLORS.verde, amarillo: COLORS.amarillo, rojo: COLORS.rojo }
const labelMap: Record<string, string> = { verde: 'Por encima', amarillo: 'Dentro de lo esperado', rojo: 'Por debajo' }

function Semaforo({ color, materia, puntaje }: { color: string; materia: string; puntaje: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: bgMap[color], border: `1px solid ${fgMap[color]}22` }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: fgMap[color], flexShrink: 0, boxShadow: `0 0 8px ${fgMap[color]}66` }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{materia}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{labelMap[color]}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 18, color: fgMap[color] }}>{puntaje.toFixed(1)}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   CARD
   ═══════════════════════════════════════════ */
function Card({ title, children, span }: { title: string; children: React.ReactNode; span?: number }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: '24px 24px 20px', gridColumn: span ? `span ${span}` : undefined, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: COLORS.textMuted, letterSpacing: 0.3, textTransform: 'uppercase', fontFamily: FONT }}>{title}</h3>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════
   SVG CHARTS
   ═══════════════════════════════════════════ */

/* Grouped bar chart: escuela vs regional vs nacional */
function PuntajesBarChart({ data }: { data: T_MockData['metricas']['puntajes_por_materia'] }) {
  const vw = 520, vh = 240, padL = 10, padB = 50, padT = 20, padR = 10
  const groupW = (vw - padL - padR) / data.length
  const bw = groupW * 0.22
  const gap = groupW * 0.04
  const scaleH = (v: number) => ((vh - padT - padB) * v) / 100
  const y = (v: number) => vh - padB - scaleH(v)
  const fills = [COLORS.escuela, COLORS.regional, COLORS.nacional]
  const keys: Array<keyof typeof data[0]> = ['promedio_escuela', 'promedio_regional', 'promedio_nacional']

  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ overflow: 'visible' }}>
      {[0, 25, 50, 75, 100].map((v) => {
        const lineY = y(v)
        return <line key={v} x1={padL} y1={lineY} x2={vw - padR} y2={lineY} stroke={COLORS.border} strokeWidth={0.8} />
      })}
      {data.map((d, gi) => {
        const gx = padL + gi * groupW
        return (
          <g key={d.materia}>
            {keys.map((k, bi) => {
              const val = d[k] as number
              const bx = gx + bi * (bw + gap) + groupW * 0.07
              return (
                <g key={k}>
                  <rect x={bx} y={y(val)} width={bw} height={scaleH(val)} fill={fills[bi]} rx={2} />
                  <text x={bx + bw / 2} y={y(val) - 3} fontSize={7} textAnchor="middle" fill={COLORS.textMuted}>{val.toFixed(0)}</text>
                </g>
              )
            })}
            <text x={gx + groupW / 2} y={vh - padB + 14} fontSize={8} textAnchor="middle" fill={COLORS.textMuted}>{d.materia.substring(0, 8)}</text>
          </g>
        )
      })}
      {/* legend */}
      {['Escuela', 'Regional', 'Nacional'].map((label, i) => (
        <g key={label} transform={`translate(${padL + i * 80}, ${vh - 10})`}>
          <rect width={10} height={10} fill={fills[i]} rx={2} />
          <text x={14} y={9} fontSize={9} fill={COLORS.textMuted}>{label}</text>
        </g>
      ))}
    </svg>
  )
}

/* Line chart: tendencia */
function TendenciaChart({ data }: { data: T_MockData['metricas']['tendencia'] }) {
  const vw = 480, vh = 200, padL = 32, padB = 28, padT = 16, padR = 20
  const minV = 50, maxV = 85
  const xStep = (vw - padL - padR) / (data.length - 1)
  const yScale = (v: number) => padT + ((vh - padT - padB) * (maxV - v)) / (maxV - minV)
  const pts = data.map((d, i) => ({ x: padL + i * xStep, y: yScale(d.promedio), d }))
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`}>
      {[50, 60, 70, 80].map((v) => {
        const ly = yScale(v)
        return <g key={v}><line x1={padL} y1={ly} x2={vw - padR} y2={ly} stroke={COLORS.border} strokeWidth={0.8} /><text x={padL - 4} y={ly + 3} fontSize={8} fill={COLORS.textMuted} textAnchor="end">{v}</text></g>
      })}
      <path d={pathD} fill="none" stroke={COLORS.trendLine} strokeWidth={2.5} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill={COLORS.trendDot} stroke="#fff" strokeWidth={2} />
          <text x={p.x} y={p.y - 8} fontSize={8} textAnchor="middle" fill={COLORS.textMuted} fontWeight={600}>{p.d.promedio}</text>
          <text x={p.x} y={vh - padB + 12} fontSize={8} textAnchor="middle" fill={COLORS.textMuted}>{p.d.periodo}</text>
        </g>
      ))}
    </svg>
  )
}

/* Histogram bar chart */
function HistogramaChart({ data }: { data: Array<{ rango: string; frecuencia: number }> }) {
  const vw = 460, vh = 200, padL = 24, padB = 28, padT = 16, padR = 10
  const maxF = Math.max(...data.map((d) => d.frecuencia))
  const bw = (vw - padL - padR) / data.length
  const scaleH = (v: number) => ((vh - padT - padB) * v) / maxF

  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`}>
      {[0, Math.round(maxF / 2), maxF].map((v) => {
        const ly = vh - padB - scaleH(v)
        return <g key={v}><line x1={padL} y1={ly} x2={vw - padR} y2={ly} stroke={COLORS.border} strokeWidth={0.8} /><text x={padL - 4} y={ly + 3} fontSize={8} fill={COLORS.textMuted} textAnchor="end">{v}</text></g>
      })}
      {data.map((d, i) => {
        const x = padL + i * bw + bw * 0.1
        const h = scaleH(d.frecuencia)
        return (
          <g key={d.rango}>
            <rect x={x} y={vh - padB - h} width={bw * 0.8} height={h} fill={COLORS.histBar} rx={3} />
            <text x={x + bw * 0.4} y={vh - padB - h - 3} fontSize={8} textAnchor="middle" fill={COLORS.textMuted}>{d.frecuencia}</text>
            <text x={x + bw * 0.4} y={vh - padB + 12} fontSize={8} textAnchor="middle" fill={COLORS.textMuted}>{d.rango}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* Horizontal boxplot chart */
function BoxplotChart({ data }: { data: T_MockData['metricas']['boxplots'] }) {
  const vw = 560, itemH = 36, padL = 80, padR = 30, padT = 10
  const vh = data.length * itemH + padT * 2
  const xScale = (v: number) => padL + (v / 100) * (vw - padL - padR)

  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`}>
      {[0, 25, 50, 75, 100].map((v) => (
        <line key={v} x1={xScale(v)} y1={padT} x2={xScale(v)} y2={vh - padT} stroke={COLORS.border} strokeWidth={0.8} />
      ))}
      {data.map((d, i) => {
        const cy = padT + i * itemH + itemH / 2
        const x1 = xScale(d.min), x2 = xScale(d.q1), x3 = xScale(d.q3), x4 = xScale(d.max)
        const xMd = xScale(d.median)
        return (
          <g key={d.materia}>
            <text x={padL - 4} y={cy + 4} fontSize={9} fill={COLORS.text} textAnchor="end">{d.materia}</text>
            <line x1={x1} y1={cy} x2={x2} y2={cy} stroke={COLORS.boxStroke} strokeWidth={1.5} />
            <line x1={x3} y1={cy} x2={x4} y2={cy} stroke={COLORS.boxStroke} strokeWidth={1.5} />
            <line x1={x1} y1={cy - 5} x2={x1} y2={cy + 5} stroke={COLORS.boxStroke} strokeWidth={1.5} />
            <line x1={x4} y1={cy - 5} x2={x4} y2={cy + 5} stroke={COLORS.boxStroke} strokeWidth={1.5} />
            <rect x={x2} y={cy - 8} width={x3 - x2} height={16} fill={COLORS.boxFill} stroke={COLORS.boxStroke} strokeWidth={1.5} rx={1} />
            <line x1={xMd} y1={cy - 8} x2={xMd} y2={cy + 8} stroke={COLORS.boxStroke} strokeWidth={2} />
          </g>
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
function ReporteEscuelaPage() {
  const [data, setData] = useState<T_MockData | null>(null)
  const [materiaHist, setMateriaHist] = useState('Matemáticas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: reemplazar con fetch(`/api/reportes/escuela/${escuelaId}/`)
    const t = setTimeout(() => { setData(MOCK_DATA); setLoading(false) }, 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.bg, fontFamily: FONT, flexDirection: 'column', gap: 16 }}>
        <Spinner />
        <div style={{ color: COLORS.textMuted, fontSize: 15 }}>Cargando reporte...</div>
      </div>
    )
  }

  if (!data) return null

  const { escuela, periodo, metricas } = data
  const diff = metricas.tendencia[metricas.tendencia.length - 1].promedio - metricas.tendencia[0].promedio

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: FONT }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', color: '#fff', padding: '40px 32px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Reporte de Evaluación</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{escuela.nombre}</h1>
          <div style={{ marginTop: 10, display: 'flex', gap: 20, fontSize: 14, opacity: 0.85 }}>
            <span>Región {escuela.region}</span>
            <span>Periodo {periodo}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        <Card title="Estado por materia">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {metricas.puntajes_por_materia.map((p) => (
              <Semaforo key={p.materia} color={p.semaforo} materia={p.materia} puntaje={p.promedio_escuela} />
            ))}
          </div>
        </Card>

        <Card title="Puntajes vs. regional y nacional">
          <PuntajesBarChart data={metricas.puntajes_por_materia} />
        </Card>

        <Card title="Tendencia del promedio general">
          <TendenciaChart data={metricas.tendencia} />
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: COLORS.textMuted }}>
            {diff >= 0 ? '↑' : '↓'} +{Math.abs(diff).toFixed(1)} puntos en {metricas.tendencia.length} periodos
          </div>
        </Card>

        <Card title="Distribución de notas">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.keys(metricas.distribucion).map((m) => (
              <button key={m} onClick={() => setMateriaHist(m)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13,
                border: `1px solid ${materiaHist === m ? COLORS.escuela : COLORS.border}`,
                background: materiaHist === m ? COLORS.escuela : '#fff',
                color: materiaHist === m ? '#fff' : COLORS.text,
                cursor: 'pointer', fontWeight: materiaHist === m ? 600 : 400,
              }}>
                {m}
              </button>
            ))}
          </div>
          <HistogramaChart data={metricas.distribucion[materiaHist] ?? []} />
        </Card>

        <Card title="Distribución por materia (boxplot)" span={2}>
          <BoxplotChart data={metricas.boxplots} />
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12, fontSize: 12, color: COLORS.textMuted }}>
            <span>Caja = Q1 a Q3 (50% central)</span>
            <span>Líneas = Mín a Máx</span>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 32px', fontSize: 12, color: COLORS.textMuted, borderTop: `1px solid ${COLORS.border}` }}>
        Generado automáticamente · Datos del periodo {periodo} · {escuela.nombre}
      </div>
    </div>
  )
}

export default withAuth(ReporteEscuelaPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
