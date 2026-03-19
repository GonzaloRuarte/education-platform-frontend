'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentAdminSchoolDashboard, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { ReloadButton } from '@/shared/components/buttons'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Alert,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

const AppointmentAdminDashboardPage = () => {
  const navigateToAppointmentList = useNavigateToAppointmentList()
  const { data, reload, isLoading } = useAppointmentAdminSchoolDashboard()

  const totals = (data ?? []).reduce(
    (acc, row) => ({
      requested_appointments: acc.requested_appointments + row.requested_appointments,
      accepted_appointments: acc.accepted_appointments + row.accepted_appointments,
      finalized_appointments: acc.finalized_appointments + row.finalized_appointments,
    }),
    {
      requested_appointments: 0,
      accepted_appointments: 0,
      finalized_appointments: 0,
    },
  )

  return (
    <Page>
      <Page.Title>Tablero de control de {APPOINTMENT_NAME.plural}</Page.Title>
      <Page.Toolbar>
        <Button startIcon={<ArrowBackIcon />} onClick={navigateToAppointmentList}>
          Volver al listado
        </Button>
        <ReloadButton onClick={reload} />
      </Page.Toolbar>

      {data === undefined || isLoading ? (
        <Spinner />
      ) : (
        <Page.Content>
          <Alert severity="info" sx={{ mb: 2 }}>
            Los turnos finalizados corresponden a turnos aprobados cuya franja horaria ya terminó.
          </Alert>

          {data.length === 0 ? (
            <Alert severity="info">No hay escuelas para mostrar en el tablero.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <MuiTable>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Escuela</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Turnos solicitados</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Turnos aceptados</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Turnos finalizados</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.school_id} hover>
                      <TableCell>{row.school_name}</TableCell>
                      <TableCell align="right">{row.requested_appointments}</TableCell>
                      <TableCell align="right">{row.accepted_appointments}</TableCell>
                      <TableCell align="right">{row.finalized_appointments}</TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{totals.requested_appointments}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{totals.accepted_appointments}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{totals.finalized_appointments}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </MuiTable>
            </TableContainer>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            El tablero se agrupa por escuela y muestra el estado actual de los {APPOINTMENT_NAME.plural.toLowerCase()}.
          </Typography>
        </Page.Content>
      )}
    </Page>
  )
}

export default withAuth(AppointmentAdminDashboardPage, {
  allowedCapabilities: ['manage_appointment_slots'],
  logoutDestination: 'dashboard',
})
