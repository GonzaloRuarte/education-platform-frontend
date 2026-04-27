import { I_PaginatedResponse } from '@/shared/data/types'

type T_ReportId = number
interface I_ReportListItem {
  id: T_ReportId
  school: number
  title: string
}
type T_ReportList = I_PaginatedResponse<I_ReportListItem>

interface I_ReportDetail {
  id: T_ReportId
  school: number
  title: string
  power_bi_link: string | URL
}

interface I_ReportCreateRequestData {
  school: number
  title: string
  power_bi_link: string | URL
}

interface I_ReportUpdateRequestData {
  school: number
  title: string
  power_bi_link: string | URL
}

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

// ─── UI state types ──────────────────────────────────────────────────────────

interface I_SemaforoBandas {
  verde: number
  amarillo: number
  naranja: number
  rojo: number
  total: number
}

interface I_ScatterPoint {
  id: number
  pdl: number
  mat: number
}

interface I_TablaRow {
  id: number
  mat?: number
  len?: number
}

interface I_EscuelaListItem {
  id: number
  nombre: string
  meta_id: string
  tomas: string[]
  ultima_toma: string | null
}

export type {
  T_ReportId,
  I_ReportListItem,
  I_ReportDetail,
  I_ReportCreateRequestData,
  I_ReportUpdateRequestData,
  T_ReportList,
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
}