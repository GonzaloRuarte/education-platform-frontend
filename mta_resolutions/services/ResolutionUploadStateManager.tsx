import { useResolutionManageUploadState } from '@/mta_resolutions/hooks/data'
import { useInterval } from '@/shared/hooks'

const ResolutionUploadStateManager = () => {
  const manageUpload = useResolutionManageUploadState()

  useInterval(manageUpload, 5000)

  return <></>
}

export default ResolutionUploadStateManager
