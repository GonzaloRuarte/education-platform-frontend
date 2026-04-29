'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Stack } from '@mui/material'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { COLORS } from '@/mta_reports_v2/constants'
import { useEscuelaReporteAurora } from '@/mta_reports_v2/hooks'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import Button from '@/shared/components/Button'
import { successToast } from '@/shared/toasts'
import { ImageSize } from '@/shared/utils'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(async () => (await import('react-quill-new')).default, { ssr: false })

const C = COLORS
const metaLogoSize = new ImageSize(257, 73, { scale: 0.55 })
const australLogoSize = new ImageSize(412, 72, { scale: 0.6 })

interface I_CoverContent {
  title: string
  subtitle: string
}

interface PortadaTabProps {
  schoolId: number
}

const ORDINAL_TOMA_LABELS: Record<string, string> = {
  '1': 'Primera Toma',
  '2': 'Segunda Toma',
  '3': 'Tercera Toma',
  '4': 'Cuarta Toma',
}

const buildDefaultContent = (toma: string | undefined): I_CoverContent => {
  const fallbackYear = String(new Date().getFullYear())
  if (!toma) return { title: '<p>Toma</p>', subtitle: `<p>${fallbackYear}</p>` }
  const [year, ord] = toma.split('-')
  const titleText = (ord && ORDINAL_TOMA_LABELS[ord]) || 'Toma'
  return {
    title: `<p>${titleText}</p>`,
    subtitle: `<p>${year ?? fallbackYear}</p>`,
  }
}

const isEffectivelyEmpty = (html: string) => html.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0

const normalizeContent = (content: I_CoverContent, defaults: I_CoverContent): I_CoverContent => ({
  title: isEffectivelyEmpty(content.title) ? defaults.title : content.title,
  subtitle: isEffectivelyEmpty(content.subtitle) ? defaults.subtitle : content.subtitle,
})

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
  ],
}

const editorFormats = ['header', 'bold', 'italic', 'underline', 'color', 'background', 'align']

const PortadaTab = ({ schoolId }: PortadaTabProps) => {
  const canEdit = useHasCapabilities(['manage_reports'])
  const { tomas } = useEscuelaReporteAurora(schoolId)
  const latestToma = tomas[tomas.length - 1]
  const defaultContent = useMemo(() => buildDefaultContent(latestToma), [latestToma])
  const [content, setContent] = useState<I_CoverContent>(() => buildDefaultContent(undefined))
  const [draft, setDraft] = useState<I_CoverContent>(() => buildDefaultContent(undefined))
  const [isEditing, setIsEditing] = useState(false)
  const [activeEditor, setActiveEditor] = useState<keyof I_CoverContent | null>(null)

  useEffect(() => {
    setContent(defaultContent)
    setDraft(defaultContent)
  }, [defaultContent])

  const startEditing = () => {
    setDraft(content)
    setActiveEditor(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraft(content)
    setActiveEditor(null)
    setIsEditing(false)
  }

  const saveEditing = () => {
    const nextContent = normalizeContent(draft, defaultContent)
    setContent(nextContent)
    setDraft(nextContent)
    setActiveEditor(null)
    setIsEditing(false)
    successToast('Portada actualizada correctamente')
  }

  const updateDraft = (field: keyof I_CoverContent, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const renderEditorBlock = (field: keyof I_CoverContent, className: string, sx: Record<string, unknown>) => (
    <Box
      className={`cover-inline-editor ${className} ${isEditing && activeEditor === field ? 'is-active' : ''} ${!isEditing ? 'is-readonly' : ''}`}
      sx={sx}
    >
      <ReactQuill
        theme="snow"
        value={draft[field]}
        readOnly={!isEditing}
        onChange={(value) => updateDraft(field, value)}
        modules={isEditing ? editorModules : { toolbar: false }}
        formats={editorFormats}
        onFocus={() => {
          if (isEditing) setActiveEditor(field)
        }}
        onBlur={() => {
          if (isEditing) {
            setActiveEditor(current => (current === field ? null : current))
          }
        }}
      />
    </Box>
  )

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 220px)',
        background: 'linear-gradient(135deg, #001a4d 0%, #0040a3 50%, #4da8ff 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        px: { xs: 3, md: 8 },
        py: { xs: 4, md: 5 },
      }}
    >
      {/* Header with edit buttons and Meta logo */}
      <Stack direction="row" justifyContent="flex-end" alignItems="flex-start" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          {canEdit && !isEditing && (
            <Button size="small" sx={{ backgroundColor: 'white', color: C.navy }} onClick={startEditing}>
              Editar
            </Button>
          )}
          {canEdit && isEditing && (
            <>
              <Button size="small" bgcolor="green" onClick={saveEditing}>
                Guardar
              </Button>
              <Button size="small" variant="outlined" onClick={cancelEditing}>
                Cancelar
              </Button>
            </>
          )}
          <Logo width={metaLogoSize.w} height={metaLogoSize.h} />
        </Stack>
      </Stack>

      {/* Center content - Title and Subtitle */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 800 }}>
        {renderEditorBlock('title', 'title-editor', { mb: 2 })}
        {renderEditorBlock('subtitle', 'subtitle-editor', {})}
      </Box>

      {/* Bottom - Austral Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
      </Box>

      <style jsx global>{`
        .cover-inline-editor {
          position: relative;
        }

        .cover-inline-editor .ql-toolbar.ql-snow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 10px 12px;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-12px);
          transition:
            opacity 0.18s ease,
            transform 0.18s ease;
        }

        .cover-inline-editor.is-active .ql-toolbar.ql-snow {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(calc(-100% - 12px));
        }

        .cover-inline-editor .ql-container.ql-snow {
          border: 0;
          font-family: inherit;
        }

        .cover-inline-editor .ql-editor {
          color: white;
          padding: 0;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .cover-inline-editor .ql-editor p {
          margin: 0;
        }

        .cover-inline-editor.is-readonly .ql-container.ql-snow {
          pointer-events: none;
        }

        .cover-inline-editor.is-readonly .ql-editor {
          cursor: default;
        }

        .title-editor .ql-editor {
          font-size: clamp(48px, 8vw, 72px);
          font-weight: 900;
          line-height: 1.1;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .subtitle-editor .ql-editor {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.2;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </Box>
  )
}

export { PortadaTab }
