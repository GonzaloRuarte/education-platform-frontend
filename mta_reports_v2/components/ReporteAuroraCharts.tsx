'use client'

import { useRef } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Rectangle, LabelList, ReferenceLine } from 'recharts'
import { COLORS, FONT_SIZES, SPACING, CHART_MARGINS } from '@/mta_reports_v2/constants'
import { useResponsiveBox, useResponsiveHeight } from '@/mta_reports_v2/hooks'
import type { I_BoxplotAurora, I_ItemAurora } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const S = SPACING

function Leg({ c, t }: { c: string; t: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} component="span" sx={{ mr: 2, display: 'inline-flex' }}>
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: C.tm, fontSize: F.md }}>{t}</Typography>
    </Stack>
  )
}

function AllSchoolsBarChart({ bars, miId }: { bars: { id: string; p: number }[]; miId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const height = useResponsiveHeight(containerRef)

  const sorted = [...bars].sort((a, b) => b.p - a.p)
  const prom = sorted.length
    ? Math.round(sorted.reduce((s, e) => s + e.p, 0) / sorted.length * 10) / 10
    : 0

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} margin={CHART_MARGINS.vertical}>
          <CartesianGrid vertical={false} stroke={C.gridLight} strokeWidth={0.8} />
          <XAxis dataKey="id" tick={{ fontSize: F.md, fill: C.tm }} angle={-40} textAnchor="end" interval={0} />
          <ReferenceLine y={prom} stroke={C.refRed} strokeDasharray="4 3" strokeWidth={1} />
          <Bar
            dataKey="p"
            shape={(props: any) => {
              const isMe = sorted[props.index]?.id === miId
              return <Rectangle {...props} fill={isMe ? C.barMe : C.barFill} radius={[2, 2, 0, 0]} />
            }}
          >
            <LabelList dataKey="p" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: F.lg, fill: C.navy }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Box sx={{ mt: 0.75 }}>
        <Leg c={C.barMe} t="Mi escuela" />
        <Leg c={C.barFill} t="Otras escuelas" />
        <Typography variant="caption" sx={{ ml: 0.5, color: C.tm, fontSize: F.md }}>
          Promedio programa: <strong>{prom}%</strong>
        </Typography>
      </Box>
    </Box>
  )
}

function HorizontalBarChart({ items }: { items: I_ItemAurora[] }) {
  const data = items.map(item => ({ name: item.n, mi: item.mi, todos: item.t }))
  const chartH = Math.max(80, data.length * 50 + 50)

  return (
    <ResponsiveContainer width="100%" height={chartH}>
      <BarChart layout="vertical" data={data} margin={CHART_MARGINS.horizontal}>
        <CartesianGrid horizontal={false} stroke={C.gridLight} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: F.md, fill: C.tm }} />
        <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: F.lg, fill: C.navy }} />
        <Bar dataKey="mi" fill={C.barFill} barSize={13} name="Mi colegio">
          <LabelList dataKey="mi" position="right" formatter={(v: number) => `${v} %`} style={{ fontSize: F.lg, fill: C.navy, fontWeight: 600 }} />
        </Bar>
        <Bar dataKey="todos" fill={C.barLight} barSize={13} name="Todos los colegios">
          <LabelList dataKey="todos" position="right" formatter={(v: number) => `${v} %`} style={{ fontSize: F.lg, fill: C.tm }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function BP({ d, color, w = 90, h = 280 }: { d: I_BoxplotAurora; color: string; w?: number; h?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useResponsiveBox(containerRef, { initialW: w, initialH: h })

  const data = [{ name: 'box', q1: d.q1, q3: d.q3, md: d.md, av: d.av, min: d.min, max: d.max }]

  const renderBox = (props: any) => {
    const { x, width } = props
    const chartHeight = dimensions.h - 40
    const yScale = (v: number) => dimensions.h - 20 - (v / 100) * chartHeight

    return (
      <g>
        <rect x={x + width / 2 - 18} y={yScale(d.q3)} width={36} height={yScale(d.q1) - yScale(d.q3)} fill={color} stroke={color} strokeWidth={1} rx={1} opacity={0.9} />
        <line x1={x + width / 2} y1={yScale(d.max)} x2={x + width / 2} y2={yScale(d.q3)} stroke={color} strokeWidth={1.5} />
        <line x1={x + width / 2} y1={yScale(d.q1)} x2={x + width / 2} y2={yScale(d.min)} stroke={color} strokeWidth={1.5} />
        <line x1={x + width / 2 - 10} y1={yScale(d.max)} x2={x + width / 2 + 10} y2={yScale(d.max)} stroke={color} strokeWidth={1.5} />
        <line x1={x + width / 2 - 10} y1={yScale(d.min)} x2={x + width / 2 + 10} y2={yScale(d.min)} stroke={color} strokeWidth={1.5} />
        <line x1={x + width / 2 - 18} y1={yScale(d.md)} x2={x + width / 2 + 18} y2={yScale(d.md)} stroke={C.white} strokeWidth={2.5} />
        <circle cx={x + width / 2} cy={yScale(d.av)} r={3.5} fill={C.darkGrey} stroke={C.white} strokeWidth={1} />
      </g>
    )
  }

  return (
    <Box ref={containerRef} sx={{ width: dimensions.w, height: dimensions.h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CHART_MARGINS.boxplot}>
          <CartesianGrid horizontal={true} vertical={false} stroke={C.gridLighter} strokeWidth={0.5} />
          <XAxis dataKey="name" hide />
          <YAxis domain={[0, 100]} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} tick={{ fontSize: F.md, fill: C.tm }} />
          <Bar dataKey="q1" shape={renderBox} fill={color} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
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
    <Box component="article" sx={{ bgcolor: C.white, border: '1px solid', borderColor: 'divider', borderRadius: 5, flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', p: S.cardPadding }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: C.navy, fontWeight: 700, fontSize: F.lg }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: C.tm, fontSize: F.md }}>{subtitle}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
        <Box sx={{ bgcolor: C.navy, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: S.cardInnerPx, py: S.cardInnerPy, borderRadius: 4 }}>
          <Typography sx={{ color: C.white, fontSize: F.md }}>Mi Colegio</Typography>
          <Typography sx={{ color: C.white, fontWeight: 800, fontSize: F.xl }}>{fmt(mi)}</Typography>
        </Box>
        <Box sx={{ bgcolor: C.lightBlue, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: S.cardInnerPx, py: S.cardInnerPy, borderRadius: 4 }}>
          <Typography sx={{ color: C.navy, fontSize: F.md }}>Todos los colegios</Typography>
          <Typography sx={{ color: C.navy, fontWeight: 800, fontSize: F.xl }}>{fmt(todos)}</Typography>
        </Box>
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
    <Box component="article" sx={{ bgcolor: C.white, border: '1px solid', borderColor: 'divider', borderRadius: 5, p: S.cardPaddingLarge }}>
      <Typography sx={{ fontSize: F.lg, color: C.accent, fontWeight: 500, mb: 0.25 }}>{num}. {title}</Typography>
      {subtitle && <Typography variant="subtitle1" sx={{ fontWeight: 600, color: C.navy, mb: 0.75, fontSize: F.lg }}>{subtitle}</Typography>}
      {legend && <Box sx={{ mb: 1 }}>{legend}</Box>}
      {children}
    </Box>
  )
}

export { Leg, AllSchoolsBarChart, HorizontalBarChart, BP, KPICard, ChartCard }
