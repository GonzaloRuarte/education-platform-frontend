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

interface I_PruebasContent {
  title: string
  body: string
}

interface PruebasTabProps {
  schoolId: number
}

const defaultContent: I_PruebasContent = {
  title: '<p>Las pruebas</p>',
  body:
    '<ul>' +
    '<li>Conformadas por <strong>45</strong> ejercicios de respuesta de selección múltiple de cuatro distractores entre los que siempre uno solo es correcto.</li>' +
    '<li>Son de aplicación virtual.</li>' +
    '<li>Los estudiantes disponen de 80 minutos para completarlas.</li>' +
    '<li>Los resultados se presentan:' +
    '<ul>' +
    '<li>por años y por materias,</li>' +
    '<li>por sectores de contenidos y competencias en cada materia,</li>' +
    '<li>por secciones de cada curso y de cada estudiante.</li>' +
    '</ul>' +
    '</li>' +
    '</ul>',
}

const isEffectivelyEmpty = (html: string) => html.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0

const normalizeContent = (content: I_PruebasContent): I_PruebasContent => ({
  title: isEffectivelyEmpty(content.title) ? defaultContent.title : content.title,
  body: isEffectivelyEmpty(content.body) ? defaultContent.body : content.body,
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

const PruebasTab = ({ schoolId }: PruebasTabProps) => {
  const authResources = useAuthResources()
  const canEdit = useHasCapabilities(['manage_reports'])
  const [content, setContent] = useState<I_PruebasContent>(defaultContent)
  const [draft, setDraft] = useState<I_PruebasContent>(defaultContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeEditor, setActiveEditor] = useState<keyof I_PruebasContent | null>(null)

  useEffect(() => {
    let alive = true

    setIsLoading(true)
    axiosGet<I_PruebasContent>({
      url: apiUrl(`/reportes/escuela/${schoolId}/pruebas-content/`),
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
      const savedContent = await axiosPatch<I_PruebasContent, I_PruebasContent>({
        url: apiUrl(`/reportes/escuela/${schoolId}/pruebas-content/`),
        requestSetup: authResources,
        options: {},
        data: nextContent,
      })
      const normalizedSavedContent = normalizeContent(savedContent)
      setContent(normalizedSavedContent)
      setDraft(normalizedSavedContent)
      setActiveEditor(null)
      setIsEditing(false)
      successToast('Sección "Las pruebas" actualizada correctamente')
    } catch (error) {
      errorToast(error instanceof Error ? error.message : 'No se pudo guardar la sección')
    } finally {
      setIsSaving(false)
    }
  }

  const updateDraft = (field: keyof I_PruebasContent, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const renderEditorBlock = (field: keyof I_PruebasContent, className: string, sx: Record<string, unknown>) => (
    <Box
      className={`pruebas-inline-editor ${className} ${isEditing && activeEditor === field ? 'is-active' : ''} ${!isEditing ? 'is-readonly' : ''}`}
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
          <Typography sx={{ color: C.tm }}>Cargando...</Typography>
        ) : (
          <>
            {renderEditorBlock('title', 'title-editor', { mb: 4 })}
            {renderEditorBlock('body', 'body-editor', {})}
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 8, md: 12 } }}>
        <LogoAustral width={australLogoSize.w} height={australLogoSize.h} />
      </Box>

      <style jsx global>{`
        .pruebas-inline-editor {
          position: relative;
        }

        .pruebas-inline-editor .ql-toolbar.ql-snow {
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

        .pruebas-inline-editor.is-active .ql-toolbar.ql-snow {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(calc(-100% - 12px));
        }

        .pruebas-inline-editor .ql-container.ql-snow {
          border: 0;
          font-family: inherit;
        }

        .pruebas-inline-editor .ql-editor {
          color: ${C.navy};
          padding: 0;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .pruebas-inline-editor .ql-editor p {
          margin: 0;
        }

        .pruebas-inline-editor .ql-editor ul,
        .pruebas-inline-editor .ql-editor ol {
          padding-left: 1.5rem;
          margin: 0;
        }

        .pruebas-inline-editor .ql-editor li {
          margin-bottom: 0.6em;
        }

        .pruebas-inline-editor .ql-editor blockquote {
          border-left: 4px solid ${C.lightBlue};
          padding-left: 16px;
        }

        .pruebas-inline-editor.is-readonly .ql-container.ql-snow {
          pointer-events: none;
        }

        .pruebas-inline-editor.is-readonly .ql-editor {
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

export { PruebasTab }
