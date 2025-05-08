'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useDevAppointmentFakerize } from '@/mta_dev/hooks'
import DevButton from '@/shared/components/DevButton'
import Page from '@/shared/components/Page'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { Grid2 } from '@mui/material'

const DevDashboard = () => {
  const { executeAction: appointmentFakerize } = useDevAppointmentFakerize()
  const actionHandler = (action: () => Promise<any>, message?: string) => {
    return () => {
      setIsInProgress()
      action()
        .then(() => {
          if (message) successToast(message)
        })
        .catch(handleServiceError)
        .finally(setIsNotInProgress)
    }
  }
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  return (
    <Page>
      <Page.Title>Dashboard de Desarrollo</Page.Title>
      <Page.Content>
        <Grid2 container spacing={4}>
          <Grid2 size={2}>
            <DevButton size="large" title="python manage.py school_fakerize">
              Crear escuela
            </DevButton>
          </Grid2>
          <Grid2 size={2}>
            <DevButton size="large" title="python manage.py school_fakerize complete">
              Crear escuela (con contenido)
            </DevButton>
          </Grid2>
          <Grid2 size={2}>
            <DevButton size="large" title="python manage.py evaluations_fakerize complete">
              Crear Evaluación
            </DevButton>
          </Grid2>
          <Grid2 size={2}>
            <DevButton
              size="large"
              title="python manage.py appointment_fakerize"
              onClick={actionHandler(() => appointmentFakerize({}), 'Turno creado')}
            >
              Crear Turno
            </DevButton>
          </Grid2>
        </Grid2>
      </Page.Content>
    </Page>
  )
}

export default withAuth(DevDashboard, { logoutDestination: 'dashboard', allowedUserProfiles: ['superuser'] })
