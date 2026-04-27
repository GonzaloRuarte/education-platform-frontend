import { useCallback, useEffect, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import { axiosGet, axiosPost } from '@/shared/data/axios'
import { dynamicNavigationHook } from '@/shared/hooks'
import { I_PaginatedResponse } from '@/shared/data/types'
import { apiUrl } from '@/config'
import { getMockEscuelaDatos } from '@/mta_reports_v2/mock_data'
import { USE_REACT_REPORTS_MOCK, ANIO_ORDER } from '@/mta_reports_v2/constants'
import type {
  I_FiltrosReact,
  I_ReporteReactData,
  I_ItemReact,
  I_BoxplotReact,
  I_RawPregunta,
  I_RawTodos,
  I_RawReporteReact,
  I_RawComboDato,
  I_RawEscuelaDatos,
  I_SemaforoBandas,
  I_ScatterPoint,
  I_TablaRow,
  I_EscuelaListItem,
} from '@/mta_reports_v2/types'
import type { T_ListServiceHook } from '@/shared/types'

// ─── Transformation helpers ───────────────────────────────────────────────────

function _r1(x: number): number {
  return Math.round(x * 10) / 10
}

function _mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

function _quantile(sorted: number[], p: number): number {
  const pos = (sorted.length - 1) * p
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return lo === hi ? sorted[lo] : (sorted[lo] + sorted[hi]) / 2
}

function _boxplot(scores: number[]): I_BoxplotReact {
  if (!scores.length) return { min: 0, q1: 0, md: 0, q3: 0, max: 0, av: 0 }
  const s = [...scores].sort((a, b) => a - b)
  return {
    min: _r1(s[0]),
    q1:  _r1(_quantile(s, 0.25)),
    md:  _r1(_quantile(s, 0.5)),
    q3:  _r1(_quantile(s, 0.75)),
    max: _r1(s[s.length - 1]),
    av:  _r1(_mean(scores)),
  }
}

function _studentScores(
  qids: Set<string>,
  estudiantes: Array<Record<string, boolean>>,
): number[] {
  const out: number[] = []
  for (const student of estudiantes) {
    const answered = [...qids].filter(k => k in student)
    if (!answered.length) continue
    out.push(answered.filter(k => student[k]).length / answered.length * 100)
  }
  return out
}

function _todosRate(
  qids: Set<string>,
  pp: Record<string, { n_correctas: number; n_total: number }>,
): number {
  let sumC = 0, sumT = 0
  for (const qid of qids) {
    const entry = pp[qid]
    if (entry) { sumC += entry.n_correctas; sumT += entry.n_total }
  }
  return sumT > 0 ? _r1(sumC / sumT * 100) : 0
}

function _groupBy(
  field: 'contenido' | 'competencia',
  preguntas: I_RawPregunta[],
  pp: Record<string, { n_correctas: number; n_total: number }>,
  estudiantes: Array<Record<string, boolean>>,
): I_ItemReact[] {
  const groups: Record<string, Set<string>> = {}
  for (const q of preguntas) {
    if (q.es_pisa) continue
    const tag = q[field]
    if (!tag) continue
    if (!groups[tag]) groups[tag] = new Set()
    groups[tag].add(String(q.id))
  }
  return Object.entries(groups).map(([tag, qids]) => ({
    n: tag,
    mi: _r1(_mean(_studentScores(qids, estudiantes))),
    t:  _todosRate(qids, pp),
  }))
}

function _transformReporteReact(raw: I_RawReporteReact, materia: string): I_ReporteReactData {
  const { preguntas, estudiantes_mi, todos, colegio, colegio_meta_id } = raw
  const pp = todos.por_pregunta

  const nonPisaIds = new Set(preguntas.filter(q => !q.es_pisa).map(q => String(q.id)))
  const pisaIds    = new Set(preguntas.filter(q =>  q.es_pisa).map(q => String(q.id)))
  const allIds     = new Set(preguntas.map(q => String(q.id)))

  const scores40   = _studentScores(nonPisaIds, estudiantes_mi)
  const scoresPISA = _studentScores(pisaIds,    estudiantes_mi)
  const scores45   = _studentScores(allIds,     estudiantes_mi)

  const contenido  = _groupBy('contenido',  preguntas, pp, estudiantes_mi)
  const competencia = _groupBy('competencia', preguntas, pp, estudiantes_mi)
  const bpMi    = _boxplot(scores45)
  const bpTodos = _boxplot(todos.puntajes)

  const isLenguaje = materia === 'Prácticas del Lenguaje'

  return {
    colegio,
    general: {
      muestra: {
        mi:   estudiantes_mi.length,
        todos: todos.puntajes.length,
      },
      pct40:  { mi: _r1(_mean(scores40)),   todos: _todosRate(nonPisaIds, pp) },
      pctPISA:{ mi: _r1(_mean(scoresPISA)), todos: _todosRate(pisaIds,    pp) },
      pct45:  { mi: _r1(_mean(scores45)),   todos: _todosRate(allIds,     pp) },
    },
    por_colegio: {
      bars: todos.por_escuela.map(e => ({ id: e.id, p: e.pct })),
      miId: colegio_meta_id,
    },
    detalle: {
      contenido:  isLenguaje ? [] : contenido,
      competencia: isLenguaje ? [] : competencia,
      boxplotMi:    bpMi,
      boxplotTodos: bpTodos,
      ...(isLenguaje && {
        lenComp: competencia,
        lenCont: contenido,
        boxplotMiLenguaje:    bpMi,
        boxplotTodosLenguaje: bpTodos,
      }),
    },
  }
}

// ─── All-data hook (one fetch, frontend filtering) ───────────────────────────

const useEscuelaReporteReact = (escuelaId: number | null) => {
  const [rawData, setRawData] = useState<I_RawEscuelaDatos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()

  useEffect(() => {
    if (USE_REACT_REPORTS_MOCK) {
      setRawData(getMockEscuelaDatos())
      setLoading(false)
      setError(null)
      return
    }
    if (!escuelaId) return
    let alive = true
    setLoading(true)
    setError(null)
    axiosGet<I_RawEscuelaDatos>({
      url: apiUrl(`/reportes/escuela/${escuelaId}/`),
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

  const getReporte = useCallback((filtros: I_FiltrosReact): I_ReporteReactData | null => {
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

    return _transformReporteReact(
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
  }, [rawData]) // eslint-disable-line react-hooks/exhaustive-deps

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

// ─── School list + cache-bust hooks ──────────────────────────────────────────

const useEscuelaReporteReactList = () => {
  const [data, setData] = useState<I_EscuelaListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()

  useEffect(() => {
    if (USE_REACT_REPORTS_MOCK) {
      const mockData = getMockEscuelaDatos()
      const tomas = [...new Set(mockData.datos.map(d => d.toma))].sort()
      setData([{
        id: 1,
        nombre: mockData.colegio,
        meta_id: mockData.colegio_meta_id,
        tomas,
        ultima_toma: tomas[tomas.length - 1] ?? null,
      }])
      setLoading(false)
      setError(null)
      return
    }
    let alive = true
    setLoading(true)
    axiosGet<I_EscuelaListItem[]>({
      url: apiUrl('/reportes/escuela/'),
      requestSetup: authResources,
      options: {},
    })
      .then(res => { if (alive) setData(res) })
      .catch(err => { if (alive) setError(err?.message ?? 'Error al cargar') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

const useEscuelaReporteReactListForPage: T_ListServiceHook<I_PaginatedResponse<I_EscuelaListItem>> = () => {
  const { data, loading: isLoading } = useEscuelaReporteReactList()
  return {
    data: data ? { results: data, count: data.length, next: '', previous: '' } : undefined,
    isLoading,
    reload: () => {},
  }
}

const useBustCacheEscuela = () => {
  const [bustingId, setBustingId] = useState<number | null>(null)
  const authResources = useAuthResources()

  const bust = async (schoolId: number): Promise<void> => {
    setBustingId(schoolId)
    try {
      await axiosPost<Record<string, never>, { ok: boolean }>({
        url: apiUrl(`/reportes/escuela/${schoolId}/bust-cache/`),
        requestSetup: authResources,
        data: {},
        options: {},
      })
    } finally {
      setBustingId(null)
    }
  }

  return { bust, bustingId }
}

const useNavigateToEscuelaReporte = dynamicNavigationHook(
  '/dashboard/reportes_react/escuela/{escuelaId:number}'
)

export {
  useEscuelaReporteReact,
  useEscuelaReporteReactList,
  useEscuelaReporteReactListForPage,
  useBustCacheEscuela,
  useNavigateToEscuelaReporte,
}
