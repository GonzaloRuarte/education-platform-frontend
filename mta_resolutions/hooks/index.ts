import { useLogout } from '@/mta_auth/hooks'
import {
  useResolutionDownloadState,
  useResolutionRequestSubmit,
  useResolutionResetState,
  useResolutionState,
} from '@/mta_resolutions/hooks/data'
import { useNavigateToResolutionSubmittedPage } from '@/mta_resolutions/hooks/navigation'
import pages from '@/pages'
import { useInProgress, useInterval } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { useStore } from '@/shared/state'
import { withRouterHistoryReset } from '@/shared/utils'
import { useState } from 'react'

const useResolutionPagination = () => {
  const currentPage = useStore((state) => state.resolution_currentPage)
  const pagesQuantity = useStore((state) => state.resolution_evaluation?.pages_quantity)
  const storeNewPage = withRouterHistoryReset(useStore((state) => state.resolution_storeCurrentPage))
  const isLastPage = currentPage === pagesQuantity
  const isFirstPage = currentPage === 1

  return {
    currentPage,
    pagesQuantity,
    isLastPage,
    isFirstPage,
    storeNewPage,
    goToPreviousPage: () => {
      if (isFirstPage) return
      storeNewPage(currentPage - 1)
    },
    goToNextPage: () => {
      if (isLastPage) return
      storeNewPage(currentPage + 1)
    },
  }
}

const useResolutionElapsedTimeSeconds = () => {
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
const useResolutionLogout = () => useLogout(pages.R._.login.path)

const useResolutionExit = () => {
  const logOut = useResolutionLogout()
  const resetState = useResolutionResetState()

  return () => {
    logOut()
    resetState()
  }
}

const useResolutionManageSubmit = () => {
  const submit = useResolutionRequestSubmit()
  const state = useResolutionState()
  const navigateToResolutionSubmittedPage = useNavigateToResolutionSubmittedPage()
  const { downloadResolutionState } = useResolutionDownloadState()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const manageSubmit = () => {
    if (state === null) return
    setIsInProgress()
    downloadResolutionState()
    submit(state)
      .then((res) => navigateToResolutionSubmittedPage())
      .catch(handleServiceError)
      .finally(setIsNotInProgress)
  }
  return manageSubmit
}

export {
  useResolutionElapsedTimeSeconds,
  useResolutionExit,
  useResolutionManageSubmit,
  useResolutionPagination,
  useResolutionLogout,
}
