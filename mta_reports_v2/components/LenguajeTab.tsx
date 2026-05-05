'use client'

import { Box } from '@mui/material'
import { EditableTab } from '@/mta_reports_v2/components/EditableTab'

interface LenguajeTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>Presentación de materias</p>', variant: 'title' as const },
  body: {
    defaultHtml:
      '<p>Las competencias seleccionadas para el área de Prácticas del Lenguaje son comprensión lectora y reflexión sobre los hechos de la práctica del lenguaje, tanto para texto de ficción, texto informativo, texto argumentativo (9º y 12º). A partir de ellas y en todos los casos, se evalúa:</p>' +
      '<ul>' +
      '<li><strong>El reconocimiento de información explícita:</strong> capacidad para buscar, localizar, seleccionar y extraer información de un texto. Para localizar la información, los estudiantes deben cotejar lo que se pregunta con la información literal o equivalente del texto.</li>' +
      '<li><strong>El reconocimiento de información implícita y/o interpretación de la información:</strong> capacidad para relacionar distintas partes del texto, por ejemplo relaciones de causa/efecto, para realizar inferencias y deducciones que pueden depender de la impresión global del texto y/o del contexto real o imaginario en que se desarrolla el contenido del texto.</li>' +
      '<li><strong>Análisis textual:</strong> crítica, reflexión y evaluación de lo leído para reconocer el sentido global del texto, la intención del autor; para identificar el posible portador del texto, el estilo, el género y el registro de lo leído. Todo ello requiere adoptar un cierto distanciamiento del texto.</li>' +
      '</ul>',
    variant: 'body' as const,
  },
}

const LenguajeTab = ({ schoolId, initialEditing }: LenguajeTabProps) => (
  <EditableTab
    schoolId={schoolId}
    initialEditing={initialEditing}
    diapositivaId="lenguaje"
    successMessage='Sección "Prácticas del Lenguaje" actualizada correctamente'
    fields={fields}
  >
    {({ renderField }) => (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 4 }}>
          {renderField('title', { mb: 1.5 })}
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: '#4C7198',
              color: '#fff',
              fontWeight: 800,
              fontSize: 26,
              px: 4,
              py: 3,
              borderRadius: 999,
              lineHeight: 1
            }}
          >
            Prácticas del Lenguaje
          </Box>
        </Box>
        {renderField('body')}
      </Box>
    )}
  </EditableTab>
)

export { LenguajeTab }
