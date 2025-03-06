import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import ClearIcon from '@mui/icons-material/Clear'
import React from 'react'

interface I_Props {
  onCancel?: () => void
  CreationForm: React.ComponentType
  entityName: string
}

const CreationPage = (p: I_Props) => {
  return (
    <Page>
      <Page.Title>Agregar {p.entityName}</Page.Title>
      <Page.Toolbar>
        <Button onClick={p.onCancel} startIcon={<ClearIcon />}>
          Cancelar
        </Button>
      </Page.Toolbar>
      <Page.Content>
        <p.CreationForm />
      </Page.Content>
    </Page>
  )
}

export default CreationPage
