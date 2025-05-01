'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import AppointmentListPage from '@/mta_schedule/pages/AppointmentListPage'
import AppointmentSchoolDashboardPage from '@/mta_schedule/pages/AppointmentSchoolDashboardPage'
import React from 'react'

const AppointmentHome = () => {
  const { isAdmin, isSchoolStaff } = useUserProfilesResources()
  if (isAdmin) return <AppointmentListPage />
  if (isSchoolStaff) return <AppointmentSchoolDashboardPage />
  return <div>AppointmentHome</div>
}

export default withAuth(AppointmentHome, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
