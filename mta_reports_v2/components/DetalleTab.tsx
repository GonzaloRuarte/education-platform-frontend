'use client'

import { useState } from 'react'
import { Box, Stack, Typography, FormControl, InputLabel, Select, MenuItem, Grid2, Tooltip } from '@mui/material'
import Paper from '@mui/material/Paper'
import { BP, HorizontalBarChart, Leg, ChartCard } from '@/mta_reports_v2/components/ReporteAuroraCharts'
import { COLORS, FONT_SIZES } from '@/mta_reports_v2/constants'
import type { I_DetalleTabData } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES

function DetalleTab({ data }: { data: I_DetalleTabData }) {
  const d = data
  const isLenguaje = (d.lenComp?.length ?? 0) > 0
  const compItems = isLenguaje ? (d.lenComp ?? []) : d.competencia
  const contItems = isLenguaje ? (d.lenCont ?? []) : d.contenido

  const [selectedStudentId, setSelectedStudentId] = useState<string | number>('all')
  const selectedStudent = selectedStudentId !== 'all'
    ? d.estudiantes.find(e => e.id === selectedStudentId)
    : null

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
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1, width: '100%' }}>
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <BP d={d.boxplotMi} color={C.barFill} />
                <Typography variant="caption" sx={{ color: C.tm }}>Mi escuela</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <BP d={d.boxplotTodos} color={C.boxLight} />
                <Typography variant="caption" sx={{ color: C.tm }}>Todos los colegios</Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: C.tm, display: 'block', mt: 1.5 }}>
              *Información del gráfico de distribución sobre el círculo {' '}
              <Tooltip
                title="Diagrama de dispersión de resultados (diagrama de caja): Las líneas que se extienden hacia arriba y hacia abajo de la caja suelen ser llamadas 'bigotes', su extensión total indica entre qué valores se distribuyen los resultados (línea horizontal de arriba, el más alto y línea horizontal de abajo el más bajo). La línea horizontal central de la caja indica la mediana de los resultados: una mitad de los datos está por debajo de este valor y la otra mitad por encima. El punto negro señala la media de los resultados. La línea vertical superior a partir de la caja abarca el 25 % de resultados, la línea vertical de abajo a partir de la caja abarca el otro 25 % de resultados. Por lo tanto, en la 'caja' se halla el otro 50 % de los resultados; 25 % por arriba de la mediana y 25 % por debajo de la mediana."
                arrow
                slotProps={{
                  popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] }
                }}
              >
                <Box component="span" sx={{ cursor: 'help', fontWeight: 500, textDecoration: 'underline dotted' }}>●</Box>
              </Tooltip>
            </Typography>
          </ChartCard>
          <ChartCard num="04" title="Calificación por alumno">
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: C.navy, whiteSpace: 'nowrap' }}>
                ID del alumno
              </Typography>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} displayEmpty>
                  <MenuItem value="all">Todos</MenuItem>
                  {d.estudiantes.map(est => (
                    <MenuItem key={est.id} value={est.id}>
                      Alumno {est.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Paper elevation={0} sx={{ bgcolor: C.navy, borderRadius: 5, p: 2.5, mt: 2, textAlign: 'center' }}>
              <Typography sx={{ color: C.white, fontWeight: 700, fontSize: 22 }}>
                {selectedStudent ? `${selectedStudent.score}%` : 'Seleccione el ID del alumno'}
              </Typography>
            </Paper>
          </ChartCard>
        </Stack>
      </Grid2>
    </Grid2>
  )
}

export { DetalleTab }
