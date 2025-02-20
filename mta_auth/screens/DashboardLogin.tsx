import LoginForm from '@/mta_auth/components/LoginForm'
import Spacer from '@/shared/components/Spacer'
import { H1, H3 } from '@/shared/components/Typography'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'


const DashboardLogin = () => {
  return <Box display='flex' justifyContent='center' alignItems='center' height='100vh'>
    <Box width='30vw'>
      <Paper style={{ padding: 30 }}>
        <H1>Meta</H1>
        <Spacer />
        <H3>Ingreso exclusivo para Administradores, Directivos y Evaluadores</H3>
        <Spacer />
        <LoginForm />
      </Paper>

    </Box>
  </Box>
}

export default DashboardLogin