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
      minHeight: 'calc(100vh - 160px)',
      bgcolor: C.blue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Stack alignItems="center" spacing={10}>
      <Logo width={420} height={120} variant="white" />
      <Box sx={{ filter: 'brightness(0) invert(1)' }}>
        <LogoAustral width={300} height={60} />
      </Box>
    </Stack>
  </Box>
)

export { CierreTab }
