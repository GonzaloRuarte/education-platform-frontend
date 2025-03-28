'use client'

import {
  useResolutionLastUploadDatetime,
  useResolutionState,
  useResolutionUpdateLastUploadDatetime,
  useResolutionUploadState,
} from '@/mta_resolutions/hooks/data'
import { I_ResolutionState } from '@/mta_resolutions/types'
import { useEffect } from 'react'

const useManageUpload = () => {
  const uploadState = useResolutionUploadState()
  const lastUploadDatetime = useResolutionLastUploadDatetime()
  const updateLastUploadDatetime = useResolutionUpdateLastUploadDatetime()
  const resState = useResolutionState()

  const executeUploadingTasks = (resState: I_ResolutionState) => {
    uploadState(resState).then(updateLastUploadDatetime)
  }

  const manageUpload = () => {
    console.log('Managing upload', new Date().toISOString())
    if (resState === null) return

    // console.log('resState === null', resState === null)
    // console.log('lastUploadDatetime !== null', lastUploadDatetime !== null)
    // console.log('lastUploadDatetime !== null', lastUploadDatetime !== null)
    //
    // if ()
    // console.log(new Date(resState.last_update_datetime), new Date(lastUploadDatetime))
    // if (lastUploadDatetime === null && new Date(resState.last_update_datetime) < new Date(lastUploadDatetime))
    //   return
    // console.log('Uploading!!!', new Date().toISOString())
  }
  return manageUpload
}

const ResolutionUploadStateManager = () => {
  const manageUpload = useManageUpload()

  useEffect(() => {
    const interval = setInterval(manageUpload, 2000)

    return () => clearInterval(interval)
  }, [])

  return <></>
}

export default ResolutionUploadStateManager
