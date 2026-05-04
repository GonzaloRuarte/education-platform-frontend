'use client'

import { Box, Stack } from '@mui/material'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import { COLORS } from '@/mta_reports_v2/constants'

const C = COLORS

const CierreTab = () => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      bgcolor: C.blue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Stack alignItems="center" spacing={10}>
      <Logo width={420} height={162} variant="white" />
      <Box sx={{ filter: 'brightness(0) invert(1)' }}>
        <LogoAustral width={343} height={60} />
      </Box>
    </Stack>
  </Box>
)

export { CierreTab }
