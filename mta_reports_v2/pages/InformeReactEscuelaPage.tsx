'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Box, Stack, Typography, Paper, Chip,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
  Grid2,
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Rectangle, LabelList, ReferenceLine,
} from 'recharts'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import Button from '@/shared/components/Button'
import { useEscuelaReporteReact } from '@/mta_reports_v2/hooks'
import type { I_ReporteReactData, I_BoxplotReact } from '@/mta_reports_v2/hooks'

const C = {
  navy: '#041552',
  blue: '#0b2280',
  accent: '#00a6e6',
  barFill: '#1a3080',
  barLight: '#4a7cc7',
  barMe: '#ff9800',
  lightBlue: '#C3D9FF',
  boxLight: '#7ecef4',
  tm: '#7a8399',
} as const

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Leg({ c, t }: { c: string; t: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} component="span" sx={{ mr: 2, display: 'inline-flex' }}>
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: C.tm }}>{t}</Typography>
    </Stack>
  )
}

function SemDot({ diff }: { diff: number }) {
  const color = diff >= 5 ? '#4caf50' : diff >= -5 ? '#ff9800' : '#e84c4c'
  const label = diff >= 5 ? 'Por encima del promedio' : diff >= -5 ? 'Dentro del promedio' : 'Por debajo del promedio'
  return <Box title={label} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, display: 'inline-block', flexShrink: 0 }} />
}

// ── Recharts: vertical bar chart (schools comparison) ─────────────────────────

function AllSchoolsBarChart({ bars, miId }: { bars: { id: string; p: number }[]; miId: string }) {
  const sorted = [...bars].sort((a, b) => b.p - a.p)
  const prom = sorted.length
    ? Math.round(sorted.reduce((s, e) => s + e.p, 0) / sorted.length * 10) / 10
    : 0
  const chartW = Math.max(400, sorted.length * 44 + 20)

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <BarChart width={chartW} height={240} data={sorted} margin={{ top: 16, right: 8, bottom: 30, left: 10 }}>
        <CartesianGrid vertical={false} stroke="#eee" strokeWidth={0.8} />
        <XAxis dataKey="id" tick={{ fontSize: 8, fill: C.tm }} angle={-40} textAnchor="end" interval={0} />
        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 8, fill: C.tm }} />
        <ReferenceLine y={prom} stroke="#e84c4c" strokeDasharray="4 3" strokeWidth={1} />
        <Bar
          dataKey="p"
          shape={(props: any) => {
            const isMe = sorted[props.index]?.id === miId
            return <Rectangle {...props} fill={isMe ? C.barMe : C.barFill} radius={[2, 2, 0, 0]} />
          }}
        >
          <LabelList dataKey="p" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 7, fill: C.navy }} />
        </Bar>
      </BarChart>
      <Box sx={{ mt: 0.75 }}>
        <Leg c={C.barMe} t="Mi escuela" />
        <Leg c={C.barFill} t="Otras escuelas" />
        <Typography variant="caption" sx={{ ml: 0.5, color: C.tm }}>
          Promedio programa: <strong>{prom}%</strong>
        </Typography>
      </Box>
    </Box>
  )
}

// ── Recharts: horizontal bar chart (competencia / contenido) ──────────────────

interface HBarItem { n: string; mi: number; t: number }

function HorizontalBarChart({ items }: { items: HBarItem[] }) {
  const data = items.map(item => ({ name: item.n, mi: item.mi, todos: item.t }))
  const chartH = Math.max(80, data.length * 50 + 50)

  return (
    <ResponsiveContainer width="100%" height={chartH}>
      <BarChart layout="vertical" data={data} margin={{ top: 5, right: 72, bottom: 5, left: 8 }}>
        <CartesianGrid horizontal={false} stroke="#eee" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: C.tm }} />
        <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: C.navy }} />
        <Bar dataKey="mi" fill={C.barFill} barSize={13} name="Mi colegio">
          <LabelList dataKey="mi" position="right" formatter={(v: number) => `${v} %`} style={{ fontSize: 10, fill: C.navy, fontWeight: 600 }} />
        </Bar>
        <Bar dataKey="todos" fill={C.barLight} barSize={13} name="Todos los colegios">
          <LabelList dataKey="todos" position="right" formatter={(v: number) => `${v} %`} style={{ fontSize: 10, fill: C.tm }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Boxplot (SVG, recharts no soporta boxplots nativamente) ───────────────────

function BP({ d, color, w = 90, h = 280 }: { d: I_BoxplotReact; color: string; w?: number; h?: number }) {
  const pad = 28, ch = h - pad * 2
  const y = (v: number) => pad + ch - (v / 100) * ch
  const cx = w / 2, bw = 36
  return (
    <svg width={w} height={h}>
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
        <g key={v}>
          <line x1={16} y1={y(v)} x2={w - 2} y2={y(v)} stroke="#eaeaea" strokeWidth={0.5} />
          <text x={14} y={y(v) + 3} fontSize={7} fill={C.tm} textAnchor="end">{v}%</text>
        </g>
      ))}
      {/* Whiskers */}
      <line x1={cx} y1={y(d.max)} x2={cx} y2={y(d.q3)} stroke={color} strokeWidth={1.5} />
      <line x1={cx} y1={y(d.q1)} x2={cx} y2={y(d.min)} stroke={color} strokeWidth={1.5} />
      <line x1={cx - 10} y1={y(d.max)} x2={cx + 10} y2={y(d.max)} stroke={color} strokeWidth={1.5} />
      <line x1={cx - 10} y1={y(d.min)} x2={cx + 10} y2={y(d.min)} stroke={color} strokeWidth={1.5} />
      {/* Box */}
      <rect x={cx - bw / 2} y={y(d.q3)} width={bw} height={y(d.q1) - y(d.q3)} fill={color} stroke={color} strokeWidth={1} rx={1} opacity={0.9} />
      {/* Median */}
      <line x1={cx - bw / 2} y1={y(d.md)} x2={cx + bw / 2} y2={y(d.md)} stroke="white" strokeWidth={2.5} />
      {/* Mean dot */}
      <circle cx={cx} cy={y(d.av)} r={3.5} fill="#555" stroke="white" strokeWidth={1} />
    </svg>
  )
}

// ── KPI Card (ResumenTab) ─────────────────────────────────────────────────────

interface KPICardProps {
  title: string; subtitle: string
  mi: number | string; todos: number | string; suffix?: string
}

function KPICard({ title, subtitle, mi, todos, suffix = '%' }: KPICardProps) {
  const fmt = (v: number | string) => typeof v === 'number' ? `${v}${suffix}` : v
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', flex: 1, minWidth: 160 }}>
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ color: C.navy, fontWeight: 700 }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: C.tm }}>{subtitle}</Typography>
      </Box>
      <Box sx={{ bgcolor: C.navy, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
        <Typography sx={{ color: 'white', fontSize: 12 }}>Mi Colegio</Typography>
        <Typography sx={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{fmt(mi)}</Typography>
      </Box>
      <Box sx={{ bgcolor: C.lightBlue, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
        <Typography sx={{ color: C.navy, fontSize: 12 }}>Todos los colegios</Typography>
        <Typography sx={{ color: C.navy, fontWeight: 800, fontSize: 20 }}>{fmt(todos)}</Typography>
      </Box>
    </Paper>
  )
}

// ── Chart section wrapper ─────────────────────────────────────────────────────

function ChartCard({ num, title, subtitle, legend, children }: {
  num: string; title: string; subtitle?: string
  legend?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
      <Typography sx={{ fontSize: 13, color: C.accent, fontWeight: 500, mb: 0.25 }}>{num}. {title}</Typography>
      {subtitle && <Typography variant="subtitle1" sx={{ fontWeight: 600, color: C.navy, mb: 0.75 }}>{subtitle}</Typography>}
      {legend && <Box sx={{ mb: 1 }}>{legend}</Box>}
      {children}
    </Paper>
  )
}

// ── Tab: Resumen ──────────────────────────────────────────────────────────────

function ResumenTab({ data }: { data: I_ReporteReactData }) {
  const g = data.general
  return (
    <>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 2.5 }}>
        <KPICard title="Datos de la muestra" subtitle="Cantidad de resoluciones" mi={String(g.muestra.mi)} todos={String(g.muestra.todos)} suffix="" />
        <KPICard title="% de respuestas correctas" subtitle="40 ítems" mi={g.pct40.mi} todos={g.pct40.todos} />
        <KPICard title="% de respuestas correctas" subtitle="ítems PISA" mi={g.pctPISA.mi} todos={g.pctPISA.todos} />
        <KPICard title="% de respuestas correctas" subtitle="45 ítems" mi={g.pct45.mi} todos={g.pct45.todos} />
      </Stack>

      <ChartCard num="01" title="Porcentaje de respuesta correcta por colegio sobre los 40 ítems">
        <AllSchoolsBarChart bars={data.por_colegio.bars} miId={data.por_colegio.miId} />
      </ChartCard>
    </>
  )
}

// ── Tab: Detalle ──────────────────────────────────────────────────────────────

function DetalleTab({ data }: { data: I_ReporteReactData }) {
  const d = data.detalle
  const isLenguaje = (d.lenComp?.length ?? 0) > 0
  const compItems = isLenguaje ? (d.lenComp ?? []) : d.competencia
  const contItems = isLenguaje ? (d.lenCont ?? []) : d.contenido

  const bpMiColor = C.barFill
  const bpTodosColor = C.boxLight

  const barLegend = (
    <>
      <Leg c={C.barFill} t="% Correctas mi colegio" />
      <Leg c={C.barLight} t="% Correctas todos los colegios" />
    </>
  )

  return (
    <Grid2 container spacing={2.5} alignItems="flex-start">
      {/* Left column */}
      <Grid2 size={{ xs: 12, md: 7 }}>
        <Stack spacing={2.5}>
          <ChartCard
            num="01"
            title="Resultados por competencia"
            subtitle="Porcentaje de respuestas correctas"
            legend={barLegend}
          >
            {compItems.length > 0
              ? <HorizontalBarChart items={compItems} />
              : <Typography variant="caption" sx={{ color: C.tm }}>Sin datos</Typography>}
          </ChartCard>

          <ChartCard
            num="02"
            title={isLenguaje ? 'Resultados por tipo de texto y microcompetencia' : 'Resultados por contenido'}
            subtitle="Porcentaje de respuestas correctas"
            legend={barLegend}
          >
            {contItems.length > 0
              ? <HorizontalBarChart items={contItems} />
              : <Typography variant="caption" sx={{ color: C.tm }}>Sin datos</Typography>}
          </ChartCard>
        </Stack>
      </Grid2>

      {/* Right column */}
      <Grid2 size={{ xs: 12, md: 5 }}>
        <Stack spacing={2.5}>
          <ChartCard num="03" title="Distribución de calificaciones">
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <BP d={d.boxplotMi} color={bpMiColor} />
                <Typography variant="caption" sx={{ color: C.tm }}>Mi escuela</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <BP d={d.boxplotTodos} color={bpTodosColor} />
                <Typography variant="caption" sx={{ color: C.tm }}>Todos los colegios</Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: C.tm, display: 'block', mt: 1.5 }}>
              *Información del gráfico de distribución sobre el círculo ●
            </Typography>
          </ChartCard>

          <ChartCard num="04" title="Calificación por alumno">
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: C.navy, whiteSpace: 'nowrap' }}>
                ID del alumno
              </Typography>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select defaultValue="all" displayEmpty>
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Paper elevation={0} sx={{ bgcolor: C.navy, borderRadius: 2, p: 2.5, mt: 2, textAlign: 'center' }}>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                Seleccione el ID del alumno
              </Typography>
            </Paper>
          </ChartCard>
        </Stack>
      </Grid2>
    </Grid2>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  materia: string; setMateria: (v: string) => void; materias: string[]
  anio: string; setAnio: (v: string) => void; anios: string[]
  division: string; setDivision: (v: string) => void; divisiones: string[]
  toma: string; setToma: (v: string) => void; tomas: string[]
  onReset: () => void
}

function Sidebar({ materia, setMateria, materias, anio, setAnio, anios, division, setDivision, divisiones, toma, setToma, tomas, onReset }: SidebarProps) {
  const selectSx = {
    bgcolor: 'white', fontSize: 13,
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiSelect-select': { py: '7px' },
  }
  const labelSx = {
    color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700,
    '&.Mui-focused': { color: 'white' },
    '&.MuiFormLabel-filled': { color: 'white' },
  }

  const Filter = ({ label, value, opts, set }: { label: string; value: string; opts: string[]; set: (v: string) => void }) => (
    <FormControl fullWidth size="small" sx={{ mb: 2.25 }}>
      <InputLabel sx={labelSx}>{label}</InputLabel>
      <Select value={value} label={label} onChange={e => set(e.target.value)} sx={selectSx}>
        {opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  )

  return (
    <Box sx={{
      width: 200, minHeight: '100vh', flexShrink: 0,
      background: `linear-gradient(180deg, ${C.navy} 0%, ${C.blue} 100%)`,
      px: 1.75, pt: 2.5, pb: 2,
      display: 'flex', flexDirection: 'column',
    }}>
      {materias.length > 1 && (
        <Filter label="Materia" value={materia} opts={materias} set={setMateria} />
      )}
      <Filter label="Año" value={anio} opts={anios} set={setAnio} />
      {divisiones.length > 1 && (
        <Filter label="División" value={division} opts={divisiones} set={setDivision} />
      )}
      <Filter label="Toma" value={toma} opts={tomas.length > 0 ? tomas : [toma]} set={setToma} />
      <Button bgcolor="red" fullWidth onClick={onReset} sx={{ mt: 0.5, fontSize: 12 }}>
        Borrar filtros
      </Button>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', pt: 1.5, display: 'flex', justifyContent: 'center' }}>
        <LogoAustral width={120} height={30} />
      </Box>
    </Box>
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

  useEffect(() => {
    if (tomas.length > 0 && !toma) setToma(tomas[tomas.length - 1])
  }, [tomas]) // eslint-disable-line react-hooks/exhaustive-deps

  const materias = getMaterias(toma)
  const anios = getAnios(toma, materia)
  const divisiones = getDivisiones(materia, anio, toma)

  useEffect(() => {
    if (materias.length > 0 && !materias.includes(materia)) setMateria(materias[0])
  }, [materias]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (anios.length > 0 && !anios.includes(anio)) setAnio(anios[0])
  }, [anios]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        materia={materia} setMateria={setMateria} materias={materias}
        anio={anio} setAnio={setAnio} anios={anios}
        division={division} setDivision={setDivision} divisiones={divisiones}
        toma={toma} setToma={setToma} tomas={tomas}
        onReset={resetFilters}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 0.5, bgcolor: 'background.paper' }}>
          <Typography variant="h5" sx={{ color: C.navy, fontWeight: 800 }}>
            {schoolName} — {tab === 'resumen' ? 'Resultados generales' : materia}
          </Typography>
          <Logo width={80} height={26} />
        </Box>

        {/* Filter pills */}
        <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.25, bgcolor: 'background.paper', flexWrap: 'wrap' }}>
          {materias.length > 1 && (
            <Chip label={`Materia: ${materia || '—'}`} size="small" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: 600 }} />
          )}
          <Chip label={`Año: ${anio || '—'}`} size="small" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: 600 }} />
          {divisiones.length > 1 && (
            <Chip label={`División: ${division || '—'}`} size="small" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: 600 }} />
          )}
        </Stack>

        {/* Tabs */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
            <Tab value="resumen" label="Resumen" />
            <Tab value="detalle" label="Contenido y competencia" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: '22px 24px 40px' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Typography color="text.secondary">Cargando reporte…</Typography>
            </Box>
          )}
          {!loading && error && (
            <Paper elevation={0} sx={{ bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 2, p: 2.5 }}>
              <Typography color="error">Error al cargar: {error}</Typography>
            </Paper>
          )}
          {!loading && !error && data && (
            <>
              {tab === 'resumen' && <ResumenTab data={data} />}
              {tab === 'detalle' && <DetalleTab data={data} />}
            </>
          )}
          {!loading && !error && !data && toma && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Typography color="text.secondary">Sin datos para {materia} · {anio} · {toma}</Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', py: 1.5, px: 3.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="caption" color="text.secondary">
            Reportes React · Reporte por Escuela · Universidad Austral – Escuela de Educación
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default withAuth(InformeReactEscuelaPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
