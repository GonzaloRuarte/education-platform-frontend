'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import ResolutionHeader from '@/mta_resolutions/components/ResolutionHeader'
import ResolutionPaginator from '@/mta_resolutions/components/ResolutionPaginator'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import ResolutionReviewDisclaimer from '@/mta_resolutions/components/ResolutionReviewDisclaimer'
import {
  useResolutionDownloadState,
  useResolutionExit,
  useResolutionLogout,
  useResolutionPagination,
  useResolutionRetrySubmit,
} from '@/mta_resolutions/hooks'
import { useResolutionDurationResources } from '@/mta_resolutions/hooks/duration'
import { useResolutionEvaluationToResolve } from '@/mta_resolutions/hooks/data'
import { submitNavigationGuard } from '@/mta_resolutions/hooks/navigation'
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
import { warningToast } from '@/shared/toasts'
import { useEffect, useRef, useState } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const OfflineSubmittedView = () => {
  const { downloadResolutionState } = useResolutionDownloadState()
  const retrySubmit = useResolutionRetrySubmit()
  const exit = useResolutionExit()
  const { isOnline } = useNetworkStatus()
  const [retryStatus, setRetryStatus] = useState<'pending' | 'retrying' | 'success' | 'error'>('pending')
  const hasTriedRef = useRef(false)

  useEffect(() => {
    if (!isOnline) return
    if (hasTriedRef.current) return

    hasTriedRef.current = true
    setRetryStatus('retrying')

    retrySubmit()
      .then(() => setRetryStatus('success'))
      .catch(() => {
        hasTriedRef.current = false
        setRetryStatus('error')
      })
  }, [isOnline])

  const handleExit = () => {
    submitNavigationGuard.active = true
    exit()
  }

  if (retryStatus === 'retrying') {
    return (
      <Page>
        <Page.Content>
          <H3>Enviando evaluación...</H3>
          <Body1>Se restableció la conexión. Enviando las respuestas al servidor.</Body1>
          <Spacer />
          <Spinner />
        </Page.Content>
      </Page>
    )
  }

  if (retryStatus === 'success') {
    return (
      <Page>
        <Page.Content>
          <H3>¡Felicitaciones!</H3>
          <Body1>Tu evaluación fue enviada con éxito. Gracias por tu participación.</Body1>
          <Spacer />
          <Button onClick={handleExit}>Salir</Button>
        </Page.Content>
      </Page>
    )
  }

  if (retryStatus === 'error') {
    return (
      <Page>
        <Page.Content>
          <H3>Evaluación finalizada</H3>
          <Body1>
            No se pudo enviar la evaluación. Por favor, descargá las respuestas y avisá al docente.
          </Body1>
          <Spacer />
          <Button onClick={downloadResolutionState}>Descargar respuestas</Button>
        </Page.Content>
      </Page>
    )
  }

  return (
    <Page>
      <Page.Content>
        <OfflineIndicator />
        <Spacer />
        <H3>Evaluación finalizada</H3>
        <Body1>
          Por favor llamá al docente. El dispositivo no tiene internet. Las respuestas se enviarán
          automáticamente cuando se restaure la conexión. Por favor, no cierres esta página.
        </Body1>
        <Spacer />
        <Button onClick={downloadResolutionState}>Descargar respuestas</Button>
      </Page.Content>
    </Page>
  )
}

const ResolveEvaluationPage = () => {
  const evaluationToResolve = useResolutionEvaluationToResolve()
  const { currentPage } = useResolutionPagination()
  const isOfflineSubmitted = useStore((state) => state.resolution_offlineSubmitted)

  const { timeLeft } = useResolutionDurationResources()
  const resolutionLogout = useResolutionLogout()

  const didKickRef = useRef(false)

  useEffect(() => {
    if (didKickRef.current) return
    if (timeLeft == null) return
    if (timeLeft <= 0) {
      didKickRef.current = true
      warningToast('Se terminó el tiempo de la evaluación.')
      resolutionLogout()
    }
  }, [timeLeft, resolutionLogout])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submitNavigationGuard.active) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  if (isOfflineSubmitted) return <OfflineSubmittedView />

  return (
    <>
      <OfflineIndicator />
      <ResolutionResumingManager />

      <ResolutionRemaingTimeManager />

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
                      <ResolutionQuestions {...{ evaluationToResolve, currentPage }} />
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
    </>
  )
}

export default withAuth(ResolveEvaluationPage, {
  allowedUserProfiles: ['admin', 'student'],
  logoutDestination: 'resolutions',
})
