'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useResolutionExit } from '@/mta_resolutions/hooks'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import OfflineIndicator from '@/shared/offline/OfflineIndicator'
import { useSearchParams } from 'next/navigation'

const ResolutionSubmittedPage = () => {
  const exit = useResolutionExit()
  const searchParams = useSearchParams()
  const isOffline = searchParams.get('offline') === 'true'

  return (
    <Page>
      <OfflineIndicator />
      <Spacer />
      <Page.Title> </Page.Title>
      <Page.Content>
        {isOffline ? (
          <>
            <H3>Evaluación finalizada</H3>
            <Body1>
              El dispositivo no tiene conexión a internet. La evaluación terminó pero las respuestas
              no pudieron ser enviadas. Por favor, llamá al docente para que asista con este
              dispositivo.
            </Body1>
          </>
        ) : (
          <>
            <H3>¡Felicitaciones!</H3>
            <Body1>Tu evaluación fue enviada con éxito. Gracias por tu participación.</Body1>
          </>
        )}
        <Spacer />
        <Button onClick={exit}>Salir</Button>
      </Page.Content>
    </Page>
  )
}

export default withAuth(ResolutionSubmittedPage, {
  allowedUserProfiles: ['admin', 'student'],
  logoutDestination: 'resolutions',
})
