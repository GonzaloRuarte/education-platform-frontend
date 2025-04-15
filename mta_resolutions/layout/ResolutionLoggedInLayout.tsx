'use client'

import Box from '@mui/material/Box'

import { useResolutionElapsedTimeSeconds, useResolutionExit } from '@/mta_resolutions/hooks'
import { useResolutionEvaluationToResolve, useResolutionMaxDurationMinutes } from '@/mta_resolutions/hooks/data'
import Logo from '@/shared/components/Logo'
import { H4 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import { ImageSize, secondsToHHMMSS, secondsToMMSS } from '@/shared/utils'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Chip from '@/shared/components/Chip'
import LogoAustral from '@/shared/components/LogoAustral'

const logoSize = new ImageSize(262, 101, { scale: 0.5 })

const Header = () => {
  const t = useTheme()
  const exit = useResolutionExit()
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const elapsedTimeSeconds = useResolutionElapsedTimeSeconds()
  const maxDurationMinutes = useResolutionMaxDurationMinutes() as number

  const maxDurationOverflow = Math.round(elapsedTimeSeconds - maxDurationMinutes * 60)
  const timeLeft = Math.max(Math.round(maxDurationMinutes * 60 - elapsedTimeSeconds), 0)
  const maxDurationReached = maxDurationOverflow >= 0
  const showMaxDurationWarning = 0 < timeLeft && timeLeft < 15 * 60

  return (
    <>
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
              <Grid>{secondsToMMSS(elapsedTimeSeconds)}</Grid>
              <Grid>
                <IconButton onClick={exit}>
                  <ExitToAppIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </header>
      {showMaxDurationWarning && (
        <section style={{ background: '#fdffd0', padding: 10 }}>
          <Container>Quedan {secondsToHHMMSS(Math.abs(timeLeft))}</Container>
        </section>
      )}
      {maxDurationReached && (
        <section style={{ background: '#ffd0d0', padding: 10 }}>
          <Container>Has superado el tiempo máximo de evaluación por {secondsToHHMMSS(maxDurationOverflow)}</Container>
        </section>
      )}
    </>
  )
}
const Main: T_FCwChildren = ({ children }) => {
  return (
    <Container style={{ flex: 1 }}>
      <Box justifyContent={'flex-start'}>{children}</Box>
    </Container>
  )
}

const australLogoSize = new ImageSize(412, 72, { scale: 0.5 })
const Footer = () => {
  const t = useTheme()
  return (
    <footer style={{ background: t.palette.primary.main, padding: 20 }}>
      <Container>
        <Grid container>
          <Grid>
            <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
          </Grid>
          <Grid></Grid>
        </Grid>
      </Container>
    </footer>
  )
}
const ResolutionLoggedInLayout: T_FCwChildren = ({ children }) => {
  return (
    <Box height={'100%'} minHeight={'100vh'} justifyContent={'space-between'} flexDirection={'column'} display={'flex'}>
      <Header />
      <Box display={'flex'} flexDirection={'column'} flex={1}>
        <Main>{children}</Main>
        <Footer />
      </Box>
    </Box>
  )
}
export default ResolutionLoggedInLayout
