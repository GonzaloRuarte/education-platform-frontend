import { withAuth } from '@/mta_auth/hocs/withAuth'
import Button from '@/shared/components/Button'
import DevButton from '@/shared/components/DevButton'
import Page from '@/shared/components/Page'
import { Grid2 } from '@mui/material'
import React from 'react'

const DevDashboard = () => {
  return (
    <Page>
      <Page.Title>Dashboard de Desarrollo</Page.Title>
      <Page.Content>
        <Grid2 container spacing={4}>
          <Grid2 size={2}>
            <DevButton size="large" title="python manage.py school_fakerize">
              Crear escuela
            </DevButton>
          </Grid2>
          <Grid2 size={2}>
            <DevButton size="large" title="python manage.py school_fakerize complete">
              Crear escuela (con contenido)
            </DevButton>
          </Grid2>
          <Grid2 size={2}>
            <DevButton size="large" title="python manage.py evaluations_fakerize complete">
              Crear Evaluación
            </DevButton>
          </Grid2>
        </Grid2>
      </Page.Content>
    </Page>
  )
}

export default withAuth(DevDashboard, { logoutDestination: 'dashboard', allowedUserProfiles: ['superuser'] })
