import Input from '@/shared/forms/Input'
import { TextFieldProps } from '@mui/material/TextField'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

type T_OmittedFields =
  | 'value'
  | 'error'
  | 'fullWidth'
  | 'onChange'
  | 'onBlur'
  | 'value'
  | 'disabled'
  | 'name'
  | 'ref'
  | 'defaultValue'

interface I_Props<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields>,
    Omit<TextFieldProps, T_OmittedFields> {}

export default function InputControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  disabled,
  helperText,
  ...props
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control, disabled })
  const hasError = fieldState.error !== undefined

  return (
    <Input
      error={hasError}
      helperText={
        <>
          {helperText ? helperText : ''}
          {helperText && hasError && <br />}
          {hasError && fieldState.error?.message}
        </>
      }
      {...field}
      {...props}
    />
  )
}
