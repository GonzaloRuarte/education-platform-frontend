import { T_EvaluationStatusCode } from '@/mta_evaluations/types'

const evaluationLabels = {
  status: {
    published: 'Publicada',
    draft: 'Borrador',
  },
}

const evaluationStatusCodeToLabels = (code: T_EvaluationStatusCode): string =>
  ({
    P: evaluationLabels.status.published,
    D: evaluationLabels.status.draft,
  })[code]

export { evaluationStatusCodeToLabels }
