import React, { ComponentProps } from 'react'

import Button from '@/shared/components/Button'
import { sharedLabels } from '@/shared/labels'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import CancelIcon from '@mui/icons-material/Cancel'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PasswordIcon from '@mui/icons-material/Password'

interface I_ButtonProps extends Omit<ComponentProps<typeof Button>, 'startIcon' | 'children'> {}

const ReloadButton: React.FC<I_ButtonProps> = ({ ...props }) => (
  <Button {...props} startIcon={<ReplayIcon />}>
    {sharedLabels.reload}
  </Button>
)
const BackButton: React.FC<I_ButtonProps> = ({ ...props }) => (
  <Button {...props} startIcon={<ArrowBackIcon />}>
    {sharedLabels.back}
  </Button>
)

const AddButton: React.FC<I_ButtonProps> = ({ ...props }) => (
  <Button {...props} startIcon={<AddCircleIcon />}>
    {sharedLabels.add}
  </Button>
)

const CancelButton: React.FC<I_ButtonProps> = ({ ...props }) => (
  <Button {...props} startIcon={<CancelIcon />}>
    {sharedLabels.cancel}
  </Button>
)

interface I_DeleteButtonProps extends I_ButtonProps {
  label?: string
}

const DeleteButton: React.FC<I_DeleteButtonProps> = ({ label, ...props }) => (
  <Button {...props} startIcon={<DeleteIcon />}>
    {label || sharedLabels.delete}
  </Button>
)

const ChangePasswordButton: React.FC<I_ButtonProps> = ({ ...props }) => (
  <Button startIcon={<PasswordIcon />} {...props}>
    Cambiar contraseña
  </Button>
)

export { AddButton, DeleteButton, ReloadButton, CancelButton, BackButton, ChangePasswordButton }
