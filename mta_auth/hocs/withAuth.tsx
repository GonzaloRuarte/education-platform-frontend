import RequireAuth from '@/mta_auth/hocs/RequireAuth'
import { T_AllowedAccessGroups } from '@/mta_auth/types'
import { ComponentProps, FC } from 'react'
import { T_LoginZone } from '../types'

export const withAuth = (
  WrappedComponent: FC,
  options: {
    allowedAccessGroups?: T_AllowedAccessGroups
    logoutDestination: T_LoginZone
  },
) => {
  const WithAuthHOC = (props: ComponentProps<typeof WrappedComponent>) => {
    return (
      <>
        <RequireAuth allowedAccessGroups={options.allowedAccessGroups} logoutDestination={options.logoutDestination} />
        <WrappedComponent {...props} />
      </>
    )
  }

  return WithAuthHOC
}
