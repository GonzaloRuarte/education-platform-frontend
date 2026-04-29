'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Box, Stack, Tabs, Tab, Chip, IconButton } from '@mui/material'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Logo from '@/shared/components/Logo'
import { ImageSize } from '@/shared/utils'
import { useEscuelaReporteAurora } from '@/mta_reports_v2/hooks'
import { COLORS, ANIO_ORDER } from '@/mta_reports_v2/constants'
import Paper from '@mui/material/Paper'
import { IntroduccionTab } from '@/mta_reports_v2/components/IntroduccionTab'
import { ResumenTab } from '@/mta_reports_v2/components/ResumenTab'
import { DetalleTab } from '@/mta_reports_v2/components/DetalleTab'
import { SemaforoTab } from '@/mta_reports_v2/components/SemaforoTab'
import { ScatterTab } from '@/mta_reports_v2/components/ScatterTab'
import { TablaTab } from '@/mta_reports_v2/components/TablaTab'
import { Sidebar } from '@/mta_reports_v2/components/EscuelaReporteSidebar'
import type { FilterDef } from '@/mta_reports_v2/components/EscuelaReporteSidebar'

const C = COLORS
const TAB_IDS = { INTRO: 'intro', RESUMEN: 'resumen', DETALLE: 'detalle', SEMAFORO: 'semaforo', SCATTER: 'scatter', TABLA: 'tabla' } as const
const headerLogoSize = new ImageSize(257, 73, { scale: 0.31 })

type TabId = 'intro' | 'resumen' | 'detalle' | 'semaforo' | 'scatter' | 'tabla'

const ReporteEscuelaPage = () => {
  const params = useParams<{ escuelaId: string }>()
  const escuelaId = params?.escuelaId ? Number(params.escuelaId) : null
  const tabsRef = useRef<HTMLDivElement>(null)

  const [tab, setTab] = useState<TabId>(TAB_IDS.RESUMEN)
  const [toma, setToma] = useState('')
  const [materia, setMateria] = useState('Matemática')
  const [anio, setAnio] = useState('3ro')
  const [division, setDivision] = useState('Todas')

  const { loading, error, tomas, getMaterias, getAnios, getDivisiones, getReporte, getSemaforoBandas, getScatterPoints, getTablaData } =
    useEscuelaReporteAurora(escuelaId)

  const materias = getMaterias(toma)
  const anios = getAnios(toma, materia)

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

  const data = toma ? getReporte({ materia, anio, division, toma }) : null
  const schoolName = data?.colegio ?? (loading ? 'Cargando…' : 'Escuela')

  const scatterPoints = useMemo(
    () => (toma ? getScatterPoints(anio, division, toma) : []),
    [anio, division, toma, getScatterPoints],
  )

  const tablaRows = useMemo(
    () => (toma ? getTablaData(anio, division, toma) : []),
    [anio, division, toma, getTablaData],
  )

  const tomaFilter = useMemo(() => ({ label: 'Toma', value: toma, opts: tomas.length > 0 ? tomas : [toma].filter(Boolean), set: setToma }), [toma, tomas])
  const divFilter = useMemo(() => ({ label: 'División', value: division, opts: divisiones, set: setDivision }), [division, divisiones])
  const materiaFilter = useMemo(() => ({ label: 'Materia', value: materia, opts: materias.length > 0 ? materias : [materia], set: setMateria }), [materia, materias])
  const anioFilter = useMemo(() => ({ label: 'Año', value: anio, opts: anios.length > 0 ? anios : ANIO_ORDER.slice(), set: setAnio }), [anio, anios])

  const sidebarFilters = useMemo((): Array<FilterDef> => {
    const FILTER_LAYOUTS: Record<TabId, Array<FilterDef>> = {
      [TAB_IDS.INTRO]: [],
      [TAB_IDS.RESUMEN]: [
        ...(materias.length > 1 ? [materiaFilter] : []),
        anioFilter,
        ...(divisiones.length > 1 ? [divFilter] : []),
        tomaFilter,
      ],
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
    [TAB_IDS.INTRO]: 'Introducción',
    [TAB_IDS.RESUMEN]: 'Resultados generales',
    [TAB_IDS.DETALLE]: materia,
    [TAB_IDS.SEMAFORO]: 'Semáforo',
    [TAB_IDS.SCATTER]: 'Resultados por alumno',
    [TAB_IDS.TABLA]: 'Resumen por estudiante',
  }

  const filterPills = useMemo(() => {
    const pills: Array<{ label: string }> = []
    if (tab === TAB_IDS.INTRO) return pills
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

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const isIntroTab = tab === TAB_IDS.INTRO

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isIntroTab && <Sidebar filters={sidebarFilters} onReset={resetFilters} />}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        {!isIntroTab && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 0.5, bgcolor: 'background.paper' }}>
            <Typography variant="h5" sx={{ color: C.navy, fontWeight: 800 }}>
              {schoolName} — {tabLabels[tab]}
            </Typography>
            <Logo width={headerLogoSize.w} height={headerLogoSize.h} />
          </Box>
        )}

        {/* Filter pills */}
        {!isIntroTab && (
          <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.25, bgcolor: 'background.paper', flexWrap: 'wrap' }}>
            {filterPills.map(p => (
              <Chip key={p.label} label={p.label} size="medium" sx={{ bgcolor: C.lightBlue, color: C.navy, fontWeight: 600 }} />
            ))}
          </Stack>
        )}

        {/* Tabs */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" onClick={() => scrollTabs('left')} sx={{ color: C.navy, flexShrink: 0 }}>
            <ChevronLeftIcon />
          </IconButton>
          <Box ref={tabsRef} sx={{ overflowX: 'auto', flex: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, minWidth: 'max-content' }}>
              <Tab value={TAB_IDS.INTRO} label="Introducción" />
              <Tab value={TAB_IDS.RESUMEN} label="Resumen" />
              <Tab value={TAB_IDS.DETALLE} label="Contenido y competencia" />
              <Tab value={TAB_IDS.SEMAFORO} label="Semáforo" />
              <Tab value={TAB_IDS.SCATTER} label="Resultados por alumno" />
              <Tab value={TAB_IDS.TABLA} label="Resumen por estudiante" />
            </Tabs>
          </Box>
          <IconButton size="small" onClick={() => scrollTabs('right')} sx={{ color: C.navy, flexShrink: 0 }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: isIntroTab ? 0 : '22px 24px 40px' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Typography color="text.secondary">Cargando reporte…</Typography>
            </Box>
          )}
          {!loading && error && (
            <Paper elevation={0} sx={{ bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 2, p: 2.5 }}>
              <Typography color="error">Error al cargar: {error}</Typography>
            </Paper>
          )}
          {!loading && !error && (
            <>
              {tab === TAB_IDS.INTRO && escuelaId !== null && <IntroduccionTab schoolId={escuelaId} />}
              {tab === TAB_IDS.RESUMEN && data && <ResumenTab data={data} />}
              {tab === TAB_IDS.DETALLE && data && <DetalleTab data={data} />}
              {(tab === TAB_IDS.RESUMEN || tab === TAB_IDS.DETALLE) && !data && toma && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography color="text.secondary">Sin datos para {materia} · {anio} · {toma}</Typography>
                </Box>
              )}
              {tab === TAB_IDS.SEMAFORO && (
                <SemaforoTab materia={materia} division={division} toma={toma} getSemaforoBandas={getSemaforoBandas} />
              )}
              {tab === TAB_IDS.SCATTER && <ScatterTab points={scatterPoints} />}
              {tab === TAB_IDS.TABLA && <TablaTab rows={tablaRows} />}
            </>
          )}
        </Box>

        {/* Footer */}
        {!isIntroTab && (
          <Box sx={{ textAlign: 'center', py: 1.5, px: 3.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="caption" color="text.secondary">
              Reportes Aurora · Reporte por Escuela · Universidad Austral – Escuela de Educación
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default withAuth(ReporteEscuelaPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
