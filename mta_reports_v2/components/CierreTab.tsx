'use client'

import { Box, Stack } from '@mui/material'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import { COLORS } from '@/mta_reports_v2/constants'
import { SlideContainer } from '@/mta_reports_v2/components/shared/SlideContainer'

const C = COLORS

const CierreTab = () => (
  <SlideContainer bgcolor={C.blue} centered sx={{ containerType: 'inline-size' }}>
    <Stack alignItems="center" spacing={10} sx={{ width: '100%' }}>
      <Box sx={{ width: 'min(33cqi, 420px)', '& img': { width: '100%', height: 'auto', display: 'block' } }}>
        <Logo width={420} height={162} variant="white" />
      </Box>
      <Box sx={{ filter: 'brightness(0) invert(1)', width: 'min(27cqi, 343px)', '& img': { width: '100%', height: 'auto', display: 'block' } }}>
        <LogoAustral width={343} height={60} />
      </Box>
    </Stack>
  </SlideContainer>
)

export { CierreTab }
