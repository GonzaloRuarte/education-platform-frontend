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

// ─── Aurora Report visualization ──────────────────────────────────────────────

interface I_FiltrosAurora {
  materia: string
  anio: string
  division: string
  toma: string
  neeFilter?: string
}

interface I_ItemAurora {
  n: string
  mi: number
  t: number
}

interface I_BoxplotAurora {
  min: number       // whisker low (q1 - 1.5*IQR clamped to data min)
  q1: number
  md: number
  q3: number
  max: number       // whisker high (q3 + 1.5*IQR clamped to data max)
  av: number
  outliers?: number[]
  rawMin?: number   // actual data min (for tooltip)
  rawMax?: number
}

interface I_ResumenTabData {
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
}

interface I_DetalleTabData {
  contenido: I_ItemAurora[]
  competencia: I_ItemAurora[]
  boxplotMi: I_BoxplotAurora
  boxplotTodos: I_BoxplotAurora
  lenComp?: I_ItemAurora[]
  lenCont?: I_ItemAurora[]
  boxplotMiLenguaje?: I_BoxplotAurora
  boxplotTodosLenguaje?: I_BoxplotAurora
  estudiantes: Array<{ id: number; score: number }>
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

interface I_RawComboDato {
  materia: string
  anio: string
  toma: string
  preguntas: I_RawPregunta[]
  estudiantes_mi: Array<{ division: string | null; nee?: boolean; respuestas: Record<string, boolean> }>
  todos: I_RawTodos
}

interface I_RawEscuelaDatos {
  colegio: string
  colegio_meta_id: string
  datos: I_RawComboDato[]
  report_id?: number | null
  report_status?: T_AuroraReportStatus | null
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

type T_AuroraReportStatus = 'draft' | 'published'

interface I_AuroraReportListItem {
  id: number
  school: number
  school_name: string
  toma: string
  blob_path: string
  last_generated_at: string | null
  status: T_AuroraReportStatus
  published_at: string | null
}
type T_AuroraReportList = I_PaginatedResponse<I_AuroraReportListItem>

interface I_AuroraReportCreateRequestData {
  school: number
  toma: string
}

export type {
  T_ReportId,
  I_ReportListItem,
  I_ReportDetail,
  I_ReportCreateRequestData,
  I_ReportUpdateRequestData,
  T_ReportList,
  I_FiltrosAurora,
  I_ResumenTabData,
  I_DetalleTabData,
  I_ItemAurora,
  I_BoxplotAurora,
  I_RawPregunta,
  I_RawTodos,
  I_RawComboDato,
  I_RawEscuelaDatos,
  I_SemaforoBandas,
  I_ScatterPoint,
  I_TablaRow,
  I_AuroraReportListItem,
  T_AuroraReportList,
  I_AuroraReportCreateRequestData,
  T_AuroraReportStatus,
}