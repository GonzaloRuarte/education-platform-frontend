import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import React from 'react'

const GUIShowcase = () => {
  return <Page>
    <Page.Title>GUI Showcase</Page.Title>
    <Page.Content>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h1">Heading 1</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="h2">Heading 2</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="h3">Heading 3</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="h4">Heading 4</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="h5">Heading 5</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="h6">Heading 6</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="body1">Body 1</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="body2">Body 2</Typography>
        </Grid>
        <Grid size={12}>
          <Typography variant="caption">Caption</Typography>
        </Grid>
        <Grid size={12}>
          <Button variant="contained" color="primary">Primary Button</Button>
        </Grid>
        <Grid size={12}>
          <Button variant="contained" color="secondary">Secondary Button</Button>
        </Grid>
      </Grid>
    </Page.Content>
  </Page>
}

export default GUIShowcase