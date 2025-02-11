import React from 'react'
import MUI_AppBar from '@mui/material/AppBar'
import { Toolbar, Typography } from '@mui/material'

const AppBar = () => {
  return <>
    <MUI_AppBar position="fixed" sx={{ zIndex: 100000 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Meta
        </Typography>
      </Toolbar>
    </MUI_AppBar>
  </>
}

export default AppBar