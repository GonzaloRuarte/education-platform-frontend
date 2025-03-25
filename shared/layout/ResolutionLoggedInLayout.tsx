'use client'

import Box from '@mui/material/Box'

import Logo from '@/shared/components/Logo'
import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'

const Header = () => {
  const t = useTheme()
  return (
    <header style={{ background: t.palette.primary.dark, paddingTop: 30, paddingBottom: 20 }}>
      <Container>
        <Grid container>
          <Grid>
            <Logo variant="white" width={131} height={37} />
          </Grid>
          <Grid></Grid>
        </Grid>
      </Container>
    </header>
  )
}
const Main: T_FCwChildren = ({ children }) => {
  return <main></main>
}
const Footer = () => {
  return <footer></footer>
}
const ResolutionLoggedInLayout: T_FCwChildren = ({ children }) => {
  return (
    <>
      <Header />
      <Box>
        <Main>{children}</Main>
        <Footer />
      </Box>
      {/* <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflowX: 'hidden' }}>
      <Box sx={{ flex: 1 }}>
        <Drawer />
      </Box>
      <Box sx={{ flex: 5, position: 'relative' }}>
        <Box sx={{ mt: 2, mr: 5 }}>
          <AppBar />
        </Box>

        <Box sx={{ position: 'relative', height: '90vh', overflowY: 'auto' }}>
          <Spacer />
          {children}
        </Box>
      </Box>
    </Box> */}
    </>
  )
}
export default ResolutionLoggedInLayout
