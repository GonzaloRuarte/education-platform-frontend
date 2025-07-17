'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentRequestForm from '@/mta_schedule/components/AppointmentRequestForm'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useSchoolOwnSchool } from '@/mta_schools/hooks/state'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import Bold from '@/shared/components/Bold'

const AppointmentRequestPage = () => {
  const ownSchoolData = useSchoolOwnSchool()

  return (
    <Page>
      <Page.Title>Solicitar {APPOINTMENT_NAME.singular}</Page.Title>
      <Page.Content>
        <Bold>CUIDADO: Dado que las evaluaciones deberían durar 80 minutos, es importante iniciarla con al menos ese tiempo previo al momento de la finalización del turno.</Bold>
        <Spacer size="l" />
        {ownSchoolData === undefined ? <Spinner /> : <AppointmentRequestForm ownSchoolData={ownSchoolData} />}
      </Page.Content>
      <Spacer size="l" />
    </Page>
  )
}

export default withAuth(AppointmentRequestPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
