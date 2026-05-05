'use client'

import { Box } from '@mui/material'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import AuroraReportCreateForm from '@/mta_reports_v2/components/AuroraReportCreateForm'
import { AURORA_REPORT_NAME, FONT_FAMILY } from '@/mta_reports_v2/constants'
import { useNavigateToAuroraReportList } from '@/mta_reports_v2/hooks'
import CreationPage from '@/shared/pages/CreationPage'

const ReporteAuroraCreatePage = () => {
  const navigateToAuroraReportList = useNavigateToAuroraReportList()

  return (
    <Box sx={{ fontFamily: FONT_FAMILY, '& *': { fontFamily: FONT_FAMILY }, height: '100%' }}>
      <CreationPage
        CreationForm={AuroraReportCreateForm}
        entityName={AURORA_REPORT_NAME}
        onCancel={navigateToAuroraReportList}
      />
    </Box>
  )
}

export default withAuth(ReporteAuroraCreatePage, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
