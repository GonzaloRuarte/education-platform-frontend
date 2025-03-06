import { FormControl, FormHelperText, FormLabel } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

interface I_Props<T_FormFields extends FieldValues> extends UseControllerProps<T_FormFields> {
  label?: string
}

export default function WysiwygEditor<T_FormFields extends FieldValues>({
  name,
  control,
  defaultValue,
  disabled,
  rules,
  shouldUnregister,
  label,
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control, disabled })
  const { onChange, onBlur, value } = field
  const hasError = fieldState.error !== undefined

  return (
    <FormControl component="fieldset" error={hasError} fullWidth>
      <FormLabel component="legend">{label}</FormLabel>
      <ReactQuill
        theme="snow"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        modules={{
          toolbar: [
            ['bold', 'italic'],
            ['link', 'blockquote', 'code-block', 'image'],
            [{ list: 'ordered' }, { list: 'bullet' }],
          ],
        }}
      />
      {hasError && <FormHelperText>{fieldState.error?.message}</FormHelperText>}
    </FormControl>
  )
}
