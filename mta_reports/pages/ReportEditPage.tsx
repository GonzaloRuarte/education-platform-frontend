'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'

import ReportEditForm from '@/mta_reports/components/ReportEditForm'
import { REPORT_NAME } from '@/mta_reports/constants'

import {
  useReportDelete,
  useReportDetail,
  useNavigateToReportList,
} from '@/mta_reports/hooks'

import EditionPage from '@/shared/pages/EditionPage'



const ReportEditPage = () => {
  const back = useNavigateToReportList()

  return (
    <EditionPage
      EditionForm={ReportEditForm}
      entityName={REPORT_NAME}
      idFieldName="reportId" 
      useDelete={useReportDelete}
      useDetail={useReportDetail}
      onExit={back}
    />
  )
}

export default withAuth(ReportEditPage, {
  allowedCapabilities: ['manage_reports'],
  logoutDestination: 'dashboard',
})
