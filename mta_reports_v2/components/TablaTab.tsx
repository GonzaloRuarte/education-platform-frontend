'use client'

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { COLORS, FONT_SIZES, CARD_SX } from '@/mta_reports_v2/constants'
import type { I_TablaRow } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES

const headCellSx = { fontWeight: 700, color: C.navy, bgcolor: C.lightBlue }

function TablaTab({ rows }: { rows: I_TablaRow[] }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', maxWidth: 560, mx: 'auto' }}>
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography sx={{ fontSize: F.lg, color: C.accent, fontWeight: 500 }}>
          Resumen de respuestas correctas por alumno
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 680 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>ID Alumno</TableCell>
              <TableCell align="right" sx={headCellSx}>Matemática %</TableCell>
              <TableCell align="right" sx={headCellSx}>PDL %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: C.navy, py: 3 }}>
                  Sin datos para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : rows.map(row => (
              <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ color: C.navy, fontWeight: 600 }}>{row.id}</TableCell>
                <TableCell align="right">
                  {row.mat != null ? `${row.mat}%` : <Typography variant="caption" color="text.disabled">—</Typography>}
                </TableCell>
                <TableCell align="right">
                  {row.len != null ? `${row.len}%` : <Typography variant="caption" color="text.disabled">—</Typography>}
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
