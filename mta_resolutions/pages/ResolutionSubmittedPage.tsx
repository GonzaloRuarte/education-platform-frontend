'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useResolutionExit } from '@/mta_resolutions/hooks'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'

const ResolutionSubmittedPage = () => {
  const exit = useResolutionExit()
  return (
    <Page>
      <Spacer />
      <Page.Title>Evaluación enviada correctamente</Page.Title>
      <Page.Content>
        <H3>¡Felicitaciones!</H3>
        <Body1>Tu evaluación fue enviada con éxito.</Body1>
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
