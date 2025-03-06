import { T_LogService } from '@/shared/log'
import { FC } from 'react'

interface IApplicationServiceBaseProps {}

type T_ApplicationService<TOtherProps = object> = FC<IApplicationServiceBaseProps & TOtherProps>

interface I_ApplicationServiceDependencies {
  stateVersion?: string | undefined
  executeStateResetTasks?: () => void
  storeStateVersion?: (version: string) => void
  log?: T_LogService
}

export type { I_ApplicationServiceDependencies, IApplicationServiceBaseProps, T_ApplicationService }
