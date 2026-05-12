'use client'

import { useEffect, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet } from '@/shared/data/axios'
import { apiUrl } from '@/config'
import type { I_Subject } from './viewer'

export interface I_HistoricoBar {
  toma: string  // p.ej. "1-2024"
  pct_mi_colegio: number
  pct_promedio_red: number
  participantes: number
}

export interface I_HistoricoData {
  por_materia: {
    matematica: I_HistoricoBar[]
    lenguaje: I_HistoricoBar[]
  }
  por_anio: Record<string, I_HistoricoBar[]>
}

const historicoUrl = (subject: I_Subject): string => {
  if (subject.kind === 'grouping') {
    return apiUrl(`/reportes-aurora/agrupamiento/${subject.id}/historico/`)
  }
  return apiUrl(`/reportes-aurora/escuela/${subject.id}/historico/`)
}

export const useHistoricoSubject = (subject: I_Subject) => {
  const [data, setData] = useState<I_HistoricoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()

  useEffect(() => {
    if (subject.id === null) return
    let alive = true
    setLoading(true)
    setError(null)
    axiosGet<I_HistoricoData>({
      url: historicoUrl(subject),
      requestSetup: authResources,
      options: {},
    })
      .then(res => { if (alive) setData(res) })
      .catch(err => { if (alive) setError(err?.message ?? 'Error al cargar') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [subject.kind, subject.id, authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export const useHistoricoEscuela = (schoolId: number | null) =>
  useHistoricoSubject({ kind: 'school', id: schoolId })
