import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet } from '@/shared/data/axios'
import { apiUrl } from '@/config'
import { ANIO_ORDER } from '@/mta_reports_v2/constants'
import type { I_RawEscuelaDatos } from '@/mta_reports_v2/types'

const useEscuelaReporteAurora = (escuelaId: number | null) => {
  const [rawData, setRawData] = useState<I_RawEscuelaDatos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()

  useEffect(() => {
    if (!escuelaId) return
    let alive = true
    setLoading(true)
    setError(null)
    axiosGet<I_RawEscuelaDatos>({
      url: apiUrl(`/reportes-aurora/escuela/${escuelaId}/`),
      requestSetup: authResources,
      options: {},
    })
      .then(res => { if (alive) setRawData(res) })
      .catch(err => { if (alive) setError(err?.message ?? 'Error al cargar') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [escuelaId, authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const tomas = useMemo(
    () => (rawData ? [...new Set(rawData.datos.map(d => d.toma))].sort() : []),
    [rawData],
  )

  const uniqueFrom = useCallback(
    <K extends 'materia' | 'anio'>(key: K, predicate: (d: I_RawEscuelaDatos['datos'][number]) => boolean) => {
      if (!rawData) return [] as string[]
      return [...new Set(rawData.datos.filter(predicate).map(d => d[key]))]
    },
    [rawData],
  )

  const getMaterias = useCallback(
    (toma: string) => uniqueFrom('materia', d => d.toma === toma),
    [uniqueFrom],
  )

  const getAnios = useCallback((toma: string, materia: string): string[] => {
    const available = new Set(uniqueFrom('anio', d => d.toma === toma && d.materia === materia))
    return ANIO_ORDER.filter(a => available.has(a))
  }, [uniqueFrom])

  const getDivisiones = useCallback((materia: string, anio: string, toma: string): string[] => {
    if (!rawData) return []
    const combo = rawData.datos.find(d => d.materia === materia && d.anio === anio && d.toma === toma)
    if (!combo) return []
    const divs = [...new Set(combo.estudiantes_mi.map(s => s.division).filter(Boolean))] as string[]
    return divs.length > 1 ? ['Todas', ...divs] : divs
  }, [rawData])

  return { rawData, loading, error, tomas, getMaterias, getAnios, getDivisiones }
}

export { useEscuelaReporteAurora }
