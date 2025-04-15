'use client'

import { T_LoginZone } from '../types'
import { useHasPermissions, useIsAuthorized, useNavigateToLogin } from '@/mta_auth/hooks'
import { T_AllowedAccessGroups } from '@/mta_auth/types'
import pages from '@/pages'
import { useNavigateToDashboardHome } from '@/shared/hooks'
import { warningToast } from '@/shared/toasts'
import { useEffect } from 'react'

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

  // const isAuthorized = useStore((state) => state.accessToken !== undefined)

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
