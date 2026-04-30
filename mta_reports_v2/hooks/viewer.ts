import { useCallback, useEffect, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet } from '@/shared/data/axios'
import { apiUrl } from '@/config'
import { ANIO_ORDER } from '@/mta_reports_v2/constants'
import { transformReporteAurora } from './transform'
import type {
  I_FiltrosAurora,
  I_RawComboDato,
  I_RawEscuelaDatos,
  I_ReporteAuroraData,
  I_ScatterPoint,
  I_SemaforoBandas,
  I_TablaRow,
} from '@/mta_reports_v2/types'

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

  const tomas = rawData
    ? [...new Set(rawData.datos.map(d => d.toma))].sort()
    : []

  const getMaterias = useCallback((toma: string): string[] => {
    if (!rawData) return []
    return [...new Set(rawData.datos.filter(d => d.toma === toma).map(d => d.materia))]
  }, [rawData])

  const getAnios = useCallback((toma: string, materia: string): string[] => {
    if (!rawData) return []
    const available = new Set(
      rawData.datos.filter(d => d.toma === toma && d.materia === materia).map(d => d.anio)
    )
    return ANIO_ORDER.filter(a => available.has(a))
  }, [rawData]) // eslint-disable-line react-hooks/exhaustive-deps

  const getDivisiones = useCallback((materia: string, anio: string, toma: string): string[] => {
    if (!rawData) return []
    const combo = rawData.datos.find(d => d.materia === materia && d.anio === anio && d.toma === toma)
    if (!combo) return []
    const divs = [...new Set(combo.estudiantes_mi.map(s => s.division).filter(Boolean))] as string[]
    return divs.length > 1 ? ['Todas', ...divs] : divs
  }, [rawData])

  const getReporte = useCallback((filtros: I_FiltrosAurora): I_ReporteAuroraData | null => {
    if (!rawData) return null
    const combo = rawData.datos.find(
      d => d.materia === filtros.materia && d.anio === filtros.anio && d.toma === filtros.toma
    )
    if (!combo) return null

    const estudiantes_mi: Array<Record<string, boolean>> =
      filtros.division.toLowerCase() === 'todas'
        ? combo.estudiantes_mi.map(s => s.respuestas)
        : combo.estudiantes_mi
            .filter(s => !s.division || s.division === filtros.division)
            .map(s => s.respuestas)

    return transformReporteAurora(
      {
        colegio: rawData.colegio,
        colegio_meta_id: rawData.colegio_meta_id,
        preguntas: combo.preguntas,
        estudiantes_mi,
        todos: combo.todos,
      },
      filtros.materia,
    )
  }, [rawData])

  const _filterEstudiantes = (combo: I_RawComboDato, division: string) =>
    division.toLowerCase() === 'todas'
      ? combo.estudiantes_mi
      : combo.estudiantes_mi.filter(s => !s.division || s.division === division)

  const _findCombo = (materia: string, anio: string, toma: string): I_RawComboDato | undefined =>
    rawData?.datos.find(d => d.materia === materia && d.anio === anio && d.toma === toma)

  const _calcPercentage = (answered: string[], responses: Record<string, boolean>): number => {
    if (!answered.length) return 0
    const correct = answered.filter(k => responses[k]).length
    return Math.round(correct / answered.length * 100)
  }

  const _bandForCount = (correct: number): keyof I_SemaforoBandas => {
    if (correct >= 31) return 'verde'
    if (correct >= 20) return 'amarillo'
    if (correct >= 11) return 'naranja'
    return 'rojo'
  }

  const getSemaforoBandas = useCallback((materia: string, division: string, toma: string): Record<string, I_SemaforoBandas> => {
    if (!rawData) return {}
    const result: Record<string, I_SemaforoBandas> = {}
    for (const anio of ANIO_ORDER) {
      const combo = _findCombo(materia, anio, toma)
      if (!combo) continue
      const estudiantes = _filterEstudiantes(combo, division)
      const nonPisaIds = combo.preguntas.filter(q => !q.es_pisa).map(q => String(q.id))
      const bands = { verde: 0, amarillo: 0, naranja: 0, rojo: 0 }
      for (const est of estudiantes) {
        const correct = nonPisaIds.filter(k => k in est.respuestas && est.respuestas[k]).length
        const band = _bandForCount(correct)
        bands[band]++
      }
      result[anio] = { ...bands, total: Object.values(bands).reduce((s, v) => s + v, 0) }
    }
    return result
  }, [rawData])

  const getScatterPoints = useCallback((anio: string, division: string, toma: string): I_ScatterPoint[] => {
    if (!rawData) return []
    const lenCombo = _findCombo('Prácticas del Lenguaje', anio, toma)
    const matCombo = _findCombo('Matemática', anio, toma)
    if (!lenCombo || !matCombo) return []
    const lenStudents = _filterEstudiantes(lenCombo, division)
    const matStudents = _filterEstudiantes(matCombo, division)
    const lenIds = lenCombo.preguntas.map(q => String(q.id))
    const matIds = matCombo.preguntas.map(q => String(q.id))
    const count = Math.min(lenStudents.length, matStudents.length)
    return Array.from({ length: count }, (_, i) => {
      const lenR = lenStudents[i].respuestas
      const matR = matStudents[i].respuestas
      const lenAns = lenIds.filter(k => k in lenR)
      const matAns = matIds.filter(k => k in matR)
      return {
        id: i + 1,
        pdl: _calcPercentage(lenAns, lenR),
        mat: _calcPercentage(matAns, matR),
      }
    })
  }, [rawData]) // eslint-disable-line react-hooks/exhaustive-deps

  const getTablaData = useCallback((anio: string, division: string, toma: string): I_TablaRow[] => {
    if (!rawData) return []
    const MATS = [
      { materia: 'Matemática', key: 'mat' as const },
      { materia: 'Prácticas del Lenguaje', key: 'len' as const },
    ]
    const infos = MATS.flatMap(({ materia, key }) => {
      const combo = _findCombo(materia, anio, toma)
      if (!combo) return []
      const qids = combo.preguntas.map(q => String(q.id))
      return [{ students: _filterEstudiantes(combo, division), qids, key }]
    })
    const maxLen = Math.max(...infos.map(m => m.students.length), 0)
    return Array.from({ length: maxLen }, (_, i) => {
      const row: I_TablaRow = { id: i + 1 }
      for (const { students, qids, key } of infos) {
        if (i >= students.length) continue
        const answered = qids.filter(k => k in students[i].respuestas)
        row[key] = _calcPercentage(answered, students[i].respuestas)
      }
      return row
    })
  }, [rawData]) // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, error, tomas, getMaterias, getAnios, getDivisiones, getReporte, getSemaforoBandas, getScatterPoints, getTablaData }
}

export { useEscuelaReporteAurora }
