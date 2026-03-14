import RequireAuth from '@/mta_auth/hocs/RequireAuth'

import { T_UserCapability, T_LoginZone } from '@/mta_auth/types'
import { ComponentProps, FC } from 'react'

export const withAuth = (
  WrappedComponent: FC,
  options: {
    allowedCapabilities?: Array<T_UserCapability>
    logoutDestination: T_LoginZone
  },
) => {
  const WithAuthHOC = (props: ComponentProps<typeof WrappedComponent>) => {
    return (
      <>
        <RequireAuth
          allowedCapabilities={options.allowedCapabilities}
          logoutDestination={options.logoutDestination}
        >
          <WrappedComponent {...props} />
        </RequireAuth>
      </>
    )
  }

  return WithAuthHOC
}
