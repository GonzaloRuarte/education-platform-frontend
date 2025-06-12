import { axiosPost } from '@/shared/data/axios'
import { creationHook } from '@/shared/hooks'
import { useAuthResources } from '@/mta_auth/hooks'
import { I_ImportQuestionRequest, I_ImportQuestionResponse } from '@/mta_evaluations/types'




const useImportQuestion = (evaluationPageId: number) =>
  creationHook<I_ImportQuestionRequest, I_ImportQuestionResponse>(
    `/evaluation-pages/${evaluationPageId}/import-question`,
    axiosPost,
    useAuthResources,
  )

export { useImportQuestion }