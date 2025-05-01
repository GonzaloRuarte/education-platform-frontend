'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import AppointmentRequestForm from '@/mta_schedule/components/AppointmentRequestForm'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useSchoolStaffProfileOwnSchool } from '@/mta_schools/hooks'
import Page from '@/shared/components/Page'
import Spinner from '@/shared/components/Spinner'

const AppointmentRequestPage = () => {
  const { isAdmin, isSchoolStaff } = useUserProfilesResources()

  const { schoolData } = useSchoolStaffProfileOwnSchool(isSchoolStaff)

  return (
    <Page>
      <Page.Title>Solicitar {APPOINTMENT_NAME.singular}</Page.Title>
      <Page.Content>
        {schoolData === undefined ? (
          <Spinner />
        ) : (
          <AppointmentRequestForm
            schoolName={schoolData ? schoolData.name : undefined}
            schoolId={schoolData ? schoolData.id : undefined}
          />
        )}
      </Page.Content>
    </Page>
  )
}

export default withAuth(AppointmentRequestPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
