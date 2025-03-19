import StudentsLoginForm from '@/mta_auth/components/StudentsLoginForm'
import Spacer from '@/shared/components/Spacer'
import { H1, H3 } from '@/shared/components/Typography'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

const StudentsLogin = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box width="30vw">
        <Paper style={{ padding: 30 }}>
          <H1>¡Hola!</H1>
          <Spacer />
          <H3>Para comenzar tu evaluación ingresá con tu número de DNI.</H3>
          <Spacer />
          <StudentsLoginForm />
        </Paper>
      </Box>
    </Box>
  )
}

export default StudentsLogin
