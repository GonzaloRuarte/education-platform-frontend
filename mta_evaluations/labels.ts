import { T_EvaluationStatusCode } from '@/mta_evaluations/types'

const evaluationLabels = {
  title: 'Título',
  code: 'Código',
  header: 'Encabezado',
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

export { evaluationStatusCodeToLabels, evaluationLabels }
