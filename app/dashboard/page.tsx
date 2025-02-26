import { withAuth } from '@/mta_auth/hocs/withAuth'
import DashboardLoggedInLayout from '@/shared/layout/DashboardLoggedInLayout'

const Welcome = () => {
  return <DashboardLoggedInLayout>Bienvenido/a a Meta</DashboardLoggedInLayout>
}

export default withAuth(Welcome, ['admin', 'evaluator', 'school_staff'])
