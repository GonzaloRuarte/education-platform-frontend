'use client'

import { ReactNode, useEffect, useState } from 'react'
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

type FieldVariant = 'title' | 'body'

interface FieldConfig {
  defaultHtml: string
  variant: FieldVariant
}

interface RenderFieldArgs<F extends string> {
  renderField: (key: F, sx?: Record<string, unknown>) => ReactNode
  isEditing: boolean
}

interface EditableContentSectionProps<F extends string> {
  schoolId: number
  diapositivaId: number
  successMessage: string
  fields: Record<F, FieldConfig>
  initialEditing?: boolean
  children: (args: RenderFieldArgs<F>) => ReactNode
}

const isEffectivelyEmpty = (html: string) =>
  html.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0

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
  const authResources = useAuthResources()
  const canEdit = useHasCapabilities(['manage_reports'])

  const fieldKeys = Object.keys(fields) as F[]

  const buildDefault = (): Record<F, string> =>
    fieldKeys.reduce((acc, key) => {
      acc[key] = fields[key].defaultHtml
      return acc
    }, {} as Record<F, string>)

  const normalize = (raw: Record<F, string>): Record<F, string> =>
    fieldKeys.reduce((acc, key) => {
      const value = raw[key]
      acc[key] = !value || isEffectivelyEmpty(value) ? fields[key].defaultHtml : value
      return acc
    }, {} as Record<F, string>)

  const [content, setContent] = useState<Record<F, string>>(buildDefault)
  const [draft, setDraft] = useState<Record<F, string>>(buildDefault)
  const [isEditing, setIsEditing] = useState(() => Boolean(initialEditing && canEdit))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeEditor, setActiveEditor] = useState<F | null>(null)

  useEffect(() => {
    let alive = true

    setIsLoading(true)
    axiosGet<Record<F, string>>({
      url: apiUrl(`/reportes/escuela/${schoolId}/diapositiva/${diapositivaId}/`),
      requestSetup: authResources,
      options: {},
    })
      .then(response => {
        if (!alive) return
        const next = normalize(response)
        setContent(next)
        setDraft(next)
      })
      .catch(error => {
        if (!alive) return
        const fallback = buildDefault()
        setContent(fallback)
        setDraft(fallback)
        errorToast(error.message)
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authResources.accessToken, schoolId, diapositivaId])

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
    const nextContent = normalize(draft)

    try {
      setIsSaving(true)
      const saved = await axiosPatch<Record<F, string>, Record<F, string>>({
        url: apiUrl(`/reportes/escuela/${schoolId}/diapositiva/${diapositivaId}/`),
        requestSetup: authResources,
        options: {},
        data: nextContent,
      })
      const normalizedSaved = normalize(saved)
      setContent(normalizedSaved)
      setDraft(normalizedSaved)
      setActiveEditor(null)
      setIsEditing(false)
      successToast(successMessage)
    } catch (error) {
      errorToast(error instanceof Error ? error.message : 'No se pudo guardar la diapositiva')
    } finally {
      setIsSaving(false)
    }
  }

  const updateDraft = (field: F, value: string) => {
    setDraft(current => ({ ...current, [field]: value }))
  }

  const renderField = (key: F, sx: Record<string, unknown> = {}) => {
    const variantClass = fields[key].variant === 'title' ? 'title-editor' : 'body-editor'
    return (
      <Box
        className={`editable-section-editor ${variantClass} ${isEditing && activeEditor === key ? 'is-active' : ''} ${!isEditing ? 'is-readonly' : ''}`}
        sx={sx}
      >
        <ReactQuill
          theme="snow"
          value={draft[key]}
          readOnly={!isEditing}
          onChange={(value) => updateDraft(key, value)}
          modules={isEditing ? editorModules : { toolbar: false }}
          formats={editorFormats}
          onFocus={() => {
            if (isEditing) setActiveEditor(key)
          }}
          onBlur={() => {
            if (isEditing) {
              setActiveEditor(current => (current === key ? null : current))
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
              <Button size="small" bgcolor="green" onClick={saveEditing} disabled={isSaving || isLoading}>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button size="small" variant="outlined" onClick={cancelEditing} disabled={isSaving || isLoading}>
                Cancelar
              </Button>
            </>
          )}
          <Logo width={metaLogoSize.w} height={metaLogoSize.h} />
        </Stack>
      </Stack>

      <Box sx={{ pt: { xs: 6, md: 16 } }}>
        {isLoading ? (
          <Typography sx={{ color: C.tm }}>Cargando...</Typography>
        ) : (
          children({ renderField, isEditing })
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 8, md: 12 } }}>
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
          color: ${C.navy};
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

export { EditableContentSection }
