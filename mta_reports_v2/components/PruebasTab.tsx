'use client'

import { Box } from '@mui/material'
import { EditableContentSection } from '@/mta_reports_v2/components/EditableContentSection'
import LogoAustral from '@/shared/components/LogoAustral'

interface PruebasTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: {
    defaultHtml: '<p>Las pruebas</p>',
    variant: 'title' as const,
  },
  body: {
    defaultHtml:
      '<ul>' +
      '<li>Conformadas por <strong>45</strong> ejercicios de respuesta de selección múltiple de cuatro distractores entre los que siempre uno solo es correcto.</li>' +
      '<li>Son de aplicación virtual.</li>' +
      '<li>Los estudiantes disponen de 80 minutos para completarlas.</li>' +
      '<li>Los resultados se presentan:' +
      '<ul>' +
      '<li>por años y por materias,</li>' +
      '<li>por sectores de contenidos y competencias en cada materia,</li>' +
      '<li>por secciones de cada curso y de cada estudiante.</li>' +
      '</ul>' +
      '</li>' +
      '</ul>',
    variant: 'body' as const,
  },
}

const PruebasTab = ({ schoolId, initialEditing }: PruebasTabProps) => (
  <>
    <EditableContentSection
      schoolId={schoolId}
      diapositivaId={2}
      successMessage='Sección "Las pruebas" actualizada correctamente'
      fields={fields}
      initialEditing={initialEditing}
    >
      {({ renderField }) => (
        <Box sx={{ maxWidth: 820 }}>
          {renderField('title', { mb: 4 })}
          {renderField('body')}
        </Box>
      )}
    </EditableContentSection>
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        pointerEvents: 'none',
        filter:
          'brightness(0) saturate(100%) invert(13%) sepia(91%) saturate(3500%) hue-rotate(228deg) brightness(85%) contrast(105%)',
      }}
    >
      <LogoAustral width={440} height={80} />
    </Box>
  </>
)

export { PruebasTab }
