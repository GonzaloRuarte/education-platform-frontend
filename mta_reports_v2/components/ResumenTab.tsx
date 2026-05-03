'use client'

import { Stack, Box } from '@mui/material'
import { KPICard, AllSchoolsBarChart, ChartCard } from '@/mta_reports_v2/components/ReporteAuroraCharts'
import type { I_ResumenTabData } from '@/mta_reports_v2/types'

function ResumenTab({ data }: { data: I_ResumenTabData }) {
  const g = data.general
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0 }}>
      <Stack direction="row" spacing={1.5} sx={{ width: '100%', flexShrink: 0 }}>
        <Box sx={{ flex: 1 }}>
          <KPICard title="Datos de la muestra" subtitle="Cantidad de resoluciones" mi={String(g.muestra.mi)} todos={String(g.muestra.todos)} suffix="" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <KPICard title="% de respuestas correctas" subtitle="40 ítems" mi={g.pct40.mi} todos={g.pct40.todos} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <KPICard title="% de respuestas correctas" subtitle="ítems PISA" mi={g.pctPISA.mi} todos={g.pctPISA.todos} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <KPICard title="% de respuestas correctas" subtitle="45 ítems" mi={g.pct45.mi} todos={g.pct45.todos} />
        </Box>
      </Stack>
      <ChartCard
        num="01"
        title="Porcentaje de respuesta correcta por colegio sobre los 40 ítems"
        dense
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        bodySx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        <AllSchoolsBarChart bars={data.por_colegio.bars} miId={data.por_colegio.miId} fill />
      </ChartCard>
    </Box>
  )
}

export { ResumenTab }
