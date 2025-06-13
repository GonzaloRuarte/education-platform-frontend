import { T_EvaluationStatusCode } from '@/mta_evaluations/types'
import { sharedLabels } from '@/shared/labels'

const evaluationLabels = {
  title: 'Título',
  code: 'Código',
  header: 'Encabezado',
  status: 'Estado',
  statuses: {
    published: 'Publicada',
    draft: 'Borrador',
    change: 'Modificar estado de evaluación',
    areYouSure: '¿Estás seguro/a que querés modificar el estado de la evaluación?',
  },
  subject: 'Materia',
  create: 'Crear',
  pages: 'Páginas de evaluación',
  addPage: 'Agregar página',

}

const evaluationPageLabels = {
  newQuestion: 'Creación pregunta',
  createdQuestions: 'Preguntas Creadas',
  pinnedText: 'Texto fijo',
  deletePage: 'Eliminar página',
  delete: 'Eliminar',
  deletePageAreYouSure: '¿Estás seguro/a que querés eliminar la página?',
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

export { evaluationLabels, evaluationPageLabels, evaluationStatusCodeToLabels, multipleChoiceLabels, questionLabels, numericLabels }
