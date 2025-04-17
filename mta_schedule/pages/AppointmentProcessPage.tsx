'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EvaluationSelect, I_EvaluationOption } from '@/mta_evaluations/components/EvaluationSelect'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentDetail } from '@/mta_schedule/hooks'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body1, H4 } from '@/shared/components/Typography'
import { useParams } from 'next/navigation'
import { useState } from 'react'
require('dayjs/locale/es')

const AppointmentProcessPage = () => {
  const { appointmentId } = useParams()
  const { data } = useAppointmentDetail(Number(appointmentId))
  const [v, setV] = useState<I_EvaluationOption | null>(null)
  return (
    <Page>
      <Page.Title>Procesar {APPOINTMENT_NAME.singular}</Page.Title>
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
              />
              <Spacer />
              <Body1>Tomando como base los requerimientos del turno, asigne la evaluación correspondiente:</Body1>
              <EvaluationSelect onChange={setV} value={v} />
            </MagicGrid>
          </Page.Content>
        </>
      )}
    </Page>
  )
}

export default withAuth(AppointmentProcessPage, {
  allowedAccessGroups: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
