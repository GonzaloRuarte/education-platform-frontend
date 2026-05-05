'use client'

import { Box, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { SLIDE_HERO_TITLE_SX } from '@/mta_reports_v2/constants'
import { SlideContainer } from '@/mta_reports_v2/components/shared/SlideContainer'

const PresentacionResultadosTab = () => (
  <SlideContainer sx={{ flexDirection: 'row' }}>
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
        <Image src="/triangle.png" alt="" fill style={{ objectFit: 'contain', objectPosition: 'top left' }} />
      </Box>
      <Box width="100%" height="100%" position="relative" sx={{ mixBlendMode: 'multiply' }}>
        <Image src="/boy.jpg" alt="Estudiante" fill style={{ objectFit: 'contain', objectPosition: 'bottom right' }} />
      </Box>
    </Box>
    <Box flex={1} display="flex" alignItems="center" justifyContent="center" minWidth={0}>
      <Stack alignItems="center" sx={{ px: 4 }}>
        <Typography sx={{ ...SLIDE_HERO_TITLE_SX, textAlign: 'center' }}>
          Presentación de los Resultados
        </Typography>
      </Stack>
    </Box>
  </SlideContainer>
)

export { PresentacionResultadosTab }
