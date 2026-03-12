'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import SelectedSchoolMismatchAlert from '@/mta_schools/components/SelectedSchoolMismatchAlert'
import AppointmentsEditStudentsForm from '@/mta_schedule/components/AppointmentsEditStudentsForm'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useAppointmentDetail, useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { useParams } from 'next/navigation'

const AppointmentEditStudentsPage = () => {
  const { appointmentId } = useParams()
  const { data, reload } = useAppointmentDetail(Number(appointmentId))
  const navToList = useNavigateToAppointmentList()

  return (
    <Page>
      <Page.Title>{APPOINTMENT_NAME.singular.toUpperCase()}: Editar estudiantes</Page.Title>
      <Page.BasicToolbar entityName={APPOINTMENT_NAME} id={Number(appointmentId)} onExit={navToList} reload={reload} />
      {data === undefined ? (
        <Spinner />
      ) : (
        <Page.Content>
          <SelectedSchoolMismatchAlert entitySchool={data.school} entityLabel="turno" />
          <AppointmentsEditStudentsForm data={data} />
          <Spacer size="xl" />
        </Page.Content>
      )}
    </Page>
  )
}

export default withAuth(AppointmentEditStudentsPage, {
  allowedCapabilities: ['edit_appointment_students'],
  logoutDestination: 'dashboard',
})
