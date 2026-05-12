'use client'

import { useEffect, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet } from '@/shared/data/axios'
import { apiUrl } from '@/config'

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

export const useHistoricoEscuela = (schoolId: number | null) => {
  const [data, setData] = useState<I_HistoricoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()

  useEffect(() => {
    if (schoolId === null) return
    let alive = true
    setLoading(true)
    setError(null)
    axiosGet<I_HistoricoData>({
      url: apiUrl(`/reportes-aurora/escuela/${schoolId}/historico/`),
      requestSetup: authResources,
      options: {},
    })
      .then(res => { if (alive) setData(res) })
      .catch(err => { if (alive) setError(err?.message ?? 'Error al cargar') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [schoolId, authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}
