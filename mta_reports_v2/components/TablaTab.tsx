'use client'

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { COLORS } from '@/mta_reports_v2/constants'
import { NIVEL_COLORS } from '@/mta_reports_v2/semaforo_data'
import type { I_TablaRow } from '@/mta_reports_v2/types'

const C = COLORS

function TablaTab({ rows }: { rows: I_TablaRow[] }) {
  const dot = (v: number | undefined) => {
    if (v == null) return null
    const color = v >= 78 ? NIVEL_COLORS.verde : v >= 50 ? NIVEL_COLORS.amarillo : v >= 28 ? NIVEL_COLORS.naranja : NIVEL_COLORS.rojo
    return <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, display: 'inline-block', mr: 0.75, verticalAlign: 'middle' }} />
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography sx={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>
          Resumen de respuestas correctas por alumno
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: C.navy, bgcolor: C.lightBlue }}>ID Alumno</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: C.navy, bgcolor: C.lightBlue }}>Matemática %</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: C.navy, bgcolor: C.lightBlue }}>PDL %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: C.tm, py: 3 }}>
                  Sin datos para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : rows.map(row => (
              <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ color: C.navy, fontWeight: 600 }}>{row.id}</TableCell>
                <TableCell align="right">
                  {row.mat != null ? <>{dot(row.mat)}{row.mat}%</> : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
                <TableCell align="right">
                  {row.len != null ? <>{dot(row.len)}{row.len}%</> : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > 0 && (
        <Box sx={{ px: 2.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: C.tm }}>{rows.length} alumnos</Typography>
        </Box>
      )}
    </Paper>
  )
}

export { TablaTab }
