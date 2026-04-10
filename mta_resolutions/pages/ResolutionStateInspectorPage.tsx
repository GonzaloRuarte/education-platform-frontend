'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useResolutionInspection } from '@/mta_resolutions/hooks/inspection'
import { I_ResolutionInspectionStateHistoryItem } from '@/mta_resolutions/types/inspection'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import SelectedSchoolMismatchAlert from '@/mta_schools/components/SelectedSchoolMismatchAlert'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { BackButton, ReloadButton } from '@/shared/components/buttons'
import { handleServiceError } from '@/shared/service'
import { warningToast } from '@/shared/toasts'
import SearchIcon from '@mui/icons-material/Search'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FormEvent, useMemo, useState } from 'react'

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('es-AR')
}

const summarizeSpecificData = (answer: any) => {
  if (!answer) return '—'

  if (answer.resource_type === 'MultipleChoice') {
    const chosen = answer.specific_data?.chosen_options ?? []
    return chosen.length > 0 ? chosen.join(', ') : 'Sin opciones seleccionadas'
  }

  if (answer.resource_type === 'Numeric') {
    return answer.specific_data?.value ?? '—'
  }

  if (answer.resource_type === 'OpenEnded') {
    const value = answer.specific_data?.value ?? ''
    return value.length > 160 ? `${value.slice(0, 160)}…` : value || 'Sin texto'
  }

  return JSON.stringify(answer.specific_data ?? answer)
}

const ResolutionStateInspectorPage = () => {
  const navigateToAppointmentList = useNavigateToAppointmentList()
  const { data, isLoading, fetchResolutionInspection } = useResolutionInspection()
  const [personalId, setPersonalId] = useState('')
  const [appointmentId, setAppointmentId] = useState('')

  const latestStateAnswers = useMemo(() => {
    const answers = data?.resolution.latest_state?.answers ?? {}

    return Object.values(answers).sort((a: any, b: any) => Number(a.id) - Number(b.id))
  }, [data])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedPersonalId = personalId.trim()
    if (!normalizedPersonalId) {
      warningToast('Ingresá un DNI o pasaporte para buscar.')
      return
    }

    const normalizedAppointmentId = appointmentId.trim()
    const parsedAppointmentId = normalizedAppointmentId ? Number(normalizedAppointmentId) : undefined

    if (normalizedAppointmentId && Number.isNaN(parsedAppointmentId)) {
      warningToast('El ID de turno debe ser numérico.')
      return
    }

    await fetchResolutionInspection({
      personal_id: normalizedPersonalId,
      appointment_id: parsedAppointmentId,
    }).catch(handleServiceError)
  }

  const handleReload = () => {
    const normalizedPersonalId = personalId.trim()
    if (!normalizedPersonalId) return

    const normalizedAppointmentId = appointmentId.trim()
    const parsedAppointmentId = normalizedAppointmentId ? Number(normalizedAppointmentId) : undefined

    fetchResolutionInspection({
      personal_id: normalizedPersonalId,
      appointment_id: parsedAppointmentId,
    }).catch(handleServiceError)
  }

  return (
    <Page>
      <Page.Title>Inspección de estados de resolución</Page.Title>
      <Page.Toolbar>
        <BackButton onClick={navigateToAppointmentList} />
        <ReloadButton onClick={handleReload} disabled={!data || isLoading} />
      </Page.Toolbar>

      <Page.Content>
        <Alert severity="info" sx={{ mb: 2 }}>
          Buscá por DNI o pasaporte para ver la última <strong>EvaluationResolution</strong> accesible de ese alumno, el
          último estado subido y el historial completo de uploads de estado.
        </Alert>

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              label="DNI o pasaporte"
              value={personalId}
              onChange={(event) => setPersonalId(event.target.value)}
              fullWidth
              required
            />
            <TextField
              label="ID de turno (opcional)"
              value={appointmentId}
              onChange={(event) => setAppointmentId(event.target.value)}
              sx={{ minWidth: { md: 220 } }}
            />
            <Button type="submit" startIcon={<SearchIcon />} sx={{ minWidth: { md: 180 } }}>
              Buscar
            </Button>
          </Stack>
        </Paper>

        {isLoading && <Spinner />}

        {!isLoading && data && (
          <>
            <SelectedSchoolMismatchAlert entitySchool={data.student.school} entityLabel="alumno" />

            <Paper sx={{ p: 3, mb: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Alumno</Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                  <Chip label={`DNI/Pasaporte: ${data.student.personal_id ?? 'Oculto'}`} />
                  <Chip label={`Cohorte: ${data.student.cohort}`} />
                  <Chip label={`Escuela: ${data.student.school?.name ?? 'Sin escuela'}`} />
                  <Chip label={`Resolución #${data.resolution.id}`} color="primary" />
                  <Chip label={`Estado: ${data.resolution.status === 'FINISHED' ? 'Finalizada' : 'En proceso'}`} color="secondary" />
                </Stack>
                {data.student.nee && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Alumno marcado con NEE.
                    {data.student.nee_comments ? ` Comentarios: ${data.student.nee_comments}` : ''}
                  </Alert>
                )}
              </Stack>
            </Paper>

            {data.resolution.appointment && (
              <Box mb={3}>
                <AppointmentBriefCard
                  appointmentId={data.resolution.appointment.id}
                  begins_at={data.resolution.appointment.begins_at}
                  title={data.resolution.appointment.school?.name ?? undefined}
                  evaluation={data.resolution.appointment.evaluation ?? undefined}
                  status={data.resolution.appointment.status}
                />
              </Box>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Último estado recibido por el servidor
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip label={`Uploads guardados: ${data.resolution.total_uploaded_states}`} />
                <Chip label={`Creado en servidor: ${formatDateTime(data.resolution.latest_state_server_created_at)}`} />
                <Chip label={`Última actualización cliente: ${formatDateTime(data.resolution.latest_state_client_datetime)}`} />
                <Chip label={`Inicio resolución: ${formatDateTime(data.resolution.started_at)}`} />
                <Chip label={`Límite entrega: ${formatDateTime(data.resolution.submit_by_time)}`} />
                <Chip label={`Fin resolución: ${formatDateTime(data.resolution.finished_at)}`} />
              </Stack>

              {latestStateAnswers.length === 0 ? (
                <Alert severity="warning">La última resolución no tiene respuestas cargadas en el estado guardado.</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Respuesta ID</strong></TableCell>
                      <TableCell><strong>Tipo</strong></TableCell>
                      <TableCell><strong>Actualizada en cliente</strong></TableCell>
                      <TableCell><strong>Valor</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {latestStateAnswers.map((answer: any) => (
                      <TableRow key={answer.id} hover>
                        <TableCell>{answer.id}</TableCell>
                        <TableCell>{answer.resource_type}</TableCell>
                        <TableCell>{formatDateTime(answer.last_update_datetime)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {String(summarizeSpecificData(answer))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                JSON del último estado
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  overflow: 'auto',
                  backgroundColor: '#111827',
                  color: '#f9fafb',
                  borderRadius: 2,
                  fontSize: 13,
                }}
              >
                {JSON.stringify(data.resolution.latest_state ?? {}, null, 2)}
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Historial de estados subidos
              </Typography>
              <Stack spacing={1.5}>
                {data.states.map((state: I_ResolutionInspectionStateHistoryItem) => (
                  <Accordion key={state.id} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                        <Chip label={`State #${state.id}`} />
                        <Chip label={`Servidor: ${formatDateTime(state.server_created_at)}`} />
                        <Chip label={`Cliente: ${formatDateTime(state.client_datetime)}`} />
                        <Chip label={`Respuestas: ${state.answers_count}`} color="primary" variant="outlined" />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Este snapshot permite comparar qué tenía guardado el servidor en cada upload del alumno.
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 2,
                          overflow: 'auto',
                          backgroundColor: '#111827',
                          color: '#f9fafb',
                          borderRadius: 2,
                          fontSize: 13,
                        }}
                      >
                        {JSON.stringify(state.data, null, 2)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Paper>
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default withAuth(ResolutionStateInspectorPage, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
