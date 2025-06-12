
import QuestionAccordion from '@/mta_evaluations/components/QuestionAccordion'
import { evaluationPageLabels } from '@/mta_evaluations/labels'
import { I_EvaluationPageDetail, T_EvaluationStatusCode } from '@/mta_evaluations/types'
import Spacer from '@/shared/components/Spacer'
import { H4 } from '@/shared/components/Typography'
import { T_VoidFn } from '@/shared/types'
import React, { FC, useState } from 'react'

const CreatedQuestions: FC<{ evaluationStatus: T_EvaluationStatusCode; data: I_EvaluationPageDetail; reload: T_VoidFn }> = ({ evaluationStatus, data, reload }) => {
  const [expanded, setExpanded] = useState<I_EvaluationPageDetail['id'] | false>(false)

  return (
    <>
      <H4>{evaluationPageLabels.createdQuestions}</H4>
      <Spacer />
      {data.questions.map((question) => {
        const isExpanded = expanded === question.id
        return (
          <React.Fragment key={question.id}>
            <QuestionAccordion
              reload={reload}
              evaluationStatus={evaluationStatus}
              evaluationId={data.id}
              {...{ isExpanded, setExpanded, question }}
            />

          </React.Fragment>
        )
      })}
    </>
  )
}

export default CreatedQuestions
