'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentCreateForm from '@/mta_schedule/components/AppointmentCreateForm'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import { useNavigateToAppointmentList } from '@/mta_schedule/hooks'
import CreationPage from '@/shared/pages/CreationPage'
import React from 'react'

const AppointmentCreatePage = () => {
  return (
    <CreationPage
      entityName={APPOINTMENT_NAME}
      CreationForm={AppointmentCreateForm}
      onCancel={useNavigateToAppointmentList()}
    />
  )
}

export default withAuth(AppointmentCreatePage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})
