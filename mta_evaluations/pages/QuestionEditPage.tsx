import QuestionEditForm from '@/mta_evaluations/components/QuestionEditForm'
import { useQuestionDetail } from '@/mta_evaluations/hooks'
import { T_QuestionId } from '@/mta_evaluations/types'
import Spinner from '@/shared/components/Spinner'
import { FC } from 'react'

const QuestionEdit: FC<{ id: T_QuestionId }> = ({ id }) => {
  const { data, reload } = useQuestionDetail(id)

  if (data === undefined) return <Spinner />
  return <QuestionEditForm data={data} />
}

export default QuestionEdit
