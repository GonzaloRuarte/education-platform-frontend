import { T_VoidFn } from '@/shared/types'
import { Box, FormHelperText } from '@mui/material'
import {
  DateValidationError,
  PickerChangeHandlerContext,
  PickersDay,
  PickersDayProps,
  StaticDatePicker,
} from '@mui/x-date-pickers'
import { DateCalendarProps } from '@mui/x-date-pickers/DateCalendar'
import { Dayjs } from 'dayjs'
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form'

type T_OmittedFields = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'
type T_AvailableDays = Record<number, boolean>
interface I_Props<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields>,
    Omit<DateCalendarProps<Dayjs>, T_OmittedFields> {
  availableDays?: T_AvailableDays
  onChangeCallback?: (...args: any) => void
}

const dayComponent = (availableDays: T_AvailableDays) => {
  const Day = ({ ...props }: PickersDayProps<Dayjs>) => {
    const isDisabled = props.disabled || props.day.date() in availableDays ? !availableDays[props.day.date()] : true
    return (
      <PickersDay
        style={{ border: !isDisabled && !props.selected ? 'solid 1px rgb(118, 176, 127)' : undefined }}
        {...props}
        disabled={isDisabled}
      />
    )
  }
  return Day
}

export default function DateCalendarControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  control,
  availableDays,
  onChangeCallback,
  ...props
}: I_Props<T_FormFields>) {
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
              <StaticDatePicker
                {...props}
                value={field.value || null}
                onChange={(value: Dayjs | null, context: PickerChangeHandlerContext<DateValidationError>) => {
                  field.onChange(value, context)
                  if (onChangeCallback !== undefined) {
                    onChangeCallback(value, context)
                  }
                }}
                disablePast
                slots={{
                  actionBar: () => <></>,
                  day: availableDays !== undefined ? dayComponent(availableDays) : undefined,
                }}
              />
              {hasError && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
            </>
          )
        }}
      />
    </Box>
  )
}
