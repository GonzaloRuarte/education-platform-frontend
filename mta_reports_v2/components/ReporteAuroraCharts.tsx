'use client'

import { useRef, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Rectangle, LabelList, ComposedChart, Tooltip } from 'recharts'
import { COLORS, FONT_SIZES, SPACING, CHART_MARGINS, CARD_SX, FILL_COLUMN_SX, RADIUS } from '@/mta_reports_v2/constants'
import { useResponsiveBox, useResponsiveHeight } from '@/mta_reports_v2/hooks'
import type { I_BoxplotAurora, I_ItemAurora } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const S = SPACING

function Leg({ c, t }: { c: string; t: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} component="span" sx={{ mr: 2, display: 'inline-flex' }}>
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: C.tm, fontSize: F.base }}>{t}</Typography>
    </Stack>
  )
}

function MiVsTodosLegend() {
  return (
    <>
      <Leg c={C.darkGrey} t="% Correctas mi colegio" />
      <Leg c={C.iceBlue} t="% Correctas todos los colegios" />
    </>
  )
}

function AllSchoolsBarChart({
  bars,
  miId,
  minHeight,
  bottomMargin,
  fill = false,
}: {
  bars: { id: string; p: number }[]
  miId: string
  minHeight?: number
  bottomMargin?: number
  fill?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const height = useResponsiveHeight(containerRef, { minHeight, bottomMargin })
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const sorted = [...bars].sort((a, b) => b.p - a.p)
  const prom = sorted.length
    ? Math.round(sorted.reduce((s, e) => s + e.p, 0) / sorted.length * 10) / 10
    : 0

  const wrapperSx = fill
    ? FILL_COLUMN_SX
    : { display: 'flex', flexDirection: 'column', height: height }
  const chartWrapperSx = fill
    ? { flex: 1, minHeight: 0 }
    : { flex: 1 }

  return (
    <Box ref={containerRef} sx={wrapperSx}>
      <Box sx={chartWrapperSx}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            margin={CHART_MARGINS.vertical}
            onMouseMove={(s: any) => setHoverIdx(typeof s?.activeTooltipIndex === 'number' ? s.activeTooltipIndex : null)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <CartesianGrid vertical={false} stroke={C.gridDivider} strokeWidth={1} strokeDasharray="1 8" strokeLinecap="round" />
            <XAxis dataKey="id" tick={{ fontSize: F.md, fill: C.tm }} angle={-40} textAnchor="end" interval={0} />
            <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: F.md, fill: C.tm }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null
                const p = payload[0].payload
                return (
                  <Box sx={{
                    bgcolor: C.white,
                    border: `1px solid ${C.gridDivider}`,
                    borderRadius: 1,
                    px: 1.5,
                    py: 1,
                    fontSize: F.lg,
                    color: C.darkGrey,
                    lineHeight: 1.5,
                  }}>
                    <Box>ID Escuela: <strong>{p.id}</strong></Box>
                    <Box>Promedio de Porcentaje Correctas: <strong>{p.p}%</strong></Box>
                  </Box>
                )
              }}
            />
            <Bar
              dataKey="p"
              shape={(props: any) => {
                const isMe = sorted[props.index]?.id === miId
                const isHover = props.index === hoverIdx
                const baseFill = isMe ? C.navyMid : C.iceBlue
                return (
                  <Rectangle
                    {...props}
                    fill={baseFill}
                    radius={[2, 2, 0, 0]}
                    style={{
                      transition: 'opacity 0.15s ease, filter 0.15s ease',
                      opacity: hoverIdx === null || isHover ? 1 : 0.55,
                      filter: isHover ? 'brightness(0.92)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                )
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ mt: 0.75, flexShrink: 0 }}>
        <Leg c={C.navyMid} t="Mi escuela" />
        <Leg c={C.iceBlue} t="Otras escuelas" />
        <Typography variant="caption" sx={{ ml: 0.5, color: C.tm, fontSize: F.md }}>
          Promedio programa: <strong>{prom}%</strong>
        </Typography>
      </Box>
    </Box>
  )
}

function YAxisWrappedTick(props: any) {
  const { x, y, payload } = props
  const text = String(payload?.value ?? '')
  const maxChars = 22
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    const next = current ? `${current} ${w}` : w
    if (next.length > maxChars && current) {
      lines.push(current)
      current = w
    } else {
      current = next
    }
  }
  if (current) lines.push(current)

  const lineHeight = 14
  const startY = -((lines.length - 1) * lineHeight) / 2
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={startY + i * lineHeight}
          dy="0.355em"
          textAnchor="end"
          fill={C.navy}
          fontSize={F.lg}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function HorizontalBarChart({
  items,
  rowHeight = 50,
  baseHeight = 50,
  barSize = 13,
}: {
  items: I_ItemAurora[]
  rowHeight?: number
  baseHeight?: number
  barSize?: number
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const data = items.map(item => ({ name: item.n, mi: item.mi, todos: item.t }))
  const chartH = Math.max(80, data.length * rowHeight + baseHeight)
  const maxVal = data.reduce((m, d) => Math.max(m, d.mi ?? 0, d.todos ?? 0), 0)
  const xMax = Math.min(100, Math.max(20, Math.ceil((maxVal) / 10) * 10))

  const makeShape = (fill: string) => (props: any) => {
    const isHover = props.index === hoverIdx
    return (
      <Rectangle
        {...props}
        fill={fill}
        radius={[0, 2, 2, 0]}
        style={{
          transition: 'opacity 0.12s ease',
          opacity: hoverIdx === null || isHover ? 1 : 0.35,
        }}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={chartH}>
      <BarChart
        layout="vertical"
        data={data}
        margin={CHART_MARGINS.horizontal}
        barGap={0}
        onMouseMove={(s: any) => setHoverIdx(typeof s?.activeTooltipIndex === 'number' ? s.activeTooltipIndex : null)}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <CartesianGrid horizontal={false} stroke={C.gridLight} strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[0, xMax]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: F.md, fill: C.tm }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={180}
          tick={<YAxisWrappedTick />}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          isAnimationActive={false}
          content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null
            const row = payload[0].payload
            return (
              <Box sx={{
                bgcolor: C.white,
                border: `1px solid ${C.gridDivider}`,
                borderRadius: 1,
                px: 1.5,
                py: 1,
                fontSize: F.lg,
                color: C.darkGrey,
                lineHeight: 1.9,
                maxWidth: 280,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              }}>
                <Box sx={{ fontWeight: 700, color: C.navy, mb: 0.5, wordBreak: 'break-word' }}>{row.name}</Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: C.navyMid, flexShrink: 0, display: 'inline-block' }} />
                  Mi colegio: <strong style={{ marginLeft: 4 }}>{row.mi}%</strong>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: C.iceBlue, border: `1.5px solid ${C.gridDivider}`, flexShrink: 0, display: 'inline-block' }} />
                  Todos los colegios: <strong style={{ marginLeft: 4 }}>{row.todos}%</strong>
                </Box>
              </Box>
            )
          }}
        />
        <Bar dataKey="mi" fill={C.navyMid} barSize={barSize} name="Mi colegio" shape={makeShape(C.navyMid)}>
          <LabelList dataKey="mi" position="right" formatter={(v: number) => `${v} %`} style={{ fontSize: F.lg, fill: C.navy }} />
        </Bar>
        <Bar dataKey="todos" fill={C.iceBlue} barSize={barSize} name="Todos los colegios" shape={makeShape(C.iceBlue)}>
          <LabelList dataKey="todos" position="right" formatter={(v: number) => `${v} %`} style={{ fontSize: F.lg, fill: C.tm }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function BoxplotShape(props: { x?: number; y?: number; width?: number; height?: number; d: I_BoxplotAurora; color: string }) {
  const { x = 0, y = 0, width = 0, height = 0, d, color } = props
  if (width <= 0 || height <= 0) return null

  const valToY = (v: number) => y + (100 - v) / 100 * height
  const cx = x + width / 2
  const bw = Math.min(64, width * 0.6)
  const whiskerW = bw / 3

  const yQ1 = valToY(d.q1)
  const yQ3 = valToY(d.q3)
  const yMin = valToY(d.min)
  const yMax = valToY(d.max)
  const yMd = valToY(d.md)
  const yAv = valToY(d.av)

  return (
    <g>
      <line x1={cx} y1={yMax} x2={cx} y2={yQ3} stroke={color} strokeWidth={2} />
      <line x1={cx} y1={yQ1} x2={cx} y2={yMin} stroke={color} strokeWidth={2} />
      <rect x={cx - bw / 2} y={yQ3} width={bw} height={Math.max(1, yQ1 - yQ3)} fill={color} stroke={color} strokeWidth={1} rx={2} opacity={0.9} />
      <line x1={cx - whiskerW} y1={yMax} x2={cx + whiskerW} y2={yMax} stroke={color} strokeWidth={2.5} />
      <line x1={cx - whiskerW} y1={yMin} x2={cx + whiskerW} y2={yMin} stroke={color} strokeWidth={2.5} />
      <line x1={cx - bw / 2} y1={yMd} x2={cx + bw / 2} y2={yMd} stroke={C.white} strokeWidth={3} />
      <circle cx={cx} cy={yAv} r={5.5} fill={C.darkGrey} stroke={C.white} strokeWidth={1.5} />
      {d.outliers?.map((v, i) => (
        <circle key={i} cx={cx} cy={valToY(v)} r={3} fill={C.white} stroke={color} strokeWidth={1.5} />
      ))}
    </g>
  )
}

function BP({ d, color, w = 120, h = 340 }: { d: I_BoxplotAurora; color: string; w?: number; h?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useResponsiveBox(containerRef, { initialW: w, initialH: h })

  const chartData = [{ name: 'box', range: [0, 100] as [number, number] }]

  return (
    <Box ref={containerRef} sx={{ width: dimensions.w, height: dimensions.h }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 4, bottom: 8, left: 4 }}>
          <CartesianGrid horizontal vertical={false} stroke={C.gridMid} strokeWidth={1} />
          <XAxis dataKey="name" hide />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: F.md, fill: C.tm }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            isAnimationActive={false}
            content={({ active }: any) => {
              if (!active) return null
              return (
                <Box sx={{
                  bgcolor: C.white,
                  border: `1px solid ${C.gridDivider}`,
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  fontSize: F.lg,
                  color: C.darkGrey,
                  lineHeight: 1.9,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                }}>
                  <Box sx={{ fontWeight: 700, color: C.navy, mb: 0.5 }}>Distribución</Box>
                  <Box>Máximo: <strong>{d.rawMax ?? d.max}%</strong></Box>
                  <Box>Q3: <strong>{d.q3}%</strong></Box>
                  <Box>Mediana: <strong>{d.md}%</strong></Box>
                  <Box>Media: <strong>{d.av}%</strong></Box>
                  <Box>Q1: <strong>{d.q1}%</strong></Box>
                  <Box>Mínimo: <strong>{d.rawMin ?? d.min}%</strong></Box>
                  {d.outliers && d.outliers.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>Atípicos: <strong>{d.outliers.join(', ')}%</strong></Box>
                  )}
                </Box>
              )
            }}
          />
          <Bar dataKey="range" isAnimationActive={false} shape={(props: any) => <BoxplotShape {...props} d={d} color={color} />} />
        </ComposedChart>
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
  const fmt = (v: number | string) => typeof v === 'number' ? (suffix ? `${v} ${suffix}` : `${v}`) : v
  return (
    <Box component="article" sx={{ ...CARD_SX, border: '2px solid', borderColor: C.blackAlpha18, flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', px: 1.25, py: 3 }}>
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ color: C.kpiText, fontWeight: 550, fontSize: F.kpiTitle }}>{title}</Typography>
        <Typography sx={{ color: C.kpiText, fontWeight: 500, fontSize: F.lg, pb: 4 }}>{subtitle}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        <Box sx={{ bgcolor: C.navyMid, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 2, borderRadius: RADIUS.lg }}>
          <Typography sx={{ color: C.white, fontSize: F.kpiLabel, fontWeight: 500 }}>Mi <br /> Colegio</Typography>
          <Typography sx={{ color: C.white, fontWeight: 550, fontSize: F.kpiValue, pr: 4 }}>{fmt(mi)}</Typography>
        </Box>
        <Box sx={{ bgcolor: C.iceBlue, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1.5, borderRadius: RADIUS.lg }}>
          <Typography sx={{ color: C.navy, fontSize: F.kpiLabel, fontWeight: 500 }}>Todos <br /> los colegios</Typography>
          <Typography sx={{ color: C.navy, fontWeight: 550, fontSize: F.kpiValue, pr: 4 }}>{fmt(todos)}</Typography>
        </Box>
      </Box>
    </Box >
  )
}

function ChartCard({ num, title, subtitle, legend, children, dense = false, sx, bodySx }: {
  num: string
  title: string
  subtitle?: string
  legend?: React.ReactNode
  children: React.ReactNode
  dense?: boolean
  sx?: object
  bodySx?: object
}) {
  return (
    <Box component="article" sx={{ ...CARD_SX, borderColor: C.blackAlpha18, p: dense ? S.cardPadding : S.cardPaddingLarge, ...sx }}>
      <Typography sx={{ fontSize: F.lg, color: C.navyMid, fontWeight: 500, mb: 0.25 }}>{num}. {title}</Typography>
      {subtitle && <Typography variant="subtitle1" sx={{ fontWeight: 600, color: C.navy, mb: dense ? 0.5 : 0.75, fontSize: F.cardSubtitle }}>{subtitle}</Typography>}
      {legend && <Box sx={{ mb: dense ? 0.5 : 1 }}>{legend}</Box>}
      {bodySx ? <Box sx={bodySx}>{children}</Box> : children}
    </Box>
  )
}

export { Leg, MiVsTodosLegend, AllSchoolsBarChart, HorizontalBarChart, BP, KPICard, ChartCard }
