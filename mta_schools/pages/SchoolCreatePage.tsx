'use client'

import SchoolCreateForm from '@/mta_schools/components/SchoolCreateForm'
import { useNavigateToSchoolList } from '@/mta_schools/hooks'
import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import ClearIcon from '@mui/icons-material/Clear'

const SchoolCreatePage = () => {
  const n = useNavigateToSchoolList()
  return (
    <Page>
      <Page.Title>Agregar Escuela</Page.Title>
      <Page.Toolbar>
        <Button onClick={n} startIcon={<ClearIcon />}>
          Cancelar
        </Button>
      </Page.Toolbar>
      <Page.Content>
        <SchoolCreateForm />
      </Page.Content>
    </Page>
  )
}

export default SchoolCreatePage
