import LogoutButton from '@/mta_auth/components/LogoutButton'
import Bold from '@/shared/components/Bold'
import { useTheme } from '@/shared/hooks'
import { Avatar } from '@mui/material'
import MUI_AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

const AppBar = () => {
  return (
    <>
      <MUI_AppBar elevation={0} sx={{ position: 'relative', borderBottom: `1px solid #CCC` }}>
        <Toolbar>
          <Typography noWrap>
            Buenos días, <Bold>admin</Bold>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button LinkComponent={Link} href="gui-showcase" color="inherit">
            Showcase
          </Button>
          <LogoutButton />
          <Avatar alt="Admin">A</Avatar>
        </Toolbar>
      </MUI_AppBar>
    </>
  )
}

export default AppBar
