'use client'

import { useMemo } from 'react'
import { Stack, Box } from '@mui/material'
import { KPICard, AllSchoolsBarChart, ChartCard } from '@/mta_reports_v2/components/ReporteAuroraCharts'
import { FILL_COLUMN_SX } from '@/mta_reports_v2/constants'
import type { I_EscuelaMiembro, I_ResumenTabData } from '@/mta_reports_v2/types'

interface ResumenTabProps {
  data: I_ResumenTabData
  // Sólo aplican en modo agrupamiento. Cuando `isAgrupamiento` es false el tab
  // mantiene exactamente el comportamiento del reporte de escuela.
  isAgrupamiento?: boolean
  escuelas?: I_EscuelaMiembro[]
  selectedSchools?: string[] | null
}

function ResumenTab({ data, isAgrupamiento = false, escuelas = [], selectedSchools = null }: ResumenTabProps) {
  const g = data.general
  // En agrupamiento, resaltamos todas las barras de las escuelas miembro seleccionadas
  // ("Todas" = todas las del agrupamiento) con el color "mi". En modo escuela, dejamos
  // que AllSchoolsBarChart caiga al matching por miId.
  const highlightIds = useMemo<ReadonlySet<string> | undefined>(() => {
    if (!isAgrupamiento) return undefined
    const ids = selectedSchools ?? escuelas.map(e => e.id)
    return new Set(ids)
  }, [isAgrupamiento, escuelas, selectedSchools])
  const miLabelNode = isAgrupamiento ? <>Mis <br /> alumnos</> : undefined
  const highlightLabel = isAgrupamiento ? 'Mis alumnos' : 'Mi escuela'
  return (
    <Box sx={{ ...FILL_COLUMN_SX, gap: 0.5 }}>
      <Stack direction="row" spacing={1} sx={{ width: '100%', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <KPICard title="Datos de la muestra" subtitle="Cantidad de resoluciones" mi={String(g.muestra.mi)} todos={String(g.muestra.todos)} suffix="" miLabel={miLabelNode} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <KPICard title="% de respuestas correctas" subtitle="40 ítems" mi={g.pct40.mi} todos={g.pct40.todos} miLabel={miLabelNode} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <KPICard title="% de respuestas correctas" subtitle="ítems PISA" mi={g.pctPISA.mi} todos={g.pctPISA.todos} miLabel={miLabelNode} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <KPICard title="% de respuestas correctas" subtitle="45 ítems" mi={g.pct45.mi} todos={g.pct45.todos} miLabel={miLabelNode} />
        </Box>
      </Stack>
      <ChartCard
        num="01"
        title="Porcentaje de respuesta correcta por colegio sobre los 40 ítems"
        dense
        sx={{ ...FILL_COLUMN_SX, bgcolor: 'transparent', border: 'none', p: 0 }}
        bodySx={FILL_COLUMN_SX}
      >
        <AllSchoolsBarChart
          bars={data.por_colegio.bars}
          miId={data.por_colegio.miId}
          highlightIds={highlightIds}
          highlightLabel={highlightLabel}
          fill
        />
      </ChartCard>
    </Box>
  )
}

export { ResumenTab }
