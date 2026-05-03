'use client'

import { EditableTab } from '@/mta_reports_v2/components/EditableTab'

interface PisaTabProps {
  schoolId: number
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>Ejercicios tipo PISA</p>', variant: 'title' as const },
  body: {
    defaultHtml:
      '<p>Las pruebas están compuestas por un total de 45 ejercicios, de los cuales 5 se clasifican como “ejercicios tipo PISA”, ya que responden al estilo y formato característicos de las evaluaciones internacionales de estas características.</p>' +
      '<p>Estos 5 ejercicios fueron incorporados a partir de 2023 como parte del proceso de mejora continua del Programa META. Como resultado de esta incorporación, los informes presentan tres tipos de resultados:</p>' +
      '<p>a) Los obtenidos en los <strong>40 ejercicios tradicionales</strong>, lo cual permite mantener la comparabilidad con los resultados de aplicaciones anteriores a la introducción de los ítems tipo PISA.</p>' +
      '<p>b) Los correspondientes a los <strong>5 ejercicios tipo PISA</strong>.</p>' +
      '<p>c) Los resultados globales basados en los <strong>45 ejercicios que conforman la prueba completa</strong>.</p>' +
      '<p>Las comparaciones entre instituciones se realizan exclusivamente sobre la base de los 40 ejercicios mencionados en el punto “a”, garantizando así la consistencia histórica de los datos.</p>',
    variant: 'body' as const,
  },
}

const PisaTab = ({ schoolId, initialEditing }: PisaTabProps) => (
  <EditableTab
    schoolId={schoolId}
    initialEditing={initialEditing}
    diapositivaId={6}
    successMessage='Sección "Ejercicios tipo PISA" actualizada correctamente'
    fields={fields}
    maxWidth={1000}
  />
)

export { PisaTab }
