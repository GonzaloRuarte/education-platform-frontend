import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { Box, IconButton, TextField, TextFieldProps } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
type T_OmittedFields = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'

interface I_Props<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields>,
    Omit<TextFieldProps, T_OmittedFields> {
  min?: number
  max?: number
  step?: number
}

export default function IntegerInputControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  const handleIncrement = () => {
    const newValue = Math.min((field.value || 0) + step, max)
    field.onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max((field.value || 0) - step, min)
    field.onChange(newValue)
  }

  return (
    <Box display="flex" alignItems="center">
      <IconButton onClick={handleDecrement} disabled={field.value <= min}>
        <RemoveIcon />
      </IconButton>
      <TextField
        {...field}
        {...props}
        type="number"
        value={field.value || ''}
        error={hasError}
        helperText={hasError && fieldState.error?.message}
        slotProps={{ htmlInput: { min, max } }}
        sx={{ mx: 1, width: 80 }}
      />
      <IconButton onClick={handleIncrement} disabled={field.value >= max}>
        <AddIcon />
      </IconButton>
    </Box>
  )
}
