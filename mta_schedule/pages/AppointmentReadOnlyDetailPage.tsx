'use client'

import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentDetail, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body1, H3 } from '@/shared/components/Typography'
import { useParams } from 'next/navigation'

const AppointmentReadOnlyDetail = () => {
  const { appointmentId } = useParams()
  const { data, reload } = useAppointmentDetail(Number(appointmentId))
  const navToList = useNavigateToAppointmentList()

  return (
    <Page>
      <Page.Title>Detalle {APPOINTMENT_NAME.singular} (solo lectura)</Page.Title>
      <Page.BasicToolbar entityName={APPOINTMENT_NAME} id={Number(appointmentId)} onExit={navToList} reload={reload} />

      <Page.Content>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            <AppointmentBriefCard
              appointmentId={data.id}
              status={data.status}
              begins_at={data.begins_at}
              title={data.school === null ? undefined : data.school.name}
              subject={data.requested_evaluation_subject === null ? '' : data.requested_evaluation_subject.name}
              grade={data.requested_evaluation_grade === null ? undefined : data.requested_evaluation_grade}
              evaluation={data.evaluation_brief !== null ? data.evaluation_brief : undefined}
            />
            <Spacer />
            {data.students.length > 0 && (
              <>
                <H3>Listado de estudiantes</H3>
                <Spacer size="s" />
                <Body1>Cantidad: {data.students.length}</Body1>
                <Spacer size="s" />
                <MagicGrid itemSize="auto">
                  {data.students.map((s) => (
                    <Chip key={s.personal_id} label={`${s.personal_id} (${s.cohort})`} />
                  ))}
                </MagicGrid>
              </>
            )}
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default AppointmentReadOnlyDetail
