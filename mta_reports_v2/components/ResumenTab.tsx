'use client'

import { Stack, Box } from '@mui/material'
import { KPICard, AllSchoolsBarChart, ChartCard } from '@/mta_reports_v2/components/ReporteAuroraCharts'
import { FILL_COLUMN_SX } from '@/mta_reports_v2/constants'
import type { I_ResumenTabData } from '@/mta_reports_v2/types'

function ResumenTab({ data }: { data: I_ResumenTabData }) {
  const g = data.general
  return (
    <Box sx={{ ...FILL_COLUMN_SX, gap: 0.5 }}>
      <Stack direction="row" spacing={1} sx={{ width: '100%', flexShrink: 0 }}>
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
        sx={{ ...FILL_COLUMN_SX, bgcolor: 'transparent', border: 'none', p: 0 }}
        bodySx={FILL_COLUMN_SX}
      >
        <AllSchoolsBarChart bars={data.por_colegio.bars} miId={data.por_colegio.miId} fill />
      </ChartCard>
    </Box>
  )
}

export { ResumenTab }
