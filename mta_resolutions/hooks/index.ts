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
  T_EvaluationToResolve_Page,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
} from '@/mta_resolutions/types'
import pages from '@/pages'
import { useInProgress, useInterval } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { useStore } from '@/shared/state'
import { withRouterHistoryReset } from '@/shared/utils'
import { useState } from 'react'

const hasAllCurrentPageQuestionsAnswered = (
  currentPageData: T_EvaluationToResolve_Page,
  state: I_ResolutionState,
): boolean => {
  return currentPageData.every((question) => {
    const answer = state.answers[question.id]

    if (!answer) {
      // If there's no answer for the question, it's not answered
      return false
    }

    if (question.answer.resource_type === 'Numeric') {
      // For numeric answers, check if the value is defined
      const numericAnswer = answer as T_ResolutionState_NumericAnswerData
      return numericAnswer.specific_data.value !== undefined
    }

    if (question.answer.resource_type === 'MultipleChoice') {
      // For multiple-choice answers, check if at least one option is chosen
      const multipleChoiceAnswer = answer as T_ResolutionState_MultipleChoiceAnswerData
      return multipleChoiceAnswer.specific_data.choosed_options.length > 0
    }

    // If the resource type is unknown, consider it unanswered
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
    a.currentPage < a.pagesQuantity &&
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
  const canSubmitOrForwardPage = _canSubmitOrForwardPage({
    currentPage,
    pagesQuantity,
    resolutionState,
    evaluationToResolve,
  })

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
