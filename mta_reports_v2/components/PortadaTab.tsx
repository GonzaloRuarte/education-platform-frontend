'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { Stack } from '@mui/material'
import { useEditableSlide } from '@/mta_reports_v2/hooks'
import { COLORS } from '@/mta_reports_v2/constants'
import Footer from '@/shared/layout/Footer'
import Logo from '@/shared/components/Logo'
import Button from '@/shared/components/Button'
import { ImageSize } from '@/shared/utils'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(async () => (await import('react-quill-new')).default, { ssr: false })

const C = COLORS

const metaLogoSize = new ImageSize(350, 100)

interface PortadaTabProps {
  schoolId: number
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

const PortadaTab = ({ schoolId, initialEditing }: PortadaTabProps) => {
  const slide = useEditableSlide<'title' | 'subtitle'>({
    schoolId,
    diapositivaId: 'portada',
    successMessage: 'Portada actualizada correctamente',
    fields,
    initialEditing,
  })

  const renderField = (key: 'title' | 'subtitle', variantClass: string) => (
    <Box
      className={`portada-editor ${variantClass} ${slide.isEditing && slide.activeEditor === key ? 'is-active' : ''} ${!slide.isEditing ? 'is-readonly' : ''}`}
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
    <Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', flexDirection: 'column', bgcolor: C.white, position: 'relative' }}>
      {slide.canEdit && (
        <Stack direction="row" spacing={1.25} sx={{ position: 'absolute', top: 16, right: 16, zIndex: 5 }}>
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
            zIndex={1}
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
            <Logo width={metaLogoSize.w} height={metaLogoSize.h} variant='color' />
            {renderField('title', 'portada-title')}
            {renderField('subtitle', 'portada-subtitle')}
          </Stack>
        </Box>
      </Box>
      <Footer includePin={false} />

      <style jsx global>{`
        .portada-editor {
          position: relative;
        }

        .portada-editor .ql-toolbar.ql-snow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
          border: 1px solid ${C.navyAlpha12};
          background: ${C.lightBlueAlpha22};
          border-radius: 18px;
          padding: 8px 10px;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-12px);
          transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .portada-editor.is-active .ql-toolbar.ql-snow {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(calc(-100% - 8px));
        }

        .portada-editor .ql-container.ql-snow {
          border: 0;
          font-family: inherit;
        }

        .portada-editor .ql-editor,
        .portada-editor .ql-editor * {
          color: ${C.navy} !important;
        }

        .portada-editor .ql-editor {
          padding: 0;
          text-align: left;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .portada-editor .ql-editor p {
          margin: 0;
        }

        .portada-editor.is-readonly .ql-container.ql-snow {
          pointer-events: none;
        }

        .portada-editor.is-readonly .ql-editor {
          cursor: default;
        }

        .portada-title .ql-editor {
          font-family: "Segoe UI", Segoe, system-ui, sans-serif;
          font-size: clamp(36px, 4.5vw, 54px);
          font-weight: 900;
          line-height: 1.1;
          color: ${C.navy};
        }

        .portada-subtitle .ql-editor {
          font-family: "Segoe UI", Segoe, system-ui, sans-serif;
          font-size: clamp(24px, 3vw, 42px);
          font-weight: 700;
          line-height: 1.2;
          color: ${C.navy};
        }
      `}</style>
    </Box>
  )
}

export { PortadaTab }
