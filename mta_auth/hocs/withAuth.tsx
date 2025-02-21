import RequireAuth from '@/mta_auth/hocs/RequireAuth'
import { T_AllowedAccessGroups } from '@/mta_auth/types'
import { ComponentProps, FC } from 'react'

export const withAuth = (
  WrappedComponent: FC,
  allowedAccessGroups?: T_AllowedAccessGroups,
) => {
  const WithAuthHOC = (props: ComponentProps<typeof WrappedComponent>) => {
    return (
      <>
        <RequireAuth allowedAccessGroups={allowedAccessGroups} />
        <WrappedComponent {...props} />
      </>
    )
  }

  return WithAuthHOC
}
