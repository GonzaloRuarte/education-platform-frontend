import { useAuthResources, useLogout } from '@/mta_auth/hooks'
import { I_EvaluationToResolve } from '@/mta_resolutions/types'
import pages from '@/pages'
import { axiosPost } from '@/shared/data/axios'
import { actionHook, navigationHook, useInProgress } from '@/shared/hooks'
import { useStore } from '@/shared/state'
import useToasts from '@/shared/toasts'
import { T_EmptyPayload } from '@/shared/types'

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)
// const useNavigateToResolutionLogin = navigationHook(pages.R._.login.path)

// Data Service
const RESOLUTIONS_PATH = '/resolutions'

const _useRequestResume = actionHook<T_EmptyPayload, I_EvaluationToResolve>(
  `${RESOLUTIONS_PATH}/resume`,
  axiosPost,
  useAuthResources,
)

const _useStoreEvaluationToResolve = () => {
  return useStore((state) => state.storeEvaluationToResolve)
}

const useResolutionResume = () => {
  const requestResume = _useRequestResume()
  const storeEvaluationToResolve = _useStoreEvaluationToResolve()
  const { setIsNotInProgress, setIsInProgress } = useInProgress()
  const { errorToast } = useToasts()

  const resume = () => {
    setIsInProgress()
    requestResume({})
      .then(storeEvaluationToResolve)
      .catch((err) => {
        errorToast('Hubo un error iniciando la evaluación. ')
      })
      .finally(setIsNotInProgress)
  }
  return { resume }
}

const useResolutionEvaluationToResolve = () => useStore((state) => state.evaluationToResolve)

const useResolutionExit = () => {
  const logOut = useLogout(pages.R._.login.path)
  const storeEvaluationToResolve = _useStoreEvaluationToResolve()

  return () => {
    logOut()
    storeEvaluationToResolve(undefined)
  }
}

export { useNavigateToResolutionPage, useResolutionResume, useResolutionEvaluationToResolve, useResolutionExit }
