'use client'

import { Box, Stack, Typography, Chip } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useHistoricoEscuela, type I_HistoricoBar } from '@/mta_reports_v2/hooks'
import { COLORS } from '@/mta_reports_v2/constants'

const C = COLORS

interface HistoricoTabProps { schoolId: number }

const HistoricoChart = ({ title, data }: { title: string; data: I_HistoricoBar[] }) => (
  <Box sx={{ flex: 1, bgcolor: C.white, borderRadius: 4, p: 3 }}>
    <Typography sx={{ color: C.navy, fontWeight: 800, mb: 2 }}>{title}</Typography>
    <Box sx={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.gridLight} />
          <XAxis dataKey="toma" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="pct_mi_colegio" name="Mi colegio" fill={C.barMe} />
          <Bar dataKey="pct_promedio_red" name="Promedio red" fill={C.barFill} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </Box>
)

const HistoricoTab = ({ schoolId }: HistoricoTabProps) => {
  const { data, loading } = useHistoricoEscuela(schoolId)

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography sx={{ color: C.navy, fontWeight: 800, fontSize: 22 }}>Comparación histórica</Typography>
        <Chip size="small" color="warning" label="Datos preliminares (mock)" />
      </Stack>
      {loading || !data ? (
        <Typography sx={{ color: C.tm }}>Cargando…</Typography>
      ) : (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <HistoricoChart title="Matemática" data={data.por_materia.matematica} />
          <HistoricoChart title="Prácticas del Lenguaje" data={data.por_materia.lenguaje} />
        </Stack>
      )}
    </Box>
  )
}

export { HistoricoTab }
