import PageBreak from '@/mta_evaluations/components/PageBreak'
import QuestionAccordion from '@/mta_evaluations/components/QuestionAccordion'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Spacer from '@/shared/components/Spacer'
import { H3 } from '@/shared/components/Typography'
import React, { FC, useState } from 'react'

const CreatedQuestions: FC<{ data: I_EvaluationDetail }> = ({ data }) => {
  const [expanded, setExpanded] = useState<I_EvaluationDetail['id'] | false>(false)

  return (
    <>
      <H3>{evaluationLabels.createdQuestions}</H3>
      <Spacer />
      {data.questions.map((question) => {
        const isExpanded = expanded === question.id
        return (
          <React.Fragment key={question.id}>
            <QuestionAccordion evaluationId={data.id} {...{ isExpanded, setExpanded, question }} />
            {question.breaks_page_after && <PageBreak afterQuestionId={question.id} />}
          </React.Fragment>
        )
      })}
    </>
  )
}

export default CreatedQuestions
