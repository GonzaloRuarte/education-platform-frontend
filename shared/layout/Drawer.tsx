import pages from '@/pages'
import Logo from '@/shared/components/Logo'
import Spacer from '@/shared/components/Spacer'
import EmptyToolBar from '@/shared/layout/EmptyToolbar'
import Menu from '@/shared/layout/Menu'
import { Paper } from '@mui/material'
import Box from '@mui/material/Box'
import MUI_Drawer from '@mui/material/Drawer'
import Link from 'next/link'

const drawerWidth = 'auto'

const Drawer = () => {
  return (
    <Box sx={{ padding: 2.5, height: '100%' }}>
      <Paper variant="elevation" elevation={8} sx={{ borderRadius: 5, pt: 5, pb: 5, height: '100%' }}>
        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
          <Link href={pages.D.path}>
            <Logo width={131} height={37} />
          </Link>
        </Box>
        <Spacer />
        <Menu />
      </Paper>
    </Box>
  )
  return (
    <>
      <MUI_Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <EmptyToolBar />
        <Box sx={{ overflow: 'auto' }}>
          <Menu />
        </Box>
      </MUI_Drawer>
    </>
  )
}

export default Drawer
