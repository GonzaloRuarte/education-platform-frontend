import RequireAuth from '@/mta_auth/hocs/RequireAuth'

import { T_AllowedUserProfiles } from '@/mta_users/types'
import { ComponentProps, FC } from 'react'
import { T_LoginZone } from '../types'

export const withAuth = (
  WrappedComponent: FC,
  options: {
    allowedUserProfiles?: T_AllowedUserProfiles
    logoutDestination: T_LoginZone
  },
) => {
  const WithAuthHOC = (props: ComponentProps<typeof WrappedComponent>) => {
    return (
      <>
        <RequireAuth allowedUserProfiles={options.allowedUserProfiles} logoutDestination={options.logoutDestination}>
          <WrappedComponent {...props} />
        </RequireAuth>
      </>
    )
  }

  return WithAuthHOC
}
