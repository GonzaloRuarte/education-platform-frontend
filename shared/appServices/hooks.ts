'use client'

import { I_ApplicationServiceDependencies } from '@/shared/appServices/types'
import { useEffect, useState } from 'react'

/**
 * Performs required tasks when version has changed (i.e: resetting corresponding states)
 *
 * @param version as the parameter is mandatory to be passed. As calculation of version could be undefined, version must be passed as version || null
 * @param d (aka dependencies)
 */
const useHandleVersioning = (version: null | string, d: I_ApplicationServiceDependencies) => {
  const [versionWasHandled, setVersionWasHandled] = useState(false)

  const handleVersioning = () => {
    setVersionWasHandled(false)
    d.log && d.log(`VersionUpdateManager: handleVersioning ${version}`)

    if (version === null) {
      throw new Error('VersionUpdateManager: version is null (undefined in app)')
    }

    if (d.stateVersion !== version) {
      d.executeStateResetTasks !== undefined && d.executeStateResetTasks()
      d.storeStateVersion !== undefined && d.storeStateVersion(version) // this stores updated version

      d.log && d.log(`Version updated to ${version}`)
      setVersionWasHandled(true)
      return
    }

    setVersionWasHandled(true)
    d.log && d.log(`Version is still ${version}`)
  }

  useEffect(handleVersioning, [])
  useEffect(handleVersioning, [version])

  return { versionWasHandled }
}

export { useHandleVersioning }
