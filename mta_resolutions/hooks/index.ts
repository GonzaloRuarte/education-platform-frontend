import { useLogout } from '@/mta_auth/hooks'
import { useClearEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import pages from '@/pages'
import { navigationHook } from '@/shared/hooks'
import { useStore } from '@/shared/state'

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)

const useResolutionPagination = () => {
  return {
    currentPage: useStore((state) => state.resolution_currentPage),
    pagesQuantity: useStore((state) => state.resolution_evaluation?.pages_quantity),
    storeNewPage: useStore((state) => state.resolution_storeCurrentPage),
  }
}

const useResolutionExit = () => {
  const logOut = useLogout(pages.R._.login.path)
  const clear = useClearEvaluationToResolve()

  return () => {
    logOut()
    clear()
  }
}

export { useNavigateToResolutionPage, useResolutionExit, useResolutionPagination }
