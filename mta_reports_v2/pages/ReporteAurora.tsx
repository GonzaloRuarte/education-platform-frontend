'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Box, Stack, Tabs, Tab, Chip, IconButton } from '@mui/material'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import Logo from '@/shared/components/Logo'
import { ImageSize } from '@/shared/utils'
import { useEscuelaReporteAurora, useAuroraReportPublish, useAuroraReportUnpublish } from '@/mta_reports_v2/hooks'
import { COLORS, ANIO_ORDER } from '@/mta_reports_v2/constants'
import Paper from '@mui/material/Paper'
import { IntroduccionTab } from '@/mta_reports_v2/components/IntroduccionTab'
import { PortadaTab } from '@/mta_reports_v2/components/PortadaTab'
import { PruebasTab } from '@/mta_reports_v2/components/PruebasTab'
import { InformeTab } from '@/mta_reports_v2/components/InformeTab'
import { MatematicaTab } from '@/mta_reports_v2/components/MatematicaTab'
import { LenguajeTab } from '@/mta_reports_v2/components/LenguajeTab'
import { PisaTab } from '@/mta_reports_v2/components/PisaTab'
import { InstitucionesTab } from '@/mta_reports_v2/components/InstitucionesTab'
import { PresentacionResultadosTab } from '@/mta_reports_v2/components/PresentacionResultadosTab'
import { CierreTab } from '@/mta_reports_v2/components/CierreTab'
import { ResumenTab } from '@/mta_reports_v2/components/ResumenTab'
import { HistoricoTab } from '@/mta_reports_v2/components/HistoricoTab'
import { calcResumen } from '@/mta_reports_v2/components/calc/ResumenTab'
import { DetalleTab } from '@/mta_reports_v2/components/DetalleTab'
import { calcDetalle } from '@/mta_reports_v2/components/calc/DetalleTab'
import { SemaforoTab } from '@/mta_reports_v2/components/SemaforoTab'
import { calcSemaforo } from '@/mta_reports_v2/components/calc/SemaforoTab'
import { ScatterTab } from '@/mta_reports_v2/components/ScatterTab'
import { calcScatter } from '@/mta_reports_v2/components/calc/ScatterTab'
import { TablaTab } from '@/mta_reports_v2/components/TablaTab'
import { calcTabla } from '@/mta_reports_v2/components/calc/TablaTab'
import { Sidebar } from '@/mta_reports_v2/components/ReporteAuroraSidebar'
import type { FilterDef } from '@/mta_reports_v2/components/ReporteAuroraSidebar'

const C = COLORS
const TAB_IDS = {
  COVER: 'cover',
  INTRO: 'intro',
  INFORME: 'informe',
  MATEMATICA: 'matematica',
  LENGUAJE: 'lenguaje',
  PISA: 'pisa',
  PRUEBAS: 'pruebas',
  INSTITUCIONES: 'instituciones',
  PRESENTACION: 'presentacion',
  RESUMEN: 'resumen',
  HISTORICO: 'historico',
  DETALLE: 'detalle',
  SEMAFORO: 'semaforo',
  SCATTER: 'scatter',
  TABLA: 'tabla',
  CIERRE: 'cierre',
} as const
const headerLogoSize = new ImageSize(257, 73, { scale: 0.31 })

type TabId = typeof TAB_IDS[keyof typeof TAB_IDS]

const TAB_ORDER: Array<TabId> = [
  TAB_IDS.COVER,
  TAB_IDS.INTRO,
  TAB_IDS.INFORME,
  TAB_IDS.MATEMATICA,
  TAB_IDS.LENGUAJE,
  TAB_IDS.PISA,
  TAB_IDS.PRUEBAS,
  TAB_IDS.INSTITUCIONES,
  TAB_IDS.PRESENTACION,
  TAB_IDS.RESUMEN,
  TAB_IDS.HISTORICO,
  TAB_IDS.DETALLE,
  TAB_IDS.SEMAFORO,
  TAB_IDS.SCATTER,
  TAB_IDS.TABLA,
  TAB_IDS.CIERRE,
]

const NON_DATA_TABS = new Set<TabId>([
  TAB_IDS.COVER, TAB_IDS.INTRO, TAB_IDS.INFORME, TAB_IDS.MATEMATICA,
  TAB_IDS.LENGUAJE, TAB_IDS.PISA, TAB_IDS.PRUEBAS, TAB_IDS.INSTITUCIONES,
  TAB_IDS.PRESENTACION, TAB_IDS.CIERRE,
])

const ReporteAurora = () => {
  const params = useParams<{ escuelaId: string }>()
  const searchParams = useSearchParams()
  const escuelaId = params?.escuelaId ? Number(params.escuelaId) : null
  const editRequested = searchParams?.get('edit') === '1'
  const canManage = useHasCapabilities(['manage_reports'])
  const publish = useAuroraReportPublish()
  const unpublish = useAuroraReportUnpublish()
  const [statusBusy, setStatusBusy] = useState(false)

  const [tab, setTab] = useState<TabId>(editRequested ? TAB_IDS.INTRO : TAB_IDS.COVER)
  const [toma, setToma] = useState('')
  const [materia, setMateria] = useState('Matemática')
  const [anio, setAnio] = useState('3ro')
  const [division, setDivision] = useState('Todas')
  const [semaforoAnio, setSemaforoAnio] = useState<string>('3ro')

  const { rawData, loading, error, tomas, getMaterias, getAnios, getDivisiones } =
    useEscuelaReporteAurora(escuelaId)

  const materias = useMemo(() => getMaterias(toma), [getMaterias, toma])
  const anios = useMemo(() => getAnios(toma, materia), [getAnios, toma, materia])

  const divisiones = useMemo(() => {
    if (tab === TAB_IDS.SEMAFORO) {
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
    setToma(t => {
      if (tomas.length > 0 && !t) return tomas[tomas.length - 1]
      return t
    })
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
    () => (rawData && toma ? calcResumen(rawData, { materia, anio, division, toma }) : null),
    [rawData, materia, anio, division, toma],
  )
  const detalleData = useMemo(
    () => (rawData && toma ? calcDetalle(rawData, { materia, anio, division, toma }) : null),
    [rawData, materia, anio, division, toma],
  )
  const semaforoBandas = useMemo(
    () => (rawData && toma ? calcSemaforo(rawData, materia, division, toma) : {}),
    [rawData, materia, division, toma],
  )
  const scatterPoints = useMemo(
    () => (rawData && toma ? calcScatter(rawData, anio, division, toma) : []),
    [rawData, anio, division, toma],
  )
  const tablaRows = useMemo(
    () => (rawData && toma ? calcTabla(rawData, anio, division, toma) : []),
    [rawData, anio, division, toma],
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

  const tomaFilter = useMemo(() => ({ label: 'Toma', value: toma, opts: tomas.length > 0 ? tomas : [toma].filter(Boolean), set: setToma }), [toma, tomas])
  const divFilter = useMemo(() => ({ label: 'División', value: division, opts: divisiones, set: setDivision }), [division, divisiones])
  const materiaFilter = useMemo(() => ({ label: 'Materia', value: materia, opts: materias.length > 0 ? materias : [materia], set: setMateria }), [materia, materias])
  const anioFilter = useMemo(() => ({ label: 'Año', value: anio, opts: anios.length > 0 ? anios : ANIO_ORDER.slice(), set: setAnio }), [anio, anios])

  const sidebarFilters = useMemo((): Array<FilterDef> => {
    const FILTER_LAYOUTS: Record<TabId, Array<FilterDef>> = {
      [TAB_IDS.INTRO]: [],
      [TAB_IDS.COVER]: [],
      [TAB_IDS.PRUEBAS]: [],
      [TAB_IDS.INFORME]: [],
      [TAB_IDS.MATEMATICA]: [],
      [TAB_IDS.LENGUAJE]: [],
      [TAB_IDS.PISA]: [],
      [TAB_IDS.INSTITUCIONES]: [],
      [TAB_IDS.PRESENTACION]: [],
      [TAB_IDS.CIERRE]: [],
      [TAB_IDS.RESUMEN]: [
        ...(materias.length > 1 ? [materiaFilter] : []),
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.HISTORICO]: [tomaFilter],
      [TAB_IDS.DETALLE]: [
        ...(materias.length > 1 ? [materiaFilter] : []),
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.SEMAFORO]: [
        ...(materias.length > 1 ? [materiaFilter] : []),
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.SCATTER]: [
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
      [TAB_IDS.TABLA]: [
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
    }
    return FILTER_LAYOUTS[tab] ?? []
  }, [tab, materias.length, anios.length, divisiones.length, materiaFilter, anioFilter, divFilter, tomaFilter])

  const resetFilters = () => {
    setMateria('Matemática')
    setAnio('3ro')
    setDivision('Todas')
    if (tomas.length > 0) setToma(tomas[tomas.length - 1])
  }

  const tabLabels: Record<TabId, string> = {
    [TAB_IDS.COVER]: 'Portada',
    [TAB_IDS.INTRO]: 'Introducción',
    [TAB_IDS.INFORME]: 'El Informe',
    [TAB_IDS.MATEMATICA]: 'Matemática',
    [TAB_IDS.LENGUAJE]: 'Prácticas del Lenguaje',
    [TAB_IDS.PISA]: 'PISA',
    [TAB_IDS.PRUEBAS]: 'Las pruebas',
    [TAB_IDS.INSTITUCIONES]: 'Instituciones',
    [TAB_IDS.PRESENTACION]: 'Presentación',
    [TAB_IDS.RESUMEN]: 'Resultados generales',
    [TAB_IDS.HISTORICO]: 'Histórico',
    [TAB_IDS.DETALLE]: materia,
    [TAB_IDS.SEMAFORO]: 'Semáforo',
    [TAB_IDS.SCATTER]: 'Resultados por alumno',
    [TAB_IDS.TABLA]: 'Resumen por estudiante',
    [TAB_IDS.CIERRE]: 'Cierre',
  }

  const filterPills = useMemo(() => {
    const pills: Array<{ label: string }> = []
    if (NON_DATA_TABS.has(tab)) return pills
    if ((tab === TAB_IDS.RESUMEN || tab === TAB_IDS.DETALLE || tab === TAB_IDS.SEMAFORO) && materias.length > 1) {
      pills.push({ label: `Materia: ${materia || '—'}` })
    }
    if (tab !== TAB_IDS.SEMAFORO) {
      pills.push({ label: `Año: ${anio || '—'}` })
    }
    if (divisiones.length > 1) pills.push({ label: `División: ${division || '—'}` })
    if (toma) pills.push({ label: `Toma: ${toma}` })
    return pills
  }, [tab, materia, materias.length, anio, division, divisiones.length, toma])

  const SEMAFORO_ANIOS = ANIO_ORDER

  const advance = (direction: 'prev' | 'next') => {
    if (tab === TAB_IDS.SEMAFORO) {
      const idx = SEMAFORO_ANIOS.indexOf(semaforoAnio as typeof SEMAFORO_ANIOS[number])
      const nextSubIdx = direction === 'prev' ? idx - 1 : idx + 1
      if (nextSubIdx >= 0 && nextSubIdx < SEMAFORO_ANIOS.length) {
        setSemaforoAnio(SEMAFORO_ANIOS[nextSubIdx])
        return
      }
      // exiting Semáforo: continue to next/prev top-level tab
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
    if (nextTab === TAB_IDS.SEMAFORO) {
      // entering Semáforo: position anio at the appropriate end
      setSemaforoAnio(direction === 'next' ? SEMAFORO_ANIOS[0] : SEMAFORO_ANIOS[SEMAFORO_ANIOS.length - 1])
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
  const isIntroTab = NON_DATA_TABS.has(tab)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'rgb(230, 230, 230)' }}>
      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, minWidth: 'max-content' }}>
          <Tab value={TAB_IDS.COVER} label="Portada" />
          <Tab value={TAB_IDS.INTRO} label="Introducción" />
          <Tab value={TAB_IDS.INFORME} label="El Informe" />
          <Tab value={TAB_IDS.MATEMATICA} label="Matemática" />
          <Tab value={TAB_IDS.LENGUAJE} label="Lenguaje" />
          <Tab value={TAB_IDS.PISA} label="PISA" />
          <Tab value={TAB_IDS.PRUEBAS} label="Las pruebas" />
          <Tab value={TAB_IDS.INSTITUCIONES} label="Instituciones" />
          <Tab value={TAB_IDS.PRESENTACION} label="Presentación" />
          <Tab value={TAB_IDS.RESUMEN} label="Resumen" />
          <Tab value={TAB_IDS.HISTORICO} label="Histórico" />
          <Tab value={TAB_IDS.DETALLE} label="Contenido y competencia" />
          <Tab value={TAB_IDS.SEMAFORO} label="Semáforo" />
          <Tab value={TAB_IDS.SCATTER} label="Resultados por alumno" />
          <Tab value={TAB_IDS.TABLA} label="Resumen por estudiante" />
          <Tab value={TAB_IDS.CIERRE} label="Cierre" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!isIntroTab && <Sidebar filters={sidebarFilters} onReset={resetFilters} />}

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: isIntroTab ? 0 : '22px 24px 40px' }}>
            {tab === TAB_IDS.INTRO && escuelaId !== null && <IntroduccionTab schoolId={escuelaId} initialEditing={editRequested} />}
            {tab === TAB_IDS.COVER && escuelaId !== null && <PortadaTab />}
            {tab === TAB_IDS.PRUEBAS && escuelaId !== null && <PruebasTab schoolId={escuelaId} initialEditing={editRequested} />}
            {tab === TAB_IDS.INFORME && escuelaId !== null && <InformeTab schoolId={escuelaId} initialEditing={editRequested} />}
            {tab === TAB_IDS.MATEMATICA && escuelaId !== null && <MatematicaTab schoolId={escuelaId} initialEditing={editRequested} />}
            {tab === TAB_IDS.LENGUAJE && escuelaId !== null && <LenguajeTab schoolId={escuelaId} initialEditing={editRequested} />}
            {tab === TAB_IDS.PISA && escuelaId !== null && <PisaTab schoolId={escuelaId} initialEditing={editRequested} />}
            {tab === TAB_IDS.INSTITUCIONES && escuelaId !== null && <InstitucionesTab schoolId={escuelaId} />}
            {tab === TAB_IDS.PRESENTACION && <PresentacionResultadosTab />}
            {tab === TAB_IDS.CIERRE && <CierreTab />}
            {!isIntroTab && loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography sx={{ color: C.navy }}>Cargando reporte…</Typography>
              </Box>
            )}
            {!isIntroTab && !loading && error && (
              <Paper elevation={0} sx={{ bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 5, p: 2.5 }}>
                <Typography color="error">Error al cargar: {error}</Typography>
              </Paper>
            )}
            {!isIntroTab && !loading && !error && (
              <>
                {tab === TAB_IDS.RESUMEN && resumenData && <ResumenTab data={resumenData} />}
                {tab === TAB_IDS.HISTORICO && escuelaId !== null && <HistoricoTab schoolId={escuelaId} />}
                {tab === TAB_IDS.DETALLE && detalleData && <DetalleTab data={detalleData} />}
                {tab === TAB_IDS.RESUMEN && !resumenData && toma && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography sx={{ color: C.navy }}>Sin datos para {materia} · {anio} · {toma}</Typography>
                  </Box>
                )}
                {tab === TAB_IDS.DETALLE && !detalleData && toma && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography sx={{ color: C.navy }}>Sin datos para {materia} · {anio} · {toma}</Typography>
                  </Box>
                )}
                {tab === TAB_IDS.SEMAFORO && (
                  <SemaforoTab
                    materia={materia}
                    bandasMap={semaforoBandas}
                    anio={semaforoAnio}
                    onAnioChange={setSemaforoAnio}
                  />
                )}
                {tab === TAB_IDS.SCATTER && <ScatterTab points={scatterPoints} />}
                {tab === TAB_IDS.TABLA && <TablaTab rows={tablaRows} />}
              </>
            )}
          </Box>

          {/* Header */}
          {!isIntroTab && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 0.5, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: C.navy, fontWeight: 800 }}>
                  {schoolName} — {tabLabels[tab]}
                </Typography>
                {!isIntroTab && canManage && reportId && (
                  <Chip
                    size="small"
                    color={reportStatus === 'published' ? 'success' : 'warning'}
                    label={reportStatus === 'published' ? 'Publicado' : 'Borrador'}
                    onClick={handleTogglePublish}
                    disabled={statusBusy}
                    sx={{ ml: 2, cursor: 'pointer' }}
                  />
                )}
              </Box>
              <Logo width={headerLogoSize.w} height={headerLogoSize.h} />
            </Box>
          )}

          {/* Filter pills */}
          {!isIntroTab && (
            <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.25, bgcolor: 'white', flexWrap: 'wrap' }}>
              {filterPills.map(p => (
                <Chip key={p.label} label={p.label} size="medium" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: 600 }} />
              ))}
            </Stack>
          )}

          {/* Footer */}
          {!isIntroTab && (
            <Box sx={{ textAlign: 'center', py: 1.5, px: 3.5, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
              <Typography variant="caption" sx={{ color: C.navy }}>
                Reportes Aurora · Reporte por Escuela · Universidad Austral – Escuela de Educación
              </Typography>
            </Box>
          )}

          {/* Floating tab nav */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              zIndex: theme => theme.zIndex.fab,
              bgcolor: 'white',
              borderRadius: 999,
              boxShadow: 3,
              px: 0.5,
              py: 0.5,
            }}
          >
            <IconButton size="medium" onClick={() => advance('prev')} disabled={isFirstTab} sx={{ color: C.navy }}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton size="medium" onClick={() => advance('next')} disabled={isLastTab} sx={{ color: C.navy }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default withAuth(ReporteAurora, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
