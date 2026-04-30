'use client'

import { Stack, Typography } from '@mui/material'
import { useEscuelaReporteAurora } from '@/mta_reports_v2/hooks'
import { LogInPageLayoutBoy } from '@/shared/layout/LogInPageLayout'
import Logo from '@/shared/components/Logo'
import { ImageSize } from '@/shared/utils'

const metaLogoSize = new ImageSize(350, 100)

interface PortadaTabProps {
  schoolId: number
}

const ORDINAL_TOMA_LABELS: Record<string, string> = {
  '1': 'Primera Toma',
  '2': 'Segunda Toma',
  '3': 'Tercera Toma',
  '4': 'Cuarta Toma',
}

const PortadaTab = () => {
  return (
    <LogInPageLayoutBoy >
      <Stack alignItems="left" spacing={4} sx={{ px: 4 }}>
        <Logo width={metaLogoSize.w} height={metaLogoSize.h} variant='color' />
        <Typography
          sx={{
            color: '#0040a3',
            fontSize: 'clamp(48px, 6vw, 72px)',
            fontWeight: 900,
            textAlign: 'left',
            lineHeight: 1.1,
          }}
        >
          {'Primera Toma'}
        </Typography>
        <Typography
          sx={{
            color: '#0040a3',
            fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: 700,
            textAlign: 'left',
            lineHeight: 1.2,
          }}
        >
          {2026}
        </Typography>
      </Stack>
    </LogInPageLayoutBoy >
  )
}

export { PortadaTab }
