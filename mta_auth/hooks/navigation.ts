'use client'

import { T_LoginZone } from '@/mta_auth/types'
import pages from '@/pages'
import { useRouter } from 'next/navigation'

export const useNavigateToLogin = (loginZone: T_LoginZone = 'dashboard') => {
  const loginPath: Record<T_LoginZone, string> = {
    dashboard: pages.D._.login.path,
    resolutions: pages.R._.login.path,
  }
  const router = useRouter()
  return () => {
    return () => {
      router.push(loginPath[loginZone])
    }
  }
}
