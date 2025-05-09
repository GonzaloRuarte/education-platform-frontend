'use client'

import Box from '@mui/material/Box'

import { useResolutionEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import { H4 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import { ImageSize } from '@/shared/utils'

import TeachersPinMenu from '@/mta_resolutions/components/TeachersPinMenu'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'
import AccessibilityWrapper from '@/mta_resolutions/components/AccessibilityWrapper'

const logoSize = new ImageSize(262, 101, { scale: 0.5 })

const Header = () => {
  const t = useTheme()

  const evaluationToResolve = useResolutionEvaluationToResolve()

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
          </Grid>
        </Container>
      </header>
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
        <Grid container alignItems={'center'} justifyContent={'space-between'}>
          <Grid size={8}>
            <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
          </Grid>
          <Grid size={4} display={'flex'} justifyContent={'flex-end'}>
            <TeachersPinMenu />
          </Grid>
        </Grid>
      </Container>
    </footer>
  )
}

const ResolutionLoggedInLayout: T_FCwChildren = ({ children }) => {
  return (
    <Box height={'100%'} minHeight={'100vh'} justifyContent={'space-between'} flexDirection={'column'} display={'flex'}>
      <AccessibilityWrapper>
        <Header />
        <Box display={'flex'} flexDirection={'column'} flex={1}>
          <Main>{children}</Main>
          <Footer />
        </Box>
      </AccessibilityWrapper>
    </Box>
  )
}
export default ResolutionLoggedInLayout
