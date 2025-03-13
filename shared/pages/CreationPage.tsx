import Button from '@/shared/components/Button'
import Page from '@/shared/components/Page'
import { T_VoidFn } from '@/shared/types'
import { EntityName } from '@/shared/utils'
import ClearIcon from '@mui/icons-material/Clear'
import React from 'react'

interface I_Props {
  onCancel?: T_VoidFn
  CreationForm: React.ComponentType
  entityName: EntityName
}

const CreationPage = (p: I_Props) => {
  return (
    <Page>
      <Page.Title>Agregar {p.entityName.singular}</Page.Title>
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
