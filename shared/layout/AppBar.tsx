'use client'

import LogoutButton from '@/mta_auth/components/LogoutButton'
import { useUserWhoIAmData } from '@/mta_users/hooks'
import Bold from '@/shared/components/Bold'
import MagicGrid from '@/shared/components/MagicGrid'
import { Avatar } from '@mui/material'
import MUI_AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'

import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const AppBar = () => {
  const whoIAm = useUserWhoIAmData()
  const nameAndSurname = `${whoIAm?.first_name} ${whoIAm?.last_name}`
  return (
    <>
      <MUI_AppBar elevation={0} sx={{ position: 'relative', borderBottom: `1px solid #CCC` }}>
        <Toolbar>
          {whoIAm !== undefined && (
            <Typography noWrap>
              Buenos días, <Bold>{nameAndSurname.length > 3 ? nameAndSurname : whoIAm.username}</Bold>
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <MagicGrid itemSize="auto">
            <LogoutButton />
            <Avatar alt="Admin">{whoIAm !== undefined && whoIAm.username.slice(0, 1).toUpperCase()}</Avatar>
          </MagicGrid>
        </Toolbar>
      </MUI_AppBar>
    </>
  )
}

export default AppBar
