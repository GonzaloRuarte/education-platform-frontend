'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import Page from '@/shared/components/Page'
require('dayjs/locale/es')

const AppointmentProcessPage = () => {
  return (
    <Page>
      <Page.Title>Procesar {APPOINTMENT_NAME.singular}</Page.Title>
      <Page.Content>a</Page.Content>
    </Page>
  )
}

export default withAuth(AppointmentProcessPage, {
  allowedAccessGroups: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
