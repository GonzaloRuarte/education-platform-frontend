'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { Box, Stack, Typography } from '@mui/material'
import { COLORS } from '@/mta_reports_v2/constants'
import { useEditableSlide, SlideFieldConfig } from '@/mta_reports_v2/hooks'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import Button from '@/shared/components/Button'
import { ImageSize } from '@/shared/utils'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(async () => (await import('react-quill-new')).default, { ssr: false })

const C = COLORS
const metaLogoSize = new ImageSize(257, 73, { scale: 1.48 })
const australLogoSize = new ImageSize(412, 72, { scale: 0.7 })

type FieldVariant = 'title' | 'body'

export interface FieldConfig extends SlideFieldConfig {
  variant: FieldVariant
}

export interface RenderFieldArgs<F extends string> {
  renderField: (key: F, sx?: Record<string, unknown>) => ReactNode
  isEditing: boolean
}

interface EditableContentSectionProps<F extends string> {
  schoolId: number
  diapositivaId: string
  successMessage: string
  fields: Record<F, FieldConfig>
  initialEditing?: boolean
  children: (args: RenderFieldArgs<F>) => ReactNode
}

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote'],
    ['clean'],
  ],
}

const editorFormats = ['header', 'bold', 'italic', 'underline', 'color', 'background', 'align', 'list', 'link', 'blockquote']

const EditableContentSection = <F extends string,>({
  schoolId,
  diapositivaId,
  successMessage,
  fields,
  initialEditing = false,
  children,
}: EditableContentSectionProps<F>) => {
  const slide = useEditableSlide<F>({
    schoolId,
    diapositivaId,
    successMessage,
    fields,
    initialEditing,
  })

  const renderField = (key: F, sx: Record<string, unknown> = {}) => {
    const variantClass = fields[key].variant === 'title' ? 'title-editor' : 'body-editor'
    return (
      <Box
        key={key}
        className={`editable-section-editor ${variantClass} ${slide.isEditing && slide.activeEditor === key ? 'is-active' : ''} ${!slide.isEditing ? 'is-readonly' : ''}`}
        sx={sx}
      >
        <ReactQuill
          theme="snow"
          value={slide.draft[key]}
          readOnly={!slide.isEditing}
          onChange={(value) => slide.updateDraft(key, value)}
          modules={slide.isEditing ? editorModules : { toolbar: false }}
          formats={editorFormats}
          onFocus={() => {
            if (slide.isEditing) slide.setActiveEditor(key)
          }}
          onBlur={() => {
            if (slide.isEditing) {
              slide.setActiveEditor(slide.activeEditor === key ? null : slide.activeEditor)
            }
          }}
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: C.bgGrey,
        px: { xs: 3, md: 8 },
        pt: { xs: 4, md: 5 },
        pb: { xs: 2, md: 3 },
      }}
    >
      <Stack direction="row" justifyContent="flex-end" alignItems="flex-start" spacing={2} sx={{ position: 'absolute', top: { xs: 16, md: 24 }, right: { xs: 24, md: 64 }, zIndex: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          {slide.canEdit && !slide.isEditing && (
            <Button size="small" bgcolor="purple" onClick={slide.startEditing} disabled={slide.isLoading}>
              Editar
            </Button>
          )}
          {slide.canEdit && slide.isEditing && (
            <>
              <Button size="small" bgcolor="green" onClick={slide.saveEditing} disabled={slide.isSaving || slide.isLoading}>
                {slide.isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button size="small" variant="outlined" onClick={slide.cancelEditing} disabled={slide.isSaving || slide.isLoading}>
                Cancelar
              </Button>
            </>
          )}
          <Logo width={metaLogoSize.w} height={metaLogoSize.h} />
        </Stack>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pt: { xs: 6, md: 12 }, pr: { xs: 0, md: 1 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {slide.isLoading ? (
          <Typography sx={{ color: C.tm }}>Cargando...</Typography>
        ) : (
          children({ renderField, isEditing: slide.isEditing })
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
        <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
      </Box>

      <style jsx global>{`
        .editable-section-editor {
          position: relative;
        }

        .editable-section-editor .ql-toolbar.ql-snow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
          border: 1px solid ${C.navyAlpha12};
          background: ${C.lightBlueAlpha22};
          
          border-radius: 18px;
          padding: 10px 12px;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-12px);
          transition:
            opacity 0.18s ease,
            transform 0.18s ease;
        }

        .editable-section-editor.is-active .ql-toolbar.ql-snow {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(calc(-100% - 12px));
        }

        .editable-section-editor .ql-container.ql-snow {
          border: 0;
          font-family: inherit;
        }

        .editable-section-editor .ql-editor {
          color: ${C.midNavy};
          padding: 0;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .editable-section-editor .ql-editor p {
          margin: 0;
        }

        .editable-section-editor .ql-editor ul,
        .editable-section-editor .ql-editor ol {
          padding-left: 1.5rem;
          margin: 0;
        }

        .editable-section-editor .ql-editor li {
          margin-bottom: 0.6em;
        }

        .editable-section-editor .ql-editor li > .ql-ui::before {
          font-size: 2em;
          line-height: 1;
        }

        .editable-section-editor .ql-editor blockquote {
          border-left: 4px solid ${C.lightBlue};
          padding-left: 16px;
        }

        .editable-section-editor.is-readonly .ql-container.ql-snow {
          pointer-events: none;
        }

        .editable-section-editor.is-readonly .ql-editor {
          cursor: default;
        }

        .title-editor .ql-editor {
          font-family: "Segoe UI", Segoe, system-ui, sans-serif;
          font-size: clamp(26px, 3.6vw, 38px);
          font-weight: 800;
          line-height: 1.05;
          color: ${C.midNavy};
        }

        .body-editor .ql-editor {
          font-size: clamp(18px, 2.2vw, 24px);
          line-height: 1.48;
          font-weight: 400;
        }
      `}</style>
    </Box>
  )
}

export { EditableContentSection }
