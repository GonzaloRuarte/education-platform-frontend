'use client'

import { useLogout } from '@/mta_auth/hooks'
import Button from '@mui/material/Button'


const LogoutButton = () => {
  const logout = useLogout()
  return <Button onClick={logout} color="inherit">Cerrar sesión</Button>
}

export default LogoutButton

