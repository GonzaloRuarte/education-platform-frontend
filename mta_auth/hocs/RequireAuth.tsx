'use client'

import { useHasPermissions, useIsAuthorized, useNavigateToLogin } from '@/mta_auth/hooks'

import { useNavigateToDashboardHome } from '@/shared/hooks'
import { warningToast } from '@/shared/toasts'
import { useEffect } from 'react'
import { T_LoginZone } from '../types'
import { T_AllowedUserProfiles } from '@/mta_users/types'

const RequireAuth = ({
  allowedUserProfiles,
  logoutDestination,
}: {
  allowedUserProfiles: T_AllowedUserProfiles
  logoutDestination: T_LoginZone
}) => {
  const navigateToLogin = useNavigateToLogin(logoutDestination)
  const navigateToHome = useNavigateToDashboardHome()
  const isAuthorized = useIsAuthorized()

  const hasPermissions = useHasPermissions(allowedUserProfiles)

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
