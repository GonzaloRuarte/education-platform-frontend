import Box from '@mui/material/Box'

import Spacer from '@/shared/components/Spacer'
import AppBar from '@/shared/layout/AppBar'
import Drawer from '@/shared/layout/Drawer'
import { T_FCwChildren } from '@/shared/types'

const DashboardLoggedInLayout: T_FCwChildren = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflowX: 'hidden' }}>
      <Box sx={{ flex: 1 }}>
        <Drawer />
      </Box>
      <Box sx={{ flex: 5, position: 'relative' }}>
        <Box sx={{ mt: 2, mr: 5 }}>
          <AppBar />
        </Box>

        <Box sx={{ position: 'relative', height: '90vh', overflowY: 'auto' }}>
          <Spacer />
          {children}
        </Box>
      </Box>
    </Box>
  )
}
export default DashboardLoggedInLayout
