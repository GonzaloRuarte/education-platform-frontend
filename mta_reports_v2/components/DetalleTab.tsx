'use client'

import { Box, Stack, Typography, FormControl, InputLabel, Select, MenuItem, Grid2 } from '@mui/material'
import Paper from '@mui/material/Paper'
import { BP, HorizontalBarChart, Leg, ChartCard } from '@/mta_reports_v2/components/EscuelaReporteCharts'
import { COLORS } from '@/mta_reports_v2/constants'
import type { I_ReporteReactData } from '@/mta_reports_v2/types'

const C = COLORS

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

export { DetalleTab }
