import { T_EvaluationStatusCode } from '@/mta_evaluations/types'
import { sharedLabels } from '@/shared/labels'

const evaluationLabels = {
  title: 'Título',
  code: 'Código',
  header: 'Encabezado',
  pinnedText: 'Texto Fijado',
  questions_per_page: 'Preguntas por página',
  status: 'Estado',
  statuses: {
    published: 'Publicada',
    draft: 'Borrador',
  },
  subject: 'Materia',
  create: 'Crear',
  pageBreak: 'Salto de Página',
  newQuestion: 'Nueva pregunta',
  createdQuestions: 'Preguntas Creadas',
}

const evaluationStatusCodeToLabels = (code: T_EvaluationStatusCode): string =>
  ({
    P: evaluationLabels.statuses.published,
    D: evaluationLabels.statuses.draft,
  })[code]

const questionLabels = {
  title: sharedLabels.title,
  content: sharedLabels.content,
  create: 'Crear pregunta',
  pageBreak: {
    add: 'Agregar salto de página',
  },
}

const multipleChoiceLabels = {
  option: {
    name: sharedLabels.name,
    content: sharedLabels.content,
  },
}
const numericLabels = {
  value: 'Valor',
}

export { evaluationLabels, evaluationStatusCodeToLabels, multipleChoiceLabels, questionLabels, numericLabels }
