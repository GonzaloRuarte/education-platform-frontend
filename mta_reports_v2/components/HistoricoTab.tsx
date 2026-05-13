'use client'

import { useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, Leg } from '@/mta_reports_v2/components/ReporteAuroraCharts'
import { AXIS, BAR_CHART, BOX_SHADOWS, CHART_MARGINS, COLORS, FONT_SIZES, FONT_WEIGHTS, LAYOUT_SIZES, RADIUS, TITLE_FONT_FAMILY } from '@/mta_reports_v2/constants'
import type { I_RawHistoricoBar, I_RawHistoricoData } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS

interface HistoricoTabProps { data: I_RawHistoricoData | null | undefined }

const HistoricoChart = ({ data }: { data: I_RawHistoricoBar[] }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const makeShape = (fill: string) => (props: any) => {
    const isHover = props.index === hoverIdx
    return (
      <Rectangle
        {...props}
        fill={fill}
        radius={BAR_CHART.radius.vertical}
        style={{
          transition: 'opacity 0.15s ease, filter 0.15s ease',
          opacity: hoverIdx === null || isHover ? 1 : 0.55,
          filter: isHover ? 'brightness(0.92)' : 'none',
        }}
      />
    )
  }

  return (
    <Box>
      <Box sx={{ height: LAYOUT_SIZES.chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ ...CHART_MARGINS.vertical, bottom: 8 }}
          onMouseMove={(s: any) => setHoverIdx(typeof s?.activeTooltipIndex === 'number' ? s.activeTooltipIndex : null)}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <CartesianGrid vertical={false} stroke={C.gridDivider} strokeWidth={1} strokeDasharray="1 8" strokeLinecap="round" />
          <XAxis dataKey="toma" tick={{ fontSize: F.lg, fill: C.tm, fontWeight: W.medium }} axisLine={{ stroke: C.gridDivider }} tickLine={false} />
          <YAxis
            domain={AXIS.percentDomain}
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: F.md, fill: C.tm }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null
              const row = payload[0].payload as I_RawHistoricoBar
              return (
                <Box sx={{
                  bgcolor: C.white,
                  border: `1px solid ${C.gridDivider}`,
                  borderRadius: RADIUS.sm,
                  px: 1.5,
                  py: 1,
                  fontSize: F.lg,
                  color: C.darkGrey,
                  lineHeight: 1.9,
                  boxShadow: BOX_SHADOWS.tooltip,
                }}>
                  <Box sx={{ fontWeight: W.bold, color: C.navy, mb: 0.5 }}>Toma {row.toma}</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box component="span" sx={{ width: LAYOUT_SIZES.dotSmall, height: LAYOUT_SIZES.dotSmall, borderRadius: RADIUS.circle, bgcolor: C.navyMid, flexShrink: 0, display: 'inline-block' }} />
                    Mi colegio: <strong style={{ marginLeft: 4 }}>{row.pct_mi_colegio.toFixed(1)}%</strong>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box component="span" sx={{ width: LAYOUT_SIZES.dotSmall, height: LAYOUT_SIZES.dotSmall, borderRadius: RADIUS.circle, bgcolor: C.iceBlue, border: `1.5px solid ${C.gridDivider}`, flexShrink: 0, display: 'inline-block' }} />
                    Todos los colegios: <strong style={{ marginLeft: 4 }}>{row.pct_promedio_red.toFixed(1)}%</strong>
                  </Box>
                </Box>
              )
            }}
          />
          <Bar dataKey="pct_mi_colegio" name="Mi colegio" fill={C.navyMid} shape={makeShape(C.navyMid)} />
          <Bar dataKey="pct_promedio_red" name="Todos los colegios" fill={C.iceBlue} shape={makeShape(C.iceBlue)} />
        </BarChart>
      </ResponsiveContainer>
      </Box>
      <Box sx={{ mt: 0.75 }}>
        <Leg c={C.navyMid} t="% Correctas mi colegio" />
        <Leg c={C.iceBlue} t="% Correctas todos los colegios" />
      </Box>
    </Box>
  )
}

const HistoricoTab = ({ data }: HistoricoTabProps) => {
  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto', pr: 1 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography sx={{ color: C.navy, fontFamily: TITLE_FONT_FAMILY, fontWeight: W.extrabold, fontSize: F.subtitle }}>Evolución del % de respuestas correctas por toma</Typography>
      </Stack>
      {!data ? (
        <Typography sx={{ color: C.tm }}>Sin datos históricos.</Typography>
      ) : (
        <Stack direction="column" spacing={3}>
          <ChartCard num="01" title="Matemática" dense>
            <HistoricoChart data={data.por_materia.matematica} />
          </ChartCard>
          <ChartCard num="02" title="Prácticas del Lenguaje" dense>
            <HistoricoChart data={data.por_materia.lenguaje} />
          </ChartCard>
        </Stack>
      )}
    </Box>
  )
}

export { HistoricoTab }
