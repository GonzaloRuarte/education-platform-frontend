'use client'

import { useIsAuthorized } from '@/mta_auth/hooks'
import { useNavigateToDashboardHome } from '@/shared/hooks'
import { useEffect } from 'react'

const AvoidAuthorized = () => {
  const navigateToDashboardHome = useNavigateToDashboardHome()
  const isAuthorized = useIsAuthorized()

  const avoidAuthoruzed = () => {
    if (isAuthorized) {
      navigateToDashboardHome()
      return
    }
  }

  useEffect(avoidAuthoruzed, [isAuthorized])
  return <></>
}

export default AvoidAuthorized
