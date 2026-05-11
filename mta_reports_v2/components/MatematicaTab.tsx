'use client'

import { Box, Stack, Typography } from '@mui/material'
import { EditableTab } from '@/mta_reports_v2/components/EditableTab'
import { SubjectBadge } from '@/mta_reports_v2/components/shared/SubjectBadge'
import { COLORS, FONT_WEIGHTS, RADIUS, TITLE_FONT_FAMILY } from '@/mta_reports_v2/constants'
import type { I_Subject } from '@/mta_reports_v2/hooks'

const C = COLORS
const W = FONT_WEIGHTS

interface MatematicaTabProps {
  subject: I_Subject
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>Presentación de materias</p>', variant: 'title' as const },
  contenidos: {
    defaultHtml:
      '<ul>' +
      '<li>Numeración y operaciones.</li>' +
      '<li>Medidas.</li>' +
      '<li>Geometría: cuerpos y polígonos.</li>' +
      '<li>Estadística y probabilidad (a partir de 6º).</li>' +
      '<li>Álgebra (en 9º y 12º).</li>' +
      '<li>Funciones, ecuaciones e inecuaciones (en 9º y 12º).</li>' +
      '</ul>',
    variant: 'body' as const,
  },
  competencias: {
    defaultHtml:
      '<p><strong>Reconocimiento de conceptos:</strong> Capacidad de identificar conceptos por medio de ejemplos, casos, atributos o definiciones de los mismos o viceversa: identificar ejemplos, casos, atributos o definiciones de conceptos dados.</p>' +
      '<p><strong>Resolución de operaciones (algoritmos):</strong> Capacidad de resolver diversas operaciones matemáticas mediante distintos procedimientos canónicos o no convencionales.</p>' +
      '<p><strong>Resolución de problemas:</strong> Capacidad de resolución de situaciones matemáticas nuevas, integrales y situadas en contextos intra-matemáticos y/o de la realidad cotidiana.</p>',
    variant: 'body' as const,
  },
}

const sectionHeadingSx = {
  fontFamily: TITLE_FONT_FAMILY,
  color: C.navy,
  fontWeight: W.extrabold,
  fontSize: 'min(2.2cqi, 28px)',
  mb: 1.5,
}

const MatematicaTab = ({ subject, initialEditing }: MatematicaTabProps) => (
  <EditableTab
    subject={subject}
    initialEditing={initialEditing}
    diapositivaId="matematica"
    successMessage='Sección "Matemática" actualizada correctamente'
    fields={fields}
  >
    {({ renderField }) => (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 4 }}>
          {renderField('title', { mb: 1.5 })}
          <SubjectBadge>Matemática</SubjectBadge>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={10}>
          <Box flex={1}>
            <Typography sx={sectionHeadingSx}>Contenidos</Typography>
            <Box
              sx={{
                '& ul': { listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.25 },
                '& li': {
                  bgcolor: C.iceBlue,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: RADIUS.sm,
                  color: C.navy,
                },
              }}
            >
              {renderField('contenidos')}
            </Box>
          </Box>
          <Box flex={1}>
            <Typography sx={sectionHeadingSx}>Competencias</Typography>
            {renderField('competencias')}
          </Box>
        </Stack>
      </Box>
    )}
  </EditableTab>
)

export { MatematicaTab }
