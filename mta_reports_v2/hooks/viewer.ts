import { useCallback, useEffect, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet } from '@/shared/data/axios'
import { apiUrl } from '@/config'
import { ANIO_ORDER } from '@/mta_reports_v2/constants'
import type { I_RawEscuelaDatos } from '@/mta_reports_v2/types'

type T_SubjectKind = 'school' | 'grouping'
interface I_Subject {
  kind: T_SubjectKind
  id: number | null
}

const subjectUrl = (subject: I_Subject, toma: string): string => {
  const segment = subject.kind === 'grouping' ? 'agrupamiento' : 'escuela'
  return `/reportes-aurora/${segment}/${subject.id}/toma/${toma}/`
}

// Hook genérico para el reporte Aurora — el shape del payload (`I_RawEscuelaDatos`)
// es idéntico para escuela y agrupamiento. Lo único que cambia es la URL: el backend
// monta dos endpoints paralelos que devuelven el mismo formato. Mantenemos
// `useEscuelaReporteAurora` como alias retrocompatible.
const useReporteAurora = (subject: I_Subject, toma: string | null) => {
  const [rawData, setRawData] = useState<I_RawEscuelaDatos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()

  useEffect(() => {
    if (!subject.id || !toma) return
    let alive = true
    setLoading(true)
    setError(null)
    axiosGet<I_RawEscuelaDatos>({
      url: apiUrl(subjectUrl(subject, toma)),
      requestSetup: authResources,
      options: {},
    })
      .then(res => { if (alive) setRawData(res) })
      .catch(err => { if (alive) setError(err?.message ?? 'Error al cargar') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [subject.kind, subject.id, toma, authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // El blob ya viene filtrado por toma (una page = una toma), así que el set de materias/años
  // disponibles se calcula sobre el `datos` completo sin volver a filtrar por toma.
  const uniqueFrom = useCallback(
    <K extends 'materia' | 'anio'>(key: K, predicate: (d: I_RawEscuelaDatos['datos'][number]) => boolean) => {
      if (!rawData) return [] as string[]
      return [...new Set(rawData.datos.filter(predicate).map(d => d[key]))]
    },
    [rawData],
  )

  const getMaterias = useCallback(
    () => uniqueFrom('materia', () => true),
    [uniqueFrom],
  )

  const getAnios = useCallback((materia: string): string[] => {
    const available = new Set(uniqueFrom('anio', d =>
      materia === 'Todas' || d.materia === materia,
    ))
    return ANIO_ORDER.filter(a => available.has(a))
  }, [uniqueFrom])

  const getDivisiones = useCallback((materia: string, anio: string): string[] => {
    if (!rawData) return []
    const matching = rawData.datos.filter(d =>
      (materia === 'Todas' || d.materia === materia) &&
      (anio === 'Todos' || d.anio === anio),
    )
    if (matching.length === 0) return []
    const divSet = new Set<string>()
    for (const c of matching) {
      for (const s of c.estudiantes_mi) if (s.division) divSet.add(s.division)
    }
    const divs = [...divSet]
    return divs.length > 1 ? ['Todas', ...divs] : divs
  }, [rawData])

  return { rawData, loading, error, getMaterias, getAnios, getDivisiones }
}

const useEscuelaReporteAurora = (escuelaId: number | null, toma: string | null) =>
  useReporteAurora({ kind: 'school', id: escuelaId }, toma)

const useAgrupamientoReporteAurora = (groupingId: number | null, toma: string | null) =>
  useReporteAurora({ kind: 'grouping', id: groupingId }, toma)

export type { I_Subject, T_SubjectKind }
export { useEscuelaReporteAurora, useAgrupamientoReporteAurora, useReporteAurora }
