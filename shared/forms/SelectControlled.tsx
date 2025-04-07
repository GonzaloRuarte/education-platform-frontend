import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { FormControl, InputLabel, MenuItem, Select, SelectProps, FormHelperText } from '@mui/material'

type T_OmittedFields = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'

interface I_Props<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields>,
    Omit<SelectProps, T_OmittedFields> {
  label: string
  options: Array<{ value: string | number; label: string }>
}

export default function SelectControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
  options,
  ...props
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <FormControl fullWidth error={hasError}>
      <InputLabel>{label}</InputLabel>
      <Select fullWidth {...field} {...props} value={field.value || ''}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{fieldState.error?.message}</FormHelperText>}
    </FormControl>
  )
}
