'use client'

import { Box, Stack, Typography, Paper, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import Spinner from '@/shared/components/Spinner'
import {
  useEscuelaReporteReactList,
  useBustCacheEscuela,
  useNavigateToEscuelaReporte,
} from '@/mta_reports_v2/hooks'

const C = {
  navy: '#041552',
  blue: '#0b2280',
  accent: '#00a6e6',
  lightBlue: '#C3D9FF',
  tm: '#7a8399',
  off: '#f4f5f8',
}

function ReportesReactListPage() {
  const { data, loading, error } = useEscuelaReporteReactList()
  const { bust, bustingId } = useBustCacheEscuela()
  const navigateToEscuela = useNavigateToEscuelaReporte()
  const canManage = useHasCapabilities(['manage_reports'])

  if (loading) return <Spinner />

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.off }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(90deg, ${C.navy} 0%, ${C.blue} 100%)`,
          px: 4,
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              display: 'block',
              mb: 0.25,
            }}
          >
            Proyecto React
          </Typography>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>
            Reportes por escuela
          </Typography>
        </Box>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
          <Logo width={80} height={26} variant="white" />
          <LogoAustral width={100} height={26} />
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', my: 4, px: 3 }}>
        {error && (
          <Paper elevation={0} sx={{ bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 2, p: 2.5 }}>
            <Typography color="error">Error al cargar: {error}</Typography>
          </Paper>
        )}

        {!error && (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ color: C.navy, fontWeight: 600 }}>
                {data.length} {data.length === 1 ? 'escuela' : 'escuelas'} con datos
              </Typography>
            </Box>

            {data.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">No hay datos disponibles aún.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: C.off }}>
                      <TableCell sx={{ fontWeight: 600, color: C.tm, fontSize: 12 }}>Escuela</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: C.tm, fontSize: 12 }}>Tomas disponibles</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: C.tm, fontSize: 12 }}>Última toma</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: C.tm, fontSize: 12 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map(school => (
                      <TableRow
                        key={school.id}
                        onClick={() => navigateToEscuela({ escuelaId: school.id })}
                        hover
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: C.navy }}>{school.nombre}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                            {school.tomas.map(t => (
                              <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 24 }} />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.accent, fontSize: 13 }}>
                          {school.ultima_toma ?? '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={e => {
                                e.stopPropagation()
                                navigateToEscuela({ escuelaId: school.id })
                              }}
                              sx={{ color: C.accent, borderColor: C.accent }}
                            >
                              Ver reporte
                            </Button>
                            {canManage && (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={bustingId === school.id}
                                onClick={e => {
                                  e.stopPropagation()
                                  bust(school.id)
                                }}
                              >
                                {bustingId === school.id ? 'Regenerando…' : 'Regenerar'}
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default withAuth(ReportesReactListPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
