'use client'

import { useResolutionResume } from '@/mta_resolutions/hooks'
import { useEffect } from 'react'

const ResolutionResumingManager = () => {
  const { resume } = useResolutionResume()
  useEffect(resume, [])

  return <></>
}

export default ResolutionResumingManager
