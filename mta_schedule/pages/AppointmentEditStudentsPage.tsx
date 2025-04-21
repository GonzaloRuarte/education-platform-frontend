'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EvaluationSelectControlled } from '@/mta_evaluations/components/EvaluationSelect'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentApprove,
  useAppointmentDetail,
  useAppointmentReject,
  useNavigateToAppointmentList,
} from '@/mta_schedule/hooks'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body1, H4 } from '@/shared/components/Typography'
import { useConfirm } from '@/shared/confirm'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { Button } from '@mui/material'
import { useParams } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'

require('dayjs/locale/es')

interface I_FormFields {
  evaluation: { id: string; title: string } | null
}

const AppointmentEditStudentsPage = () => {
  const { appointmentId } = useParams()
  const { data, reload } = useAppointmentDetail(Number(appointmentId))
  const approveAppointment = useAppointmentApprove()
  const rejectAppointment = useAppointmentReject()
  const navToList = useNavigateToAppointmentList()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const { ConfirmDialogComponent, showConfirm } = useConfirm()

  const { control, handleSubmit } = useForm<I_FormFields>({
    defaultValues: {
      evaluation: null,
    },
  })

  const onApprove: SubmitHandler<I_FormFields> = (formData) => {
    showConfirm('Aprobar turno', '¿Estás seguro/a que querés APROBAR este turno?').then(() => {
      setIsInProgress()
      approveAppointment({
        appointment_id: Number(appointmentId),
        evaluation_id: Number(formData.evaluation?.id),
      })
        .then(() => {
          successToast('Turno aprobado correctamente')
          navToList()
        })
        .catch(handleServiceError)
        .finally(setIsNotInProgress)
    })
  }

  const onReject = () => {
    showConfirm('Rechazar turno', '¿Estás seguro/a que querés RECHAZAR este turno?').then(() => {
      setIsInProgress()
      rejectAppointment({ appointment_id: Number(appointmentId) })
        .then(() => {
          successToast('Turno rechazado correctamente')
          navToList()
        })
        .catch(handleServiceError)
        .finally(setIsNotInProgress)
    })
  }

  return (
    <Page>
      <Page.Title>{APPOINTMENT_NAME.singular.toUpperCase()}: Editar estudiantes</Page.Title>
      <Page.BasicToolbar entityName={APPOINTMENT_NAME} id={Number(appointmentId)} onExit={navToList} reload={reload} />

      {data === undefined ? (
        <Spinner />
      ) : (
        <>
          <Page.Content>
            <MagicGrid>
              <H4>Requerimientos del turno</H4>

              <AppointmentBriefCard
                appointmentId={Number(appointmentId)}
                begins_at={data.begins_at}
                title={data.school.name}
                subject={data.requested_evaluation_subject.name}
                grade={data.requested_evaluation_grade}
                evaluation={data.evaluation_brief !== null ? data.evaluation_brief : undefined}
              />
              <Spacer />
              <Body1>Tomando como base los requerimientos del turno, asigne la evaluación correspondiente:</Body1>
              <form onSubmit={handleSubmit(onApprove)}>
                <EvaluationSelectControlled
                  name="evaluation"
                  control={control}
                  label="Evaluación"
                  rules={{ required: 'Debe seleccionar una evaluación' }}
                />
                <Spacer />
                <Button type="submit" variant="contained" color="primary">
                  Aprobar Turno
                </Button>
                <Button type="button" variant="contained" color="error" onClick={onReject} sx={{ ml: 2 }}>
                  Rechazar Turno
                </Button>
              </form>
            </MagicGrid>
          </Page.Content>
        </>
      )}
      <ConfirmDialogComponent />
    </Page>
  )
}

export default withAuth(AppointmentEditStudentsPage, {
  allowedAccessGroups: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
