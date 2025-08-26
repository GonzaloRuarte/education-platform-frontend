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
import { ReactNode, useEffect, useRef, useState } from 'react'
import { T_LoginZone } from '../types'
import { T_AllowedUserProfiles } from '@/mta_users/types'
import { useDebouncedCallback } from 'use-debounce'

// 👇 your store-provided reset hook
import { useResolutionResetState } from '@/mta_resolutions/hooks/data'

type Props = {
  allowedUserProfiles: T_AllowedUserProfiles
  logoutDestination: T_LoginZone
  children: ReactNode
}

const RequireAuth = ({ allowedUserProfiles, logoutDestination, children }: Props) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  const navigateToLogin = useNavigateToLogin(logoutDestination)
  const navigateToHome = useNavigateToDashboardHome()

  const isAuthorized = useIsAuthorized()
  const hasPermissions = useHasPermissions(allowedUserProfiles)
  const { isStudent } = useUserProfilesResources()
  const logout = useLogout()

  // ✅ resolution store resetter (provided by your store file)
  const resetResolution = useResolutionResetState()

  // Avoid double kicks in Strict Mode / rapid state flips
  const didKickRef = useRef(false)

  // One place to clean state, then go where we need to go
  const cleanupAndKick = useDebouncedCallback(
    (where: 'login' | 'home' | 'logout') => {
      if (didKickRef.current) return
      didKickRef.current = true

      // 1) Clear session/persisted resolution state BEFORE navigating
      try {
        resetResolution?.()
      } catch {
        // noop: defensive
      }

      // 2) Now redirect / logout
      if (where === 'logout') {
        logout() // if this navigates, perfect; if not, ensure it does
        return
      }
      if (where === 'home') {
        navigateToHome()
        return
      }
      // default: to the login zone
      navigateToLogin()
    },
    // A tiny debounce smooths over brief "auth not ready yet" frames
    150
  )

  useEffect(() => {
    if (!isClient) return

    // Not authorized → go to login (after cleanup)
    if (!isAuthorized) {
      cleanupAndKick('login')
      return
    }

    // Authorized but lacks permissions
    if (!hasPermissions) {
      warningToast('No tienes permisos suficientes para acceder a esta zona')
      if (isStudent) {
        cleanupAndKick('logout')
      } else {
        cleanupAndKick('home')
      }
      return
    }

    // If we reach here: authorized and allowed
    didKickRef.current = false
  }, [isClient, isAuthorized, hasPermissions, isStudent, cleanupAndKick])

  // While hydrating or when about to redirect, render nothing
  if (!isClient || !isAuthorized || !hasPermissions) return <></>

  return <>{children}</>
}

export default RequireAuth
