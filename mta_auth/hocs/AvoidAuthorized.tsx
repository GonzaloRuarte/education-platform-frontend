'use client'

import { useHasCapabilities, useIsAuthorized } from '@/mta_auth/hooks'
import { useNavigateToDashboardHome } from '@/shared/hooks'
import { ComponentProps, FC, useEffect } from 'react'

export const avoidAuthorized = (WrappedComponent: FC) => {
  const AvoidAuthorizedHOC = (props: ComponentProps<typeof WrappedComponent>) => {
    const navigateToDashboardHome = useNavigateToDashboardHome()
    const isAuthorized = useIsAuthorized()
    const canAccessDashboard = useHasCapabilities(['access_dashboard'])

    useEffect(() => {
      if (isAuthorized && canAccessDashboard) {
        navigateToDashboardHome()
      }
    }, [isAuthorized, canAccessDashboard, navigateToDashboardHome])

    return <WrappedComponent {...props} />
  }

  return AvoidAuthorizedHOC
}
