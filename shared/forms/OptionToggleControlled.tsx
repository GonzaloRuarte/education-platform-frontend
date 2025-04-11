import { Box, FormHelperText, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

type T_OmittedFields = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'

interface I_Props<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields>,
    Omit<ToggleButtonGroupProps, T_OmittedFields> {
  options: Array<{ value: string | number; label: string }>
}

export default function OptionToggleControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  options,
  ...props
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <Box>
      <ToggleButtonGroup
        {...field}
        {...props}
        value={field.value || ''}
        exclusive // Ensures only one option can be selected
        onChange={(_, value) => field.onChange(value)} // Update the form state
      >
        {options.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {hasError && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
    </Box>
  )
}
