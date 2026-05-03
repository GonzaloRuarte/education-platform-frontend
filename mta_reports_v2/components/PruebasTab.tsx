'use client'

import { EditableTab } from '@/mta_reports_v2/components/EditableTab'

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
  <EditableTab
    schoolId={schoolId}
    initialEditing={initialEditing}
    diapositivaId={2}
    successMessage='Sección "Las pruebas" actualizada correctamente'
    fields={fields}
    withAustralFilter
  />
)

export { PruebasTab }
