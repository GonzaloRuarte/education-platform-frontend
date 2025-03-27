'use client'

import Box from '@mui/material/Box'

import { useResolutionEvaluationToResolve, useResolutionExit } from '@/mta_resolutions/hooks'
import Logo from '@/shared/components/Logo'
import { H4 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import { ImageSize } from '@/shared/utils'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'

const logoSize = new ImageSize(262, 101, { scale: 0.5 })

const Header = () => {
  const t = useTheme()
  const exit = useResolutionExit()
  const evaluationToResolve = useResolutionEvaluationToResolve()
  return (
    <header style={{ background: t.palette.primary.dark, paddingTop: 30, paddingBottom: 30 }}>
      <Container>
        <Grid container alignItems="center" spacing={3}>
          <Grid>
            <Box style={{}}>
              <Logo variant="white" width={logoSize.w} height={logoSize.h} />
            </Box>
          </Grid>
          <Grid size="grow">
            <H4 color="white">{evaluationToResolve?.evaluation_data.title}</H4>
          </Grid>
          <Grid>
            <IconButton style={{ color: 'white' }} onClick={exit}>
              <ExitToAppIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Container>
    </header>
  )
}
const Main: T_FCwChildren = ({ children }) => {
  return <Container>{children}</Container>
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
