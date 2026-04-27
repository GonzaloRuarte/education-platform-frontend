'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Box, Stack, Typography, Paper, Chip,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
  Grid2,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Rectangle, LabelList, ReferenceLine,
  ScatterChart, Scatter, Tooltip,
} from 'recharts'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import Button from '@/shared/components/Button'
import { ImageSize } from '@/shared/utils'
import { useEscuelaReporteReact } from '@/mta_reports_v2/hooks'
import type { I_ReporteReactData, I_BoxplotReact, I_SemaforoBandas, I_ScatterPoint, I_TablaRow } from '@/mta_reports_v2/hooks'
import {
  SEMAFORO_NIVELES, NIVEL_COLORS, NIVEL_KEYS, ANIO_LABELS,
} from '@/mta_reports_v2/semaforo_data'
import type { SemaforoNivel } from '@/mta_reports_v2/semaforo_data'

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

const ANIO_ORDER = ['3ro', '6to', '9no', '12mo'] as const
const TAB_IDS = { RESUMEN: 'resumen', DETALLE: 'detalle', SEMAFORO: 'semaforo', SCATTER: 'scatter', TABLA: 'tabla' } as const
const headerLogoSize = new ImageSize(257, 73, { scale: 0.31 })
const sidebarAustralLogoSize = new ImageSize(412, 72, { scale: 0.29 })

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Leg({ c, t }: { c: string; t: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} component="span" sx={{ mr: 2, display: 'inline-flex' }}>
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: C.tm }}>{t}</Typography>
    </Stack>
  )
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

// ── Boxplot (SVG) ─────────────────────────────────────────────────────────────

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
      <line x1={cx} y1={y(d.max)} x2={cx} y2={y(d.q3)} stroke={color} strokeWidth={1.5} />
      <line x1={cx} y1={y(d.q1)} x2={cx} y2={y(d.min)} stroke={color} strokeWidth={1.5} />
      <line x1={cx - 10} y1={y(d.max)} x2={cx + 10} y2={y(d.max)} stroke={color} strokeWidth={1.5} />
      <line x1={cx - 10} y1={y(d.min)} x2={cx + 10} y2={y(d.min)} stroke={color} strokeWidth={1.5} />
      <rect x={cx - bw / 2} y={y(d.q3)} width={bw} height={y(d.q1) - y(d.q3)} fill={color} stroke={color} strokeWidth={1} rx={1} opacity={0.9} />
      <line x1={cx - bw / 2} y1={y(d.md)} x2={cx + bw / 2} y2={y(d.md)} stroke="white" strokeWidth={2.5} />
      <circle cx={cx} cy={y(d.av)} r={3.5} fill="#555" stroke="white" strokeWidth={1} />
    </svg>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

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

// ── Tab: Contenido y competencia ──────────────────────────────────────────────

function DetalleTab({ data }: { data: I_ReporteReactData }) {
  const d = data.detalle
  const isLenguaje = (d.lenComp?.length ?? 0) > 0
  const compItems = isLenguaje ? (d.lenComp ?? []) : d.competencia
  const contItems = isLenguaje ? (d.lenCont ?? []) : d.contenido

  const barLegend = (
    <>
      <Leg c={C.barFill} t="% Correctas mi colegio" />
      <Leg c={C.barLight} t="% Correctas todos los colegios" />
    </>
  )

  return (
    <Grid2 container spacing={2.5} alignItems="flex-start">
      <Grid2 size={{ xs: 12, md: 7 }}>
        <Stack spacing={2.5}>
          <ChartCard num="01" title="Resultados por competencia" subtitle="Porcentaje de respuestas correctas" legend={barLegend}>
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
      <Grid2 size={{ xs: 12, md: 5 }}>
        <Stack spacing={2.5}>
          <ChartCard num="03" title="Distribución de calificaciones">
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <BP d={d.boxplotMi} color={C.barFill} />
                <Typography variant="caption" sx={{ color: C.tm }}>Mi escuela</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <BP d={d.boxplotTodos} color={C.boxLight} />
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

// ── Tab: Semáforo ─────────────────────────────────────────────────────────────

function GruposList({ grupos }: { grupos: SemaforoNivel['col1'] }) {
  return (
    <Box>
      {grupos.map((g, gi) => (
        <Box key={gi} sx={{ mb: g.titulo ? 1 : 0 }}>
          {g.titulo && (
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 12, mb: 0.25, textDecoration: 'underline' }}>
              {g.titulo}
            </Typography>
          )}
          {g.items.map((item, ii) => (
            <Typography key={ii} sx={{ color: 'white', fontSize: 12, lineHeight: 1.5, pl: g.titulo ? 1 : 0 }}>
              • {item}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  )
}

function NivelRow({ nivel, bandas, nivelKey }: { nivel: SemaforoNivel; bandas: I_SemaforoBandas | undefined; nivelKey: string }) {
  const color = NIVEL_COLORS[nivelKey] ?? '#999'
  const count = bandas ? bandas[nivelKey as keyof I_SemaforoBandas] as number : 0
  const pct = bandas && bandas.total > 0 ? Math.round((count / bandas.total) * 100) : 0

  return (
    <Paper elevation={0} sx={{ bgcolor: color, borderRadius: 1.5, p: 2, mb: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Typography sx={{ color: 'white', fontWeight: 800, fontSize: 14, minWidth: 90 }}>
          {nivel.rango}
        </Typography>
        <Chip
          label={`${pct}%`}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.92)', color, fontWeight: 800, fontSize: 13 }}
        />
        {bandas && (
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
            {count} alumno{count !== 1 ? 's' : ''}
          </Typography>
        )}
      </Stack>
      {nivel.col2 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <GruposList grupos={nivel.col1} />
          <GruposList grupos={nivel.col2} />
        </Box>
      ) : (
        <GruposList grupos={nivel.col1} />
      )}
    </Paper>
  )
}

function SemaforoTab({
  materia, division, toma, getSemaforoBandas,
}: {
  materia: string; division: string; toma: string
  getSemaforoBandas: (m: string, d: string, t: string) => Record<string, I_SemaforoBandas>
}) {
  const [anio, setAnio] = useState('3ro')
  const bandasMap = useMemo(
    () => getSemaforoBandas(materia, division, toma),
    [materia, division, toma, getSemaforoBandas],
  )
  const niveles = SEMAFORO_NIVELES[anio]?.[materia] ?? []

  return (
    <Box>
      <Tabs
        value={anio}
        onChange={(_, v) => setAnio(v)}
        sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
      >
        {ANIO_ORDER.map(a => (
          <Tab key={a} value={a} label={ANIO_LABELS[a]} />
        ))}
      </Tabs>
      {niveles.length === 0 ? (
        <Typography sx={{ color: C.tm, mt: 2 }}>Sin descriptores para {ANIO_LABELS[anio]} — {materia}</Typography>
      ) : (
        NIVEL_KEYS.map((key, i) => (
          <NivelRow key={key} nivel={niveles[i]} bandas={bandasMap[anio]} nivelKey={key} />
        ))
      )}
    </Box>
  )
}

// ── Tab: Resultados por alumno (Scatter) ─────────────────────────────────────

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as I_ScatterPoint
  return (
    <Paper elevation={2} sx={{ p: 1.25, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" sx={{ color: C.navy, fontWeight: 700 }}>Alumno #{d.id}</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: C.tm }}>PDL: {d.pdl}%</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: C.tm }}>Mat: {d.mat}%</Typography>
    </Paper>
  )
}

function ScatterTab({ points }: { points: I_ScatterPoint[] }) {
  const avg = useMemo(() => {
    if (!points.length) return null
    return {
      pdl: Math.round(points.reduce((s, p) => s + p.pdl, 0) / points.length),
      mat: Math.round(points.reduce((s, p) => s + p.mat, 0) / points.length),
    }
  }, [points])

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
      <Typography sx={{ fontSize: 13, color: C.accent, fontWeight: 500, mb: 1.5 }}>
        Resultados por alumno — % PDL vs % Matemática
      </Typography>
      {points.length === 0 ? (
        <Typography sx={{ color: C.tm }}>Sin datos para los filtros seleccionados</Typography>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                type="number" dataKey="pdl" name="PDL"
                domain={[0, 100]} tickFormatter={v => `${v}%`}
                tick={{ fontSize: 11, fill: C.tm }}
                label={{ value: '% Prácticas del Lenguaje', position: 'insideBottom', offset: -20, fontSize: 12, fill: C.navy }}
              />
              <YAxis
                type="number" dataKey="mat" name="Mat"
                domain={[0, 100]} tickFormatter={v => `${v}%`}
                tick={{ fontSize: 11, fill: C.tm }}
                label={{ value: '% Matemática', angle: -90, position: 'insideLeft', offset: 12, fontSize: 12, fill: C.navy }}
              />
              {avg && <ReferenceLine x={avg.pdl} stroke={C.tm} strokeDasharray="4 3" strokeWidth={1} />}
              {avg && <ReferenceLine y={avg.mat} stroke={C.tm} strokeDasharray="4 3" strokeWidth={1} />}
              <Tooltip content={<ScatterTooltip />} />
              <Scatter data={points} fill={C.barFill} opacity={0.75} r={5} />
            </ScatterChart>
          </ResponsiveContainer>
          <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: C.tm }}>N = {points.length} alumnos</Typography>
            {avg && (
              <Typography variant="caption" sx={{ color: C.tm }}>
                Promedio: PDL {avg.pdl}% · Mat {avg.mat}%
              </Typography>
            )}
          </Stack>
        </>
      )}
    </Paper>
  )
}

// ── Tab: Resumen por estudiante (Tabla) ───────────────────────────────────────

function TablaTab({ rows }: { rows: I_TablaRow[] }) {
  const dot = (v: number | undefined) => {
    if (v == null) return null
    const color = v >= 78 ? NIVEL_COLORS.verde : v >= 50 ? NIVEL_COLORS.amarillo : v >= 28 ? NIVEL_COLORS.naranja : NIVEL_COLORS.rojo
    return <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, display: 'inline-block', mr: 0.75, verticalAlign: 'middle' }} />
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography sx={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>
          Resumen de respuestas correctas por alumno
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: C.navy, bgcolor: C.lightBlue }}>ID Alumno</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: C.navy, bgcolor: C.lightBlue }}>Matemática %</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: C.navy, bgcolor: C.lightBlue }}>PDL %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: C.tm, py: 3 }}>
                  Sin datos para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : rows.map(row => (
              <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ color: C.navy, fontWeight: 600 }}>{row.id}</TableCell>
                <TableCell align="right">
                  {row.mat != null ? <>{dot(row.mat)}{row.mat}%</> : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
                <TableCell align="right">
                  {row.len != null ? <>{dot(row.len)}{row.len}%</> : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > 0 && (
        <Box sx={{ px: 2.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: C.tm }}>{rows.length} alumnos</Typography>
        </Box>
      )}
    </Paper>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface FilterDef { label: string; value: string; opts: string[]; set: (v: string) => void }

function Sidebar({ filters, onReset }: { filters: FilterDef[]; onReset: () => void }) {
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
  return (
    <Box sx={{
      width: 200, minHeight: '100vh', flexShrink: 0,
      background: `linear-gradient(180deg, ${C.navy} 0%, ${C.blue} 100%)`,
      px: 1.75, pt: 2.5, pb: 2,
      display: 'flex', flexDirection: 'column',
    }}>
      {filters.map(({ label, value, opts, set }) => (
        <FormControl key={label} fullWidth size="small" sx={{ mb: 2.25 }}>
          <InputLabel sx={labelSx}>{label}</InputLabel>
          <Select value={value} label={label} onChange={e => set(e.target.value)} sx={selectSx}>
            {opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </FormControl>
      ))}
      <Button bgcolor="red" fullWidth onClick={onReset} sx={{ mt: 0.5, fontSize: 12 }}>
        Borrar filtros
      </Button>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', pt: 1.5, display: 'flex', justifyContent: 'center' }}>
        <LogoAustral width={sidebarAustralLogoSize.w} height={sidebarAustralLogoSize.h} />
      </Box>
    </Box>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type TabId = 'resumen' | 'detalle' | 'semaforo' | 'scatter' | 'tabla'

function ReporteEscuelaPage() {
  const params = useParams<{ escuelaId: string }>()
  const escuelaId = params?.escuelaId ? Number(params.escuelaId) : null

  const [tab, setTab] = useState<TabId>(TAB_IDS.RESUMEN)
  const [toma, setToma] = useState('')
  const [materia, setMateria] = useState('Matemática')
  const [anio, setAnio] = useState('3ro')
  const [division, setDivision] = useState('Todas')

  const { loading, error, tomas, getMaterias, getAnios, getDivisiones, getReporte, getSemaforoBandas, getScatterPoints, getTablaData } =
    useEscuelaReporteReact(escuelaId)

  const materias = getMaterias(toma)
  const anios = getAnios(toma, materia)

  const divisiones = useMemo(() => {
    if (tab === TAB_IDS.SEMAFORO) {
      const divSet = new Set<string>()
      for (const a of ANIO_ORDER) {
        getDivisiones(materia, a, toma).filter(d => d !== 'Todas').forEach(d => divSet.add(d))
      }
      const divs = [...divSet]
      return divs.length > 0 ? ['Todas', ...divs] : ['Todas']
    }
    return getDivisiones(materia, anio, toma)
  }, [tab, materia, anio, toma, getDivisiones]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tomas.length > 0 && !toma) setToma(tomas[tomas.length - 1])
    if (materias.length > 0 && !materias.includes(materia)) setMateria(materias[0])
    if (anios.length > 0 && !anios.includes(anio)) setAnio(anios[0])
    if (divisiones.length > 0 && !divisiones.includes(division)) setDivision(divisiones[0])
  }, [tomas, materias, anios, divisiones, toma, materia, anio, division]) // eslint-disable-line react-hooks/exhaustive-deps

  const data = toma ? getReporte({ materia, anio, division, toma }) : null
  const schoolName = data?.colegio ?? (loading ? 'Cargando…' : 'Escuela')

  const scatterPoints = useMemo(
    () => (toma ? getScatterPoints(anio, division, toma) : []),
    [anio, division, toma, getScatterPoints],
  )

  const tablaRows = useMemo(
    () => (toma ? getTablaData(anio, division, toma) : []),
    [anio, division, toma, getTablaData],
  )

  const tomaFilter: FilterDef = { label: 'Toma', value: toma, opts: tomas.length > 0 ? tomas : [toma].filter(Boolean), set: setToma }
  const divFilter: FilterDef = { label: 'División', value: division, opts: divisiones, set: setDivision }
  const materiaFilter: FilterDef = { label: 'Materia', value: materia, opts: materias.length > 0 ? materias : [materia], set: setMateria }
  const anioFilter: FilterDef = { label: 'Año', value: anio, opts: anios.length > 0 ? anios : ANIO_ORDER.slice(), set: setAnio }

  const sidebarFilters = useMemo((): FilterDef[] => {
    const FILTER_LAYOUTS: Record<TabId, FilterDef[]> = {
      [TAB_IDS.RESUMEN]: [
        ...(materias.length > 1 ? [materiaFilter] : []),
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.DETALLE]: [
        ...(materias.length > 1 ? [materiaFilter] : []),
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.SEMAFORO]: [
        ...(materias.length > 1 ? [materiaFilter] : []),
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.SCATTER]: [
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.TABLA]: [
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
    }
    return FILTER_LAYOUTS[tab] ?? []
  }, [tab, materia, materias, anio, anios, division, divisiones, toma, tomas, materiaFilter, anioFilter, divFilter, tomaFilter])

  const resetFilters = () => {
    setMateria('Matemática')
    setAnio('3ro')
    setDivision('Todas')
    if (tomas.length > 0) setToma(tomas[tomas.length - 1])
  }

  const tabLabels: Record<TabId, string> = {
    [TAB_IDS.RESUMEN]: 'Resultados generales',
    [TAB_IDS.DETALLE]: materia,
    [TAB_IDS.SEMAFORO]: 'Semáforo',
    [TAB_IDS.SCATTER]: 'Resultados por alumno',
    [TAB_IDS.TABLA]: 'Resumen por estudiante',
  }

  const filterPills = useMemo(() => {
    const pills: { label: string }[] = []
    if ((tab === TAB_IDS.RESUMEN || tab === TAB_IDS.DETALLE || tab === TAB_IDS.SEMAFORO) && materias.length > 1) {
      pills.push({ label: `Materia: ${materia || '—'}` })
    }
    if (tab !== TAB_IDS.SEMAFORO) {
      pills.push({ label: `Año: ${anio || '—'}` })
    }
    if (divisiones.length > 1) pills.push({ label: `División: ${division || '—'}` })
    if (toma) pills.push({ label: `Toma: ${toma}` })
    return pills
  }, [tab, materia, materias, anio, division, divisiones, toma])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar filters={sidebarFilters} onReset={resetFilters} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 0.5, bgcolor: 'background.paper' }}>
          <Typography variant="h5" sx={{ color: C.navy, fontWeight: 800 }}>
            {schoolName} — {tabLabels[tab]}
          </Typography>
          <Logo width={headerLogoSize.w} height={headerLogoSize.h} />
        </Box>

        {/* Filter pills */}
        <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.25, bgcolor: 'background.paper', flexWrap: 'wrap' }}>
          {filterPills.map(p => (
            <Chip key={p.label} label={p.label} size="small" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: 600 }} />
          ))}
        </Stack>

        {/* Tabs */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
            <Tab value={TAB_IDS.RESUMEN} label="Resumen" />
            <Tab value={TAB_IDS.DETALLE} label="Contenido y competencia" />
            <Tab value={TAB_IDS.SEMAFORO} label="Semáforo" />
            <Tab value={TAB_IDS.SCATTER} label="Resultados por alumno" />
            <Tab value={TAB_IDS.TABLA} label="Resumen por estudiante" />
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
          {!loading && !error && (
            <>
              {tab === TAB_IDS.RESUMEN && data && <ResumenTab data={data} />}
              {tab === TAB_IDS.DETALLE && data && <DetalleTab data={data} />}
              {(tab === TAB_IDS.RESUMEN || tab === TAB_IDS.DETALLE) && !data && toma && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography color="text.secondary">Sin datos para {materia} · {anio} · {toma}</Typography>
                </Box>
              )}
              {tab === TAB_IDS.SEMAFORO && (
                <SemaforoTab materia={materia} division={division} toma={toma} getSemaforoBandas={getSemaforoBandas} />
              )}
              {tab === TAB_IDS.SCATTER && <ScatterTab points={scatterPoints} />}
              {tab === TAB_IDS.TABLA && <TablaTab rows={tablaRows} />}
            </>
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

export default withAuth(ReporteEscuelaPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
