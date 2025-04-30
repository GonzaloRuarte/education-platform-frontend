import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useStore } from '@/shared/state'
import { successToast } from '@/shared/toasts'
import { useTheme as useMUITheme } from '@mui/material'
import { T_InProgressHook, T_VoidFn } from '@/shared/types'
import { EntityName, sentence } from '@/shared/utils'

const useInProgressLocal: T_InProgressHook = () => {
  const [isInProgress, setInProgressStatus] = useState(false)
  return {
    isInProgress,
    setInProgressStatus,
    setIsNotInProgress: () => setInProgressStatus(false),
    setIsInProgress: () => setInProgressStatus(true),
  }
}
const useInProgress: T_InProgressHook = () => {
  const isInProgress = useStore((state) => state.isInProgress)
  const setInProgressStatus = useStore((state) => state.setIsInProgress)
  return {
    isInProgress,
    setInProgressStatus,
    setIsNotInProgress: () => setInProgressStatus(false),
    setIsInProgress: () => setInProgressStatus(true),
  }
}
const useHandleDelete = (
  id: number | string,
  d: {
    showConfirm: (title: string, content: string) => Promise<void>
    deleteInstance: (id: any) => Promise<any>
    entityName: EntityName
    callback: T_VoidFn
  },
) => {
  return () => {
    d.showConfirm(`Eliminar ${d.entityName.singular} #${id}`, '¿Estás seguro/a que querés proceder?').then(() => {
      d.deleteInstance(id).then(() => {
        successToast(
          sentence(
            `${d.entityName.singular} ${d.entityName.genderedString({ m: 'eliminado', f: 'eliminada' })} correctamente.`,
          ),
        )
        d.callback()
      })
    })
  }
}
const useTheme = useMUITheme

/**
 * Copied from: https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Copied from: https://usehooks-ts.com/react-hook/use-interval
 */
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (delay === null) {
      return
    }

    const id = setInterval(() => {
      savedCallback.current()
    }, delay)

    return () => {
      clearInterval(id)
    }
  }, [delay])
}
export { useInProgress, useInProgressLocal, useHandleDelete, useTheme, useIsomorphicLayoutEffect, useInterval }
