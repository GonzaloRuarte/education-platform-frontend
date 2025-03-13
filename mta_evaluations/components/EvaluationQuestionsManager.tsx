import CreatedQuestions from '@/mta_evaluations/components/CreatedQuestions'
import CreationToolbar from '@/mta_evaluations/components/CreationToolbar'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Spacer from '@/shared/components/Spacer'
import { T_VoidFn } from '@/shared/types'
import { FC } from 'react'

const EvaluationQuestionsManager: FC<{ reload: T_VoidFn; data: I_EvaluationDetail }> = ({ reload, data }) => {
  return (
    <>
      <CreationToolbar />
      <Spacer />

      <CreatedQuestions {...{ data, reload }} />
    </>
  )
}

export default EvaluationQuestionsManager
