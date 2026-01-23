'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import {
  useMetaReportGlobalArtifactAction,
  useMetaReportGlobalChatAction,
  useMetaReportGlobalDatasetAction,
  useMetaReportGlobalGenerateAll,
  useMetaReportGlobalLatestAction,
  useMetaReportGlobalLatestBySchoolIdAction,
  useMetaReportGlobalManifestAction,
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
import { useSchoolAllNames } from '@/mta_schools/hooks'
import { useSchoolOwnSchool } from '@/mta_schools/hooks/state'

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

type T_Tab = 'resumen' | 'preguntas' | 'estudiantes' | 'dataset' | 'manifest' | 'full_data' | 'chat'

const MetaReportGlobalReportPage = () => {
  const { isAdmin } = useUserProfilesResources()
  const ownSchool = useSchoolOwnSchool()
  const { data: schools } = useSchoolAllNames()

  // Admin can pick a school (or 'all'); non-admin is forced by backend.
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('')

  const { executeAction: fetchLatest, isInProgress: latestLoading } = useMetaReportGlobalLatestAction()
  const { executeAction: fetchLatestBySchoolId, isInProgress: latestBySchoolLoading } =
    useMetaReportGlobalLatestBySchoolIdAction({ schoolId: selectedSchoolId === '' ? 0 : selectedSchoolId })

  const [bundle, setBundle] = useState<any>(undefined)
  const [topError, setTopError] = useState<string | null>(null)

  const bundleId = bundle?.id ? Number(bundle.id) : 0

  const { executeAction: fetchManifest, isInProgress: manifestLoading } = useMetaReportGlobalManifestAction({
    bundleId,
  })
  const { executeAction: fetchSummaries, isInProgress: summariesLoading } = useMetaReportGlobalArtifactAction({
    bundleId,
    name: 'summaries',
  })
  const { executeAction: fetchQuestionsStats, isInProgress: questionsLoading } = useMetaReportGlobalArtifactAction({
    bundleId,
    name: 'questions_stats',
  })
  const { executeAction: fetchStudentsStats, isInProgress: studentsLoading } = useMetaReportGlobalArtifactAction({
    bundleId,
    name: 'students_stats',
  })
  const { executeAction: fetchFullData, isInProgress: fullDataLoading } = useMetaReportGlobalArtifactAction({
    bundleId,
    name: 'full_data_2',
  })

  // Dataset selection
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('')
  const [selectedSubjects, setSelectedSubjects] = useState<string>('')

  // Dataset loader fix: separate fetchers per dataset type (no state-race on name)
  const { executeAction: fetchGraph, isInProgress: graphLoading } = useMetaReportGlobalDatasetAction({
    bundleId,
    grade: selectedGrade === '' ? 0 : selectedGrade,
    subjects: selectedSubjects === '' ? 'Lenguage_y_Matematica' : selectedSubjects,
    name: 'graph',
  })
  const { executeAction: fetchClusterSummary, isInProgress: clusterLoading } = useMetaReportGlobalDatasetAction({
    bundleId,
    grade: selectedGrade === '' ? 0 : selectedGrade,
    subjects: selectedSubjects === '' ? 'Lenguage_y_Matematica' : selectedSubjects,
    name: 'cluster_summary',
  })
  const { executeAction: fetchDatasetData, isInProgress: datasetDataLoading } = useMetaReportGlobalDatasetAction({
    bundleId,
    grade: selectedGrade === '' ? 0 : selectedGrade,
    subjects: selectedSubjects === '' ? 'Lenguage_y_Matematica' : selectedSubjects,
    name: 'data',
  })

  const generateAll = useMetaReportGlobalGenerateAll()

  const { executeAction: sendChat, isInProgress: chatLoading } = useMetaReportGlobalChatAction({ bundleId })

  const [tab, setTab] = useState<T_Tab>('resumen')
  const [manifest, setManifest] = useState<any>(undefined)
  const [summaries, setSummaries] = useState<any>(undefined)
  const [questionsStats, setQuestionsStats] = useState<any>(undefined)
  const [studentsStats, setStudentsStats] = useState<any>(undefined)
  const [fullData, setFullData] = useState<any>(undefined)
  const [graph, setGraph] = useState<any>(undefined)
  const [clusterSummary, setClusterSummary] = useState<any>(undefined)
  const [datasetData, setDatasetData] = useState<any>(undefined)

  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])

  const ready = bundle?.status === 'D'

  const loadLatestBundle = async () => {
    setTopError(null)
    try {
      // Admin can optionally pick school. Non-admin always forced by backend.
      const data = isAdmin && selectedSchoolId !== '' ? await fetchLatestBySchoolId() : await fetchLatest()
      setBundle(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando reporte global')
      setBundle(undefined)
    }
  }

  useEffect(() => {
    loadLatestBundle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchoolId])

  const datasetOptions = useMemo(() => {
    const ds: string[] = manifest?.files?.datasets ?? []
    if (!Array.isArray(ds) || ds.length === 0) return [] as Array<{ grade: number; subjects: string }>

    const unique = new Map<string, { grade: number; subjects: string }>()
    for (const p of ds) {
      // expected: <prefix>/<grade>/<subjects>/<file>.json
      const tail = manifest?.storage_prefix ? String(p).replace(manifest.storage_prefix, '') : String(p)
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

      // Set defaults for dataset selectors
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
      setTopError(e?.message ?? 'Error cargando full_data_2')
    }
  }

  const loadGraph = async () => {
    setTopError(null)
    try {
      const data = await fetchGraph()
      setGraph(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando graph')
    }
  }

  const loadClusterSummary = async () => {
    setTopError(null)
    try {
      const data = await fetchClusterSummary()
      setClusterSummary(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando cluster_summary')
    }
  }

  const loadDatasetData = async () => {
    setTopError(null)
    try {
      const data = await fetchDatasetData()
      setDatasetData(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando data')
    }
  }

  const regenerateAll = async () => {
    setTopError(null)
    try {
      await generateAll.executeAction({ force_new_version: true })
      successToast('Generación de bundles globales encolada')
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error encolando generación global')
    }
  }

  const doChat = async () => {
    if (!bundleId) return
    const msg = chatMessage.trim()
    if (!msg) return
    setChatHistory((h) => [...h, { role: 'user', text: msg }])
    setChatMessage('')
    try {
      const res: any = await sendChat({ message: msg, filters: {} } as any)
      const answer = res?.answer ?? res?.response ?? JSON.stringify(res)
      setChatHistory((h) => [...h, { role: 'assistant', text: String(answer) }])
    } catch (e: any) {
      handleServiceError(e)
      setChatHistory((h) => [...h, { role: 'assistant', text: 'Error obteniendo respuesta del chat.' }])
    }
  }

  // Auto-load manifest once bundle is ready
  useEffect(() => {
    if (ready && bundleId) {
      loadManifest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleId, ready])

  const isLoading = latestLoading || latestBySchoolLoading

  return (
    <Page>
      <H3>Reporte META (Global)</H3>
      <Spacer y={2} />

      {topError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {topError}
        </Alert>
      )}

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ md: 'center' }}>
        {isAdmin && (
          <TextField
            select
            label="Escuela"
            size="small"
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">Todas las escuelas</MenuItem>
            {(schools ?? []).map((s: any) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        {!isAdmin && ownSchool && (
          <Chip
            size="small"
            label={`Escuela: ${ownSchool.name}`}
            color="info"
            sx={{ alignSelf: { xs: 'flex-start', md: 'auto' } }}
          />
        )}

        <Button variant="outlined" onClick={loadLatestBundle} disabled={isLoading}>
          Recargar
        </Button>

        {isAdmin && (
          <Button variant="contained" onClick={regenerateAll} disabled={generateAll.isInProgress}>
            Regenerar global (todas)
          </Button>
        )}

        {bundle && (
          <Chip
            size="small"
            label={`Estado: ${statusLabel(bundle.status)}`}
            color={statusColor(bundle.status)}
          />
        )}
      </Box>

      <Spacer y={2} />

      {isLoading && <Spinner />}

      {bundle && (
        <>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: '1px solid rgba(0,0,0,0.12)' }}
          >
            <Tab value="resumen" label="Resumen" />
            <Tab value="preguntas" label="Preguntas" />
            <Tab value="estudiantes" label="Estudiantes" />
            <Tab value="dataset" label="Dataset" />
            <Tab value="manifest" label="Manifest" />
            <Tab value="full_data" label="Full Data" />
            <Tab value="chat" label="Chat" />
          </Tabs>

          <Spacer y={2} />

          {!ready && (
            <Alert severity="info">El bundle global aún no está listo (estado: {statusLabel(bundle.status)}).</Alert>
          )}

          {ready && tab === 'manifest' && (
            <>
              <Button variant="outlined" onClick={loadManifest} disabled={manifestLoading}>
                Cargar manifest
              </Button>
              <Spacer y={2} />
              <JsonPanel data={manifest} />
            </>
          )}

          {ready && tab === 'resumen' && (
            <>
              <Button variant="outlined" onClick={loadSummaries} disabled={summariesLoading}>
                Cargar resumen
              </Button>
              <Spacer y={2} />
              <JsonPanel data={summaries} />
            </>
          )}

          {ready && tab === 'preguntas' && (
            <>
              <Button variant="outlined" onClick={loadQuestionsStats} disabled={questionsLoading}>
                Cargar preguntas
              </Button>
              <Spacer y={2} />
              <JsonPanel data={questionsStats} />
            </>
          )}

          {ready && tab === 'estudiantes' && (
            <>
              <Button variant="outlined" onClick={loadStudentsStats} disabled={studentsLoading}>
                Cargar estudiantes
              </Button>
              <Spacer y={2} />
              <JsonPanel data={studentsStats} />
            </>
          )}

          {ready && tab === 'full_data' && (
            <>
              <Button variant="outlined" onClick={loadFullData} disabled={fullDataLoading}>
                Cargar full_data_2
              </Button>
              <Spacer y={2} />
              <JsonPanel data={fullData} />
            </>
          )}

          {ready && tab === 'dataset' && (
            <>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                <TextField
                  select
                  label="Año"
                  size="small"
                  value={selectedGrade}
                  onChange={(e) => {
                    const v = e.target.value
                    setSelectedGrade(v === '' ? '' : Number(v))
                    setSelectedSubjects('')
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">—</MenuItem>
                  {grades.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}º
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Materias"
                  size="small"
                  value={selectedSubjects}
                  onChange={(e) => setSelectedSubjects(String(e.target.value))}
                  sx={{ minWidth: 260 }}
                  disabled={selectedGrade === ''}
                >
                  <MenuItem value="">—</MenuItem>
                  {subjectsForGrade.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="outlined"
                  onClick={loadGraph}
                  disabled={selectedGrade === '' || selectedSubjects === '' || graphLoading}
                >
                  Cargar graph
                </Button>
                <Button
                  variant="outlined"
                  onClick={loadClusterSummary}
                  disabled={selectedGrade === '' || selectedSubjects === '' || clusterLoading}
                >
                  Cargar cluster_summary
                </Button>
                <Button
                  variant="outlined"
                  onClick={loadDatasetData}
                  disabled={selectedGrade === '' || selectedSubjects === '' || datasetDataLoading}
                >
                  Cargar data
                </Button>
              </Box>

              <Spacer y={2} />

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                <Box>
                  <H3>graph</H3>
                  <JsonPanel data={graph} />
                </Box>
                <Box>
                  <H3>cluster_summary</H3>
                  <JsonPanel data={clusterSummary} />
                </Box>
                <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
                  <H3>data</H3>
                  <JsonPanel data={datasetData} />
                </Box>
              </Box>
            </>
          )}

          {ready && tab === 'chat' && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Chat (beta). Responde usando el resumen del bundle global.
              </Alert>

              <Box
                sx={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 2,
                  p: 2,
                  maxHeight: 360,
                  overflow: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                }}
              >
                {chatHistory.length === 0 ? (
                  <Box sx={{ color: 'rgba(0,0,0,0.6)' }}>Escribe una pregunta para comenzar…</Box>
                ) : (
                  chatHistory.map((m, idx) => (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <b>{m.role === 'user' ? 'Tú' : 'META'}:</b> {m.text}
                    </Box>
                  ))
                )}
              </Box>

              <Spacer y={2} />

              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  label="Mensaje"
                  size="small"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') doChat()
                  }}
                />
                <Button variant="contained" onClick={doChat} disabled={chatLoading}>
                  Enviar
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Page>
  )
}

export default withAuth(MetaReportGlobalReportPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})
