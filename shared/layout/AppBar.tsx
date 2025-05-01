import LogoutButton from '@/mta_auth/components/LogoutButton'
import Bold from '@/shared/components/Bold'
import MagicGrid from '@/shared/components/MagicGrid'
import { Avatar } from '@mui/material'
import MUI_AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'

import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const AppBar = () => {
  return (
    <>
      <MUI_AppBar elevation={0} sx={{ position: 'relative', borderBottom: `1px solid #CCC` }}>
        <Toolbar>
          <Typography noWrap>
            Buenos días, <Bold>admin</Bold>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <MagicGrid itemSize="auto">
            <LogoutButton />
            <Avatar alt="Admin">A</Avatar>
          </MagicGrid>
        </Toolbar>
      </MUI_AppBar>
    </>
  )
}

export default AppBar
