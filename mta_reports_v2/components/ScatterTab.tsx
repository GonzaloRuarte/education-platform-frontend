'use client'

import { Box, Paper, Stack, Typography } from '@mui/material'
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, ReferenceLine } from 'recharts'
import { useMemo } from 'react'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, CARD_SX, FILL_COLUMN_SX, CHART_MARGINS, AXIS, SCATTER } from '@/mta_reports_v2/constants'
import type { I_ScatterPoint } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS
const S = SPACING

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as I_ScatterPoint
  return (
    <Paper elevation={2} sx={{ bgcolor: C.white, p: S.groupSpacing, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" sx={{ color: C.navy, fontWeight: W.bold }}>Alumno #{d.id}</Typography>
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
    <Paper elevation={0} sx={{ ...CARD_SX, p: S.scatterCardP, ...FILL_COLUMN_SX }}>
      <Typography sx={{ fontSize: F.lg, color: C.accent, fontWeight: W.medium, mb: 1.5, flexShrink: 0 }}>
        Resultados por alumno - % PDL vs % Matemática
      </Typography>
      {points.length === 0 ? (
        <Typography sx={{ color: C.navy }}>Sin datos para los filtros seleccionados</Typography>
      ) : (
        <>
          <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={CHART_MARGINS.scatter}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gridLight} />
              <XAxis
                type="number"
                dataKey="pdl"
                name="PDL"
                domain={AXIS.percentDomain}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: F.lg, fill: C.textGrey }}
                label={{ value: '% Prácticas del Lenguaje', position: 'insideBottom', offset: AXIS.labelOffset, fontSize: F.lg, fill: C.black }}
              />
              <YAxis
                type="number"
                dataKey="mat"
                name="Mat"
                domain={AXIS.percentDomain}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: F.lg, fill: C.textGrey }}
                label={{ value: '% Matemática', angle: -90, position: 'insideLeft', fontSize: F.lg, fill: C.black }}
              />
              <ZAxis type="number"
                dataKey="mat"
                name="Mat" range={SCATTER.bubbleRange} />
              {avg && <ReferenceLine x={avg.pdl} stroke={C.tm} strokeDasharray={AXIS.refLineDash} strokeWidth={1} />}
              {avg && <ReferenceLine y={avg.mat} stroke={C.tm} strokeDasharray={AXIS.refLineDash} strokeWidth={1} />}
              <Tooltip content={<ScatterTooltip />} />
              <Scatter data={points} fill={C.navyMid} opacity={SCATTER.dotOpacity} r={SCATTER.dotRadius} />
            </ScatterChart>
          </ResponsiveContainer>
          </Box>
          <Stack direction="row" spacing={3} sx={{ mt: 1.5, flexShrink: 0 }}>
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

export { ScatterTooltip, ScatterTab }
