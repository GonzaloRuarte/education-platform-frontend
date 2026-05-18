'use client'

import { useTheme } from '@/shared/hooks'

import TeachersPinMenu from '@/mta_resolutions/components/TeachersPinMenu'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'

const Footer = ({ includePin = true }) => {
  const t = useTheme()
  return (
    <footer style={{ background: t.palette.primary.main, padding: 20 }}>
      <Container>
        <Grid container alignItems={'center'} justifyContent={'flex-end'}>
          <Grid size={4} display={'flex'} justifyContent={'flex-end'}>
            {includePin && <TeachersPinMenu />}
          </Grid>
        </Grid>
      </Container>
    </footer>
  )
}
export default Footer
