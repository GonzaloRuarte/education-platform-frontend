'use client'

import { useIsAuthorized } from '@/mta_auth/hooks'
import { useRecoverAndStoreEvaluationSubjects } from '@/mta_evaluations/hooks'
import { T_ApplicationService } from '@/shared/appServices/types'
import log from '@/shared/log'
import { useEffect } from 'react'

const RecoverEvaluationSubjects: T_ApplicationService<{}> = () => {
  const recoverAndStore = useRecoverAndStoreEvaluationSubjects()
  const isAuthorized = useIsAuthorized()

  useEffect(() => {
    const to = setTimeout(() => {
      recoverAndStore().then(() => {
        log.info('Evaluation subjects loaded succesfully')
      })
    }, 500)
    return () => clearTimeout(to)
  }, [isAuthorized])
  return <></>
}

export default RecoverEvaluationSubjects
