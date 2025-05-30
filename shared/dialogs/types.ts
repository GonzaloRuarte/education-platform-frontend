import { T_VoidFn } from '@/shared/types'
import { ReactNode } from 'react'
import { DialogProps as MUIDialogProps } from '@mui/material/Dialog'

interface I_DialogAction {
  buttonLabel: string
  onPress: T_VoidFn
  key: string
}
interface I_DialogProps {
  isVisible: boolean
  title: string
  content: ReactNode
  actions: Array<I_DialogAction>
  onClose: T_VoidFn
  dialogProps?: Partial<MUIDialogProps>      // ← NEW
}
interface I_DialogConfig {
  title: string
  content: ReactNode
  actions: Array<I_DialogAction>
  dialogProps?: Partial<MUIDialogProps>     
}

interface I_DialogExtendedConfig extends I_DialogConfig {
  isVisible: boolean
}

export type { I_DialogAction, I_DialogProps, I_DialogConfig, I_DialogExtendedConfig }
