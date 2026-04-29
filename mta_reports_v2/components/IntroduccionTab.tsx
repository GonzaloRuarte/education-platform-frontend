'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Stack, Typography } from '@mui/material'
import { useAuthResources, useHasCapabilities } from '@/mta_auth/hooks'
import { apiUrl } from '@/config'
import { COLORS } from '@/mta_reports_v2/constants'
import { axiosGet, axiosPatch } from '@/shared/data/axios'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import Button from '@/shared/components/Button'
import { errorToast, successToast } from '@/shared/toasts'
import { ImageSize } from '@/shared/utils'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(async () => (await import('react-quill-new')).default, { ssr: false })

const C = COLORS
const metaLogoSize = new ImageSize(257, 73, { scale: 0.74 })
const australLogoSize = new ImageSize(412, 72, { scale: 0.7 })

interface I_IntroContent {
  title: string
  paragraph1: string
  paragraph2: string
}

interface IntroduccionTabProps {
  schoolId: number
}

const defaultContent: I_IntroContent = {
  title: '<p>Introducción</p>',
  paragraph1:
    '<p>META (Medición y Evaluación para la Transformación de los Aprendizajes) es un programa de la Escuela de Educación de la Universidad Austral, orientado a medir y evaluar los desempeños de aprendizaje escolar en Matemática y Prácticas del Lenguaje, con el objetivo de contribuir a la mejora de la calidad y equidad educativa.</p>',
  paragraph2:
    '<p>A través de evaluaciones estandarizadas que se realizan dos veces al año, META brinda información precisa sobre el desarrollo de los estudiantes al finalizar el primer y segundo ciclo del nivel primario (3° y 6° grado), así como al término del ciclo básico y de la orientación del nivel secundario (9° y 12° año).</p>',
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

const IntroduccionTab = ({ schoolId }: IntroduccionTabProps) => {
  const authResources = useAuthResources()
  const canEdit = useHasCapabilities(['manage_reports'])
  const [content, setContent] = useState<I_IntroContent>(defaultContent)
  const [draft, setDraft] = useState<I_IntroContent>(defaultContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeEditor, setActiveEditor] = useState<keyof I_IntroContent | null>(null)

  useEffect(() => {
    let alive = true

    setIsLoading(true)
    axiosGet<I_IntroContent>({
      url: apiUrl(`/reportes/escuela/${schoolId}/intro-content/`),
      requestSetup: authResources,
      options: {},
    })
      .then(response => {
        if (!alive) return
        const nextContent = normalizeContent(response)
        setContent(nextContent)
        setDraft(nextContent)
      })
      .catch(error => {
        if (!alive) return
        setContent(defaultContent)
        setDraft(defaultContent)
        errorToast(error.message)
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [authResources.accessToken, schoolId])

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

  const saveEditing = async () => {
    const nextContent = normalizeContent(draft)

    try {
      setIsSaving(true)
      const savedContent = await axiosPatch<I_IntroContent, I_IntroContent>({
        url: apiUrl(`/reportes/escuela/${schoolId}/intro-content/`),
        requestSetup: authResources,
        options: {},
        data: nextContent,
      })
      const normalizedSavedContent = normalizeContent(savedContent)
      setContent(normalizedSavedContent)
      setDraft(normalizedSavedContent)
      setActiveEditor(null)
      setIsEditing(false)
      successToast('Introducción actualizada correctamente')
    } catch (error) {
      errorToast(error instanceof Error ? error.message : 'No se pudo guardar la introducción')
    } finally {
      setIsSaving(false)
    }
  }

  const updateDraft = (field: keyof I_IntroContent, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const renderEditorBlock = (field: keyof I_IntroContent, className: string, sx: Record<string, unknown>) => (
    <Box
      className={`intro-inline-editor ${className} ${isEditing && activeEditor === field ? 'is-active' : ''} ${!isEditing ? 'is-readonly' : ''}`}
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
        bgcolor: 'common.white',
        overflow: 'hidden',
        px: { xs: 3, md: 8 },
        py: { xs: 4, md: 5 },
      }}
    >
      <Stack direction="row" justifyContent="flex-end" alignItems="flex-start" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          {canEdit && !isEditing && (
            <Button size="small" bgcolor="purple" onClick={startEditing} disabled={isLoading}>
              Editar
            </Button>
          )}
          {canEdit && isEditing && (
            <>
              <Button size="small" bgcolor="green" onClick={saveEditing} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button size="small" variant="outlined" onClick={cancelEditing} disabled={isSaving}>
                Cancelar
              </Button>
            </>
          )}
          <Logo width={metaLogoSize.w} height={metaLogoSize.h} />
        </Stack>
      </Stack>

      <Box sx={{ maxWidth: 820, pt: { xs: 6, md: 16 } }}>
        {isLoading ? (
          <Typography sx={{ color: C.tm }}>Cargando introducción...</Typography>
        ) : (
          <>
            {renderEditorBlock('title', 'title-editor', { mb: 4 })}
            {renderEditorBlock('paragraph1', 'body-editor', { mb: 4 })}
            {renderEditorBlock('paragraph2', 'body-editor', {})}
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
          overflow-wrap: anywhere;
          word-break: break-word;
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

        .intro-inline-editor.is-readonly .ql-container.ql-snow {
          pointer-events: none;
        }

        .intro-inline-editor.is-readonly .ql-editor {
          cursor: default;
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
