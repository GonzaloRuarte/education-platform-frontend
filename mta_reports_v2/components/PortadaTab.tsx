'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { Stack } from '@mui/material'
import { useEditableSlide } from '@/mta_reports_v2/hooks'
import type { I_Subject } from '@/mta_reports_v2/hooks'
import { COLORS, FONT_WEIGHTS, TITLE_FONT_FAMILY, SPACING, Z_INDEX } from '@/mta_reports_v2/constants'
import Footer from '@/shared/layout/Footer'
import Logo from '@/shared/components/Logo'
import Button from '@/shared/components/Button'
import { ImageSize } from '@/shared/utils'
import { SlideContainer } from '@/mta_reports_v2/components/shared/SlideContainer'
import { QuillEditorStyles } from '@/mta_reports_v2/components/shared/QuillEditorStyles'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(async () => (await import('react-quill-new')).default, { ssr: false })

const C = COLORS

const metaLogoSize = new ImageSize(350, 100)

interface PortadaTabProps {
  subject: I_Subject
  initialEditing?: boolean
}

const fields = {
  title: { defaultHtml: '<p>Primera Toma</p>' },
  subtitle: { defaultHtml: '<p>2026</p>' },
} as const

const editorModules = {
  toolbar: [['bold', 'italic', 'underline'], [{ color: [] }], ['clean']],
}

const editorFormats = ['bold', 'italic', 'underline', 'color']

const PortadaTab = ({ subject, initialEditing }: PortadaTabProps) => {
  const slide = useEditableSlide<'title' | 'subtitle'>({
    subject,
    diapositivaId: 'portada',
    successMessage: 'Portada actualizada correctamente',
    fields,
    initialEditing,
  })

  const fontSizeFor = (key: 'title' | 'subtitle') =>
    key === 'title' ? 'min(4.25cqi, 54px)' : 'min(3.3cqi, 42px)'
  const fontWeightFor = (key: 'title' | 'subtitle') => (key === 'title' ? FONT_WEIGHTS.black : FONT_WEIGHTS.bold)
  const lineHeightFor = (key: 'title' | 'subtitle') => (key === 'title' ? 1.1 : 1.2)

  const renderField = (key: 'title' | 'subtitle', variantClass: string) => (
    <Box
      className={`portada-editor ${variantClass} ${slide.isEditing && slide.activeEditor === key ? 'is-active' : ''} ${!slide.isEditing ? 'is-readonly' : ''}`}
      sx={{
        '& .ql-editor, & .ql-editor *': {
          fontFamily: `${TITLE_FONT_FAMILY} !important`,
          color: `${C.royal} !important`,
        },
        '& .ql-editor': {
          fontSize: fontSizeFor(key),
          fontWeight: fontWeightFor(key),
          lineHeight: lineHeightFor(key),
          overflow: 'hidden',
        },
      }}
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

  return (
    <SlideContainer>
      {slide.canEdit && (
        <Stack direction="row" spacing={SPACING.groupSpacing} sx={{ position: 'absolute', top: 16, right: 16, zIndex: Z_INDEX.floating }}>
          {!slide.isEditing && (
            <Button size="small" bgcolor="purple" onClick={slide.startEditing} disabled={slide.isLoading}>
              Editar
            </Button>
          )}
          {slide.isEditing && (
            <>
              <Button size="small" bgcolor="green" onClick={slide.saveEditing} disabled={slide.isSaving || slide.isLoading}>
                {slide.isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button size="small" variant="outlined" onClick={slide.cancelEditing} disabled={slide.isSaving || slide.isLoading}>
                Cancelar
              </Button>
            </>
          )}
        </Stack>
      )}
      <Box height="auto" flex={1} display="flex" minWidth={0}>
        <Box flex={1} position="relative" minWidth={0}>
          <Box
            width="70%"
            height="70%"
            position="absolute"
            zIndex={Z_INDEX.sticky}
            sx={{ mixBlendMode: 'multiply' }}
            top={-20}
            left={-20}
          >
            <Image src="/triangle.png" alt="Chico estudiando" objectPosition="top left" fill objectFit="contain" />
          </Box>
          <Box width="100%" height="100%" position="relative" sx={{ mixBlendMode: 'multiply' }}>
            <Image src="/boy.jpg" alt="Chico estudiando" objectPosition="bottom right" fill objectFit="contain" />
          </Box>
        </Box>
        <Box flex={1} display="flex" alignItems="center" justifyContent="center" minWidth={0}>
          <Stack alignItems="left" spacing={4} sx={{ px: 4, width: '100%' }}>
            <Box sx={{ width: 'min(27.5cqi, 350px)', '& img': { width: '100%', height: 'auto', display: 'block' } }}>
              <Logo width={metaLogoSize.w} height={metaLogoSize.h} variant='color' />
            </Box>
            {renderField('title', 'portada-title')}
            {renderField('subtitle', 'portada-subtitle')}
          </Stack>
        </Box>
      </Box>
      <Footer includePin={false} />
      <QuillEditorStyles />
    </SlideContainer>
  )
}

export { PortadaTab }
