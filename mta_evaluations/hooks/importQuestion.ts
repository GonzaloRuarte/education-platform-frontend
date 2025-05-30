import { axiosPost } from '@/shared/data/axios'
import { creationHook } from '@/shared/hooks'
import { useAuthResources } from '@/mta_auth/hooks'
import { I_ImportQuestionRequest, I_ImportQuestionResponse } from '@/mta_evaluations/types'




const useImportQuestion = (evaluationId: number) =>
  creationHook<I_ImportQuestionRequest, I_ImportQuestionResponse>(
    `/evaluations/${evaluationId}/import-question`,
    axiosPost,
    useAuthResources,
  )

export { useImportQuestion }