'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { useEscuelaReporteAurora, useAuroraReportPublish, useAuroraReportUnpublish } from '@/mta_reports_v2/hooks'
import { COLORS, ANIO_ORDER } from '@/mta_reports_v2/constants'
import { calcResumen } from '@/mta_reports_v2/components/calc/ResumenTab'
import { calcDetalle } from '@/mta_reports_v2/components/calc/DetalleTab'
import { calcSemaforo } from '@/mta_reports_v2/components/calc/SemaforoTab'
import { calcScatter } from '@/mta_reports_v2/components/calc/ScatterTab'
import { calcTabla } from '@/mta_reports_v2/components/calc/TablaTab'
import { Sidebar } from '@/mta_reports_v2/components/ReporteAuroraSidebar'
import type { FilterDef } from '@/mta_reports_v2/components/ReporteAuroraSidebar'
import {
  TABS, TAB_BY_ID, TAB_ORDER, tabLabel as resolveTabLabel,
} from '@/mta_reports_v2/components/reporteAuroraTabs'
import type { TabId, TabRenderCtx } from '@/mta_reports_v2/components/reporteAuroraTabs'
import {
  ReportHeader, FilterPillsBar, TabPager,
} from '@/mta_reports_v2/components/ReporteAuroraChrome'

const C = COLORS

const ReporteAurora = () => {
  const params = useParams<{ escuelaId: string }>()
  const searchParams = useSearchParams()
  const escuelaId = params?.escuelaId ? Number(params.escuelaId) : null
  const editRequested = searchParams?.get('edit') === '1'
  const canManage = useHasCapabilities(['manage_reports'])
  const publish = useAuroraReportPublish()
  const unpublish = useAuroraReportUnpublish()
  const [statusBusy, setStatusBusy] = useState(false)

  const [tab, setTab] = useState<TabId>(editRequested ? 'intro' : 'cover')
  const [toma, setToma] = useState('')
  const [materia, setMateria] = useState('Matemática')
  const [anio, setAnio] = useState('3ro')
  const [division, setDivision] = useState('Todas')
  const [semaforoAnio, setSemaforoAnio] = useState<string>('3ro')
  const [neeFilter, setNeeFilter] = useState('Con NEE')

  const { rawData, loading, error, tomas, getMaterias, getAnios, getDivisiones } =
    useEscuelaReporteAurora(escuelaId)

  const materias = useMemo(() => getMaterias(toma), [getMaterias, toma])
  const anios = useMemo(() => getAnios(toma, materia), [getAnios, toma, materia])

  const divisiones = useMemo(() => {
    if (tab === 'semaforo') {
      const divSet = new Set<string>()
      for (const a of ANIO_ORDER) {
        getDivisiones(materia, a, toma).filter(d => d !== 'Todas').forEach(d => divSet.add(d))
      }
      const divs = [...divSet]
      return divs.length > 0 ? ['Todas', ...divs] : ['Todas']
    }
    return getDivisiones(materia, anio, toma)
  }, [tab, materia, anio, toma, getDivisiones])

  useEffect(() => {
    setToma(t => (tomas.length > 0 && !t ? tomas[tomas.length - 1] : t))
  }, [tomas])
  useEffect(() => {
    if (materias.length > 0 && !materias.includes(materia)) setMateria(materias[0])
  }, [materias, materia])
  useEffect(() => {
    if (anios.length > 0 && !anios.includes(anio)) setAnio(anios[0])
  }, [anios, anio])
  useEffect(() => {
    if (divisiones.length > 0 && !divisiones.includes(division)) setDivision(divisiones[0])
  }, [divisiones, division])

  const resumenData = useMemo(
    () => (rawData && toma ? calcResumen(rawData, { materia, anio, division, toma, neeFilter }) : null),
    [rawData, materia, anio, division, toma, neeFilter],
  )
  const detalleData = useMemo(
    () => (rawData && toma ? calcDetalle(rawData, { materia, anio, division, toma, neeFilter }) : null),
    [rawData, materia, anio, division, toma, neeFilter],
  )
  const semaforoBandas = useMemo(
    () => (rawData && toma ? calcSemaforo(rawData, materia, division, toma, neeFilter) : {}),
    [rawData, materia, division, toma, neeFilter],
  )
  const scatterPoints = useMemo(
    () => (rawData && toma ? calcScatter(rawData, anio, division, toma, neeFilter) : []),
    [rawData, anio, division, toma, neeFilter],
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

  const tomaFilter = useMemo<FilterDef>(() => ({ label: 'Toma', value: toma, opts: tomas.length > 0 ? tomas : [toma].filter(Boolean), set: setToma }), [toma, tomas])
  const divFilter = useMemo<FilterDef>(() => ({ label: 'División', value: division, opts: divisiones, set: setDivision }), [division, divisiones])
  const materiaFilter = useMemo<FilterDef>(() => ({ label: 'Materia', value: materia, opts: materias.length > 0 ? materias : [materia], set: setMateria }), [materia, materias])
  const anioFilter = useMemo<FilterDef>(() => ({ label: 'Año', value: anio, opts: anios.length > 0 ? anios : ANIO_ORDER.slice(), set: setAnio }), [anio, anios])
  const neeFilterDef = useMemo<FilterDef>(() => ({ label: 'NEE', value: neeFilter, opts: ['Con NEE', 'Sin NEE'], set: setNeeFilter }), [neeFilter])

  const tabDef = TAB_BY_ID[tab]
  const isStaticTab = tabDef.kind === 'static'

  const renderCtx: TabRenderCtx = {
    escuelaId, editRequested, materia, anio, division, toma,
    semaforoAnio, setSemaforoAnio,
    resumenData, detalleData, semaforoBandas, scatterPoints, tablaRows,
  }

  const sidebarFilters = useMemo<Array<FilterDef>>(
    () => [...(tabDef.filters?.({ materias, divisiones, anios, materiaFilter, anioFilter, divFilter, tomaFilter }) ?? []), neeFilterDef],
    [tabDef, materias, divisiones, anios, materiaFilter, anioFilter, divFilter, tomaFilter, neeFilterDef],
  )

  const resetFilters = () => {
    setMateria('Matemática')
    setAnio('3ro')
    setDivision('Todas')
    setNeeFilter('Con NEE')
    if (tomas.length > 0) setToma(tomas[tomas.length - 1])
  }

  const filterPills = useMemo(() => {
    const pills: Array<{ label: string }> = []
    if (isStaticTab) return pills
    if ((tab === 'resumen' || tab === 'detalle' || tab === 'semaforo') && materias.length > 1) {
      pills.push({ label: `Materia: ${materia || '—'}` })
    }
    if (tab !== 'semaforo') {
      pills.push({ label: `Año: ${anio || '—'}` })
    }
    if (divisiones.length > 1) pills.push({ label: `División: ${division || '—'}` })
    if (neeFilter === 'Sin NEE') pills.push({ label: `NEE: ${neeFilter}` })
    return pills
  }, [tab, isStaticTab, materia, materias.length, anio, division, divisiones.length, toma, neeFilter])

  const advance = (direction: 'prev' | 'next') => {
    if (tab === 'semaforo') {
      const idx = ANIO_ORDER.indexOf(semaforoAnio as typeof ANIO_ORDER[number])
      const nextSubIdx = direction === 'prev' ? idx - 1 : idx + 1
      if (nextSubIdx >= 0 && nextSubIdx < ANIO_ORDER.length) {
        setSemaforoAnio(ANIO_ORDER[nextSubIdx])
        return
      }
      const tabIdx = TAB_ORDER.indexOf(tab)
      const nextTabIdx = direction === 'prev' ? tabIdx - 1 : tabIdx + 1
      if (nextTabIdx < 0 || nextTabIdx >= TAB_ORDER.length) return
      setTab(TAB_ORDER[nextTabIdx])
      return
    }
    const tabIdx = TAB_ORDER.indexOf(tab)
    const nextTabIdx = direction === 'prev' ? tabIdx - 1 : tabIdx + 1
    if (nextTabIdx < 0 || nextTabIdx >= TAB_ORDER.length) return
    const nextTab = TAB_ORDER[nextTabIdx]
    if (nextTab === 'semaforo') {
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

  const tabIdx = TAB_ORDER.indexOf(tab)
  const isFirstTab = tabIdx <= 0
  const isLastTab = tabIdx === -1 || tabIdx >= TAB_ORDER.length - 1

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'rgb(230, 230, 230)' }}>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!isStaticTab && <Sidebar filters={sidebarFilters} onReset={resetFilters} />}

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, position: 'relative' }}>
          {/* Content */}
          <Box sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: isStaticTab ? 'block' : 'flex',
            flexDirection: 'column',
            pt: isStaticTab ? 0 : '22px',
            px: isStaticTab ? 0 : 3,
            pb: isStaticTab ? 0 : 2,
          }}>
            {isStaticTab && tabDef.render(renderCtx)}
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
        tabs={TAB_ORDER}
        labelOf={id => resolveTabLabel(TAB_BY_ID[id], renderCtx)}
        onChange={setTab}
        onPrev={() => advance('prev')}
        onNext={() => advance('next')}
        isFirst={isFirstTab}
        isLast={isLastTab}
      />
    </Box>
  )
}

export default withAuth(ReporteAurora, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
