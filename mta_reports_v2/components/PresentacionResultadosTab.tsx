'use client'

import { Box, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { COLORS } from '@/mta_reports_v2/constants'

const C = COLORS

const PresentacionResultadosTab = () => (
  <Box sx={{ display: 'flex', width: '100%', height: '100%', bgcolor: C.white, overflow: 'hidden' }}>
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
        <Typography
          sx={{
            color: C.royal,
            fontSize: 'clamp(40px, 5.5vw, 64px)',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          Presentación de los Resultados
        </Typography>
      </Stack>
    </Box>
  </Box>
)

export { PresentacionResultadosTab }
