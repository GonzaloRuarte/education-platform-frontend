import EvaluationPages from '@/mta_evaluations/components/EvaluationPages'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import { T_VoidFn } from '@/shared/types'
import { FC } from 'react'

const EvaluationQuestionsManager: FC<{ reload: T_VoidFn; data: I_EvaluationDetail }> = ({ reload, data }) => {
  return (
    <>


      <EvaluationPages {...{ data, reload }} />
    </>
  )
}

export default EvaluationQuestionsManager
