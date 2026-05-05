'use client'

import { useEffect, useState } from 'react'
import { useAuthResources, useHasCapabilities } from '@/mta_auth/hooks'
import { apiUrl } from '@/config'
import { axiosGet, axiosPatch } from '@/shared/data/axios'
import { errorToast, successToast } from '@/shared/toasts'

export interface SlideFieldConfig {
  defaultHtml: string
}

export interface UseEditableSlideOptions<F extends string> {
  schoolId: number
  diapositivaId: string
  successMessage: string
  fields: Record<F, SlideFieldConfig>
  initialEditing?: boolean
}

export interface UseEditableSlideResult<F extends string> {
  canEdit: boolean
  isEditing: boolean
  isLoading: boolean
  isSaving: boolean
  content: Record<F, string>
  draft: Record<F, string>
  activeEditor: F | null
  setActiveEditor: (key: F | null) => void
  updateDraft: (field: F, value: string) => void
  startEditing: () => void
  cancelEditing: () => void
  saveEditing: () => Promise<void>
}

const isEffectivelyEmpty = (html: string) =>
  html.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0

export const useEditableSlide = <F extends string>({
  schoolId,
  diapositivaId,
  successMessage,
  fields,
  initialEditing = false,
}: UseEditableSlideOptions<F>): UseEditableSlideResult<F> => {
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
      url: apiUrl(`/reportes-aurora/escuela/${schoolId}/diapositiva/${diapositivaId}/`),
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
        url: apiUrl(`/reportes-aurora/escuela/${schoolId}/diapositiva/${diapositivaId}/`),
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

  return {
    canEdit,
    isEditing,
    isLoading,
    isSaving,
    content,
    draft,
    activeEditor,
    setActiveEditor,
    updateDraft,
    startEditing,
    cancelEditing,
    saveEditing,
  }
}
