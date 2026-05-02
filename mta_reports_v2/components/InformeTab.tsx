'use client'

import { Box } from '@mui/material'
import { EditableContentSection } from '@/mta_reports_v2/components/EditableContentSection'

interface InformeTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>El Informe</p>', variant: 'title' as const },
  body: {
    defaultHtml:
      '<p>En el presente informe se presentan los resultados obtenidos por las escuelas participantes del Programa META desde su primera aplicación en 2022 hasta la toma más reciente en 2025.</p>' +
      '<p>El documento ofrece a las instituciones educativas una síntesis de los logros alcanzados por sus estudiantes, con el objetivo de facilitar el análisis de los procesos de aprendizaje y, consecuentemente, de las prácticas pedagógicas asociadas. A partir de esta información, se espera que las escuelas puedan diseñar estrategias de profundización y ampliación de los logros obtenidos, así como planificar iniciativas de mejora en las acciones de enseñanza, según las necesidades detectadas.</p>',
    variant: 'body' as const,
  },
}

const InformeTab = ({ schoolId, initialEditing }: InformeTabProps) => (
  <EditableContentSection
    schoolId={schoolId}
    diapositivaId={3}
    successMessage='Sección "El Informe" actualizada correctamente'
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
)

export { InformeTab }
