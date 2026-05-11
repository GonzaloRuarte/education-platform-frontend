'use client'

import { Box, Paper, Stack, Typography } from '@mui/material'
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, ReferenceLine } from 'recharts'
import { useMemo } from 'react'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING, CARD_SX, FILL_COLUMN_SX, CHART_MARGINS, AXIS, SCATTER, LAYOUT_SIZES } from '@/mta_reports_v2/constants'
import type { I_EscuelaMiembro, I_ScatterPoint } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS
const S = SPACING

// Paleta cualitativa estable: 25 colores generados por golden-angle (137.5°) en HSL.
// Determinístico, repetible y suficientemente distinguible para hasta 25 escuelas.
const SCHOOL_PALETTE: string[] = Array.from({ length: 25 }, (_, i) => {
  const hue = Math.round((i * 137.508) % 360)
  return `hsl(${hue}, 65%, 45%)`
})

const colorFor = (idx: number) => SCHOOL_PALETTE[idx % SCHOOL_PALETTE.length]

function ScatterTooltip({ active, payload, schoolNameById }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as I_ScatterPoint
  const schoolName = d.school && schoolNameById ? schoolNameById[d.school] : undefined
  return (
    <Paper elevation={2} sx={{ bgcolor: C.white, p: S.groupSpacing, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" sx={{ color: C.navy, fontWeight: W.bold }}>Alumno #{d.id}</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: C.tm }}>PDL: {d.pdl}%</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: C.tm }}>Mat: {d.mat}%</Typography>
      {schoolName && (
        <Typography variant="caption" sx={{ display: 'block', color: C.tm }}>{schoolName}</Typography>
      )}
    </Paper>
  )
}

interface ScatterTabProps {
  points: I_ScatterPoint[]
  isAgrupamiento?: boolean
  escuelas?: I_EscuelaMiembro[]
}

function ScatterTab({ points, isAgrupamiento = false, escuelas = [] }: ScatterTabProps) {
  const avg = useMemo(() => {
    if (!points.length) return null
    return {
      pdl: Math.round(points.reduce((s, p) => s + p.pdl, 0) / points.length),
      mat: Math.round(points.reduce((s, p) => s + p.mat, 0) / points.length),
    }
  }, [points])

  // Mapeos por escuela: id → color (índice estable según orden del agrupamiento)
  // y id → nombre (para tooltip + leyenda). Sólo se usan en agrupamiento.
  const schoolColorById = useMemo(() => {
    const out: Record<string, string> = {}
    escuelas.forEach((e, i) => { out[e.id] = colorFor(i) })
    return out
  }, [escuelas])
  const schoolNameById = useMemo(() => {
    const out: Record<string, string> = {}
    for (const e of escuelas) out[e.id] = e.name
    return out
  }, [escuelas])

  // Para colorear por escuela, separamos los puntos en una serie por escuela.
  // En modo escuela queda una sola serie con el color clásico.
  const series = useMemo(() => {
    if (!isAgrupamiento) {
      return [{ key: '__single__', name: null, color: C.navyMid, data: points }]
    }
    const byId: Record<string, I_ScatterPoint[]> = {}
    const unknown: I_ScatterPoint[] = []
    for (const p of points) {
      if (p.school && schoolColorById[p.school]) {
        if (!byId[p.school]) byId[p.school] = []
        byId[p.school].push(p)
      } else {
        unknown.push(p)
      }
    }
    const out = escuelas
      .filter(e => byId[e.id]?.length)
      .map(e => ({ key: e.id, name: e.name, color: schoolColorById[e.id], data: byId[e.id] }))
    if (unknown.length) out.push({ key: '__unknown__', name: 'Sin escuela', color: C.mutedGrey, data: unknown })
    return out
  }, [isAgrupamiento, points, escuelas, schoolColorById])

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
              <Tooltip content={<ScatterTooltip schoolNameById={schoolNameById} />} />
              {series.map(s => (
                <Scatter key={s.key} data={s.data} fill={s.color} opacity={SCATTER.dotOpacity} r={SCATTER.dotRadius} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
          </Box>
          <Stack direction="row" spacing={3} sx={{ mt: 1.5, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: C.tm }}>N = {points.length} alumnos</Typography>
            {avg && (
              <Typography variant="caption" sx={{ color: C.tm }}>
                Promedio: PDL {avg.pdl}% · Mat {avg.mat}%
              </Typography>
            )}
            {isAgrupamiento && series.length > 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {series.map(s => (
                  <Stack key={s.key} direction="row" alignItems="center" spacing={0.5} component="span">
                    <Box component="span" sx={{ width: LAYOUT_SIZES.dotLarge, height: LAYOUT_SIZES.dotLarge, borderRadius: RADIUS.circle, bgcolor: s.color, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: C.black, fontSize: F.legend }}>{s.name ?? ''}</Typography>
                  </Stack>
                ))}
              </Box>
            )}
          </Stack>
        </>
      )}
    </Paper>
  )
}

export { ScatterTooltip, ScatterTab }
