'use client'

import { useHasCapabilities, useIsAuthorized } from '@/mta_auth/hooks'
import { useNavigateToDashboardHome } from '@/shared/hooks'
import { useEffect } from 'react'

const AvoidAuthorized = () => {
  const navigateToDashboardHome = useNavigateToDashboardHome()
  const isAuthorized = useIsAuthorized()
  const canAccessDashboard = useHasCapabilities(['access_dashboard'])

  const avoidAuthoruzed = () => {
    if (isAuthorized && canAccessDashboard) {
      navigateToDashboardHome()
      return
    }
  }

  useEffect(avoidAuthoruzed, [isAuthorized, canAccessDashboard])
  return <></>
}

export default AvoidAuthorized
