import React, { ComponentProps } from 'react'

import Button from '@/shared/components/Button'
import { sharedLabels } from '@/shared/labels'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'

interface I_ButtonProps extends Omit<ComponentProps<typeof Button>, 'startIcon' | 'children'> {}

const UpdateButton: React.FC<I_ButtonProps> = ({ ...props }) => (
  <Button {...props} startIcon={<ReplayIcon />}>
    {sharedLabels.update}
  </Button>
)

const AddButton: React.FC<I_ButtonProps> = ({ ...props }) => (
  <Button {...props} startIcon={<AddCircleIcon />}>
    {sharedLabels.add}
  </Button>
)

interface I_DeleteButtonProps extends I_ButtonProps {
  disabled: boolean
}

const DeleteButton: React.FC<I_DeleteButtonProps> = ({ ...props }) => (
  <Button {...props} startIcon={<DeleteIcon />}>
    {sharedLabels.delete}
  </Button>
)

export { AddButton, DeleteButton, UpdateButton }
