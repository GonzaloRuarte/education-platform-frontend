'use client'

import { useLogout } from '@/mta_auth/hooks'
import Button from '@/shared/components/Button'

const LogoutButton = () => {
  const logout = useLogout()
  return (
    <Button onClick={logout} variant="text">
      Cerrar sesión
    </Button>
  )
}

export default LogoutButton
