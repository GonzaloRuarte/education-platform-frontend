import CreatedQuestions from '@/mta_evaluations/components/CreatedQuestions'
import CreationToolbar from '@/mta_evaluations/components/CreationToolbar'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Spacer from '@/shared/components/Spacer'
import { FC } from 'react'

const EvaluationQuestionsManager: FC<{ data: I_EvaluationDetail }> = ({ data }) => {
  return (
    <>
      <CreationToolbar />
      <Spacer />

      <CreatedQuestions data={data} />
    </>
  )
}

export default EvaluationQuestionsManager
