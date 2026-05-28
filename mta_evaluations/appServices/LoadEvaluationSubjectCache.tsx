'use client'

import { useIsAuthorized } from '@/mta_auth/hooks'
import { useLoadAndStoreEvaluationSubjects } from '@/mta_evaluations/hooks'
import { T_ApplicationService } from '@/shared/appServices/types'

import { useEffect } from 'react'

const LoadEvaluationSubjectCache: T_ApplicationService = () => {
  const loadAndStore = useLoadAndStoreEvaluationSubjects()
  const isAuthorized = useIsAuthorized()

  useEffect(() => {
    if (!isAuthorized) return

    const to = setTimeout(() => {
      loadAndStore().then(() => {})
    }, 500)
    return () => clearTimeout(to)
  }, [isAuthorized])

  return <></>
}

export default LoadEvaluationSubjectCache
