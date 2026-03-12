'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import AppointmentListPage from '@/mta_schedule/pages/AppointmentListPage'
import AppointmentSchoolDashboardPage from '@/mta_schedule/pages/AppointmentSchoolDashboardPage'
import React from 'react'

const AppointmentHome = () => {
  const canManageAppointmentSlots = useHasCapabilities(['manage_appointment_slots'])
  const canViewDetail = useHasCapabilities(['view_appointment_detail'])
  const canEditStudents = useHasCapabilities(['edit_appointment_students'])

  if (canManageAppointmentSlots) return <AppointmentListPage />

  return (
    <AppointmentSchoolDashboardPage
      canViewDetail={canViewDetail}
      canEditStudents={canEditStudents}
      canReschedule={canEditStudents}
    />
  )
}

export default withAuth(AppointmentHome, {
  allowedCapabilities: ['list_appointments'],
  logoutDestination: 'dashboard',
})
