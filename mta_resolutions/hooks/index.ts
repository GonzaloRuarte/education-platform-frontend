import { useLogout } from '@/mta_auth/hooks'
import {
  useResolutionClearEvaluation,
  useResolutionClearLastUploadDatetime,
  useResolutionClearMetadata,
  useResolutionClearState,
  useResolutionRequestSubmit,
  useResolutionState,
} from '@/mta_resolutions/hooks/data'
import pages from '@/pages'
import { navigationHook, useInProgress, useInterval } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
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
const useNavigateToResolutionSubmittedPage = navigationHook(pages.R._.resolucionEntregada.path)
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

const useResolutionManageSubmit = () => {
  const submit = useResolutionRequestSubmit()
  const state = useResolutionState()
  const navigateToResolutionSubmittedPage = useNavigateToResolutionSubmittedPage()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const manageSubmit = () => {
    if (state === null) return
    setIsInProgress()
    submit(state)
      .then((res) => navigateToResolutionSubmittedPage())
      .catch(handleServiceError)
      .finally(setIsNotInProgress)
  }
  return manageSubmit
}

export {
  useNavigateToResolutionPage,
  useResolutionExit,
  useResolutionPagination,
  useResolutionElapsedTime,
  useResolutionManageSubmit,
}
