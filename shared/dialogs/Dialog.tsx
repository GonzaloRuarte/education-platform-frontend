import Button from '@/shared/components/Button'
import Spacer from '@/shared/components/Spacer'
import { Body1, H3 } from '@/shared/components/Typography'
import { I_DialogProps } from '@/shared/dialogs/types'
import { Dialog as MUI_Dialog } from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

const Dialog = ({ title, content, actions, isVisible,  dialogProps, onClose }: I_DialogProps) => {
  return (
    <MUI_Dialog
      open={isVisible}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
       {...dialogProps}     // ← forward everything to MUI
    >
      <DialogTitle component={'div'}>
        <H3>{title}</H3>
      </DialogTitle>
      <Spacer size="xs" />
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        {actions.map((action) => {
          return <Button onClick={action.onPress} children={action.buttonLabel} key={action.key} />
        })}
      </DialogActions>
    </MUI_Dialog>
  )
}

export default Dialog
