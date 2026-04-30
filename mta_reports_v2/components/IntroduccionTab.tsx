'use client'

import { Box } from '@mui/material'
import { EditableContentSection } from '@/mta_reports_v2/components/EditableContentSection'
import LogoAustral from '@/shared/components/LogoAustral'

interface IntroduccionTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: {
    defaultHtml: '<p>Introducción</p>',
    variant: 'title' as const,
  },
  paragraph1: {
    defaultHtml:
      '<p>META (Medición y Evaluación para la Transformación de los Aprendizajes) es un programa de la Escuela de Educación de la Universidad Austral, orientado a medir y evaluar los desempeños de aprendizaje escolar en Matemática y Prácticas del Lenguaje, con el objetivo de contribuir a la mejora de la calidad y equidad educativa.</p>',
    variant: 'body' as const,
  },
  paragraph2: {
    defaultHtml:
      '<p>A través de evaluaciones estandarizadas que se realizan dos veces al año, META brinda información precisa sobre el desarrollo de los estudiantes al finalizar el primer y segundo ciclo del nivel primario (3° y 6° grado), así como al término del ciclo básico y de la orientación del nivel secundario (9° y 12° año).</p>',
    variant: 'body' as const,
  },
}

const IntroduccionTab = ({ schoolId, initialEditing }: IntroduccionTabProps) => (
  <>
    <EditableContentSection
      schoolId={schoolId}
      diapositivaId={1}
      successMessage="Introducción actualizada correctamente"
      fields={fields}
      initialEditing={initialEditing}
    >
      {({ renderField }) => (
        <Box sx={{ maxWidth: 820 }}>
          {renderField('title', { mb: 4 })}
          {renderField('paragraph1', { mb: 4 })}
          {renderField('paragraph2')}
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

export { IntroduccionTab }
