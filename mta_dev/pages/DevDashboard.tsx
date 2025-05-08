'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import {
  useDevAppointmentFakerize,
  useDevAppointmentMakeAvailableNow,
  useDevAppointmentSetAsFinished,
} from '@/mta_dev/hooks'
import { T_AppointmentId } from '@/mta_schedule/types'
import DevButton from '@/shared/components/DevButton'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import { H3, H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { errorToast, successToast } from '@/shared/toasts'
import { Grid2 } from '@mui/material'
import { useState } from 'react'

const DevDashboard = () => {
  const { executeAction: appointmentFakerize } = useDevAppointmentFakerize()
  const { executeAction: appointmentMakeAvailableNow } = useDevAppointmentMakeAvailableNow()
  const { executeAction: appointmentSetAsFinished } = useDevAppointmentSetAsFinished()

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
  const [appointment_id, setAppointmentId] = useState<T_AppointmentId | ''>('')

  return (
    <>
      <Page>
        <Page.Title>Dashboard de Desarrollo</Page.Title>
        <Page.Content>
          <Grid2 container spacing={4}>
            <Grid2 size={12}>
              <H4>Escuelas</H4>
            </Grid2>
            <Grid2 size={3}>
              <DevButton fullWidth size="large" title="python manage.py school_fakerize">
                Crear escuela
              </DevButton>
            </Grid2>
            <Grid2 size={3}>
              <DevButton fullWidth size="large" title="python manage.py school_fakerize complete">
                Crear escuela c/contenido
              </DevButton>
            </Grid2>

            <Grid2 size={12}>
              <H4>Evaluaciones</H4>
            </Grid2>
            <Grid2 size={3}>
              <DevButton fullWidth size="large" title="python manage.py evaluations_fakerize complete">
                Crear Evaluación
              </DevButton>
            </Grid2>
            <Grid2 size={12}>
              <H4>Turnos</H4>
            </Grid2>
            <Grid2 size={3}>
              <DevButton
                onClick={actionHandler(() => appointmentFakerize({}), 'Turno creado')}
                fullWidth
                size="large"
                title="python manage.py appointment_fakerize"
              >
                Crear Turno
              </DevButton>
            </Grid2>
            <Grid2 size={3}>
              <MagicGrid>
                <DevButton
                  fullWidth
                  size="large"
                  title="python manage.py make_available_now <appointment_id>"
                  onClick={actionHandler(() => {
                    if (appointment_id === '') {
                      errorToast('Por favor, proporcione un ID de turno válido.')
                      return Promise.reject('ID de turno inválido')
                    }
                    return appointmentMakeAvailableNow({ appointment_id }).then((r) => successToast(r.message))
                  })}
                >
                  Disponibilizar turno
                </DevButton>
                <Input
                  size="small"
                  type="number"
                  value={appointment_id}
                  onChange={(e) => setAppointmentId(Number(e.target.value))}
                  label="Turno ID"
                />
              </MagicGrid>
            </Grid2>
            <Grid2 size={3}>
              <MagicGrid>
                <DevButton
                  fullWidth
                  size="large"
                  title="python manage.py set_as_finished <appointment_id>"
                  onClick={actionHandler(() => {
                    if (appointment_id === '') {
                      errorToast('Por favor, proporcione un ID de turno válido.')
                      return Promise.reject('ID de turno inválido')
                    }
                    return appointmentSetAsFinished({ appointment_id }).then((r) => successToast(r.message))
                  })}
                >
                  Finalizar turno
                </DevButton>
                <Input
                  size="small"
                  type="number"
                  value={appointment_id}
                  onChange={(e) => setAppointmentId(Number(e.target.value))}
                  label="Turno ID"
                />
              </MagicGrid>
            </Grid2>
          </Grid2>
        </Page.Content>
      </Page>
    </>
  )
}

export default withAuth(DevDashboard, { logoutDestination: 'dashboard', allowedUserProfiles: ['superuser'] })
