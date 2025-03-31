'use client'

import Box from '@mui/material/Box'

import { useResolutionExit } from '@/mta_resolutions/hooks'
import { useResolutionElapsedTime, useResolutionEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import Logo from '@/shared/components/Logo'
import { H4 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import { ImageSize, secondsToMMSS } from '@/shared/utils'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Chip from '@/shared/components/Chip'

const logoSize = new ImageSize(262, 101, { scale: 0.5 })

const Header = () => {
  const t = useTheme()
  const exit = useResolutionExit()
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const elapsedTime = useResolutionElapsedTime()
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
            <H4 color="white">{evaluationToResolve?.title}</H4>
          </Grid>
          <Grid
            container
            alignItems="center"
            bgcolor={t.palette.grey[400]}
            borderRadius={10}
            paddingLeft={1}
            paddingRight={2}
          >
            <Grid>
              <Chip label="Dev" />
            </Grid>
            <Grid>{secondsToMMSS(elapsedTime)}</Grid>
            <Grid>
              <IconButton onClick={exit}>
                <ExitToAppIcon />
              </IconButton>
            </Grid>
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
