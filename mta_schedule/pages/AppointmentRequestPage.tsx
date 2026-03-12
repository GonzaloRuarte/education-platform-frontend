'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentRequestForm from '@/mta_schedule/components/AppointmentRequestForm'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import Bold from '@/shared/components/Bold'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'

const AppointmentRequestPage = () => {
  const { isLoading, selectedSchool, accessibleSchools, hasSingleSchool } = useSchoolScopeResources()

  return (
    <Page>
      <Page.Title>Solicitar {APPOINTMENT_NAME.singular}</Page.Title>
      <Page.Content>
        <Bold>
          Cuidado: La evaluación dura 80 minutos y debe iniciarse al menos 80 minutos antes de que finalice el turno.
        </Bold>
        <Spacer size="l" />
        {isLoading || accessibleSchools === undefined || selectedSchool === undefined ? (
          <Spinner />
        ) : (
          <AppointmentRequestForm
            selectedSchool={selectedSchool}
            availableSchools={accessibleSchools}
            lockSchool={!!hasSingleSchool}
          />
        )}
      </Page.Content>
      <Spacer size="l" />
    </Page>
  )
}

export default withAuth(AppointmentRequestPage, {
  allowedCapabilities: ['request_appointment'],
  logoutDestination: 'dashboard',
})
