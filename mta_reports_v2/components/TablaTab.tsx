'use client'

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, CARD_SX, TABLA } from '@/mta_reports_v2/constants'
import type { I_TablaRow } from '@/mta_reports_v2/types'

const C = COLORS
const F = FONT_SIZES
const W = FONT_WEIGHTS

const headCellSx = { fontWeight: W.bold, color: C.navy, bgcolor: C.lightBlue }

function TablaTab({ rows, isAgrupamiento = false }: { rows: I_TablaRow[]; isAgrupamiento?: boolean }) {
  const colSpan = isAgrupamiento ? 4 : 3
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', maxWidth: TABLA.maxWidth, mx: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: '100%' }}>
      <Box sx={{ px: SPACING.gutterX, pt: TABLA.headerPt, pb: TABLA.headerPb, flexShrink: 0 }}>
        <Typography sx={{ fontSize: F.lg, color: C.accent, fontWeight: W.medium }}>
          Resumen de respuestas correctas por alumno
        </Typography>
      </Box>
      <TableContainer sx={{ flex: 1, minHeight: 0, maxHeight: TABLA.maxHeight }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>ID Alumno</TableCell>
              {isAgrupamiento && <TableCell sx={headCellSx}>Escuela</TableCell>}
              <TableCell align="right" sx={headCellSx}>Matemática %</TableCell>
              <TableCell align="right" sx={headCellSx}>PDL %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ color: C.navy, py: TABLA.emptyPy }}>
                  Sin datos para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : rows.map(row => (
              <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ color: C.navy, fontWeight: W.semibold }}>{row.id}</TableCell>
                {isAgrupamiento && (
                  <TableCell sx={{ color: C.navy }}>
                    {row.school ?? <Typography variant="caption" color="text.disabled">-</Typography>}
                  </TableCell>
                )}
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
      <Box sx={{ px: SPACING.gutterX, py: 1.5, borderTop: rows.length > 0 ? '1px solid' : 'none', borderColor: 'divider', flexShrink: 0 }}>
        {rows.length > 0 && (
          <Typography variant="caption" sx={{ color: C.tm }}>{rows.length} alumnos</Typography>
        )}
      </Box>
    </Paper>
  )
}

export { TablaTab }
