import React from 'react'

import Button from '@/shared/components/Button'
import { sharedLabels } from '@/shared/labels'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'

interface I_ButtonProps {
  onClick: () => void
}

const UpdateButton: React.FC<I_ButtonProps> = ({ onClick }) => (
  <Button onClick={onClick} startIcon={<ReplayIcon />}>
    {sharedLabels.update}
  </Button>
)

const AddButton: React.FC<I_ButtonProps> = ({ onClick }) => (
  <Button onClick={onClick} startIcon={<AddCircleIcon />}>
    {sharedLabels.add}
  </Button>
)

interface I_DeleteButtonProps extends I_ButtonProps {
  disabled: boolean
}

const DeleteButton: React.FC<I_DeleteButtonProps> = ({ onClick, disabled }) => (
  <Button onClick={onClick} startIcon={<DeleteIcon />} disabled={disabled}>
    {sharedLabels.delete}
  </Button>
)

export { AddButton, DeleteButton, UpdateButton }
