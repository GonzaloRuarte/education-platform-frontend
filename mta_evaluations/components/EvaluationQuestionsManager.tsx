import CreatedQuestions from '@/mta_evaluations/components/CreatedQuestions'
import QuestionCreationToolbar from '@/mta_evaluations/components/QuestionCreationToolbar'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Spacer from '@/shared/components/Spacer'
import { T_VoidFn } from '@/shared/types'
import { FC } from 'react'

const EvaluationQuestionsManager: FC<{ reload: T_VoidFn; data: I_EvaluationDetail }> = ({ reload, data }) => {
  return (
    <>
      <QuestionCreationToolbar {...{ data, reload }} />
      <Spacer />

      <CreatedQuestions {...{ data, reload }} />
    </>
  )
}

export default EvaluationQuestionsManager
