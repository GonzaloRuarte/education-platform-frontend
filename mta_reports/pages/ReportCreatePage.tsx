'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ReportCreateForm from '@/mta_reports/components/ReportCreateForm'
import { REPORT_NAME } from '@/mta_reports/constants'
import { useNavigateToReportList } from '@/mta_reports/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const ReportCreatePage = () => (
  <CreationPage
    CreationForm={ReportCreateForm}
    entityName={REPORT_NAME}
    onCancel={useNavigateToReportList()}
  />
)

export default withAuth(ReportCreatePage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})
