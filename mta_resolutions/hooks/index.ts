'use client'

import { useLogout } from '@/mta_auth/hooks'
import { flushPendingResolutionEdits } from '@/mta_resolutions/flushPendingResolutionEdits'
import { buildResolutionOfflineKeyFromState } from '@/mta_resolutions/offlineStorage'
import {
  useResolutionDownloadState,
  useResolutionEvaluationToResolve,
  useResolutionFinalizeTimeout,
  useResolutionRequestSubmit,
  useResolutionResetState,
  useResolutionState,
} from '@/mta_resolutions/hooks/data'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { useNavigateToResolutionSubmittedPage } from '@/mta_resolutions/hooks/navigation'
import {
  I_EvaluationToResolve,
  I_Page,
  I_ResolutionState,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
  T_ResolutionState_OpenEndedAnswerData,
} from '@/mta_resolutions/types'
import pages from '@/pages'
import ApiError from '@/shared/data/errors'
import { useInProgress, useInterval } from '@/shared/hooks'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { useStore } from '@/shared/state'
import { withRouterHistoryReset } from '@/shared/utils'
import { useMemo, useState } from 'react'

const hasAllCurrentPageQuestionsAnswered = (pageObj: I_Page, state: I_ResolutionState): boolean => {
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
  }, 1000)

  return elapsedSeconds
}

const useResolutionLogout = () => useLogout(pages.R._.login.path)

const useResolutionExit = () => {
  const logout = useResolutionLogout()
  return () => {
    logout()
  }
}

const SUBMIT_CONFIRMATION_TIMEOUT_MS = 4000

const _buildSubmitConfirmationTimeoutError = () =>
  new ApiError({
    message: 'No se pudo confirmar el envío con el servidor.',
    status: -1,
    rawError: {
      response: {
        data: {
          error_code: 'SUBMIT_CONFIRMATION_TIMEOUT',
          message: 'No se pudo confirmar el envío con el servidor.',
        },
      },
    },
  })

const withConfirmationTimeout = async <T,>(promise: Promise<T>): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(_buildSubmitConfirmationTimeoutError()), SUBMIT_CONFIRMATION_TIMEOUT_MS)
    }),
  ])
}

const useResolutionActionDrivenFinalize = () => {
  const { isOnline } = useNetworkStatus()
  const submit = useResolutionRequestSubmit()
  const finalizeTimeout = useResolutionFinalizeTimeout()
  const resetState = useResolutionResetState()
  const navigateToResolutionSubmittedPage = useNavigateToResolutionSubmittedPage()
  const { downloadResolutionState } = useResolutionDownloadState()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const setOfflineSubmitted = useStore((s) => s.resolution_setOfflineSubmitted)
  const setRequiresFinalizationOnAction = useStore((s) => s.resolution_setRequiresFinalizationOnAction)
  const storeMetadata = useStore((s) => s.resolution_storeMetadata)
  const { maxDurationReached } = useResolutionDurationResources()
  const requiresFinalizationOnAction = useStore((s) => s.resolution_requiresFinalizationOnAction)

  const normalizeActiveMetadataFromServer = (serverResolution: {
    started_at: string
    submit_by_time: string
    server_now: string
    max_duration_minutes: number
    last_uploaded_state_server_created_at: string | null
  }) => {
    const current = useStore.getState()
    storeMetadata({
      resolution_startedAt: serverResolution.started_at,
      resolution_submitByTime: serverResolution.submit_by_time,
      resolution_serverNowAtSync: serverResolution.server_now,
      resolution_maxDurationMinutes: serverResolution.max_duration_minutes,
      resolution_pin: current.resolution_pin,
      resolution_serverStateToken: serverResolution.last_uploaded_state_server_created_at,
      resolution_hasUnsyncedLocalChanges: current.resolution_hasUnsyncedLocalChanges,
      resolution_successfulResumeIdentityKey:
        current.resolution_state ? buildResolutionOfflineKeyFromState(current.resolution_state) : current.resolution_successfulResumeIdentityKey,
    })
  }

  const finishAndLeave = async () => {
    setRequiresFinalizationOnAction(false)
    await resetState()
    navigateToResolutionSubmittedPage()
  }

  const normalSubmit = async (state: I_ResolutionState) => {
    await withConfirmationTimeout(submit(state))
    await finishAndLeave()
  }

  return async (options?: { onStillActive?: () => void; forceSubmit?: boolean }) => {
    const { onStillActive, forceSubmit = false } = options ?? {}

    await flushPendingResolutionEdits()

    const state = useStore.getState().resolution_state
    if (state === null) return

    const mustResolveWithServer = requiresFinalizationOnAction || maxDurationReached === true

    setIsInProgress()

    if (!isOnline) {
      await downloadResolutionState()
      setOfflineSubmitted(true)
      setIsNotInProgress()
      return
    }

    try {
      if (mustResolveWithServer) {
        const result = await withConfirmationTimeout(finalizeTimeout(state))

        if (result.result === 'ACTIVE') {
          normalizeActiveMetadataFromServer(result.resolution)
          setRequiresFinalizationOnAction(false)

          if (forceSubmit) {
            await normalSubmit(useStore.getState().resolution_state ?? state)
          } else {
            onStillActive?.()
          }
          return
        }

        await finishAndLeave()
        return
      }

      if (forceSubmit) {
        await normalSubmit(state)
        return
      }

      onStillActive?.()
    } catch (err) {
      if (err instanceof ApiError && ApiError.errorCode(err) === 'RESOLUTION_ALREADY_SUBMITTED') {
        await finishAndLeave()
      } else {
        await downloadResolutionState()
        setOfflineSubmitted(true)
      }
    } finally {
      setIsNotInProgress()
    }
  }
}

const useResolutionManageSubmit = () => {
  const finalizeOnAction = useResolutionActionDrivenFinalize()
  return async () => finalizeOnAction({ forceSubmit: true })
}

const useResolutionHandlePageAction = () => {
  const finalizeOnAction = useResolutionActionDrivenFinalize()
  return async (fn: () => void) => finalizeOnAction({ onStillActive: fn, forceSubmit: false })
}

const useResolutionRetrySubmit = () => {
  const submit = useResolutionRequestSubmit()

  return async () => {
    await flushPendingResolutionEdits()

    const state = useStore.getState().resolution_state
    if (!state) throw new Error('No resolution state')
    await withConfirmationTimeout(submit(state))
  }
}

export {
  flushPendingResolutionEdits,
  useResolutionDownloadState,
  useResolutionElapsedTimeSeconds,
  useResolutionExit,
  useResolutionHandlePageAction,
  useResolutionManageSubmit,
  useResolutionPagination,
  useResolutionLogout,
  useResolutionRetrySubmit,
}
