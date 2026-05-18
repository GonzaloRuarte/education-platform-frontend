'use client'

import { EditableTab } from '@/mta_reports_v2/components/EditableTab'
import type { I_Subject } from '@/mta_reports_v2/hooks'

interface IntroduccionTabProps {
  subject: I_Subject
  initialEditing?: boolean
}

const fields = {
  title: {
    defaultHtml: '<p>Introducción</p>',
    variant: 'title' as const,
  },
  paragraph1: {
    defaultHtml:
      '<p>Este programa de evaluación está orientado a medir y analizar los desempeños de aprendizaje escolar en Matemática y Prácticas del Lenguaje, con el objetivo de contribuir a la mejora de la calidad y equidad educativa.</p>',
    variant: 'body' as const,
  },
  paragraph2: {
    defaultHtml:
      '<p>A través de evaluaciones estandarizadas, el informe brinda información precisa sobre el desarrollo de los estudiantes al finalizar el primer y segundo ciclo del nivel primario (3° y 6° grado), así como al término del ciclo básico y de la orientación del nivel secundario (9° y 12° año).</p>',
    variant: 'body' as const,
  },
}

const IntroduccionTab = ({ subject, initialEditing }: IntroduccionTabProps) => (
  <EditableTab
    subject={subject}
    initialEditing={initialEditing}
    diapositivaId="intro"
    successMessage="Introducción actualizada correctamente"
    fields={fields}
  />
)

export { IntroduccionTab }
