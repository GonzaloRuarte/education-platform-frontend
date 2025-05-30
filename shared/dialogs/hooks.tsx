import { I_DialogConfig, I_DialogExtendedConfig, I_DialogProps } from '@/shared/dialogs/types'
import { useCallback, useState } from 'react'
import Dialog from './Dialog'

const dialogInitialState: I_DialogExtendedConfig = {
  title: '',
  content: '',
  actions: [],
  isVisible: false,
}

/**
 * Hook for using reusable Alert component.
 *
 * ### How to use it?
 * ```
 * // 1. Call useAlert hook.
 * const { showAlert, AlertComponent, componentProps  } = useAlert()
 *
 * // 2. Generate your own showCustomAlert functions...
 * const showCustomAlert = () => {
 *   showAlert({
 *     title:'Custom alert',
 *     message:'This is a custom alert',
 *   })
 * }
 * // 3. Add the AlertComponent to your layout
 * <AlertComponent {...componentProps} />
 *
 * // 4. Call your custom showCustomAlert()
 * ```
 * and that's it!
 *
 */
const useDialog = () => {
  const [config, setConfig] = useState<I_DialogExtendedConfig>(dialogInitialState)

  /*  const dismiss = () => {
    setDialogIsVisible(false)
    config?.onDismissCallback && config.onDismissCallback()
    setConfig(alertInitialState)
  } */

  const resetDialog = () => {
    setConfig(dialogInitialState)
  }

  const showDialog = (_config: I_DialogConfig) => {
    setConfig({ ..._config, isVisible: true })
  }
  const componentProps: I_DialogProps = {
    title: config.title,
    isVisible: config.isVisible,
    actions: config.actions.map((action) => {
      return {
        ...action,
        onPress: () => {
          action.onPress()
          resetDialog()
        },
      }
    }),
    content: config.content,
    onClose: resetDialog,
    dialogProps: config.dialogProps,
  }

  const DialogComponent = useCallback(({ ...props }: I_DialogProps) => {
    return <Dialog {...props} />
  }, [])

  return { showDialog, DialogComponent, componentProps, closeDialog: resetDialog }
}

export { useDialog }
