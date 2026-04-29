'use client'

import { Box, Typography } from '@mui/material'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import { COLORS } from '@/mta_reports_v2/constants'
import { ImageSize } from '@/shared/utils'

const C = COLORS
const metaLogoSize = new ImageSize(257, 73, { scale: 0.74 })
const australLogoSize = new ImageSize(412, 72, { scale: 0.7 })

const IntroduccionTab = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 220px)',
        bgcolor: 'common.white',
        overflow: 'hidden',
        px: { xs: 3, md: 8 },
        py: { xs: 4, md: 5 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: 4, md: 10 } }}>
        <Logo width={metaLogoSize.w} height={metaLogoSize.h} />
      </Box>

      <Box sx={{ maxWidth: 760, pt: { xs: 2, md: 16 } }}>
        <Typography
          sx={{
            color: C.navy,
            fontSize: { xs: 36, md: 52 },
            fontWeight: 800,
            lineHeight: 1.05,
            mb: 4,
          }}
        >
          Introducción
        </Typography>

        <Typography
          sx={{
            color: C.navy,
            fontSize: { xs: 18, md: 24 },
            lineHeight: 1.48,
            mb: 4,
          }}
        >
          META (Medición y Evaluación para la Transformación de los Aprendizajes) es un programa de la Escuela de Educación de la
          Universidad Austral, orientado a medir y evaluar los desempeños de aprendizaje escolar en Matemática y Prácticas del
          Lenguaje, con el objetivo de contribuir a la mejora de la calidad y equidad educativa.
        </Typography>

        <Typography
          sx={{
            color: C.navy,
            fontSize: { xs: 18, md: 24 },
            lineHeight: 1.48,
          }}
        >
          A través de evaluaciones estandarizadas que se realizan dos veces al año, META brinda información precisa sobre el
          desarrollo de los estudiantes al finalizar el primer y segundo ciclo del nivel primario (3° y 6° grado), así como al
          término del ciclo básico y de la orientación del nivel secundario (9° y 12° año).
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 8, md: 12 } }}>
        <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
      </Box>
    </Box>
  )
}

export { IntroduccionTab }
