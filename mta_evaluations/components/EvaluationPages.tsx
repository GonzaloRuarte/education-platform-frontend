
import QuestionCreationToolbar from '@/mta_evaluations/components/QuestionCreationToolbar'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { I_EvaluationDetail } from '@/mta_evaluations/types'
import Spacer from '@/shared/components/Spacer'
import { H3 } from '@/shared/components/Typography'
import { T_VoidFn } from '@/shared/types'
import React, { FC } from 'react'

const EvaluationPages: FC<{ data: I_EvaluationDetail; reload: T_VoidFn }> = ({ data, reload }) => {
  return (
    <>
      <H3>{evaluationLabels.pages}</H3>
      
      {data.pages.map((page) => {
        

        return (
          <>
            <Spacer />
            <QuestionCreationToolbar {...{ evaluation_id: data.id, status: data.status, data: page, reload }} />

            
          </>
        )
      })}
    </>
  )
}

export default EvaluationPages
