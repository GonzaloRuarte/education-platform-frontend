'use client'

import LogoAustral from '@/shared/components/LogoAustral'
import { useTheme } from '@/shared/hooks'
import { ImageSize } from '@/shared/utils'

import TeachersPinMenu from '@/mta_resolutions/components/TeachersPinMenu'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid2'

const australLogoSize = new ImageSize(412, 72, { scale: 0.5 })
const Footer = ({ includePin = true }) => {
  const t = useTheme()
  return (
    <footer style={{ background: t.palette.primary.main, padding: 20 }}>
      <Container>
        <Grid container alignItems={'center'} justifyContent={'space-between'}>
          <Grid size={8}>
            <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
          </Grid>
          <Grid size={4} display={'flex'} justifyContent={'flex-end'}>
            {includePin && <TeachersPinMenu />}
          </Grid>
        </Grid>
      </Container>
    </footer>
  )
}
export default Footer
