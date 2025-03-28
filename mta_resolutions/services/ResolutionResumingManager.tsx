'use client'

import { useResolutionResume } from '@/mta_resolutions/hooks/data'
import debounce from 'debounce'
import { useEffect } from 'react'

const ResolutionResumingManager = () => {
  const { resume } = useResolutionResume()
  useEffect(debounce(resume, 100), [])

  return <></>
}

export default ResolutionResumingManager
