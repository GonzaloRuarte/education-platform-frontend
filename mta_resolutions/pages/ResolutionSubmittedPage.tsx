import { withAuth } from '@/mta_auth/hocs/withAuth'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'

const ResolutionSubmittedPage = () => {
  return (
    <Page>
      <Spacer />
      <Page.Title>Evaluación enviada correctamente</Page.Title>
      <Page.Content>
        <H3>¡Felicitaciones!</H3>
        <Body1>Tu evaluación fue enviada con éxito.</Body1>
      </Page.Content>
    </Page>
  )
}

export default withAuth(ResolutionSubmittedPage, {
  allowedAccessGroups: ['admin', 'student'],
  logoutDestination: 'resolutions',
})
