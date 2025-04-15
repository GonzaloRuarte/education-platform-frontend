import AvoidAuthorized from '@/mta_auth/hocs/AvoidAuthorized'
import RequireAuth from '@/mta_auth/hocs/RequireAuth'
import { T_LoginZone } from '../types'
import { T_AllowedAccessGroups } from '@/mta_auth/types'
import pages from '@/pages'
import { ComponentProps, FC } from 'react'

export const withAuth = (
  WrappedComponent: FC,
  allowedAccessGroups?: T_AllowedAccessGroups,
  logoutDestination: T_LoginZone = 'dashboard',
) => {
  const WithAuthHOC = (props: ComponentProps<typeof WrappedComponent>) => {
    return (
      <>
        <RequireAuth allowedAccessGroups={allowedAccessGroups} logoutDestination={logoutDestination} />
        <WrappedComponent {...props} />
      </>
    )
  }

  return WithAuthHOC
}
