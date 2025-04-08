import { Box, FormHelperText } from '@mui/material'
import { StaticDatePicker } from '@mui/x-date-pickers'
import { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar'
import { Dayjs } from 'dayjs'
import { Controller, FieldValues, useController, UseControllerProps } from 'react-hook-form'

type T_OmittedFields = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'

interface I_Props<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields>,
    Omit<DateCalendarProps<Dayjs>, T_OmittedFields> {}

export default function DateCalendarController<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  ...props
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })

  return (
    <Box>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => {
          const hasError = fieldState.error !== undefined

          return (
            <>
              <StaticDatePicker value={field.value || null} onChange={field.onChange} />
              {hasError && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
            </>
          )
        }}
      />
    </Box>
  )
}
