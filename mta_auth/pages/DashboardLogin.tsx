import DashboardLoginForm from '@/mta_auth/components/DashboardLoginForm'
import { avoidAuthorized } from '@/mta_auth/hocs/avoidAuthoirzed'
import Logo from '@/shared/components/Logo'
import Spacer from '@/shared/components/Spacer'
import { H3 } from '@/shared/components/Typography'
import { ImageSize } from '@/shared/utils'
import Box from '@mui/material/Box'

const logoSize = new ImageSize(262, 74, { scale: 0.5 })

const DashboardLogin = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Box width="30vw">
        {/* <Paper style={{ padding: 30 }}> */}
        <Logo variant="color" width={logoSize.w} height={logoSize.h} />
        <Spacer />
        <H3>Ingreso exclusivo para Administradores, Directivos e Itemistas</H3>
        <Spacer />
        <DashboardLoginForm />
        {/* </Paper> */}
      </Box>
    </Box>
  )
}

export default avoidAuthorized(DashboardLogin)
