import { useTheme } from '@/shared/hooks'
import CloseIcon from '@mui/icons-material/Close'
import { AppBar, Button, Container, Dialog, DialogContent, IconButton, Slide, Toolbar, Typography } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import React, { useState } from 'react'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface I_FullScreenDialogProps {
  open: boolean
  title: string
  content: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

const FullScreenDialog: React.FC<I_FullScreenDialogProps> = ({ open, title, content, onConfirm, onCancel }) => {
  const t = useTheme()
  return (
    <Dialog fullScreen open={open} onClose={onCancel} slots={{ transition: Transition }}>
      <AppBar sx={{ position: 'relative', background: t.palette.primary.main, color: t.palette.primary.contrastText }}>
        <Container>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onCancel} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} component="div">
              {title}
            </Typography>
            <Button autoFocus color="inherit" onClick={onConfirm}>
              Confirm
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <DialogContent>
        <Container>{content}</Container>
      </DialogContent>
    </Dialog>
  )
}

interface I_UseFullScreenDialog {
  showFullScreenDialog: (title: string, content: React.ReactNode) => Promise<void>
  FullScreenDialogComponent: React.FC<I_FullScreenDialogProps>
  componentProps: I_FullScreenDialogProps
}

const useFullScreenDialog = (): I_UseFullScreenDialog => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<React.ReactNode>(null)
  const [resolvePromise, setResolvePromise] = useState<(value: void | PromiseLike<void>) => void>(() => {})

  const showFullScreenDialog = (title: string, content: React.ReactNode) => {
    setTitle(title)
    setContent(content)
    setOpen(true)
    return new Promise<void>((resolve) => {
      setResolvePromise(() => resolve)
    })
  }

  const onConfirm = () => {
    setOpen(false)
    resolvePromise()
  }

  const onCancel = () => {
    setOpen(false)
  }

  const FullScreenDialogComponent = (props: I_FullScreenDialogProps) => <FullScreenDialog {...props} />
  const componentProps = { open, title, content, onConfirm, onCancel }

  return { showFullScreenDialog, FullScreenDialogComponent, componentProps }
}

export { useFullScreenDialog }
