'use client'

import { useHandleVersioning } from '@/shared/appServices/hooks'
import { I_ApplicationServiceDependencies, T_ApplicationService } from '@/shared/appServices/types'

interface I_Props {
  version?: string
  services: Array<T_ApplicationService<any>>
  d: I_ApplicationServiceDependencies
}

/**
 * Performs the loading of the application services.
 * Also executes the preloading tasks like versioning management.
 */
const ApplicationServices = ({ services, version, d }: I_Props) => {
  const isReadyToLoadServices = useHandleVersioning(version || null, d)

  return <>{isReadyToLoadServices && services.map((Service, index) => <Service key={index} />)}</>
}

export { ApplicationServices }
