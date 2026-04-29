'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Stack } from '@mui/material'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { COLORS } from '@/mta_reports_v2/constants'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import HTMLParser from '@/shared/components/HTMLParser'
import Button from '@/shared/components/Button'
import { successToast } from '@/shared/toasts'
import { ImageSize } from '@/shared/utils'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(async () => (await import('react-quill-new')).default, { ssr: false })

const C = COLORS
const metaLogoSize = new ImageSize(257, 73, { scale: 0.74 })
const australLogoSize = new ImageSize(412, 72, { scale: 0.7 })
const INTRO_CONTENT_STORAGE_KEY = 'mta_reports_v2:reporte_escuela:intro-content'

interface I_IntroContent {
  title: string
  paragraph1: string
  paragraph2: string
}

const defaultContent: I_IntroContent = {
  title: '<p>Introducción</p>',
  paragraph1:
    '<p>META (Medición y Evaluación para la Transformación de los Aprendizajes) es un programa de la Escuela de Educación de la Universidad Austral, orientado a medir y evaluar los desempeños de aprendizaje escolar en Matemática y Prácticas del Lenguaje, con el objetivo de contribuir a la mejora de la calidad y equidad educativa.</p>',
  paragraph2:
    '<p>A través de evaluaciones estandarizadas que se realizan dos veces al año, META brinda información precisa sobre el desarrollo de los estudiantes al finalizar el primer y segundo ciclo del nivel primario (3° y 6° grado), así como al término del ciclo básico y de la orientación del nivel secundario (9° y 12° año).</p>',
}

const readStoredContent = (): I_IntroContent => {
  if (typeof window === 'undefined') return defaultContent

  try {
    const raw = window.localStorage.getItem(INTRO_CONTENT_STORAGE_KEY)
    if (!raw) return defaultContent

    const parsed = JSON.parse(raw) as Partial<I_IntroContent>
    return {
      title: parsed.title || defaultContent.title,
      paragraph1: parsed.paragraph1 || defaultContent.paragraph1,
      paragraph2: parsed.paragraph2 || defaultContent.paragraph2,
    }
  } catch {
    return defaultContent
  }
}

const isEffectivelyEmpty = (html: string) => html.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0

const normalizeContent = (content: I_IntroContent): I_IntroContent => ({
  title: isEffectivelyEmpty(content.title) ? defaultContent.title : content.title,
  paragraph1: isEffectivelyEmpty(content.paragraph1) ? defaultContent.paragraph1 : content.paragraph1,
  paragraph2: isEffectivelyEmpty(content.paragraph2) ? defaultContent.paragraph2 : content.paragraph2,
})

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

const IntroduccionTab = () => {
  const canEdit = useHasCapabilities(['manage_reports'])
  const [content, setContent] = useState<I_IntroContent>(defaultContent)
  const [draft, setDraft] = useState<I_IntroContent>(defaultContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [activeEditor, setActiveEditor] = useState<keyof I_IntroContent | null>(null)

  useEffect(() => {
    const storedContent = readStoredContent()
    setContent(storedContent)
    setDraft(storedContent)
    setIsHydrated(true)
  }, [])

  const previewContent = useMemo(() => (isHydrated ? content : defaultContent), [content, isHydrated])

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
    const nextContent = normalizeContent(draft)
    window.localStorage.setItem(INTRO_CONTENT_STORAGE_KEY, JSON.stringify(nextContent))
    setContent(nextContent)
    setDraft(nextContent)
    setActiveEditor(null)
    setIsEditing(false)
    successToast('Introducción actualizada correctamente')
  }

  const updateDraft = (field: keyof I_IntroContent, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const renderPreviewBlock = (html: string, sx: Record<string, unknown>) => (
    <Box
      sx={{
        color: C.navy,
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        '& .htmlParsedContent': {
          whiteSpace: 'inherit !important',
          overflowWrap: 'inherit',
          wordBreak: 'inherit',
        },
        '& p': { m: 0 },
        '& ul, & ol': { my: 0, pl: 3 },
        '& a': { color: C.blue },
        '& blockquote': {
          borderLeft: `4px solid ${C.lightBlue}`,
          m: 0,
          pl: 2,
          fontStyle: 'italic',
        },
        ...sx,
      }}
    >
      <HTMLParser htmlContent={html} />
    </Box>
  )

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 220px)',
        bgcolor: 'common.white',
        overflow: 'hidden',
        px: { xs: 3, md: 8 },
        py: { xs: 4, md: 5 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box />
        <Stack direction="row" alignItems="center" spacing={1.25}>
          {canEdit && !isEditing && (
            <Button size="small" bgcolor="purple" onClick={startEditing}>
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

      <Box sx={{ maxWidth: 820, pt: { xs: 6, md: 16 } }}>
        {isEditing ? (
          <>
            <Box className={`intro-inline-editor title-editor ${activeEditor === 'title' ? 'is-active' : ''}`} sx={{ mb: 4 }}>
              <ReactQuill
                theme="snow"
                value={draft.title}
                onChange={(value) => updateDraft('title', value)}
                modules={editorModules}
                formats={editorFormats}
                onFocus={() => setActiveEditor('title')}
                onBlur={() => setActiveEditor(current => (current === 'title' ? null : current))}
              />
            </Box>

            <Box className={`intro-inline-editor body-editor ${activeEditor === 'paragraph1' ? 'is-active' : ''}`} sx={{ mb: 4 }}>
              <ReactQuill
                theme="snow"
                value={draft.paragraph1}
                onChange={(value) => updateDraft('paragraph1', value)}
                modules={editorModules}
                formats={editorFormats}
                onFocus={() => setActiveEditor('paragraph1')}
                onBlur={() => setActiveEditor(current => (current === 'paragraph1' ? null : current))}
              />
            </Box>

            <Box className={`intro-inline-editor body-editor ${activeEditor === 'paragraph2' ? 'is-active' : ''}`}>
              <ReactQuill
                theme="snow"
                value={draft.paragraph2}
                onChange={(value) => updateDraft('paragraph2', value)}
                modules={editorModules}
                formats={editorFormats}
                onFocus={() => setActiveEditor('paragraph2')}
                onBlur={() => setActiveEditor(current => (current === 'paragraph2' ? null : current))}
              />
            </Box>
          </>
        ) : (
          <>
            {renderPreviewBlock(previewContent.title, {
              fontSize: { xs: 36, md: 52 },
              fontWeight: 800,
              lineHeight: 1.05,
              mb: 4,
            })}

            {renderPreviewBlock(previewContent.paragraph1, {
              fontSize: { xs: 18, md: 24 },
              lineHeight: 1.48,
              mb: 4,
            })}

            {renderPreviewBlock(previewContent.paragraph2, {
              fontSize: { xs: 18, md: 24 },
              lineHeight: 1.48,
            })}
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 8, md: 12 } }}>
        <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
      </Box>

      <style jsx global>{`
        .intro-inline-editor {
          position: relative;
        }

        .intro-inline-editor .ql-toolbar.ql-snow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
          border: 1px solid rgba(4, 21, 82, 0.12);
          background: rgba(195, 217, 255, 0.22);
          border-radius: 14px;
          padding: 10px 12px;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-12px);
          transition:
            opacity 0.18s ease,
            transform 0.18s ease;
        }

        .intro-inline-editor.is-active .ql-toolbar.ql-snow {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(calc(-100% - 12px));
        }

        .intro-inline-editor .ql-container.ql-snow {
          border: 0;
          font-family: inherit;
        }

        .intro-inline-editor .ql-editor {
          color: ${C.navy};
          padding: 0;
          white-space: normal;
        }

        .intro-inline-editor .ql-editor p {
          margin: 0;
        }

        .intro-inline-editor .ql-editor ul,
        .intro-inline-editor .ql-editor ol {
          padding-left: 1.5rem;
        }

        .intro-inline-editor .ql-editor blockquote {
          border-left: 4px solid ${C.lightBlue};
          padding-left: 16px;
        }

        .title-editor .ql-editor {
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 800;
          line-height: 1.05;
        }

        .body-editor .ql-editor {
          font-size: clamp(18px, 2.2vw, 24px);
          line-height: 1.48;
        }
      `}</style>
    </Box>
  )
}

export { IntroduccionTab }
