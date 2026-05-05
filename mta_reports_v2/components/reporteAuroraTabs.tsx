'use client'

import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import { COLORS } from '@/mta_reports_v2/constants'
import { IntroduccionTab } from './IntroduccionTab'
import { PortadaTab } from './PortadaTab'
import { PruebasTab } from './PruebasTab'
import { InformeTab } from './InformeTab'
import { MatematicaTab } from './MatematicaTab'
import { LenguajeTab } from './LenguajeTab'
import { PisaTab } from './PisaTab'
import { InstitucionesTab } from './InstitucionesTab'
import { PresentacionResultadosTab } from './PresentacionResultadosTab'
import { CierreTab } from './CierreTab'
import { ResumenTab } from './ResumenTab'
import { HistoricoTab } from './HistoricoTab'
import { DetalleTab } from './DetalleTab'
import { SemaforoTab } from './SemaforoTab'
import { ScatterTab } from './ScatterTab'
import { TablaTab } from './TablaTab'
import { calcResumen } from './calc/ResumenTab'
import { calcDetalle } from './calc/DetalleTab'
import { calcSemaforo, calcSemaforoEstudiantes } from './calc/SemaforoTab'
import { calcScatter } from './calc/ScatterTab'
import { calcTabla } from './calc/TablaTab'
import type { FilterDef } from './ReporteAuroraSidebar'

const C = COLORS

export type TabId =
  | 'cover' | 'intro' | 'informe' | 'matematica' | 'lenguaje' | 'pisa'
  | 'pruebas' | 'instituciones' | 'presentacion' | 'resumen' | 'historico'
  | 'detalleMatematica' | 'detalleLenguaje'
  | 'semaforoLenguaje' | 'semaforoMatematica'
  | 'scatter' | 'tabla' | 'cierre'

export type TabKind = 'static' | 'data'

export type TabRenderCtx = {
  escuelaId: number | null
  editRequested: boolean
  materia: string
  anio: string
  division: string
  toma: string
  divisiones: Array<string>
  setDivision: (v: string) => void
  semaforoAnio: string
  setSemaforoAnio: (s: string) => void
  selectedStudentId: string
  resumenData: ReturnType<typeof calcResumen> | null
  detalleData: ReturnType<typeof calcDetalle> | null
  semaforoBandas: ReturnType<typeof calcSemaforo>
  semaforoEstudiantes: ReturnType<typeof calcSemaforoEstudiantes>
  scatterPoints: ReturnType<typeof calcScatter>
  tablaRows: ReturnType<typeof calcTabla>
}

export type TabFiltersCtx = {
  materias: Array<string>
  divisiones: Array<string>
  anios: Array<string>
  materiaFilter: FilterDef
  anioFilter: FilterDef
  divFilter: FilterDef
  tomaFilter: FilterDef
  studentFilter: FilterDef
}

export type TabDef = {
  id: TabId
  label: string | ((ctx: TabRenderCtx) => string)
  kind: TabKind
  filters?: (ctx: TabFiltersCtx) => Array<FilterDef>
  render: (ctx: TabRenderCtx) => ReactNode
}

const NoData = ({ materia, anio, toma }: { materia: string; anio: string; toma: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
    <Typography sx={{ color: C.navy }}>Sin datos para {materia} · {anio} · {toma}</Typography>
  </Box>
)

interface FilterFlags {
  materia?: boolean
  anio?: boolean
  division?: boolean
  toma?: boolean
}

const buildFilters = (flags: FilterFlags) => (ctx: TabFiltersCtx): Array<FilterDef> => {
  const out: Array<FilterDef> = []
  if (flags.materia && ctx.materias.length > 1) out.push(ctx.materiaFilter)
  if (flags.anio) out.push(ctx.anioFilter)
  if (flags.division && ctx.divisiones.length > 1) out.push(ctx.divFilter)
  if (flags.toma) out.push(ctx.tomaFilter)
  return out
}

const filtersResumenLike = buildFilters({ materia: true, anio: true, division: true, toma: true })
const filtersScatterLike = buildFilters({ anio: true, division: true, toma: true })
const filtersDetalleSplitLike = (ctx: TabFiltersCtx): Array<FilterDef> => [
  ctx.anioFilter,
  ctx.divFilter,
  ctx.tomaFilter,
]
const filtersSemaforoSplitLike = (ctx: TabFiltersCtx): Array<FilterDef> => {
  const out: Array<FilterDef> = []
  if (ctx.divisiones.length > 1) out.push(ctx.divFilter)
  out.push(ctx.tomaFilter)
  out.push(ctx.studentFilter)
  return out
}

export const TABS: ReadonlyArray<TabDef> = [
  {
    id: 'cover', label: 'Portada', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <PortadaTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'intro', label: 'Introducción', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <IntroduccionTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'pruebas', label: 'Las pruebas', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <PruebasTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'informe', label: 'El informe', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <InformeTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'matematica', label: 'Presentación Matemática', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <MatematicaTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'lenguaje', label: 'Presentación PDL', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <LenguajeTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'pisa', label: 'Presentación PISA', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <PisaTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'instituciones', label: 'Instituciones', kind: 'static',
    render: ({ escuelaId, editRequested }) =>
      escuelaId !== null ? <InstitucionesTab schoolId={escuelaId} initialEditing={editRequested} /> : null,
  },
  {
    id: 'presentacion', label: 'Presentación Resultados', kind: 'static',
    render: () => <PresentacionResultadosTab />,
  },
  {
    id: 'resumen', label: 'Resultados generales', kind: 'data',
    filters: filtersResumenLike,
    render: ({ resumenData, materia, anio, toma }) =>
      resumenData
        ? <ResumenTab data={resumenData} />
        : (toma ? <NoData materia={materia} anio={anio} toma={toma} /> : null),
  },
  {
    id: 'historico', label: 'Histórico', kind: 'data',
    filters: ({ tomaFilter }) => [tomaFilter],
    render: ({ escuelaId }) => escuelaId !== null ? <HistoricoTab schoolId={escuelaId} /> : null,
  },
  {
    id: 'detalleLenguaje', label: 'Prácticas del Lenguaje', kind: 'data',
    filters: filtersDetalleSplitLike,
    render: ({ detalleData, materia, anio, toma }) =>
      detalleData
        ? <DetalleTab data={detalleData} />
        : (toma ? <NoData materia={materia} anio={anio} toma={toma} /> : null),
  },
  {
    id: 'detalleMatematica', label: 'Matemática', kind: 'data',
    filters: filtersDetalleSplitLike,
    render: ({ detalleData, materia, anio, toma }) =>
      detalleData
        ? <DetalleTab data={detalleData} />
        : (toma ? <NoData materia={materia} anio={anio} toma={toma} /> : null),
  },
  {
    id: 'semaforoLenguaje', label: 'Semáforo PDL', kind: 'data',
    filters: filtersSemaforoSplitLike,
    render: ({ materia, semaforoBandas, semaforoEstudiantes, semaforoAnio, setSemaforoAnio, selectedStudentId }) => (
      <SemaforoTab materia={materia} bandasMap={semaforoBandas} estudiantesMap={semaforoEstudiantes} anio={semaforoAnio} onAnioChange={setSemaforoAnio} selectedStudentId={selectedStudentId} />
    ),
  },
  {
    id: 'semaforoMatematica', label: 'Semáforo Matemática', kind: 'data',
    filters: filtersSemaforoSplitLike,
    render: ({ materia, semaforoBandas, semaforoEstudiantes, semaforoAnio, setSemaforoAnio, selectedStudentId }) => (
      <SemaforoTab materia={materia} bandasMap={semaforoBandas} estudiantesMap={semaforoEstudiantes} anio={semaforoAnio} onAnioChange={setSemaforoAnio} selectedStudentId={selectedStudentId} />
    ),
  },
  {
    id: 'scatter', label: 'Resultados por alumno', kind: 'data',
    filters: filtersScatterLike,
    render: ({ scatterPoints }) => <ScatterTab points={scatterPoints} />,
  },
  {
    id: 'tabla', label: 'Resumen por alumno', kind: 'data',
    filters: filtersScatterLike,
    render: ({ tablaRows }) => <TablaTab rows={tablaRows} />,
  },
  {
    id: 'cierre', label: 'Cierre', kind: 'static',
    render: () => <CierreTab />,
  },
]

export const TAB_BY_ID: Record<TabId, TabDef> = Object.fromEntries(
  TABS.map(t => [t.id, t]),
) as Record<TabId, TabDef>

export const TAB_ORDER: ReadonlyArray<TabId> = TABS.map(t => t.id)

export const tabLabel = (def: TabDef, ctx: TabRenderCtx): string =>
  typeof def.label === 'function' ? def.label(ctx) : def.label
