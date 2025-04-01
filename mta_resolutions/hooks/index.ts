import { useLogout } from '@/mta_auth/hooks'
import {
  useResolutionClearEvaluation,
  useResolutionClearLastUploadDatetime,
  useResolutionClearMetadata,
  useResolutionClearState,
} from '@/mta_resolutions/hooks/data'
import pages from '@/pages'
import { navigationHook, useInterval } from '@/shared/hooks'
import { useStore } from '@/shared/state'
import { useState } from 'react'

const useResolutionPagination = () => {
  const currentPage = useStore((state) => state.resolution_currentPage)
  const pagesQuantity = useStore((state) => state.resolution_evaluation?.pages_quantity)
  return {
    currentPage,
    pagesQuantity,
    storeNewPage: useStore((state) => state.resolution_storeCurrentPage),
    isLastPage: currentPage === pagesQuantity,
  }
}

const useResolutionElapsedTime = () => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const resolutionStartedAt = useStore((state) => state.resolution_startedAt)

  useInterval(() => {
    if (!resolutionStartedAt) return

    const startTime = new Date(resolutionStartedAt).getTime()
    const now = Date.now()
    setElapsedSeconds(Math.floor((now - startTime) / 1000))
  }, 1000) // Update every second

  return elapsedSeconds
}

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)
const useResolutionExit = () => {
  const logOut = useLogout(pages.R._.login.path)
  const clearEvaluation = useResolutionClearEvaluation()
  const clearState = useResolutionClearState()
  const clearLastUpload = useResolutionClearLastUploadDatetime()
  const clearMetadata = useResolutionClearMetadata()

  return () => {
    logOut()
    clearEvaluation()
    clearState()
    clearLastUpload()
    clearMetadata()
  }
}

export { useNavigateToResolutionPage, useResolutionExit, useResolutionPagination, useResolutionElapsedTime }
