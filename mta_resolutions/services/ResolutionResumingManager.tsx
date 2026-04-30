'use client'

import { useResolutionResume } from '@/mta_resolutions/hooks/data'
import { useEffect, useRef } from 'react'

const ResolutionResumingManager = () => {
  const { resume } = useResolutionResume()
  const didRunRef = useRef(false)
  const resumeRef = useRef(resume)

  useEffect(() => {
    resumeRef.current = resume
  }, [resume])

  useEffect(() => {
    if (didRunRef.current) return
    didRunRef.current = true
    void resumeRef.current({ reason: 'startup' })
  }, [])

  return <></>
}

export default ResolutionResumingManager
