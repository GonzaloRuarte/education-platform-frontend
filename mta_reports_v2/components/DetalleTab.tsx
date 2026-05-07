'use client'

import { useEffect, useState } from 'react'
import { Box, Stack, Typography, FormControl, Select, MenuItem, Grid2, Tooltip, IconButton } from '@mui/material'
import Paper from '@mui/material/Paper'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { BP, HorizontalBarChart, MiVsTodosLegend, ChartCard } from '@/mta_reports_v2/components/ReporteAuroraCharts'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, FILL_COLUMN_SX, BAR_CHART } from '@/mta_reports_v2/constants'
import type { I_DetalleTabData } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS

const EXPECTED_LEN_COMP = [
  'Comprensión lectora',
  'Reflexión sobre los hechos del lenguaje',
]
// Para Lenguaje, lenCont combina tipos de texto (contenido-) y microcompetencias (microcompetencia-).
const EXPECTED_LEN_CONT = [
  'Texto argumentativo',
  'Texto informativo',
  'Texto narrativo',
  'Análisis textual',
  'Reconocimiento de información explícita',
  'Reconocimiento de información implícita',
  'Clases de palabras',
]

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
const expectedSet = (xs: string[]) => new Set(xs.map(norm))

interface DetalleTabProps {
  data: I_DetalleTabData
}

function DetalleTab({ data }: DetalleTabProps) {
  const d = data
  const isLenguaje = (d.lenComp?.length ?? 0) > 0

  const [selectedStudentId, setSelectedStudentId] = useState<string | number>('all')

  useEffect(() => {
    if (selectedStudentId !== 'all' && !d.estudiantes.some(e => e.id === selectedStudentId)) {
      setSelectedStudentId('all')
    }
  }, [d.estudiantes, selectedStudentId])

  useEffect(() => {
    if (!isLenguaje) return
    const compAllowed = expectedSet(EXPECTED_LEN_COMP)
    const contAllowed = expectedSet(EXPECTED_LEN_CONT)
    const compBad = (d.lenComp ?? []).map(i => i.n).filter(n => !compAllowed.has(norm(n)))
    const contBad = (d.lenCont ?? []).map(i => i.n).filter(n => !contAllowed.has(norm(n)))
    const compMissing = EXPECTED_LEN_COMP.filter(e => !(d.lenComp ?? []).some(i => norm(i.n) === norm(e)))
    const contMissing = EXPECTED_LEN_CONT.filter(e => !(d.lenCont ?? []).some(i => norm(i.n) === norm(e)))
    if (compBad.length || contBad.length || compMissing.length || contMissing.length) {
      console.warn('[DetalleTab] Lenguaje data mismatch', {
        unexpectedCompetencias: compBad,
        unexpectedContenidos: contBad,
        missingCompetencias: compMissing,
        missingContenidos: contMissing,
        expectedCompetencias: EXPECTED_LEN_COMP,
        expectedContenidos: EXPECTED_LEN_CONT,
      })
    }
  }, [isLenguaje, d.lenComp, d.lenCont])

  const selectedStudent = selectedStudentId !== 'all'
    ? d.estudiantes.find(e => e.id === selectedStudentId)
    : null

  const compItems = selectedStudent
    ? (isLenguaje ? (selectedStudent.lenComp ?? []) : selectedStudent.competencia)
    : (isLenguaje ? (d.lenComp ?? []) : d.competencia)
  const contItems = selectedStudent
    ? (isLenguaje ? (selectedStudent.lenCont ?? []) : selectedStudent.contenido)
    : (isLenguaje ? (d.lenCont ?? []) : d.contenido)
  const barLegend = <MiVsTodosLegend />

  return (
    <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <Grid2 container spacing={1.5} alignItems="stretch" sx={{ flex: 1, minHeight: 0 }}>
      <Grid2 size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
          <ChartCard num="01" title="Resultados por competencia" subtitle="Porcentaje de respuestas correctas" legend={barLegend} dense>
            {compItems.length > 0
              ? <HorizontalBarChart items={compItems} rowHeight={BAR_CHART.rowHeight.tall} baseHeight={BAR_CHART.baseHeight.compact} barSize={BAR_CHART.size.thick} frame />
              : <Typography variant="caption" sx={{ color: C.tm }}>Sin datos</Typography>}
          </ChartCard>
          <ChartCard
            num="02"
            title={isLenguaje ? 'Resultados por tipo de texto y microcompetencia' : 'Resultados por contenido'}
            subtitle="Porcentaje de respuestas correctas"
            legend={barLegend}
            dense
            sx={FILL_COLUMN_SX}
            bodySx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
          >
            {contItems.length > 0
              ? <HorizontalBarChart items={contItems} rowHeight={BAR_CHART.rowHeight.tall} baseHeight={BAR_CHART.baseHeight.compact} barSize={BAR_CHART.size.thick} frame />
              : <Typography variant="caption" sx={{ color: C.tm }}>Sin datos</Typography>}
          </ChartCard>
        </Stack>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
          <ChartCard num="03" title="Distribución de calificaciones" dense sx={{ flex: 2, minHeight: 0 }}>
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 0.5, width: '100%', flex: 1, minHeight: 0 }}>
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <BP d={d.boxplotMi} color={C.navyMid} w={190} h={360} />
                <Typography variant="caption" sx={{ color: C.tm }}>Mi escuela</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <BP d={d.boxplotTodos} color={C.boxplotTodos} w={190} h={360} />
                <Typography variant="caption" sx={{ color: C.tm }}>Todos los colegios</Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: C.tm, display: 'block', mt: 1, fontSize: F.md }}>
              *Información del gráfico de distribución sobre el círculo {' '}
              <Tooltip
                title="Diagrama de dispersión de resultados (diagrama de caja): Las líneas que se extienden hacia arriba y hacia abajo de la caja suelen ser llamadas 'bigotes', su extensión total indica entre qué valores se distribuyen los resultados (línea horizontal de arriba, el más alto y línea horizontal de abajo el más bajo). La línea horizontal central de la caja indica la mediana de los resultados: una mitad de los datos está por debajo de este valor y la otra mitad por encima. El punto negro señala la media de los resultados. La línea vertical superior a partir de la caja abarca el 25 % de resultados, la línea vertical de abajo a partir de la caja abarca el otro 25 % de resultados. Por lo tanto, en la 'caja' se halla el otro 50 % de los resultados; 25 % por arriba de la mediana y 25 % por debajo de la mediana."
                arrow
                slotProps={{
                  popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] }
                }}
              >
                <Box component="span" sx={{ cursor: 'help', fontWeight: W.medium, textDecoration: 'underline dotted' }}>●</Box>
              </Tooltip>
            </Typography>
          </ChartCard>
          <ChartCard num="04" title="Calificación por alumno" dense sx={{ flex: 1, minHeight: 0 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: W.semibold, color: C.navy, whiteSpace: 'nowrap', fontSize: F.lg }}>
                ID del alumno
              </Typography>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  displayEmpty
                  MenuProps={{
                    anchorOrigin: { vertical: 'top', horizontal: 'left' },
                    transformOrigin: { vertical: 'bottom', horizontal: 'left' },
                    PaperProps: { sx: { maxHeight: 240 } },
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {d.estudiantes.map(est => (
                    <MenuItem key={est.id} value={est.id}>
                      Alumno {est.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Borrar selección">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedStudentId('all')}
                    disabled={selectedStudentId === 'all'}
                    aria-label="Borrar selección de alumno"
                  >
                    <HighlightOffIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Paper elevation={0} sx={{ bgcolor: C.navy, borderRadius: RADIUS.lg, px: 2, py: 1, textAlign: 'center', flex: 1 }}>
                <Typography sx={{ color: C.white, fontWeight: W.bold, fontSize: F.score }}>
                  {selectedStudent ? `${selectedStudent.score}%` : 'Seleccione el ID del alumno'}
                </Typography>
              </Paper>
            </Stack>
          </ChartCard>
        </Stack>
      </Grid2>
    </Grid2>
    </Stack>
  )
}

export { DetalleTab }
