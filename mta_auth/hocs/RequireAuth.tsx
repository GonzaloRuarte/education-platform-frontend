'use client'

import { useHasPermissions, useIsAuthorized, useNavigateToLogin } from '@/mta_auth/hooks'
import { T_AllowedAccessGroups } from '@/mta_auth/types'
import { useNavigateToDashboardHome } from '@/shared/hooks'
import { warningToast } from '@/shared/toasts'
import { useEffect } from 'react'
import { T_LoginZone } from '../types'

const RequireAuth = ({
  allowedAccessGroups,
  logoutDestination,
}: {
  allowedAccessGroups: T_AllowedAccessGroups
  logoutDestination: T_LoginZone
}) => {
  const navigateToLogin = useNavigateToLogin(logoutDestination)
  const navigateToHome = useNavigateToDashboardHome()
  const isAuthorized = useIsAuthorized()

  const hasPermissions = useHasPermissions(allowedAccessGroups)

  const requireAuth = () => {
    if (!isAuthorized) {
      navigateToLogin()

      return
    }

    if (!hasPermissions) {
      warningToast('No tienes permisos suficientes ')
      navigateToHome()
      return
    }
  }

  useEffect(requireAuth, [isAuthorized])
  return <></>
}

export default RequireAuth
