import Box from '@mui/material/Box'

import AppBar from '@/shared/layout/AppBar'
import Drawer from '@/shared/layout/Drawer'
import EmptyToolBar from '@/shared/layout/EmptyToolbar'
import { T_FCwChildren } from '@/shared/types'


const DashboardRootLayout: T_FCwChildren = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar />
      <Drawer />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <EmptyToolBar />
        {children}
      </Box>
    </Box>
  );
}
export default DashboardRootLayout