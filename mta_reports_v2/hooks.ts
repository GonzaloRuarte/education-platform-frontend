import { useCallback, useEffect, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_ReportDetail,
  I_ReportUpdateRequestData,
  I_ReportCreateRequestData,
  T_ReportId,
  T_ReportList,
} from '@/mta_reports/types'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, detailHook, listHook, updateHook, batchDeletionHook, dynamicNavigationHook, navigationHook } from '@/shared/hooks'
import pages from '@/pages'
import { reportEditPath } from '@/pages'
import { apiUrl } from '@/config'

const REPORTS_PATH = '/reports'

const useReportList = listHook<T_ReportList>(REPORTS_PATH, axiosGet, useAuthResources)
const useReportListByUserSchool = listHook<T_ReportList>(
  `${REPORTS_PATH}/list-by-user-school`,
  axiosGet,
  useAuthResources,
)



const useReportDetail = detailHook<T_ReportId, I_ReportDetail>(REPORTS_PATH, axiosGet, useAuthResources)

const useReportCreate = creationHook<I_ReportCreateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPost,
  useAuthResources,
)
const useReportUpdate = updateHook<T_ReportId, I_ReportUpdateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPatch,
  useAuthResources,
)
const useReportDelete = deletionHook<T_ReportId>(REPORTS_PATH, axiosDelete, useAuthResources)
const useReportBatchDelete = batchDeletionHook<T_ReportId>(REPORTS_PATH, axiosDelete, useAuthResources)

const useNavigateToReportCreate = navigationHook(pages.D._.reportes._.agregar.path)
const useNavigateToReportEdit = dynamicNavigationHook(reportEditPath)
const useNavigateToReportList = navigationHook(pages.D._.reportes.path)

// ─── React Report visualization ──────────────────────────────────────────────

interface I_FiltrosReact {
  materia: string
  anio: string
  division: string
  toma: string
}

interface I_ItemReact {
  n: string
  mi: number
  t: number
}

interface I_BoxplotReact {
  min: number
  q1: number
  md: number
  q3: number
  max: number
  av: number
}

interface I_ReporteReactData {
  colegio: string
  general: {
    muestra: { mi: number; todos: number }
    pct40: { mi: number; todos: number }
    pctPISA: { mi: number; todos: number }
    pct45: { mi: number; todos: number }
  }
  por_colegio: {
    bars: Array<{ id: string; p: number }>
    miId: string
  }
  detalle: {
    contenido: I_ItemReact[]
    competencia: I_ItemReact[]
    boxplotMi: I_BoxplotReact
    boxplotTodos: I_BoxplotReact
    lenComp?: I_ItemReact[]
    lenCont?: I_ItemReact[]
    boxplotMiLenguaje?: I_BoxplotReact
    boxplotTodosLenguaje?: I_BoxplotReact
  }
}

// ─── Raw backend response types ───────────────────────────────────────────────

interface I_RawPregunta {
  id: number
  orden: number
  competencia: string
  contenido: string
  es_pisa: boolean
}

interface I_RawTodos {
  por_pregunta: Record<string, { n_correctas: number; n_total: number }>
  puntajes: number[]
  por_escuela: Array<{ id: string; pct: number; n: number }>
}

interface I_RawReporteReact {
  colegio: string
  colegio_meta_id: string
  preguntas: I_RawPregunta[]
  estudiantes_mi: Array<Record<string, boolean>>
  todos: I_RawTodos
}

// Raw shape from GET /reportes/escuela/{school_id}/
interface I_RawComboDato {
  materia: string
  anio: string
  toma: string
  preguntas: I_RawPregunta[]
  estudiantes_mi: Array<{ division: string | null; respuestas: Record<string, boolean> }>
  todos: I_RawTodos
}

interface I_RawEscuelaDatos {
  colegio: string
  colegio_meta_id: string
  datos: I_RawComboDato[]
}

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

// Per-student percentage-correct scores over a subset of question IDs.
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

// Aggregate % correct from todos.por_pregunta for a set of question IDs.
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

// Group non-PISA questions by a tag field and compute mi/t rates.
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

  const ANIO_ORDER = ['3ro', '6to', '9no', '12mo']
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

  return { loading, error, tomas, getMaterias, getAnios, getDivisiones, getReporte }
}

// ─── Filtros disponibles ──────────────────────────────────────────────────────

const useFiltrosReact = () => {
  const [tomas, setTomas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const authResources = useAuthResources()

  useEffect(() => {
    axiosGet<{ tomas: string[] }>({
      url: apiUrl('/reportes/meta/filtros/'),
      requestSetup: authResources,
      options: {},
    })
      .then(res => setTomas(res.tomas))
      .finally(() => setLoading(false))
  }, [authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  return { tomas, loading }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

const useReporteReact = (escuelaId: number | null, filtros: I_FiltrosReact) => {
  const [data, setData] = useState<I_ReporteReactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()
  const { materia, anio, division, toma } = filtros

  const fetchData = useCallback(async () => {
    if (!escuelaId) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ materia, anio, division, toma })
      const raw = await axiosGet<I_RawReporteReact>({
        url: `${apiUrl(`/reportes/meta/${escuelaId}/`)}?${params}`,
        requestSetup: authResources,
        options: {},
      })
      setData(_transformReporteReact(raw, materia))
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }, [escuelaId, materia, anio, division, toma, authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ─── School list + cache-bust hooks ──────────────────────────────────────────

interface I_EscuelaListItem {
  id: number
  nombre: string
  meta_id: string
  tomas: string[]
  ultima_toma: string | null
}

const useEscuelaReporteReactList = () => {
  const [data, setData] = useState<I_EscuelaListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()

  useEffect(() => {
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
  '/dashboard/reportes_meta/escuela/{escuelaId:number}'
)

export type { I_FiltrosReact, I_ReporteReactData, I_ItemReact, I_BoxplotReact, I_EscuelaListItem }
export { useReportCreate, useReportList, useReportListByUserSchool, useReportDetail, useReportUpdate, useReportDelete, useReportBatchDelete, useNavigateToReportCreate, useNavigateToReportEdit, useNavigateToReportList, useReporteReact, useFiltrosReact, useEscuelaReporteReact, useEscuelaReporteReactList, useBustCacheEscuela, useNavigateToEscuelaReporte, REPORTS_PATH }