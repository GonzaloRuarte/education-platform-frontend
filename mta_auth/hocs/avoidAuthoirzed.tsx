import AvoidAuthorized from '@/mta_auth/hocs/AvoidAuthorized'
import { ComponentProps, FC } from 'react'

export const avoidAuthorized = (WrappedComponent: FC) => {
  const AvoidAuthorizedHOC = (props: ComponentProps<typeof WrappedComponent>) => {
    return (
      <>
        <AvoidAuthorized />
        <WrappedComponent {...props} />
      </>
    )
  }

  return AvoidAuthorizedHOC
}
