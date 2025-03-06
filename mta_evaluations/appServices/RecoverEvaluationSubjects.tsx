'use client'

import { useRecoverAndStoreEvaluationSubjects } from '@/mta_evaluations/hooks'
import { T_ApplicationService } from '@/shared/appServices/types'
import log from '@/shared/log'
import { useEffect } from 'react'

const RecoverEvaluationSubjects: T_ApplicationService<{}> = () => {
  const recoverAndStore = useRecoverAndStoreEvaluationSubjects()

  useEffect(() => {
    recoverAndStore().then((res) => {
      log.info('Evaluation subjects loaded succesfully')
    })
  }, [])
  return <></>
}

export default RecoverEvaluationSubjects
