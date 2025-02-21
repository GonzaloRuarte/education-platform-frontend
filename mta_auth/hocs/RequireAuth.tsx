'use client'

import {
  useHasPermissions,
  useIsAuthorized,
  useNavigateToLogin,
} from '@/mta_auth/hooks'
import { T_AllowedAccessGroups } from '@/mta_auth/types'
import { useNavigateToHome } from '@/shared/hooks'
import { warningToast } from '@/shared/toasts'
import debounce from 'debounce'
import { useEffect } from 'react'

const RequireAuth = ({
  allowedAccessGroups,
}: {
  allowedAccessGroups: T_AllowedAccessGroups
}) => {
  const { navigateToLogin } = useNavigateToLogin()
  const { navigateToHome } = useNavigateToHome()
  const isAuthorized = useIsAuthorized()

  const hasPermissions = useHasPermissions(allowedAccessGroups)

  const requireAuth = debounce(() => {
    if (!isAuthorized) {
      warningToast('Debes iniciar sesión para acceder.')
      navigateToLogin()
      return
    }

    if (!hasPermissions) {
      warningToast('No tienes permisos suficientes ')
      navigateToHome()
      return
    }
  })

  useEffect(requireAuth, [isAuthorized])
  return <></>
}

export default RequireAuth
