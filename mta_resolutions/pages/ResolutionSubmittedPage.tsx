'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import {
  useResolutionDownloadState,
  useResolutionExit,
  useResolutionRetrySubmit,
} from '@/mta_resolutions/hooks'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body1, H3 } from '@/shared/components/Typography'
import OfflineIndicator from '@/shared/offline/OfflineIndicator'
import { useNetworkStatus } from '@/shared/offline/hooks'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type RetryStatus = 'pending' | 'retrying' | 'success' | 'error'

const ResolutionSubmittedPage = () => {
  const exit = useResolutionExit()
  const searchParams = useSearchParams()
  const isOffline = searchParams.get('offline') === 'true'
  const { downloadResolutionState } = useResolutionDownloadState()
  const retrySubmit = useResolutionRetrySubmit()
  const { isOnline } = useNetworkStatus()
  const [retryStatus, setRetryStatus] = useState<RetryStatus>('pending')
  const hasTriedRef = useRef(false)

  useEffect(() => {
    if (!isOffline) return
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
  }, [isOnline, isOffline])

  const renderOfflineContent = () => {
    if (retryStatus === 'retrying') {
      return (
        <>
          <H3>Enviando evaluación...</H3>
          <Body1>Se restableció la conexión. Enviando las respuestas al servidor.</Body1>
          <Spacer />
          <Spinner />
        </>
      )
    }

    if (retryStatus === 'success') {
      return (
        <>
          <H3>¡Felicitaciones!</H3>
          <Body1>Tu evaluación fue enviada con éxito. Gracias por tu participación.</Body1>
          <Spacer />
          <Button onClick={exit}>Salir</Button>
        </>
      )
    }

    if (retryStatus === 'error') {
      return (
        <>
          <H3>Evaluación finalizada</H3>
          <Body1>
            No se pudo enviar la evaluación. Por favor, descargá las respuestas y avisá al docente.
          </Body1>
          <Spacer />
          <Button onClick={downloadResolutionState}>Descargar respuestas</Button>
        </>
      )
    }

    // pending: waiting for connection
    return (
      <>
        <H3>Evaluación finalizada</H3>
        <Body1>
          Por favor llamá al docente. El dispositivo no tiene internet. Las respuestas se enviarán
          automáticamente cuando se restaure la conexión. Por favor, no cierres esta página.
        </Body1>
        <Spacer />
        <Button onClick={downloadResolutionState}>Descargar respuestas</Button>
      </>
    )
  }

  return (
    <Page>
      <OfflineIndicator />
      <Spacer />
      <Page.Title> </Page.Title>
      <Page.Content>
        {isOffline ? (
          renderOfflineContent()
        ) : (
          <>
            <H3>¡Felicitaciones!</H3>
            <Body1>Tu evaluación fue enviada con éxito. Gracias por tu participación.</Body1>
            <Spacer />
            <Button onClick={exit}>Salir</Button>
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default withAuth(ResolutionSubmittedPage, {
  allowedCapabilities: ['resolve_evaluations'],
  logoutDestination: 'resolutions',
})
