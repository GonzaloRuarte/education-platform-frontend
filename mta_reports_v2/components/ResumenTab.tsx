'use client'

import { Stack } from '@mui/material'
import { KPICard, AllSchoolsBarChart, ChartCard } from '@/mta_reports_v2/components/EscuelaReporteCharts'
import type { I_ReporteReactData } from '@/mta_reports_v2/types'

function ResumenTab({ data }: { data: I_ReporteReactData }) {
  const g = data.general
  return (
    <>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 2.5 }}>
        <KPICard title="Datos de la muestra" subtitle="Cantidad de resoluciones" mi={String(g.muestra.mi)} todos={String(g.muestra.todos)} suffix="" />
        <KPICard title="% de respuestas correctas" subtitle="40 ítems" mi={g.pct40.mi} todos={g.pct40.todos} />
        <KPICard title="% de respuestas correctas" subtitle="ítems PISA" mi={g.pctPISA.mi} todos={g.pctPISA.todos} />
        <KPICard title="% de respuestas correctas" subtitle="45 ítems" mi={g.pct45.mi} todos={g.pct45.todos} />
      </Stack>
      <ChartCard num="01" title="Porcentaje de respuesta correcta por colegio sobre los 40 ítems">
        <AllSchoolsBarChart bars={data.por_colegio.bars} miId={data.por_colegio.miId} />
      </ChartCard>
    </>
  )
}

export { ResumenTab }
