'use client';

import { FormControl, FormHelperText, FormLabel, Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { ComponentPropsWithRef, useEffect, useMemo, useRef } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const QuillNoSSRWrapper = dynamic(
  async () => {
    const { default: ReactQuill, Quill } = await import('react-quill-new');
    if (typeof window !== 'undefined' && !(window as any).Quill) {
      (window as any).Quill = Quill;
    }
    const { default: ImageResize } = await import('quill-image-resize-module-v2');
    if (!(Quill as any).imports?.['modules/imageResize']) {
      Quill.register('modules/imageResize', ImageResize);
    }
    return (props: ComponentPropsWithRef<typeof ReactQuill>) => <ReactQuill {...props} />;
  },
  { ssr: false }
);

interface WysiwygProps<T extends FieldValues> extends UseControllerProps<T> {
  label?: string;
}

/** Preserve tabs as literal \t and lock multi-spaces so they don't collapse */
function preserveWS(html: string) {
  if (!html) return html;
  return html
    // keep \t as-is (critical: rely on CSS tab-size for visuals)
    .replace(/\t/g, '    ')
    // for 2+ spaces, alternate NBSP + space to prevent collapsing
    .replace(/ {2,}/g, (m) =>
      Array.from(m).map((_, i) => (i % 2 === 0 ? '\u00A0' : ' ')).join('')
    );
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
  } = useController({ name, rules, shouldUnregister, defaultValue, control, disabled });

  const TEXT_NODE =
    (typeof window !== 'undefined' && (window as any).Node?.TEXT_NODE) || 3;

  // Ensure Quill keeps tabs and multi-spaces when ingesting HTML/paste
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'blockquote', 'code-block', 'image', 'formula'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
      ],
      imageResize: { modules: ['Resize', 'DisplaySize'] },
      clipboard: {
        matchers: [
          [
            TEXT_NODE,
            (_node: any, delta: any) => {
              delta.ops = (delta.ops || []).map((op: any) => {
                if (typeof op.insert === 'string') {
                  op.insert = preserveWS(op.insert);
                }
                return op;
              });
              return delta;
            },
          ],
        ],
      },
    }),
    [TEXT_NODE]
  );

  // Normalize the initial controlled value once so Quill starts with preserved chars
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    const v = (value as string) ?? '';
    const preserved = preserveWS(v);
    if (preserved !== v) onChange(preserved);
    didInitRef.current = true;
  }, [value, onChange]);

  return (
    <FormControl component="fieldset" error={!!error} fullWidth>
      <FormLabel component="legend">{label}</FormLabel>

      <Box className="quillWrap">
        <QuillNoSSRWrapper
          theme="snow"
          value={(value as string) ?? ''}
          onChange={(html) => onChange(html)}   // RHF expects (value) not (value, delta...)
          onBlur={() => onBlur()}               // RHF style blur
          modules={modules}
        />
      </Box>

      {error && <FormHelperText>{error.message}</FormHelperText>}

      <style jsx global>{`
        /* Make tabs and trailing spaces visible like in a code editor */
        .quillWrap .ql-editor {
          white-space: pre !important; /* preserve spaces/newlines/tabs */
          tab-size: 4;                      /* width of a single \t */
          -moz-tab-size: 4;
        }
      `}</style>
    </FormControl>
  );
}
