import { useTheme } from '@/shared/hooks'
import { Box, Button, ButtonGroup, FormHelperText } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

type T_OmittedFields = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'

interface I_Props<T_FormFields extends FieldValues> extends UseControllerProps<T_FormFields> {
  options: Array<{ value: string | number; label: string }>
  exclusive?: boolean // Ensures only one option can be selected
  orientation?: 'horizontal' | 'vertical'
}

export default function OptionToggleControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  options,
  orientation,
  exclusive = true,
}: I_Props<T_FormFields>) {
  const t = useTheme()
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  const handleChange = (value: string | number) => {
    if (exclusive) {
      field.onChange(value) // Update the form state with the selected value
    } else {
      const currentValue = field.value
      const newValue = currentValue.includes(value)
        ? currentValue.filter((v: string | number) => v !== value) // Remove if already selected
        : [...currentValue, value] // Add if not selected
      field.onChange(newValue)
    }
  }

  return (
    <Box>
      <ButtonGroup orientation={orientation} sx={{ display: 'flex', gap: 2 }}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant={
              exclusive
                ? field.value === option.value
                  ? 'contained'
                  : 'outlined'
                : field.value?.includes(option.value)
                  ? 'contained'
                  : 'outlined'
            }
            onClick={() => handleChange(option.value)}
            // sx={{ borderBottomColor: `${t.palette.secondary.main} !important` }}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
      {hasError && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
    </Box>
  )
}
