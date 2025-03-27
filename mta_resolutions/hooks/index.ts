import { useLogout } from '@/mta_auth/hooks'
import { useStoreEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import pages from '@/pages'
import { navigationHook } from '@/shared/hooks'
import { useStore } from '@/shared/state'

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)

const useResolutionPagination = () => {
  return {
    currentPage: useStore((state) => state.resolutionCurrentPage),
    pagesQuantity: useStore((state) => state.evaluationToResolve?.pages_quantity),
    storeNewPage: useStore((state) => state.storeResolutionCurrentPage),
  }
}

const useResolutionExit = () => {
  const logOut = useLogout(pages.R._.login.path)
  const storeEvaluationToResolve = useStoreEvaluationToResolve()

  return () => {
    logOut()
    storeEvaluationToResolve(undefined)
  }
}

export { useNavigateToResolutionPage, useResolutionExit, useResolutionPagination }
