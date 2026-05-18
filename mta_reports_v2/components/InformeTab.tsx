'use client'

import { EditableTab } from '@/mta_reports_v2/components/EditableTab'
import type { I_Subject } from '@/mta_reports_v2/hooks'

interface InformeTabProps {
  subject: I_Subject
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>El Informe</p>', variant: 'title' as const },
  body: {
    defaultHtml:
      '<p>En el presente informe se presentan los resultados obtenidos por las escuelas participantes desde la primera aplicación disponible hasta la toma más reciente.</p>' +
      '<p>El documento ofrece a las instituciones educativas una síntesis de los logros alcanzados por sus estudiantes, con el objetivo de facilitar el análisis de los procesos de aprendizaje y, consecuentemente, de las prácticas pedagógicas asociadas. A partir de esta información, se espera que las escuelas puedan diseñar estrategias de profundización y ampliación de los logros obtenidos, así como planificar iniciativas de mejora en las acciones de enseñanza, según las necesidades detectadas.</p>',
    variant: 'body' as const,
  },
}

const InformeTab = ({ subject, initialEditing }: InformeTabProps) => (
  <EditableTab
    subject={subject}
    initialEditing={initialEditing}
    diapositivaId="informe"
    successMessage='Sección "El Informe" actualizada correctamente'
    fields={fields}
  />
)

export { InformeTab }
