'use client'

import { useIsAuthorized } from '@/mta_auth/hooks'
import { useNavigateToDashboardHome } from '@/shared/hooks'
import { useEffect } from 'react'

const AvoidAuth = () => {
  const navigateToDashboardHome = useNavigateToDashboardHome()
  const isAuthorized = useIsAuthorized()

  const avoidAuth = () => {
    if (isAuthorized) {
      navigateToDashboardHome()
      return
    }
  }

  useEffect(avoidAuth, [isAuthorized])
  return <></>
}

export default AvoidAuth
