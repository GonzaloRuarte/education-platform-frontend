'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import {
  useDevAppointmentDeleteTest,
  useDevAppointmentListTest,
  useDevAppointmentFakerize,
  useDevAppointmentMakeAvailableNow,
  useDevAppointmentMakeResolutionsLeft10Seconds,
  useDevAppointmentMakeResolutionsLeft5Minutes,
  useDevAppointmentSetAsFinished,
  useDevEvaluationsFakerize,
  useDevEvaluationsFakerizeComplete,
  useDevReportsFakerize,
  useDevSchoolsFakerize,
  useDevSchoolsFakerizeComplete,
} from '@/mta_dev/hooks'
import { T_AppointmentId } from '@/mta_schedule/types'
import DevButton from '@/shared/components/DevButton'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import { H3, H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { useInProgress } from '@/shared/hooks'
import { useConfirm } from '@/shared/confirm'
import { handleServiceError } from '@/shared/service'
import { errorToast, successToast } from '@/shared/toasts'
import { Grid2 } from '@mui/material'
import { useState } from 'react'

const DevDashboard = () => {
  const { executeAction: appointmentDeleteTest } = useDevAppointmentDeleteTest()
  const { executeAction: appointmentListTest } = useDevAppointmentListTest()
  const { showConfirm, ConfirmDialogComponent } = useConfirm()
  const { executeAction: appointmentFakerize } = useDevAppointmentFakerize()
  const { executeAction: appointmentMakeAvailableNow } = useDevAppointmentMakeAvailableNow()
  const { executeAction: appointmentSetAsFinished } = useDevAppointmentSetAsFinished()
  const { executeAction: appointmentMakeResolutionsLeft5Minutes } = useDevAppointmentMakeResolutionsLeft5Minutes()
  const { executeAction: appointmentMakeResolutionsLeft10Seconds } = useDevAppointmentMakeResolutionsLeft10Seconds()

  const { executeAction: schoolsFakerize } = useDevSchoolsFakerize()
  const { executeAction: schoolsFakerizeComplete } = useDevSchoolsFakerizeComplete()
  const { executeAction: evaluationsFakerize } = useDevEvaluationsFakerize()
  const { executeAction: evaluationsFakerizeComplete } = useDevEvaluationsFakerizeComplete()

  const { executeAction: reportFakerize } = useDevReportsFakerize()

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
      <ConfirmDialogComponent />
      <Page>
        <Page.Title>Dashboard de Desarrollo</Page.Title>
        <Page.Content>
          <Grid2 container spacing={4}>
            <Grid2 size={12}>
              <H4>Escuelas</H4>
            </Grid2>
            <Grid2 size={2}>
              <DevButton
                fullWidth
                size="small"
                title="python manage.py school_fakerize"
                onClick={actionHandler(() => schoolsFakerize({}), 'Escuela creada')}
              >
                Crear escuela
              </DevButton>
            </Grid2>
            <Grid2 size={2}>
              <DevButton
                fullWidth
                size="small"
                title="python manage.py school_fakerize complete"
                onClick={actionHandler(() => schoolsFakerizeComplete({}), 'Escuela creada con contenido')}
              >
                Crear escuela c/contenido
              </DevButton>
            </Grid2>

            <Grid2 size={12}>
              <H4>Evaluaciones</H4>
            </Grid2>
            <Grid2 size={2}>
              <DevButton
                fullWidth
                size="small"
                title="python manage.py evaluations_fakerize"
                onClick={actionHandler(() => evaluationsFakerize({}), 'Evaluación creada')}
              >
                Crear Evaluación
              </DevButton>
            </Grid2>
            <Grid2 size={2}>
              <DevButton
                fullWidth
                size="small"
                title="python manage.py evaluations_fakerize complete"
                onClick={actionHandler(() => evaluationsFakerizeComplete({}), 'Evaluación creada con contenido')}
              >
                Crear Eval. c/contenido
              </DevButton>
            </Grid2>

            <Grid2 size={12}>
              <H4>Turnos</H4>
            </Grid2>
            <Grid2 size={2}>
              <DevButton
                onClick={actionHandler(() => appointmentFakerize({}), 'Turno creado')}
                fullWidth
                size="small"
                title="python manage.py appointment_fakerize"
              >
                Crear Turno
              </DevButton>
            </Grid2>
            <Grid2 size={2}>
              <DevButton
                fullWidth
                size="small"
                bgcolor="red"
                title="Elimina todos los turnos creados con 'Preparar turno de prueba'"
                onClick={actionHandler(() =>
                  appointmentListTest(undefined).then((r) => {
                    const { appointments } = r
                    if (appointments.length === 0) {
                      successToast('No hay turnos de prueba para eliminar.')
                      return Promise.resolve()
                    }
                    const lista = appointments.map((a) => `• ${a.label}`).join('\n')
                    return showConfirm(
                      `Eliminar ${appointments.length} turno(s) de prueba`,
                      `Se eliminarán los siguientes turnos:\n\n${lista}`,
                    ).then(() => appointmentDeleteTest({}).then((res) => successToast(res.message)))
                  })
                )}
              >
                Eliminar turnos de prueba
              </DevButton>
            </Grid2>
            <Grid2 size={2}>
              <MagicGrid>
                <DevButton
                  fullWidth
                  size="small"
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
            <Grid2 size={2}>
              <MagicGrid>
                <DevButton
                  fullWidth
                  size="small"
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
            <Grid2 size={2}>
              <MagicGrid>
                <DevButton
                  fullWidth
                  size="small"
                  onClick={actionHandler(() => {
                    if (appointment_id === '') {
                      errorToast('Por favor, proporcione un ID de turno válido.')
                      return Promise.reject('ID de turno inválido')
                    }
                    return appointmentMakeResolutionsLeft5Minutes({ appointment_id }).then((r) =>
                      successToast(r.message),
                    )
                  })}
                >
                  5'10'' para finalizar
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
            <Grid2 size={2}>
              <MagicGrid>
                <DevButton
                  fullWidth
                  size="small"
                  onClick={actionHandler(() => {
                    if (appointment_id === '') {
                      errorToast('Por favor, proporcione un ID de turno válido.')
                      return Promise.reject('ID de turno inválido')
                    }
                    return appointmentMakeResolutionsLeft10Seconds({ appointment_id }).then((r) =>
                      successToast(r.message),
                    )
                  })}
                >
                  10'' para finalizar
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
            <Grid2 size={12}>
              <H4>Reportes</H4>
            </Grid2>
            <Grid2 size={2}>
              <DevButton fullWidth size="small" onClick={actionHandler(() => reportFakerize({}), 'Reporte creado')}>
                Crear Reporte
              </DevButton>
            </Grid2>
          </Grid2>
        </Page.Content>
      </Page>
    </>
  )
}

export default withAuth(DevDashboard, { logoutDestination: 'dashboard', allowedUserProfiles: ['superuser'] })
