import TextField, { TextFieldProps } from '@mui/material/TextField'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

type T_OmittedFields = 'value' | 'helperText' | 'error' | 'fullWidth' | 'onChange' | 'onBlur' | 'value' | 'disabled' | 'name' | 'ref' | 'defaultValue'

interface I_Props<T_FormFields extends FieldValues> extends UseControllerProps<T_FormFields>, Omit<TextFieldProps, T_OmittedFields> {}

export default function Input<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  disabled,
  ...props
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control, disabled })
  const hasError = fieldState.error !== undefined

  return <TextField fullWidth error={hasError} helperText={hasError && fieldState.error?.message} {...field} {...props} />
}
