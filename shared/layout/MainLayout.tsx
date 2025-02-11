import Box from '@mui/material/Box'
import * as React from 'react'

import AppBar from '@/shared/layout/AppBar'
import Drawer from '@/shared/layout/Drawer'
import { T_FCwChildren } from '@/shared/types'
import EmptyToolBar from '@/shared/layout/EmptyToolbar'


const MainLayout: T_FCwChildren = ({ children }) => {
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
export default MainLayout