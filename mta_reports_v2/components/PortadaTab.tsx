'use client'

import Box from '@mui/material/Box'
import Image from 'next/image'
import { Stack, Typography } from '@mui/material'
import { useEscuelaReporteAurora } from '@/mta_reports_v2/hooks'
import Footer from '@/shared/layout/Footer'
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
    <Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', flexDirection: 'column' }}>
      <Box height="auto" flex={1} display="flex" minWidth={0}>
        <Box flex={1} position="relative" minWidth={0}>
          <Box
            width="70%"
            height="70%"
            position="absolute"
            zIndex={1}
            sx={{ mixBlendMode: 'multiply' }}
            top={-20}
            left={-20}
          >
            <Image src="/triangle.png" alt="Chico estudiando" objectPosition="top left" fill objectFit="contain" />
          </Box>
          <Box width="100%" height="100%" position="relative" sx={{ mixBlendMode: 'multiply' }}>
            <Image src="/boy.jpg" alt="Chico estudiando" objectPosition="bottom right" fill objectFit="contain" />
          </Box>
        </Box>
        <Box flex={1} display="flex" alignItems="center" justifyContent="center" minWidth={0}>
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
        </Box>
      </Box>
      <Footer includePin={false} />
    </Box>
  )
}

export { PortadaTab }
