'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { Box, Stack, Typography } from '@mui/material'
import { COLORS, SPACING, Z_INDEX } from '@/mta_reports_v2/constants'
import { useEditableSlide, SlideFieldConfig } from '@/mta_reports_v2/hooks'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import Button from '@/shared/components/Button'
import { ImageSize } from '@/shared/utils'
import { QuillEditorStyles } from '@/mta_reports_v2/components/shared/QuillEditorStyles'
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
        px: SPACING.slidePx,
        pt: SPACING.slidePt,
        pb: SPACING.slidePb,
      }}
    >
      <Stack direction="row" justifyContent="flex-end" alignItems="flex-start" spacing={2} sx={{ position: 'absolute', top: { xs: 16, md: 24 }, right: { xs: 24, md: 64 }, zIndex: Z_INDEX.popover }}>
        <Stack direction="row" alignItems="center" spacing={SPACING.groupSpacing}>
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

      <QuillEditorStyles />
    </Box>
  )
}

export { EditableContentSection }
