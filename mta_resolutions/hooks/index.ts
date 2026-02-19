'use client'

import { useLogout } from '@/mta_auth/hooks'
import {
  useResolutionDownloadState,
  useResolutionEvaluationToResolve,
  useResolutionRequestSubmit,
  useResolutionResetState,
  useResolutionState,
} from '@/mta_resolutions/hooks/data'
import { useNavigateToResolutionSubmittedPage } from '@/mta_resolutions/hooks/navigation'
import {
  I_EvaluationToResolve,
  I_ResolutionState,
  I_Page,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
  T_ResolutionState_OpenEndedAnswerData,
} from '@/mta_resolutions/types'
import pages from '@/pages'
import { useInProgress, useInterval } from '@/shared/hooks'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { handleServiceError } from '@/shared/service'
import { useStore } from '@/shared/state'
import { withRouterHistoryReset } from '@/shared/utils'
import { useMemo, useState } from 'react'

const hasAllCurrentPageQuestionsAnswered = (
  pageObj: I_Page,
  state: I_ResolutionState,
): boolean => {
  return pageObj.questions.every((question) => {
    const answer = state.answers[question.id]

    if (!answer) return false

    if (question.answer.resource_type === 'Numeric') {
      const numericAnswer = answer as T_ResolutionState_NumericAnswerData
      return numericAnswer.specific_data.value !== undefined
    }

    if (question.answer.resource_type === 'MultipleChoice') {
      const mcAnswer = answer as T_ResolutionState_MultipleChoiceAnswerData
      return mcAnswer.specific_data.chosen_options.length > 0
    }

    if (question.answer.resource_type === 'OpenEnded') {
      const openEndedAnswer = answer as T_ResolutionState_OpenEndedAnswerData
      return openEndedAnswer.specific_data.value.trim() !== ''
    }

    return false
  })
}

const _canSubmitOrForwardPage = (a: {
  currentPage: number
  pagesQuantity: number | undefined
  resolutionState: I_ResolutionState | null
  evaluationToResolve: I_EvaluationToResolve | null
}): boolean => {
  return (
    a.pagesQuantity !== undefined &&
    a.resolutionState !== null &&
    a.evaluationToResolve !== null &&
    a.currentPage <= a.pagesQuantity &&
    hasAllCurrentPageQuestionsAnswered(a.evaluationToResolve.pages[a.currentPage - 1], a.resolutionState)
  )
}

const useResolutionPagination = () => {
  const currentPage = useStore((state) => state.resolution_currentPage)
  const pagesQuantity = useStore((state) => state.resolution_evaluation?.pages_quantity)
  const storeNewPage = withRouterHistoryReset(useStore((state) => state.resolution_storeCurrentPage))
  const isLastPage = currentPage === pagesQuantity
  const isFirstPage = currentPage === 1
  const resolutionState = useResolutionState()
  const evaluationToResolve = useResolutionEvaluationToResolve()

  const canSubmitOrForwardPage = useMemo(
    () =>
      _canSubmitOrForwardPage({
        currentPage,
        pagesQuantity,
        resolutionState,
        evaluationToResolve,
      }),
    [currentPage, pagesQuantity, resolutionState, evaluationToResolve],
  )

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
    canSubmitOrForwardPage,
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
  const { isOnline } = useNetworkStatus()
  const submit = useResolutionRequestSubmit()
  const resetState = useResolutionResetState()
  const state = useResolutionState()
  const navigateToResolutionSubmittedPage = useNavigateToResolutionSubmittedPage()
  const { downloadResolutionState } = useResolutionDownloadState()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const manageSubmit = () => {
    if (state === null) return
    setIsInProgress()

    if (!isOnline) {
      navigateToResolutionSubmittedPage({ offline: true })
      setIsNotInProgress()
      return
    }

    submit(state)
      .then((res) => {
        navigateToResolutionSubmittedPage()
        resetState()
      })
      .catch(handleServiceError)
      .finally(setIsNotInProgress)
  }
  return manageSubmit
}

const useResolutionRetrySubmit = () => {
  const submit = useResolutionRequestSubmit()
  const resetState = useResolutionResetState()
  const state = useResolutionState()

  return async () => {
    if (!state) throw new Error('No resolution state')
    await submit(state)
    resetState()
  }
}

export {
  useResolutionDownloadState,
  useResolutionElapsedTimeSeconds,
  useResolutionExit,
  useResolutionManageSubmit,
  useResolutionPagination,
  useResolutionLogout,
  useResolutionRetrySubmit,
}
