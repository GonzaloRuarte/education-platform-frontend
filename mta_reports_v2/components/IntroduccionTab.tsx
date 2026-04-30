'use client'

import { Box } from '@mui/material'
import { EditableContentSection } from '@/mta_reports_v2/components/EditableContentSection'

interface IntroduccionTabProps {
  schoolId: number
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

const IntroduccionTab = ({ schoolId }: IntroduccionTabProps) => (
  <EditableContentSection
    schoolId={schoolId}
    diapositivaId={1}
    successMessage="Introducción actualizada correctamente"
    fields={fields}
  >
    {({ renderField }) => (
      <Box sx={{ maxWidth: 820 }}>
        {renderField('title', { mb: 4 })}
        {renderField('paragraph1', { mb: 4 })}
        {renderField('paragraph2')}
      </Box>
    )}
  </EditableContentSection>
)

export { IntroduccionTab }
