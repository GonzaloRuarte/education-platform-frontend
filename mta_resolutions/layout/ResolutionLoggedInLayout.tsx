'use client'

import Box from '@mui/material/Box'

import { useResolutionEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import Logo from '@/shared/components/Logo'
import { H4 } from '@/shared/components/Typography'
import { useTheme } from '@/shared/hooks'
import { T_FCwChildren } from '@/shared/types'
import { ImageSize } from '@/shared/utils'

import AccessibilityWrapper from '@/mta_resolutions/components/AccessibilityWrapper'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'
import Footer from '@/shared/layout/Footer'

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

const ResolutionLoggedInLayout: T_FCwChildren = ({ children }) => {
  return (
    <AccessibilityWrapper>
      <Box
        height={'100%'}
        minHeight={'100vh'}
        justifyContent={'space-between'}
        flexDirection={'column'}
        display={'flex'}
      >
        <Header />
        <Box display={'flex'} flexDirection={'column'} flex={1}>
          <Main>{children}</Main>
          <Footer />
        </Box>
      </Box>
    </AccessibilityWrapper>
  )
}
export default ResolutionLoggedInLayout
