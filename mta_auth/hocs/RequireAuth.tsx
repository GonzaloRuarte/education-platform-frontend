'use client'

import {
  useHasCapabilities,
  useIsAuthorized,
  useLogout,
  useNavigateToLogin,
  useUserProfilesResources,
} from '@/mta_auth/hooks'
import { T_UserCapability, T_LoginZone } from '@/mta_auth/types'

import { useNavigateToDashboardHome } from '@/shared/hooks'
import { warningToast } from '@/shared/toasts'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { useResolutionResetState } from '@/mta_resolutions/hooks/data'

type Props = {
  allowedCapabilities?: Array<T_UserCapability>
  logoutDestination: T_LoginZone
  children: ReactNode
}

const RequireAuth = ({ allowedCapabilities, logoutDestination, children }: Props) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  const navigateToLogin = useNavigateToLogin(logoutDestination)
  const navigateToHome = useNavigateToDashboardHome()

  const isAuthorized = useIsAuthorized()
  const hasCapabilities = useHasCapabilities(allowedCapabilities)
  const { isStudent } = useUserProfilesResources()
  const logout = useLogout()

  const resetResolution = useResolutionResetState()
  const didKickRef = useRef(false)

  const cleanupAndKick = useDebouncedCallback(
    (where: 'login' | 'home' | 'logout') => {
      if (didKickRef.current) return
      didKickRef.current = true

      try {
        resetResolution?.()
      } catch {
      }

      if (where === 'logout') {
        logout()
        return
      }
      if (where === 'home') {
        navigateToHome()
        return
      }
      navigateToLogin()
    },
    150,
  )

  useEffect(() => {
    if (!isClient) return

    if (!isAuthorized) {
      cleanupAndKick('login')
      return
    }

    if (!hasCapabilities) {
      warningToast('No tienes permisos suficientes para acceder a esta zona')
      if (isStudent) {
        cleanupAndKick('logout')
      } else {
        cleanupAndKick('home')
      }
      return
    }

    didKickRef.current = false
  }, [isClient, isAuthorized, hasCapabilities, isStudent, cleanupAndKick])

  if (!isClient || !isAuthorized || !hasCapabilities) return <></>

  return <>{children}</>
}

export default RequireAuth
