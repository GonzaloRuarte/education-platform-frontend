'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import ResolutionPaginator from '@/mta_resolutions/components/ResolutionPaginator'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import ResolutionReviewDisclaimer from '@/mta_resolutions/components/ResolutionReviewDisclaimer'
import { useResolutionDownloadState, useResolutionExit, useResolutionPagination, useResolutionRetrySubmit } from '@/mta_resolutions/hooks'
import { flushPendingResolutionEdits } from '@/mta_resolutions/flushPendingResolutionEdits'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import {
  useResolutionEvaluationToResolve,
  useResolutionFinalizeTimeout,
  useResolutionResetState,
  useResolutionResume,
  useResolutionRuntime,
  useResolutionState,
  useResolutionStoreMetadata,
} from '@/mta_resolutions/hooks/data'
import { submitNavigationGuard, useNavigateToResolutionSubmittedPage } from '@/mta_resolutions/hooks/navigation'
import ResolutionRemaingTimeManager from '@/mta_resolutions/services/ResolutionRemaingTimeManager'
import ResolutionResumingManager from '@/mta_resolutions/services/ResolutionResumingManager'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body1, H3 } from '@/shared/components/Typography'
import OfflineIndicator from '@/shared/offline/OfflineIndicator'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { useStore } from '@/shared/state'
import { HorizontalRule } from '@mui/icons-material'
import { Box } from '@mui/material'
import { StickyPinned } from '@/shared/components/StickyPinned'
import ApiError from '@/shared/data/errors'
import { warningToast } from '@/shared/toasts'
import { ReactNode, useEffect, useRef, useState } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const RETRY_INTERVAL_MS = 8000

const ResolutionStatusView = ({
  title,
  message,
  children,
}: {
  title: string
  message: string
  children?: ReactNode
}) => {
  return (
    <Page>
      <Page.Content>
        <Spacer />
        <H3>{title}</H3>
        <Body1>{message}</Body1>
        <Spacer />
        {children}
      </Page.Content>
    </Page>
  )
}

const OfflineSubmittedView = () => {
  const { downloadResolutionState } = useResolutionDownloadState()
  const retrySubmit = useResolutionRetrySubmit()
  const resetState = useResolutionResetState()
  const navigateToResolutionSubmittedPage = useNavigateToResolutionSubmittedPage()
  const exit = useResolutionExit()
  const [retryStatus, setRetryStatus] = useState<'waiting' | 'retrying'>('waiting')
  const inProgressRef = useRef(false)
  const doneRef = useRef(false)

  useEffect(() => {
    const attempt = () => {
      if (inProgressRef.current || doneRef.current) return
      inProgressRef.current = true
      setRetryStatus('retrying')

      retrySubmit()
        .then(async () => {
          doneRef.current = true
          await resetState()
          navigateToResolutionSubmittedPage()
        })
        .catch(() => {
          inProgressRef.current = false
          setRetryStatus('waiting')
        })
    }

    attempt()
    const id = setInterval(attempt, RETRY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [retrySubmit, resetState, navigateToResolutionSubmittedPage])

  const handleExit = () => {
    submitNavigationGuard.active = true
    if (window.confirm('Si salís ahora, este dispositivo dejará de reintentar el envío automático. ¿Querés salir igual?')) {
      exit()
    }
  }

  const handleDownload = async () => {
    await downloadResolutionState()
    if (window.confirm('Las respuestas se descargaron. ¿Querés salir ahora?')) {
      handleExit()
    }
  }

  if (retryStatus === 'retrying') {
    return (
      <ResolutionStatusView
        title="Enviando evaluación..."
        message="Se restableció la conexión. Enviando las respuestas al servidor."
      >
        <Spinner />
      </ResolutionStatusView>
    )
  }

  return (
    <ResolutionStatusView
      title="Evaluación finalizada"
      message="Por favor llamá al docente. El dispositivo no tiene internet. Las respuestas se enviarán automáticamente cuando se restaure la conexión. Por favor, no cierres esta página."
    >
      <Button onClick={() => void handleDownload()}>Descargar respuestas</Button>
      <Spacer />
      <Button variant="contained" color="secondary" onClick={handleExit}>
        Salir
      </Button>
    </ResolutionStatusView>
  )
}

const TimeoutPendingConfirmationView = ({ message, isOnline }: { message: string; isOnline: boolean }) => {
  const { downloadResolutionState } = useResolutionDownloadState()
  const exit = useResolutionExit()

  const handleExit = () => {
    submitNavigationGuard.active = true
    if (window.confirm('Si salís ahora, este dispositivo dejará de reintentar el envío automático. ¿Querés salir igual?')) {
      exit()
    }
  }

  const handleDownload = async () => {
    await downloadResolutionState()
    if (window.confirm('Las respuestas se descargaron. ¿Querés salir ahora?')) {
      handleExit()
    }
  }

  return (
    <ResolutionStatusView
      title="Estamos verificando la finalización de la evaluación"
      message={message}
    >
      {isOnline ? <Spinner /> : null}
      <Spacer />
      <Button onClick={() => void handleDownload()}>Descargar respuestas guardadas</Button>
      <Spacer />
      <Button variant="contained" color="secondary" onClick={handleExit}>
        Salir
      </Button>
    </ResolutionStatusView>
  )
}

const ExpiredResolutionView = ({ message }: { message: string }) => {
  const { downloadResolutionState } = useResolutionDownloadState()
  const exit = useResolutionExit()
  const resolutionState = useResolutionState()

  const handleExit = () => {
    submitNavigationGuard.active = true
    if (window.confirm('Si salís ahora, este dispositivo dejará de reintentar el envío automático. ¿Querés salir igual?')) {
      exit()
    }
  }

  const handleDownload = async () => {
    await downloadResolutionState()
    if (window.confirm('Las respuestas se descargaron. ¿Querés salir ahora?')) {
      handleExit()
    }
  }

  return (
    <ResolutionStatusView title="El tiempo de la evaluación terminó" message={message}>
      {resolutionState ? (
        <>
          <Button onClick={() => void handleDownload()}>Descargar respuestas guardadas</Button>
          <Spacer />
        </>
      ) : null}
      <Button variant="contained" color="secondary" onClick={handleExit}>
        Salir
      </Button>
    </ResolutionStatusView>
  )
}

const ResumeErrorView = ({ message }: { message: string }) => {
  const { resume } = useResolutionResume()
  const { downloadResolutionState } = useResolutionDownloadState()
  const exit = useResolutionExit()

  const handleRetry = () => {
    void resume({ reason: 'manual_retry', preserveCurrentPage: true, setGlobalInProgress: true })
  }

  const handleExit = () => {
    submitNavigationGuard.active = true
    if (window.confirm('Si salís ahora, este dispositivo dejará de reintentar el envío automático. ¿Querés salir igual?')) {
      exit()
    }
  }

  return (
    <ResolutionStatusView title="No se pudo reanudar la evaluación" message={message}>
      <Button onClick={handleRetry}>Reintentar</Button>
      <Spacer />
      <Button onClick={downloadResolutionState}>Descargar respuestas guardadas</Button>
      <Spacer />
      <Button variant="contained" color="secondary" onClick={handleExit}>
        Salir
      </Button>
    </ResolutionStatusView>
  )
}

const ResolveEvaluationPage = () => {
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const { currentPage } = useResolutionPagination()
  const isOfflineSubmitted = useStore((state) => state.resolution_offlineSubmitted)
  const { runtimeStatus, runtimeMessage, storeRuntime } = useResolutionRuntime()
  const finalizeTimeout = useResolutionFinalizeTimeout()
  const storeMetadata = useResolutionStoreMetadata()
  const resetState = useResolutionResetState()
  const navigateToResolutionSubmittedPage = useNavigateToResolutionSubmittedPage()
  const { isOnline } = useNetworkStatus()

  const { timeLeft } = useResolutionDurationResources()

  const didWarnOfflineTimeoutRef = useRef(false)
  const isVerifyingTimeoutRef = useRef(false)
  const nextTimeoutRetryAtRef = useRef(0)

  useEffect(() => {
    if (timeLeft == null || timeLeft > 0) {
      didWarnOfflineTimeoutRef.current = false
      nextTimeoutRetryAtRef.current = 0
      if (runtimeStatus === 'timeout_pending_confirmation') {
        storeRuntime({ status: 'active', message: null })
      }
      return
    }

    if (
      runtimeStatus !== 'active' &&
      runtimeStatus !== 'offline_recovery' &&
      runtimeStatus !== 'timeout_pending_confirmation'
    ) {
      return
    }

    if (isVerifyingTimeoutRef.current) return
    if (Date.now() < nextTimeoutRetryAtRef.current) return

    if (!isOnline) {
      nextTimeoutRetryAtRef.current = Date.now() + RETRY_INTERVAL_MS
      if (!didWarnOfflineTimeoutRef.current) {
        didWarnOfflineTimeoutRef.current = true
        warningToast(
          'Se alcanzó el tiempo límite y la evaluación quedó pausada mientras esperamos conexión para confirmar y enviar las respuestas.',
        )
      }
      storeRuntime({
        status: 'timeout_pending_confirmation',
        message:
          'Se alcanzó el tiempo límite. La evaluación quedó pausada en este dispositivo y vamos a reintentar la verificación automáticamente cuando vuelva la conexión. No cierres esta página.',
      })
      return
    }

    void (async () => {
      isVerifyingTimeoutRef.current = true

      try {
        await flushPendingResolutionEdits()

        const resolutionState = useStore.getState().resolution_state
        if (!resolutionState) return

        storeRuntime({ status: 'verifying_timeout', message: null })

        const timeoutResult = await finalizeTimeout(resolutionState)

        if (timeoutResult.result === 'ACTIVE') {
          storeMetadata({
            resolution_startedAt: timeoutResult.resolution.started_at,
            resolution_submitByTime: timeoutResult.resolution.submit_by_time,
            resolution_serverNowAtSync: timeoutResult.resolution.server_now,
            resolution_maxDurationMinutes: timeoutResult.resolution.max_duration_minutes,
            resolution_pin: useStore.getState().resolution_pin,
          })
          storeRuntime({ status: 'active', message: null })
          didWarnOfflineTimeoutRef.current = false
          nextTimeoutRetryAtRef.current = 0
          return
        }

        await resetState()
        navigateToResolutionSubmittedPage()
      } catch (submitErr) {
        nextTimeoutRetryAtRef.current = Date.now() + RETRY_INTERVAL_MS

        if (submitErr instanceof ApiError && ApiError.errorCode(submitErr) === 'RESOLUTION_ALREADY_SUBMITTED') {
          await resetState()
          navigateToResolutionSubmittedPage()
          return
        }

        storeRuntime({
          status: 'timeout_pending_confirmation',
          message:
            submitErr instanceof ApiError && submitErr.status === -1
              ? 'Se alcanzó el tiempo límite. No pudimos confirmar con el servidor por un problema de conexión. La evaluación permanece pausada y vamos a reintentar automáticamente. Podés descargar las respuestas por seguridad.'
              : 'Se alcanzó el tiempo límite. No pudimos confirmar con el servidor el estado final de la evaluación. La evaluación permanece pausada y vamos a reintentar automáticamente.',
        })
      } finally {
        isVerifyingTimeoutRef.current = false
      }
    })()
  }, [
    timeLeft,
    runtimeStatus,
    isOnline,
    finalizeTimeout,
    storeMetadata,
    storeRuntime,
    resetState,
    navigateToResolutionSubmittedPage,
  ])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submitNavigationGuard.active) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  let content: ReactNode

  if (isOfflineSubmitted) {
    content = <OfflineSubmittedView />
  } else if (runtimeStatus === 'verifying_timeout' || runtimeStatus === 'resuming') {
    content = (
      <ResolutionStatusView
        title={runtimeStatus === 'verifying_timeout' ? 'Verificando tiempo disponible...' : 'Recuperando evaluación...'}
        message={
          runtimeStatus === 'verifying_timeout'
            ? 'El servidor está confirmando si la resolución sigue activa.'
            : 'Estamos recuperando tu evaluación y las respuestas guardadas.'
        }
      >
        <Spinner />
      </ResolutionStatusView>
    )
  } else if (runtimeStatus === 'timeout_pending_confirmation') {
    content = (
      <TimeoutPendingConfirmationView
        isOnline={isOnline}
        message={
          runtimeMessage ??
          'Se alcanzó el tiempo límite. La evaluación quedó pausada mientras el servidor confirma el estado final.'
        }
      />
    )
  } else if (runtimeStatus === 'expired') {
    content = (
      <ExpiredResolutionView
        message={runtimeMessage ?? 'La resolución ya fue enviada o el tiempo disponible para resolver expiró.'}
      />
    )
  } else if (runtimeStatus === 'resume_error') {
    content = (
      <ResumeErrorView message={runtimeMessage ?? 'No pudimos validar el estado actual de la evaluación.'} />
    )
  } else {
    content = (
      <Page>
        <Page.Content>
          {evaluationToResolve === null ? (
            <Spinner />
          ) : (
            <>
              <Box position="relative">
                <Box width="100%">
                  {currentPage === 1 ? (
                    <div className="quill">
                      <div className="ql-editor">
                        <ResolutionHeader evaluationToResolve={evaluationToResolve} />
                      </div>
                    </div>
                  ) : (
                    <Spacer size="l" />
                  )}
                  <ResolutionPaginator />
                  <Spacer size="s" />
                  <StickyPinned text={evaluationToResolve.pages[currentPage - 1].pinned_text} />
                  <Spacer size="xl" />

                  <div className="quill">
                    <div className="ql-editor">
                      <ResolutionQuestions evaluationToResolve={evaluationToResolve} currentPage={currentPage} />
                    </div>
                  </div>

                  <Spacer size="s" />
                  <ResolutionReviewDisclaimer />
                  <Spacer size="s" />
                  <HorizontalRule />
                  <Spacer size="s" />
                  <ResolutionPaginator />
                  <Spacer size="xl" />
                </Box>
              </Box>
            </>
          )}
        </Page.Content>
      </Page>
    )
  }

  return (
    <>
      <OfflineIndicator />
      <ResolutionResumingManager />
      <ResolutionRemaingTimeManager />
      {content}
    </>
  )
}

export default withAuth(ResolveEvaluationPage, {
  allowedCapabilities: ['resolve_evaluations'],
  logoutDestination: 'resolutions',
})
