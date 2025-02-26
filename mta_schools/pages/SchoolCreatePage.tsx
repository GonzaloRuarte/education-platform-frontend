import SchoolCreateForm from '@/mta_schools/components/SchoolCreateForm'
import Page from '@/shared/components/Page'

const SchoolCreatePage = () => {
  return (
    <Page>
      <Page.Title>Agregar Escuela</Page.Title>
      <Page.Content>
        <SchoolCreateForm />
      </Page.Content>
    </Page>
  )
}

export default SchoolCreatePage
