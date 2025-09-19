import pages from '@/pages'
import Logo from '@/shared/components/Logo'
import Spacer from '@/shared/components/Spacer'
import Menu from '@/shared/layout/Menu'
import { Paper } from '@mui/material'
import Box from '@mui/material/Box'
import Link from 'next/link'

const drawerWidth = 'auto'

const Drawer = () => {
  return (
    <Box sx={{ padding: 2.5}}>
      <Paper variant="elevation" elevation={8} sx={{ borderRadius: 5, pt: 5, pb: 5}}>
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
}

export default Drawer
