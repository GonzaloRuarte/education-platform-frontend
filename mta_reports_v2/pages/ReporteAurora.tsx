'use client'

import { useEffect, useState, useMemo, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Box } from '@mui/material'
import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { useReporteAurora, useAuroraReportPublish, useAuroraReportUnpublish } from '@/mta_reports_v2/hooks'
import type { T_SubjectKind } from '@/mta_reports_v2/hooks'
import { COLORS, ANIO_ORDER, FONT_FAMILY } from '@/mta_reports_v2/constants'
import { calcResumen } from '@/mta_reports_v2/components/calc/ResumenTab'
import { calcDetalle } from '@/mta_reports_v2/components/calc/DetalleTab'
import { calcSemaforo, calcSemaforoEstudiantes } from '@/mta_reports_v2/components/calc/SemaforoTab'
import { calcScatter } from '@/mta_reports_v2/components/calc/ScatterTab'
import { calcTabla } from '@/mta_reports_v2/components/calc/TablaTab'
import { Sidebar } from '@/mta_reports_v2/components/ReporteAuroraSidebar'
import type { FilterDef, MultiFilterDef } from '@/mta_reports_v2/components/ReporteAuroraSidebar'
import {
  TAB_BY_ID, TAB_ORDER, tabLabel as resolveTabLabel,
} from '@/mta_reports_v2/components/reporteAuroraTabs'
import type { TabId, TabRenderCtx } from '@/mta_reports_v2/components/reporteAuroraTabs'
import { ANIO_LABELS } from '@/mta_reports_v2/semaforo_data'
import {
  ReportHeader, FilterPillsBar, TabPager,
} from '@/mta_reports_v2/components/ReporteAuroraChrome'

// Tabs que dependen de un `schoolId` real. Las slides editables se guardan ahora
// por sujeto (escuela XOR agrupamiento) contra el mismo modelo `ReporteSlideContent`,
// así que están disponibles para ambos. Sólo `historico` sigue siendo school-only
// porque consume datos por escuela.
const SCHOOL_ONLY_TAB_IDS: ReadonlySet<TabId> = new Set<TabId>([
  'historico',
])

const C = COLORS

const ReporteAurora = () => {
  // El componente sirve a dos rutas: /reports/escuela/[escuelaId]/toma/[toma] y
  // /reports/agrupamiento/[groupingId]/toma/[toma]. Next.js solo entrega los
  // params que existen en la ruta concreta, así que ambos vienen como opcionales
  // y exactamente uno está presente en cada render.
  const params = useParams<{ escuelaId?: string; groupingId?: string; toma: string }>()
  const searchParams = useSearchParams()
  const groupingIdParam = params?.groupingId ? Number(params.groupingId) : null
  const escuelaIdParam = params?.escuelaId ? Number(params.escuelaId) : null
  const subjectKind: T_SubjectKind = groupingIdParam !== null ? 'grouping' : 'school'
  const subjectId = subjectKind === 'grouping' ? groupingIdParam : escuelaIdParam
  // `escuelaId` mantiene el nombre histórico para el TabRenderCtx; cuando es
  // grouping queda null y los tabs school-only se excluyen del orden visible.
  const escuelaId = subjectKind === 'school' ? escuelaIdParam : null
  const toma = params?.toma ?? ''
  const editRequested = searchParams?.get('edit') === '1'
  const canManage = useHasCapabilities(['manage_reports'])
  const publish = useAuroraReportPublish()
  const unpublish = useAuroraReportUnpublish()
  const [statusBusy, setStatusBusy] = useState(false)

  const visibleTabOrder = useMemo<ReadonlyArray<TabId>>(
    () =>
      subjectKind === 'grouping'
        ? TAB_ORDER.filter((id) => !SCHOOL_ONLY_TAB_IDS.has(id))
        : TAB_ORDER,
    [subjectKind],
  )
  const initialTab: TabId = useMemo(() => {
    const preferred = editRequested ? 'intro' : 'cover'
    if (visibleTabOrder.includes(preferred)) return preferred
    return visibleTabOrder[0] ?? 'resumen'
  }, [editRequested, visibleTabOrder])
  const [tab, setTab] = useState<TabId>(initialTab)
  const [materia, setMateria] = useState('Todos')
  const [anio, setAnio] = useState('Todos')
  const [division, setDivision] = useState('Todas')
  const [semaforoAnio, setSemaforoAnio] = useState<string>('3ro')
  const [neeFilter, setNeeFilter] = useState('Con NEE')
  const [selectedStudentLabel, setSelectedStudentLabel] = useState<string>('Todos los alumnos')
  // Sólo aplica a agrupamiento. `null` = "Todas las escuelas" (atajo del multi-select
  // de la sidebar). Es la única fuente de selección de escuelas — todos los tabs
  // (incluido Detalle) consumen este estado.
  const [selectedSchools, setSelectedSchools] = useState<string[] | null>(null)

  const { rawData, loading, error, getMaterias, getAnios, getDivisiones } =
    useReporteAurora({ kind: subjectKind, id: subjectId }, toma)

  const isAgrupamiento = subjectKind === 'grouping'
  const escuelas = useMemo(
    () => (isAgrupamiento ? rawData?.escuelas ?? [] : []),
    [isAgrupamiento, rawData],
  )

  const schoolSelection = useMemo<ReadonlySet<string> | null>(
    () => (selectedSchools && selectedSchools.length > 0 ? new Set(selectedSchools) : null),
    [selectedSchools],
  )

  const materias = useMemo(() => getMaterias(), [getMaterias])
  const anios = useMemo(() => getAnios(materia), [getAnios, materia])

  const isSemaforoTab = tab === 'semaforoLenguaje' || tab === 'semaforoMatematica'

  const divisiones = useMemo(() => {
    // En agrupamiento, cuando hay un subconjunto de escuelas elegido, mezclar divisiones
    // de distintas escuelas es ambiguo (la "A" de una no es la "A" de otra), así que
    // colapsamos a "Todas".
    if (isAgrupamiento && selectedSchools !== null) return ['Todas']
    if (isSemaforoTab) {
      const divSet = new Set<string>()
      for (const a of ANIO_ORDER) {
        getDivisiones(materia, a).filter(d => d !== 'Todas').forEach(d => divSet.add(d))
      }
      const divs = [...divSet]
      return divs.length > 0 ? ['Todas', ...divs] : ['Todas']
    }
    return getDivisiones(materia, anio)
  }, [isAgrupamiento, selectedSchools, isSemaforoTab, materia, anio, getDivisiones])

  useEffect(() => {
    // Si el tab actual quedó fuera del orden visible (por ejemplo: el componente
    // se montó como "school" y luego pasó a "grouping" — cosa que en la práctica
    // no ocurre porque cada ruta es su propio mount, pero queda como defensa),
    // saltar al primero disponible.
    if (!visibleTabOrder.includes(tab)) {
      const fallback = visibleTabOrder[0]
      if (fallback) setTab(fallback)
    }
  }, [visibleTabOrder, tab])
  useEffect(() => {
    if (materia === 'Todos') return
    if (materias.length > 0 && !materias.includes(materia)) setMateria(materias[0])
  }, [materias, materia])
  useEffect(() => {
    const lockedMateria =
      tab === 'detalleMatematica' || tab === 'semaforoMatematica' ? 'Matemática' :
      tab === 'detalleLenguaje' || tab === 'semaforoLenguaje' ? 'Prácticas del Lenguaje' :
      null
    if (lockedMateria && materia !== lockedMateria && materias.includes(lockedMateria)) {
      setMateria(lockedMateria)
    }
  }, [tab, materia, materias])
  useEffect(() => {
    if (anio === 'Todos') return
    if (anios.length > 0 && !anios.includes(anio)) setAnio(anios[0])
  }, [anios, anio])
  useEffect(() => {
    if (tab === 'detalleMatematica' && anio === 'Todos' && anios.length > 0) setAnio(anios[0])
  }, [tab, anio, anios])
  useEffect(() => {
    if (divisiones.length > 0 && !divisiones.includes(division)) setDivision(divisiones[0])
  }, [divisiones, division])
  useEffect(() => {
    if (isSemaforoTab) setDivision('Todas')
  }, [isSemaforoTab])

  const resumenData = useMemo(
    () => (rawData && toma ? calcResumen(rawData, { materia, anio, division, toma, neeFilter }, schoolSelection) : null),
    [rawData, materia, anio, division, toma, neeFilter, schoolSelection],
  )
  const detalleData = useMemo(
    () => (rawData && toma ? calcDetalle(rawData, { materia, anio, division, toma, neeFilter }, schoolSelection) : null),
    [rawData, materia, anio, division, toma, neeFilter, schoolSelection],
  )
  const semaforoBandas = useMemo(
    () => (rawData && toma ? calcSemaforo(rawData, materia, division, toma, neeFilter, schoolSelection) : {}),
    [rawData, materia, division, toma, neeFilter, schoolSelection],
  )
  // El dropdown "ID Alumno" muestra todos los del agrupamiento, así que NO se filtra
  // por escuela acá. El highlight de un alumno seleccionado dentro del SemáforoTab sí
  // se sigue restringiendo a la escuela porque depende de las bandas (que sí filtran).
  const semaforoEstudiantesAll = useMemo(
    () => (rawData && toma ? calcSemaforoEstudiantes(rawData, materia, division, toma, neeFilter) : {}),
    [rawData, materia, division, toma, neeFilter],
  )
  const semaforoEstudiantes = useMemo(
    () => (rawData && toma ? calcSemaforoEstudiantes(rawData, materia, division, toma, neeFilter, schoolSelection) : {}),
    [rawData, materia, division, toma, neeFilter, schoolSelection],
  )
  const scatterPoints = useMemo(
    () => (rawData && toma ? calcScatter(rawData, anio, division, toma, neeFilter, schoolSelection) : []),
    [rawData, anio, division, toma, neeFilter, schoolSelection],
  )
  const tablaRows = useMemo(
    () => (rawData && toma ? calcTabla(rawData, anio, division, toma, neeFilter) : []),
    [rawData, anio, division, toma, neeFilter],
  )

  const schoolName = rawData?.colegio ?? (loading ? 'Cargando…' : 'Escuela')
  const reportStatus = rawData?.report_status
  const reportId = rawData?.report_id

  const handleTogglePublish = async () => {
    if (!reportId || statusBusy) return
    setStatusBusy(true)
    try {
      if (reportStatus === 'published') await unpublish(reportId)
      else await publish(reportId)
      window.location.reload()
    } finally {
      setStatusBusy(false)
    }
  }

  const divFilter = useMemo<FilterDef>(() => ({ label: 'División', value: division, opts: divisiones, set: setDivision }), [division, divisiones])
  const materiaFilter = useMemo<FilterDef>(() => ({ label: 'Materia', value: materia, opts: ['Todos', ...(materias.length > 0 ? materias : [materia].filter(m => m && m !== 'Todos'))], set: setMateria }), [materia, materias])
  const anioFilter = useMemo<FilterDef>(() => ({ label: 'Año', value: anio, opts: ['Todos', ...(anios.length > 0 ? anios : ANIO_ORDER.slice())], set: setAnio }), [anio, anios])
  const neeFilterDef = useMemo<FilterDef>(() => ({ label: 'NEE', value: neeFilter, opts: ['Con NEE', 'Sin NEE'], set: setNeeFilter }), [neeFilter])
  const escuelasFilter = useMemo<MultiFilterDef | undefined>(
    () => (isAgrupamiento && escuelas.length > 0
      ? {
          kind: 'multi',
          label: 'Escuela',
          selected: selectedSchools,
          opts: escuelas.map(e => ({ label: e.name, value: e.id })),
          set: setSelectedSchools,
        }
      : undefined),
    [isAgrupamiento, escuelas, selectedSchools],
  )

  const studentLabelOpts = useMemo(() => {
    const set = new Set<string>()
    for (const a of Object.keys(semaforoEstudiantesAll)) {
      for (const s of semaforoEstudiantesAll[a]) set.add(s.id)
    }
    const ids = [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    return ['Todos los alumnos', ...ids.map(id => `Alumno ${id}`)]
  }, [semaforoEstudiantesAll])

  const studentFilter = useMemo<FilterDef>(
    () => ({ label: 'ID Alumno', value: selectedStudentLabel, opts: studentLabelOpts, set: setSelectedStudentLabel }),
    [selectedStudentLabel, studentLabelOpts],
  )

  const selectedStudentId = selectedStudentLabel === 'Todos los alumnos'
    ? 'all'
    : selectedStudentLabel.replace(/^Alumno\s+/, '')

  useEffect(() => {
    if (!studentLabelOpts.includes(selectedStudentLabel)) setSelectedStudentLabel('Todos los alumnos')
  }, [studentLabelOpts, selectedStudentLabel])

  const tabDef = TAB_BY_ID[tab]
  const isStaticTab = tabDef.kind === 'static'
  const SLIDE_16_9_TABS: ReadonlySet<TabId> = new Set<TabId>([
    'cover', 'intro', 'informe', 'matematica', 'lenguaje', 'pisa',
    'pruebas', 'instituciones', 'presentacion',
  ])
  const is16x9Slide = SLIDE_16_9_TABS.has(tab)

  const renderCtx: TabRenderCtx = {
    escuelaId,
    subject: { kind: subjectKind, id: subjectId },
    editRequested, materia, anio, division, toma,
    divisiones, setDivision,
    semaforoAnio, setSemaforoAnio,
    resumenData, detalleData, semaforoBandas, semaforoEstudiantes, scatterPoints, tablaRows,
    selectedStudentId,
    isAgrupamiento, escuelas, selectedSchools,
  }

  const sidebarFilters = useMemo<Array<FilterDef>>(
    () => [...(tabDef.filters?.({ materias, divisiones, anios, materiaFilter, anioFilter, divFilter, studentFilter, escuelasFilter }) ?? []), neeFilterDef],
    [tabDef, materias, divisiones, anios, materiaFilter, anioFilter, divFilter, studentFilter, escuelasFilter, neeFilterDef],
  )

  const resetFilters = () => {
    setMateria('Todos')
    setAnio('Todos')
    setDivision('Todas')
    setNeeFilter('Con NEE')
    setSelectedStudentLabel('Todos los alumnos')
    setSelectedSchools(null)
  }

  const filterPills = useMemo(() => {
    const pills: Array<{ label: string }> = []
    if (isStaticTab) return pills
    if (tab === 'resumen' && materias.length > 1) {
      pills.push({ label: `Materia: ${materia || '-'}` })
    }
    if (!isSemaforoTab) {
      pills.push({ label: `Año: ${anio || '-'}` })
    }
    if (divisiones.length > 1) pills.push({ label: `División: ${division || '-'}` })
    if (isSemaforoTab) {
      const isAnio = semaforoAnio === '9no' || semaforoAnio === '12mo'
      pills.push({ label: `${isAnio ? 'Año' : 'Grado'}: ${ANIO_LABELS[semaforoAnio] ?? semaforoAnio}` })
    }
    if (neeFilter === 'Sin NEE') pills.push({ label: `NEE: ${neeFilter}` })
    return pills
  }, [tab, isStaticTab, isSemaforoTab, materia, materias.length, anio, division, divisiones.length, toma, neeFilter, semaforoAnio])

  const advance = (direction: 'prev' | 'next') => {
    if (isSemaforoTab) {
      const idx = ANIO_ORDER.indexOf(semaforoAnio as typeof ANIO_ORDER[number])
      const nextSubIdx = direction === 'prev' ? idx - 1 : idx + 1
      if (nextSubIdx >= 0 && nextSubIdx < ANIO_ORDER.length) {
        setSemaforoAnio(ANIO_ORDER[nextSubIdx])
        return
      }
      const tabIdx = visibleTabOrder.indexOf(tab)
      const nextTabIdx = direction === 'prev' ? tabIdx - 1 : tabIdx + 1
      if (nextTabIdx < 0 || nextTabIdx >= visibleTabOrder.length) return
      const nextTab = visibleTabOrder[nextTabIdx]
      if (nextTab === 'semaforoLenguaje' || nextTab === 'semaforoMatematica') {
        setSemaforoAnio(direction === 'next' ? ANIO_ORDER[0] : ANIO_ORDER[ANIO_ORDER.length - 1])
      }
      setTab(nextTab)
      return
    }
    const tabIdx = visibleTabOrder.indexOf(tab)
    const nextTabIdx = direction === 'prev' ? tabIdx - 1 : tabIdx + 1
    if (nextTabIdx < 0 || nextTabIdx >= visibleTabOrder.length) return
    const nextTab = visibleTabOrder[nextTabIdx]
    if (nextTab === 'semaforoLenguaje' || nextTab === 'semaforoMatematica') {
      setSemaforoAnio(direction === 'next' ? ANIO_ORDER[0] : ANIO_ORDER[ANIO_ORDER.length - 1])
    }
    setTab(nextTab)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return
      advance(e.key === 'ArrowLeft' ? 'prev' : 'next')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, semaforoAnio])

  const tabIdx = visibleTabOrder.indexOf(tab)
  const isFirstTab = tabIdx <= 0
  const isLastTab = tabIdx === -1 || tabIdx >= visibleTabOrder.length - 1

  return (
    <AuroraFontTheme>
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: COLORS.bgGrey, fontFamily: FONT_FAMILY, '& *': { fontFamily: FONT_FAMILY } }}>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!isStaticTab && <Sidebar filters={sidebarFilters} onReset={resetFilters} />}

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, position: 'relative' }}>
          {/* Contenido */}
          <Box sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: isStaticTab && !is16x9Slide ? 'block' : 'flex',
            flexDirection: 'column',
            alignItems: is16x9Slide ? 'center' : undefined,
            justifyContent: is16x9Slide ? 'center' : undefined,
            pt: is16x9Slide ? 2 : (isStaticTab ? 0 : '22px'),
            px: is16x9Slide ? 2 : (isStaticTab ? 0 : 3),
            pb: is16x9Slide ? 2 : (isStaticTab ? 0 : 2),
            bgcolor: is16x9Slide ? COLORS.bgGrey : undefined,
            containerType: is16x9Slide ? 'size' : undefined,
          }}>
            {isStaticTab && is16x9Slide && (
              <Box sx={{
                width: 'min(100cqw, 100cqh * 16 / 9)',
                height: 'min(100cqh, 100cqw * 9 / 16)',
                overflow: 'hidden',
                bgcolor: COLORS.white,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                minHeight: 0,
                containerType: 'inline-size',
              }}>
                {tabDef.render(renderCtx)}
              </Box>
            )}
            {isStaticTab && !is16x9Slide && tabDef.render(renderCtx)}
            {!isStaticTab && (
              <>
                <ReportHeader
                  schoolName={schoolName}
                  tabLabel={resolveTabLabel(tabDef, renderCtx)}
                  canManage={canManage}
                  reportId={reportId}
                  reportStatus={reportStatus}
                  statusBusy={statusBusy}
                  onTogglePublish={handleTogglePublish}
                />
                <FilterPillsBar pills={filterPills} />
              </>
            )}
            {!isStaticTab && loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 0 }}>
                <Typography sx={{ color: C.navy }}>Cargando reporte…</Typography>
              </Box>
            )}
            {!isStaticTab && !loading && error && (
              <Paper elevation={0} sx={{ bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 5, p: 2.5 }}>
                <Typography color="error">Error al cargar: {error}</Typography>
              </Paper>
            )}
            {!isStaticTab && !loading && !error && (
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {tabDef.render(renderCtx)}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <TabPager<TabId>
        tab={tab}
        tabs={visibleTabOrder}
        labelOf={id => resolveTabLabel(TAB_BY_ID[id], renderCtx)}
        onChange={setTab}
        onPrev={() => advance('prev')}
        onNext={() => advance('next')}
        isFirst={isFirstTab}
        isLast={isLastTab}
      />
    </Box>
    </AuroraFontTheme>
  )
}

function AuroraFontTheme({ children }: { children: ReactNode }) {
  const outer = useTheme()
  const inner = useMemo(() => createTheme({ ...outer, typography: { ...outer.typography, fontFamily: FONT_FAMILY } }), [outer])
  return <ThemeProvider theme={inner}>{children}</ThemeProvider>
}

export default withAuth(ReporteAurora, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
