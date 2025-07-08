'use client'

import { FormControl, FormHelperText, FormLabel } from '@mui/material'
import dynamic from 'next/dynamic'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { ComponentPropsWithRef } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const QuillNoSSRWrapper = dynamic(
  async () => {
    /* 1 ─ load React-Quill-new, which also exports Quill 2 */
    const {
      default: ReactQuill,
      Quill,
    } = await import('react-quill-new')

    /* 2 ─ expose Quill on window *before* loading the plugin;
            many forks look for window.Quill                       */
    if (typeof window !== 'undefined' && !(window as any).Quill) {
      ;(window as any).Quill = Quill
    }

    /* 3 ─ load the Quill-2-compatible resize module from GitHub */
    const { default: ImageResize } = await import(
      'quill-image-resize-module-v2'
    )

    /* 4 ─ register once */
    if (!(Quill as any).imports?.['modules/imageResize']) {
      Quill.register('modules/imageResize', ImageResize)
    }

    /* 5 ─ return the wrapper component */
    return (props: ComponentPropsWithRef<typeof ReactQuill>) => (
      <ReactQuill {...props} />
    )
  },
  { ssr: false },
)

interface WysiwygProps<T extends FieldValues> extends UseControllerProps<T> {
  label?: string
}

export default function WysiwygEditorControlled<T extends FieldValues>({
  name,
  control,
  defaultValue,
  disabled,
  rules,
  shouldUnregister,
  label,
}: WysiwygProps<T>) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({ name, rules, shouldUnregister, defaultValue, control, disabled })

  return (
    <FormControl component="fieldset" error={!!error} fullWidth>
      <FormLabel component="legend">{label}</FormLabel>

      <QuillNoSSRWrapper
        theme="snow"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        modules={{
          toolbar: [
            ['bold', 'italic'],
            ['link', 'blockquote', 'code-block', 'image', 'formula'],
            [{ list: 'ordered' }, { list: 'bullet' }],
          ],
          imageResize: {
            modules: ['Resize', 'DisplaySize'],
          },
        }}
      />

      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}
