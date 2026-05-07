'use client'

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, CARD_SX, TABLA } from '@/mta_reports_v2/constants'
import type { I_TablaRow } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS

const headCellSx = { fontWeight: W.bold, color: C.navy, bgcolor: C.lightBlue }

function TablaTab({ rows }: { rows: I_TablaRow[] }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', maxWidth: TABLA.maxWidth, mx: 'auto' }}>
      <Box sx={{ px: SPACING.gutterX, pt: TABLA.headerPt, pb: TABLA.headerPb }}>
        <Typography sx={{ fontSize: F.lg, color: C.accent, fontWeight: W.medium }}>
          Resumen de respuestas correctas por alumno
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: TABLA.maxHeight }}>
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
                <TableCell colSpan={3} align="center" sx={{ color: C.navy, py: TABLA.emptyPy }}>
                  Sin datos para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : rows.map(row => (
              <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ color: C.navy, fontWeight: W.semibold }}>{row.id}</TableCell>
                <TableCell align="right">
                  {row.mat != null ? `${row.mat}%` : <Typography variant="caption" color="text.disabled">-</Typography>}
                </TableCell>
                <TableCell align="right">
                  {row.len != null ? `${row.len}%` : <Typography variant="caption" color="text.disabled">-</Typography>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > 0 && (
        <Box sx={{ px: SPACING.gutterX, py: TABLA.footerPy, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: C.tm }}>{rows.length} alumnos</Typography>
        </Box>
      )}
    </Paper>
  )
}

export { TablaTab }
