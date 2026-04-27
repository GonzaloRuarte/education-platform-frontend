'use client'

import { Box, Stack, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Rectangle, LabelList, ReferenceLine } from 'recharts'
import { COLORS } from '@/mta_reports_v2/constants'
import type { I_BoxplotReact, I_ItemReact } from '@/mta_reports_v2/types'

const C = COLORS

function Leg({ c, t }: { c: string; t: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} component="span" sx={{ mr: 2, display: 'inline-flex' }}>
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: C.tm }}>{t}</Typography>
    </Stack>
  )
}

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

interface KPICardProps {
  title: string
  subtitle: string
  mi: number | string
  todos: number | string
  suffix?: string
}

function KPICard({ title, subtitle, mi, todos, suffix = '%' }: KPICardProps) {
  const fmt = (v: number | string) => typeof v === 'number' ? `${v}${suffix}` : v
  return (
    <Box component="article" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', flex: 1, minWidth: 160 }}>
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
    </Box>
  )
}

function ChartCard({ num, title, subtitle, legend, children }: {
  num: string
  title: string
  subtitle?: string
  legend?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Box component="article" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
      <Typography sx={{ fontSize: 13, color: C.accent, fontWeight: 500, mb: 0.25 }}>{num}. {title}</Typography>
      {subtitle && <Typography variant="subtitle1" sx={{ fontWeight: 600, color: C.navy, mb: 0.75 }}>{subtitle}</Typography>}
      {legend && <Box sx={{ mb: 1 }}>{legend}</Box>}
      {children}
    </Box>
  )
}

export { Leg, AllSchoolsBarChart, HorizontalBarChart, BP, KPICard, ChartCard }
