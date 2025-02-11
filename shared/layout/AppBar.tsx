import React from 'react'
import MUI_AppBar from '@mui/material/AppBar'
import { Box, Button, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'


const AppBar = () => {
  return <>
    <MUI_AppBar position="fixed" sx={{ zIndex: 100000 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Meta
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button LinkComponent={Link} href='gui-showcase' color="inherit">Login</Button>
      </Toolbar>
    </MUI_AppBar>
  </>
}

export default AppBar