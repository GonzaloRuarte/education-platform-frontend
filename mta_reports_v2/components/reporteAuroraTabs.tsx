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
import type { FilterDef, MultiFilterDef } from './ReporteAuroraSidebar'
import type { I_EscuelaMiembro } from '@/mta_reports_v2/types'

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
  // Sólo se completan cuando el sujeto es agrupamiento — el reporte de escuela
  // los recibe igual para mantener el shape, con `escuelas: []`.
  isAgrupamiento: boolean
  escuelas: I_EscuelaMiembro[]
  // `null` = "Todas las escuelas del agrupamiento". Se aplica al highlight del
  // chart de resumen, al detalle, a las bandas del semáforo y al subset del
  // scatter/tabla.
  selectedSchools: string[] | null
}

export type TabFiltersCtx = {
  materias: Array<string>
  divisiones: Array<string>
  anios: Array<string>
  materiaFilter: FilterDef
  anioFilter: FilterDef
  divFilter: FilterDef
  studentFilter: FilterDef
  // Sólo presente cuando el sujeto es agrupamiento y `rawData.escuelas` trae
  // miembros. Se prepende a la lista de filtros de cada data-tab.
  escuelasFilter?: MultiFilterDef
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
}

// Anteponemos el filtro de Escuela (multi-select, sólo agrupamiento) al inicio
// de cualquier lista de filtros, para que aparezca arriba en el sidebar.
const withEscuelas = (ctx: TabFiltersCtx, rest: Array<FilterDef>): Array<FilterDef> =>
  ctx.escuelasFilter ? [ctx.escuelasFilter, ...rest] : rest

const buildFilters = (flags: FilterFlags) => (ctx: TabFiltersCtx): Array<FilterDef> => {
  const out: Array<FilterDef> = []
  if (flags.materia) out.push(ctx.materiaFilter)
  if (flags.anio) out.push(ctx.anioFilter)
  if (flags.division) out.push(ctx.divFilter)
  return withEscuelas(ctx, out)
}

const filtersResumenLike = buildFilters({ materia: true, anio: true, division: true })
const filtersScatterLike = buildFilters({ anio: true, division: true })
const filtersDetalleMatematicaLike = (ctx: TabFiltersCtx): Array<FilterDef> =>
  withEscuelas(ctx, [
    { ...ctx.anioFilter, opts: ctx.anioFilter.opts.filter(o => o !== 'Todos') },
    ctx.divFilter,
  ])
const filtersDetalleLenguajeLike = (ctx: TabFiltersCtx): Array<FilterDef> =>
  withEscuelas(ctx, [ctx.anioFilter, ctx.divFilter])
const filtersSemaforoSplitLike = (ctx: TabFiltersCtx): Array<FilterDef> =>
  withEscuelas(ctx, [ctx.divFilter, ctx.studentFilter])

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
    render: ({ resumenData, materia, anio, toma, isAgrupamiento, escuelas, selectedSchools }) =>
      resumenData
        ? <ResumenTab data={resumenData} isAgrupamiento={isAgrupamiento} escuelas={escuelas} selectedSchools={selectedSchools} />
        : (toma ? <NoData materia={materia} anio={anio} toma={toma} /> : null),
  },
  {
    id: 'historico', label: 'Histórico', kind: 'data',
    render: ({ escuelaId }) => escuelaId !== null ? <HistoricoTab schoolId={escuelaId} /> : null,
  },
  {
    id: 'detalleLenguaje', label: 'Prácticas del Lenguaje', kind: 'data',
    filters: filtersDetalleLenguajeLike,
    render: ({ detalleData, materia, anio, toma, isAgrupamiento, escuelas, selectedSchools }) =>
      detalleData
        ? <DetalleTab data={detalleData} isAgrupamiento={isAgrupamiento} escuelas={escuelas} selectedSchools={selectedSchools} />
        : (toma ? <NoData materia={materia} anio={anio} toma={toma} /> : null),
  },
  {
    id: 'detalleMatematica', label: 'Matemática', kind: 'data',
    filters: filtersDetalleMatematicaLike,
    render: ({ detalleData, materia, anio, toma, isAgrupamiento, escuelas, selectedSchools }) =>
      detalleData
        ? <DetalleTab data={detalleData} isAgrupamiento={isAgrupamiento} escuelas={escuelas} selectedSchools={selectedSchools} />
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
    render: ({ scatterPoints, isAgrupamiento, escuelas }) =>
      <ScatterTab points={scatterPoints} isAgrupamiento={isAgrupamiento} escuelas={escuelas} />,
  },
  {
    id: 'tabla', label: 'Resumen por alumno', kind: 'data',
    filters: filtersScatterLike,
    render: ({ tablaRows, isAgrupamiento }) => <TablaTab rows={tablaRows} isAgrupamiento={isAgrupamiento} />,
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
