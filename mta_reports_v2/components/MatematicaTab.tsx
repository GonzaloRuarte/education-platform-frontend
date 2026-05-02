'use client'

import { Box, Stack, Typography } from '@mui/material'
import { EditableContentSection } from '@/mta_reports_v2/components/EditableContentSection'
import { COLORS } from '@/mta_reports_v2/constants'

const C = COLORS

interface MatematicaTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>Presentación de materias — Matemática</p>', variant: 'title' as const },
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

const MatematicaTab = ({ schoolId, initialEditing }: MatematicaTabProps) => (
  <EditableContentSection
    schoolId={schoolId}
    diapositivaId={4}
    successMessage='Sección "Matemática" actualizada correctamente'
    fields={fields}
    initialEditing={initialEditing}
  >
    {({ renderField }) => (
      <Box sx={{ maxWidth: 1100 }}>
        {renderField('title', { mb: 4 })}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Box flex={1}>
            <Typography sx={{ color: C.navy, fontWeight: 800, fontSize: 22, mb: 1.5 }}>Contenidos</Typography>
            {renderField('contenidos')}
          </Box>
          <Box flex={1}>
            <Typography sx={{ color: C.navy, fontWeight: 800, fontSize: 22, mb: 1.5 }}>Competencias</Typography>
            {renderField('competencias')}
          </Box>
        </Stack>
      </Box>
    )}
  </EditableContentSection>
)

export { MatematicaTab }
