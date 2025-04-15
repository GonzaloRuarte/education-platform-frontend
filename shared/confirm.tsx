import React, { useState, useCallback } from 'react'

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'
import { T_VoidFn } from '@/shared/types'

interface I_ConfirmDialogProps {
  open: boolean
  title: string
  content: string
  onConfirm: T_VoidFn
  onCancel: T_VoidFn
}

const ConfirmDialog: React.FC<I_ConfirmDialogProps> = ({ open, title, content, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle style={{ fontSize: 20 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog

interface I_UseConfirm {
  showConfirm: (title: string, content: string) => Promise<void>
  ConfirmDialogComponent: React.FC
}

const useConfirm = (): I_UseConfirm => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [resolvePromise, setResolvePromise] = useState<(value: void | PromiseLike<void>) => void>(() => {})

  const showConfirm = useCallback((title: string, content: string) => {
    setTitle(title)
    setContent(content)
    setOpen(true)
    return new Promise<void>((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setOpen(false)
    resolvePromise()
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [])

  const ConfirmDialogComponent: React.FC = useCallback(
    () => (
      <ConfirmDialog open={open} title={title} content={content} onConfirm={handleConfirm} onCancel={handleCancel} />
    ),
    [open, title, content, handleConfirm, handleCancel],
  )

  return { showConfirm, ConfirmDialogComponent }
}

export { useConfirm }
export type { I_UseConfirm }
