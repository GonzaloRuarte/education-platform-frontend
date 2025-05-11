'use client'

import {
  useHasPermissions,
  useIsAuthorized,
  useLogout,
  useNavigateToLogin,
  useUserProfilesResources,
} from '@/mta_auth/hooks'

import { useNavigateToDashboardHome } from '@/shared/hooks'
import { warningToast } from '@/shared/toasts'
import { ReactNode, useEffect, useState } from 'react'
import { T_LoginZone } from '../types'
import { T_AllowedUserProfiles } from '@/mta_users/types'
import { useDebouncedCallback } from 'use-debounce'

const RequireAuth = ({
  allowedUserProfiles,
  logoutDestination,
  children,
}: {
  allowedUserProfiles: T_AllowedUserProfiles
  logoutDestination: T_LoginZone
  children: ReactNode
}) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true)
  }, [])

  const navigateToLogin = useNavigateToLogin(logoutDestination)
  const navigateToHome = useNavigateToDashboardHome()
  const isAuthorized = useIsAuthorized()
  const { isStudent } = useUserProfilesResources()
  const logout = useLogout()

  const hasPermissions = useHasPermissions(allowedUserProfiles)
  const requireAuth = useDebouncedCallback(() => {
    if (!isAuthorized) {
      navigateToLogin()

      return
    }

    if (!hasPermissions) {
      warningToast('No tienes permisos suficientes para acceder a esta zona')
      if (isStudent) {
        logout()
      } else {
        navigateToHome()
      }
    }
  })
  useEffect(requireAuth, [isAuthorized])

  if (!isClient || !isAuthorized || !hasPermissions) return <></>
  return <>{children}</>
}

export default RequireAuth
