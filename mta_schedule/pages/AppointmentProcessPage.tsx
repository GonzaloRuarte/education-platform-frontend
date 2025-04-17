'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentDetail } from '@/mta_schedule/hooks'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'
import { useParams } from 'next/navigation'
require('dayjs/locale/es')

const AppointmentProcessPage = () => {
  const { appointmentId } = useParams()
  const { data, reload } = useAppointmentDetail(Number(appointmentId))

  return (
    <Page>
      <Page.Title>Procesar {APPOINTMENT_NAME.singular}</Page.Title>
      {data === undefined ? (
        <Spinner />
      ) : (
        <>
          <Page.Content>
            <AppointmentBriefCard
              appointmentId={Number(appointmentId)}
              begins_at={data.begins_at}
              title={data.school.name}
              subject={data.requested_evaluation_subject.name}
              grade={data.requested_evaluation_grade}
            />
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
