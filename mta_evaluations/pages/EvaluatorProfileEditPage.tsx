'use client'

import EvaluatorProfileUpdateForm from '@/mta_evaluations/components/EvaluatorProfileUpdateForm'
import { EVALUATOR_PROFILE_NAME } from '@/mta_evaluations/constants'
import {
  useEvaluatorProfileDelete,
  useEvaluatorProfileDetail,
  useNavigateToEvaluatorProfileList,
} from '@/mta_evaluations/hooks/evaluators'
import { I_EvaluatorProfileDetail, T_EvaluatorProfileId } from '@/mta_evaluations/types/evaluatorProfile'
import { useNavigateToUserChangePassword } from '@/mta_users/hooks'
import { ChangePasswordButton } from '@/shared/components/buttons'
import EditionPage from '@/shared/pages/EditionPage'

const EvaluatorProfileEditPage = () => {
  const navToList = useNavigateToEvaluatorProfileList()
  const navigateToChangePassword = useNavigateToUserChangePassword()

  return (
    <EditionPage<T_EvaluatorProfileId, I_EvaluatorProfileDetail>
      EditionForm={EvaluatorProfileUpdateForm}
      entityName={EVALUATOR_PROFILE_NAME}
      onExit={navToList}
      useDetail={useEvaluatorProfileDetail}
      useDelete={useEvaluatorProfileDelete}
      customButtons={(data) => (
        <>
          <ChangePasswordButton onClick={() => navigateToChangePassword({ userId: data.user_id })} />
        </>
      )}
    />
  )
}

export default EvaluatorProfileEditPage
