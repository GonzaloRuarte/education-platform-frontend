'use client'

import { Box, Paper, Stack, Typography } from '@mui/material'
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { useMemo, useState, useEffect } from 'react'
import { COLORS, FONT_SIZES } from '@/mta_reports_v2/constants'
import type { I_ScatterPoint } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES

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
  const [chartHeight, setChartHeight] = useState(420)

  useEffect(() => {
    const calculateHeight = () => {
      const availableHeight = window.innerHeight - 300
      setChartHeight(Math.max(400, Math.min(availableHeight, 700)))
    }
    calculateHeight()
    window.addEventListener('resize', calculateHeight)
    return () => window.removeEventListener('resize', calculateHeight)
  }, [])

  const avg = useMemo(() => {
    if (!points.length) return null
    return {
      pdl: Math.round(points.reduce((s, p) => s + p.pdl, 0) / points.length),
      mat: Math.round(points.reduce((s, p) => s + p.mat, 0) / points.length),
    }
  }, [points])

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
      <Typography sx={{ fontSize: F.lg, color: C.accent, fontWeight: 500, mb: 1.5 }}>
        Resultados por alumno — % PDL vs % Matemática
      </Typography>
      {points.length === 0 ? (
        <Typography sx={{ color: C.tm }}>Sin datos para los filtros seleccionados</Typography>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                type="number"
                dataKey="pdl"
                name="PDL"
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: F.chart.lg, fill: C.tm }}
                label={{ value: '% Prácticas del Lenguaje', position: 'insideBottom', offset: -25, fontSize: F.lg, fill: 'black' }}
              />
              <YAxis
                type="number"
                dataKey="mat"
                name="Mat"
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: F.lg, fill: 'grey' }}
                label={{ value: '% Matemática', angle: -90, position: 'insideLeft', fontSize: F.lg, fill: 'black' }}
              />
              {avg && <ReferenceLine x={avg.pdl} stroke={C.tm} strokeDasharray="4 3" strokeWidth={1} />}
              {avg && <ReferenceLine y={avg.mat} stroke={C.tm} strokeDasharray="4 3" strokeWidth={1} />}
              <Tooltip content={<ScatterTooltip />} />
              <Scatter data={points} fill={C.barFill} opacity={0.75} r={20} />
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

export { ScatterTooltip, ScatterTab }
