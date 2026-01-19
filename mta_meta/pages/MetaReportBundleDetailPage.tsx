'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import { META_REPORT_BUNDLE_NAME } from '@/mta_meta/constants'
import {
  useMetaReportBundleDetail,
  useMetaReportGenerate,
  useMetaReportManifestAction,
  useMetaReportArtifactAction,
  useMetaReportDatasetAction,
  useNavigateToMetaReportList,
} from '@/mta_meta/hooks'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import Button from '@/shared/components/Button'
import Chip from '@/shared/components/Chip'
import { H3 } from '@/shared/components/Typography'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

const statusLabel = (s: string) => {
  if (s === 'P') return 'Pendiente'
  if (s === 'R') return 'Procesando'
  if (s === 'D') return 'Listo'
  if (s === 'F') return 'Falló'
  return s
}

const statusColor = (s: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  if (s === 'D') return 'success'
  if (s === 'R') return 'info'
  if (s === 'P') return 'warning'
  if (s === 'F') return 'error'
  return 'default'
}

const JsonPanel = ({ data }: { data: any }) => {
  return (
    <Box
      sx={{
        fontFamily: 'monospace',
        fontSize: 12,
        p: 2,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.12)',
        backgroundColor: 'rgba(0,0,0,0.02)',
        overflow: 'auto',
        maxHeight: 520,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {data === undefined ? '—' : JSON.stringify(data, null, 2)}
    </Box>
  )
}

type T_Tab = 'resumen' | 'preguntas' | 'estudiantes' | 'dataset' | 'manifest' | 'full_data'

const MetaReportBundleDetailPage = () => {
  const params = useParams() as { bundleId?: string }
  const bundleId = Number(params.bundleId)

  const navToList = useNavigateToMetaReportList()
  const { isAdmin } = useUserProfilesResources()

  const { data: bundle, reload: reloadBundle } = useMetaReportBundleDetail(bundleId)

  // Manual GET actions
  const { executeAction: fetchManifest, isInProgress: manifestLoading } = useMetaReportManifestAction({ bundleId })
  const { executeAction: fetchSummaries, isInProgress: summariesLoading } = useMetaReportArtifactAction({
    bundleId,
    name: 'summaries',
  })
  const { executeAction: fetchQuestionsStats, isInProgress: questionsLoading } = useMetaReportArtifactAction({
    bundleId,
    name: 'questions_stats',
  })
  const { executeAction: fetchStudentsStats, isInProgress: studentsLoading } = useMetaReportArtifactAction({
    bundleId,
    name: 'students_stats',
  })
  const { executeAction: fetchFullData, isInProgress: fullDataLoading } = useMetaReportArtifactAction({
    bundleId,
    name: 'full_data_2',
  })

  // Dataset action (query params are placeholders)
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('')
  const [selectedSubjects, setSelectedSubjects] = useState<string>('')
  const [selectedDatasetName, setSelectedDatasetName] = useState<'graph' | 'data' | 'cluster_summary'>('graph')

  const { executeAction: fetchDataset, isInProgress: datasetLoading } = useMetaReportDatasetAction({
    bundleId,
    grade: selectedGrade === '' ? 0 : selectedGrade,
    subjects: selectedSubjects === '' ? 'Lenguage_y_Matematica' : selectedSubjects,
    name: selectedDatasetName,
  })

  const generate = useMetaReportGenerate()

  const [tab, setTab] = useState<T_Tab>('resumen')

  const [manifest, setManifest] = useState<any>(undefined)
  const [summaries, setSummaries] = useState<any>(undefined)
  const [questionsStats, setQuestionsStats] = useState<any>(undefined)
  const [studentsStats, setStudentsStats] = useState<any>(undefined)
  const [fullData, setFullData] = useState<any>(undefined)
  const [dataset, setDataset] = useState<any>(undefined)

  const [topError, setTopError] = useState<string | null>(null)

  const ready = bundle?.status === 'D'

  const datasetOptions = useMemo(() => {
    const ds: string[] = manifest?.files?.datasets ?? []
    if (!Array.isArray(ds) || ds.length === 0) return [] as Array<{ grade: number; subjects: string }>

    const unique = new Map<string, { grade: number; subjects: string }>()
    for (const p of ds) {
      // expected: <prefix>/<grade>/<subjects>/<file>.json
      const tail = manifest?.storage_prefix ? p.replace(manifest.storage_prefix, '') : p
      const parts = tail.split('/').filter(Boolean)
      if (parts.length < 3) continue
      const grade = Number(parts[0])
      const subjects = parts[1]
      if (!Number.isFinite(grade)) continue
      unique.set(`${grade}|${subjects}`, { grade, subjects })
    }

    return Array.from(unique.values()).sort((a, b) => a.grade - b.grade)
  }, [manifest])

  const grades = useMemo(() => {
    const s = new Set<number>()
    datasetOptions.forEach((o) => s.add(o.grade))
    return Array.from(s.values()).sort((a, b) => a - b)
  }, [datasetOptions])

  const subjectsForGrade = useMemo(() => {
    if (selectedGrade === '') return []
    return datasetOptions
      .filter((o) => o.grade === selectedGrade)
      .map((o) => o.subjects)
      .sort()
  }, [datasetOptions, selectedGrade])

  const loadManifest = async () => {
    setTopError(null)
    try {
      const data = await fetchManifest()
      setManifest(data)

      // sensible defaults (based on returned manifest)
      const ds: string[] = data?.files?.datasets ?? []
      const firstPath = Array.isArray(ds) ? ds[0] : undefined
      if (firstPath) {
        const tail = data?.storage_prefix ? String(firstPath).replace(data.storage_prefix, '') : String(firstPath)
        const parts = tail.split('/').filter(Boolean)
        const grade = Number(parts?.[0])
        const subjects = parts?.[1]
        if (selectedGrade === '' && Number.isFinite(grade)) setSelectedGrade(grade)
        if (selectedSubjects === '' && subjects) setSelectedSubjects(subjects)
      }
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando manifest')
    }
  }

  const loadSummaries = async () => {
    setTopError(null)
    try {
      const data = await fetchSummaries()
      setSummaries(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando resumen')
    }
  }

  const loadQuestionsStats = async () => {
    setTopError(null)
    try {
      const data = await fetchQuestionsStats()
      setQuestionsStats(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando preguntas')
    }
  }

  const loadStudentsStats = async () => {
    setTopError(null)
    try {
      const data = await fetchStudentsStats()
      setStudentsStats(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando estudiantes')
    }
  }

  const loadFullData = async () => {
    setTopError(null)
    try {
      const data = await fetchFullData()
      setFullData(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando datos completos')
    }
  }

  const loadDataset = async () => {
    setTopError(null)
    try {
      const data = await fetchDataset()
      setDataset(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando dataset')
    }
  }

  const reloadAll = () => {
    reloadBundle()
    if (bundleId) loadManifest()
  }

  useEffect(() => {
    if (!bundleId) return
    // try to load manifest early (if the bundle isn't ready, API returns 409)
    loadManifest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleId])

  useEffect(() => {
    if (!ready) return
    // Auto-load summaries on first open
    if (tab === 'resumen' && summaries === undefined && !summariesLoading) {
      loadSummaries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, ready])

  const canLoadDataset = ready && selectedGrade !== '' && selectedSubjects !== ''

  return (
    <Page>
      <Page.Title disableMarginBottom>
        Detalle {META_REPORT_BUNDLE_NAME.singular} #{bundleId}
      </Page.Title>
      <Spacer size="s" />

      <Page.BasicToolbar entityName={META_REPORT_BUNDLE_NAME} id={bundleId} onExit={navToList} reload={reloadAll} />

      <Page.Content>
        {bundle === undefined ? (
          <Spinner />
        ) : (
          <>
            {topError && (
              <>
                <Alert severity="error">{topError}</Alert>
                <Spacer size="m" />
              </>
            )}

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip label={`Estado: ${statusLabel(bundle.status)}`} color={statusColor(bundle.status)} />
              <Chip label={`Versión: v${bundle.version}`} />
              <Chip label={`ARP: ${bundle.arp_id}`} />
              {bundle.generated_at && <Chip label={`Generado: ${new Date(bundle.generated_at).toLocaleString()}`} />}
            </Box>

            {bundle.status === 'F' && bundle.error_message && (
              <>
                <Spacer size="m" />
                <Alert severity="warning">
                  Error: {bundle.error_message}
                </Alert>
              </>
            )}

            <Spacer size="m" />

            {isAdmin && (
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  onClick={() => {
                    if (!bundle?.arp_id) return
                    generate({ arp_id: bundle.arp_id, force_new_version: true })
                      .then(() => {
                        successToast('Reporte META encolado para regeneración')
                        reloadAll()
                      })
                      .catch(handleServiceError)
                  }}
                >
                  Regenerar (nueva versión)
                </Button>
              </Box>
            )}

            <Spacer size="l" />

            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="resumen" label="Resumen" />
              <Tab value="preguntas" label="Preguntas" />
              <Tab value="estudiantes" label="Estudiantes" />
              <Tab value="dataset" label="Dataset" />
              <Tab value="manifest" label="Manifest" />
              <Tab value="full_data" label="Datos completos" />
            </Tabs>

            <Spacer size="m" />

            {!ready && (
              <Alert severity="info">
                El bundle todavía no está listo. Una vez que termine el procesamiento en Huey, vas a poder ver los
                artefactos.
              </Alert>
            )}

            {ready && tab === 'resumen' && (
              <>
                <H3>summaries.json</H3>
                <Spacer size="s" />
                <Button onClick={loadSummaries} disabled={summariesLoading}>
                  {summariesLoading ? 'Cargando...' : summaries ? 'Recargar' : 'Cargar'}
                </Button>
                <Spacer size="m" />
                <JsonPanel data={summaries} />
              </>
            )}

            {ready && tab === 'preguntas' && (
              <>
                <H3>questions_stats.json</H3>
                <Spacer size="s" />
                <Button onClick={loadQuestionsStats} disabled={questionsLoading}>
                  {questionsLoading ? 'Cargando...' : questionsStats ? 'Recargar' : 'Cargar'}
                </Button>
                <Spacer size="m" />
                <JsonPanel data={questionsStats} />
              </>
            )}

            {ready && tab === 'estudiantes' && (
              <>
                <H3>students_stats.json</H3>
                <Spacer size="s" />
                <Button onClick={loadStudentsStats} disabled={studentsLoading}>
                  {studentsLoading ? 'Cargando...' : studentsStats ? 'Recargar' : 'Cargar'}
                </Button>
                <Spacer size="m" />
                <JsonPanel data={studentsStats} />
              </>
            )}

            {ready && tab === 'manifest' && (
              <>
                <H3>manifest.json</H3>
                <Spacer size="s" />
                <Button onClick={loadManifest} disabled={manifestLoading}>
                  {manifestLoading ? 'Cargando...' : manifest ? 'Recargar' : 'Cargar'}
                </Button>
                <Spacer size="m" />
                <JsonPanel data={manifest} />
              </>
            )}

            {ready && tab === 'full_data' && (
              <>
                <H3>full_data_2.json</H3>
                <Spacer size="s" />
                <Alert severity="warning">
                  Este archivo puede ser grande. Se recomienda usarlo sólo si es necesario.
                </Alert>
                <Spacer size="s" />
                <Button onClick={loadFullData} disabled={fullDataLoading}>
                  {fullDataLoading ? 'Cargando...' : fullData ? 'Recargar' : 'Cargar'}
                </Button>
                <Spacer size="m" />
                <JsonPanel data={fullData} />
              </>
            )}

            {ready && tab === 'dataset' && (
              <>
                <H3>Dataset</H3>
                <Spacer size="s" />

                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                    select
                    label="Año"
                    value={selectedGrade}
                    onChange={(e) => {
                      const g = e.target.value === '' ? '' : Number(e.target.value)
                      setSelectedGrade(g)
                      setSelectedSubjects('')
                      setDataset(undefined)
                    }}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="">Seleccionar</MenuItem>
                    {grades.map((g) => (
                      <MenuItem key={g} value={g}>
                        {g}º
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Materias"
                    value={selectedSubjects}
                    onChange={(e) => {
                      setSelectedSubjects(String(e.target.value))
                      setDataset(undefined)
                    }}
                    sx={{ minWidth: 240 }}
                    disabled={selectedGrade === ''}
                  >
                    <MenuItem value="">Seleccionar</MenuItem>
                    {subjectsForGrade.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Archivo"
                    value={selectedDatasetName}
                    onChange={(e) => {
                      setSelectedDatasetName(e.target.value as any)
                      setDataset(undefined)
                    }}
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="graph">graph.json</MenuItem>
                    <MenuItem value="data">data.json</MenuItem>
                    <MenuItem value="cluster_summary">cluster_summary.json</MenuItem>
                  </TextField>

                  <Button onClick={loadDataset} disabled={!canLoadDataset || datasetLoading}>
                    {datasetLoading ? 'Cargando...' : dataset ? 'Recargar' : 'Cargar'}
                  </Button>
                </Box>

                <Spacer size="m" />
                <JsonPanel data={dataset} />
              </>
            )}
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default withAuth(MetaReportBundleDetailPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})
