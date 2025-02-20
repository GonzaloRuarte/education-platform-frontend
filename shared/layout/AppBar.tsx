import LogoutButton from '@/mta_auth/components/LogoutButton'
import MUI_AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'


const AppBar = () => {

  return <>
    <MUI_AppBar position="fixed" sx={{ zIndex: 100000 }}>
      <Toolbar>
        <Typography noWrap fontSize={22} fontWeight={600} >
          Meta
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button LinkComponent={Link} href='gui-showcase' color="inherit">Showcase</Button>
        <LogoutButton />
      </Toolbar>
    </MUI_AppBar>
  </>
}

export default AppBar