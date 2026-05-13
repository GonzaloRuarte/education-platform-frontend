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

// ─── Visualización de Reporte Aurora ──────────────────────────────────────────

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
  min: number       // whisker inferior (q1 - 1.5*IQR acotado al mínimo de los datos)
  q1: number
  md: number
  q3: number
  max: number       // whisker superior (q3 + 1.5*IQR acotado al máximo de los datos)
  av: number
  outliers?: number[]
  rawMin?: number   // mínimo real de los datos (para tooltip)
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
  estudiantes: Array<{
    id: string
    score: number
    contenido: I_ItemAurora[]
    competencia: I_ItemAurora[]
    lenCont?: I_ItemAurora[]
    lenComp?: I_ItemAurora[]
  }>
}

// ─── Tipos crudos de respuesta del backend ────────────────────────────────────

interface I_RawPregunta {
  id: number
  orden: number
  competencia: string
  contenido: string
  es_pisa: boolean
  // String con tags separados por ';'. Para Lenguaje, las microcompetencias
  // vienen como tags con prefijo 'microcompetencia-' (ver groupByMicrocompetencia).
  tags?: string
}

interface I_RawTodos {
  por_pregunta: Record<string, { n_correctas: number; n_total: number }>
  puntajes: number[]
  por_escuela: Array<{ id: string; pct: number; n: number }>
}

interface I_RawEstudianteMi {
  id: string
  division: string | null
  nee?: boolean
  respuestas: Record<string, boolean>
  // Sólo viene seteado en payloads de agrupamiento (backend lo derivó del meta_id
  // de la escuela de origen). Para reportes de escuela queda undefined.
  school?: string | null
}

interface I_RawComboDato {
  materia: string
  anio: string
  toma: string
  preguntas: I_RawPregunta[]
  estudiantes_mi: I_RawEstudianteMi[]
  todos: I_RawTodos
}

interface I_EscuelaMiembro {
  id: string   // matchea estudiante.school y todos.por_escuela[].id
  name: string
}

interface I_RawHistoricoBar {
  toma: string
  pct_mi_colegio: number
  pct_promedio_red: number
  participantes: number
}

interface I_RawHistoricoData {
  por_materia: {
    matematica: I_RawHistoricoBar[]
    lenguaje: I_RawHistoricoBar[]
  }
  por_anio: Record<string, I_RawHistoricoBar[]>
}

interface I_RawEscuelaDatos {
  colegio: string
  colegio_meta_id: string
  datos: I_RawComboDato[]
  // Sólo presente en payloads de agrupamiento. Lista las escuelas miembro para
  // poblar el filtro multi-select de la sidebar y la leyenda por color del scatter.
  escuelas?: I_EscuelaMiembro[]
  report_id?: number | null
  report_status?: T_AuroraReportStatus | null
  // Datos del histórico inlineados en el mismo payload del reporte para evitar
  // un GET extra al abrir el tab "Histórico". Lo computa y persiste el backend
  // al generar el reporte.
  historico?: I_RawHistoricoData
}

// ─── Tipos de estado de UI ───────────────────────────────────────────────────

interface I_SemaforoBandas {
  verde: number
  amarillo: number
  naranja: number
  rojo: number
  total: number
}

interface I_ScatterPoint {
  id: string
  pdl: number
  mat: number
  // Meta_id de la escuela de origen — sólo poblado en agrupamiento. Driver del
  // color por escuela en el scatter.
  school?: string | null
}

interface I_TablaRow {
  id: string
  mat?: number
  len?: number
  // Nombre de la escuela. Sólo se popula en reportes de agrupamiento.
  school?: string
}

type T_AuroraReportStatus = 'draft' | 'published'

interface I_AuroraReportListItem {
  id: number
  // Un reporte apunta a UN sujeto: o una escuela o un agrupamiento (XOR enforce-ado
  // en el backend). Exactamente uno de los pares school/school_name vs
  // grouping/grouping_name viene seteado por fila.
  school: number | null
  school_name: string | null
  school_meta_id: number | null
  grouping: number | null
  grouping_name: string | null
  // Sólo viene seteado (no-null) para reportes de agrupamiento. Lista los nombres
  // de las escuelas miembro para mostrarlos en la columna "Escuela" del listado.
  grouping_school_names: string[] | null
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
  I_RawEstudianteMi,
  I_RawEscuelaDatos,
  I_RawHistoricoBar,
  I_RawHistoricoData,
  I_EscuelaMiembro,
  I_SemaforoBandas,
  I_ScatterPoint,
  I_TablaRow,
  I_AuroraReportListItem,
  T_AuroraReportList,
  I_AuroraReportCreateRequestData,
  T_AuroraReportStatus,
}