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
import { H3, H4 } from '@/shared/components/Typography'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useSchoolAllNames } from '@/mta_schools/hooks'
import { useEffect, useMemo, useState } from 'react'

type T_Tab = 'resumen' | 'preguntas' | 'estudiantes' | 'agrupamiento' | 'red' | 'chat'

type T_DatasetOption = { grade: number; subjects: string; label: string }

type T_GraphJson = {
  nodes: Array<{ id: string; is_leaf?: boolean; score?: number | null; cluster_label?: string | null; pos?: [number, number] }>
  links: Array<{ source: string; target: string }>
}

const statusLabel = (s?: string) => {
  if (s === 'P') return 'Pendiente'
  if (s === 'R') return 'Procesando'
  if (s === 'D') return 'Listo'
  if (s === 'F') return 'Falló'
  return s ?? '—'
}

const normalizeDatasetLabel = (subjects: string) => {
  return subjects
    .replace(/_/g, ' ')
    .replace(/y/g, 'y')
    .replace(/Lenguage/g, 'Lenguaje')
}

const safeNum = (v: any) => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

const buildDatasetOptions = (manifest: any): T_DatasetOption[] => {
  const raw = manifest?.files?.datasets
  if (!raw) return []

  // 1) New format: [{ grade, subjects, label, ... }]
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
    return raw
      .map((d: any) => {
        const grade = Number(d.grade ?? d.grade_id)
        // IMPORTANT:
        // Backend global bundles expose datasets with:
        //   { grade, dataset_id, subjects: ['L'|'M'...], graph, data, cluster_summary }
        // The dataset endpoint expects the query param `subjects` to be the dataset_id.
        // If we stringify `subjects` (the array), we'll end up sending "L" or "L,M",
        // which causes the backend to return: "Dataset not found".
        const subjects = String(d.dataset_id ?? d.id ?? '')
        if (!Number.isFinite(grade) || !subjects) return null
        return {
          grade,
          subjects,
          label: String(d.label ?? normalizeDatasetLabel(subjects)),
        } as T_DatasetOption
      })
      .filter(Boolean) as T_DatasetOption[]
  }

  // 2) Legacy format: ["<prefix>/<grade>/<subjects>/<file>.json", ...]
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
    const out = new Map<string, T_DatasetOption>()
    for (const p of raw as string[]) {
      const s = String(p)
      const parts = s.split('/').filter(Boolean)
      // Find first numeric segment as grade
      let gradeIdx = parts.findIndex((x) => /^\d+$/.test(x))
      if (gradeIdx < 0) continue
      const grade = Number(parts[gradeIdx])
      const subjects = parts[gradeIdx + 1]
      if (!Number.isFinite(grade) || !subjects) continue
      const key = `${grade}|${subjects}`
      if (!out.has(key)) {
        out.set(key, { grade, subjects, label: normalizeDatasetLabel(subjects) })
      }
    }
    return Array.from(out.values()).sort((a, b) => a.grade - b.grade || a.label.localeCompare(b.label))
  }

  return []
}

const SummaryCards = ({ summary }: { summary: any }) => {
  if (!summary) return null

  const cards: Array<{ label: string; value: any }> = [
    { label: 'Respuestas', value: summary.total_answers },
    { label: 'Preguntas', value: summary.total_questions },
    { label: 'Estudiantes', value: summary.total_students },
    { label: 'Escuelas', value: summary.total_schools },
    { label: 'Promedio', value: safeNum(summary.total_avg_score)?.toFixed(3) },
    { label: 'Desvío', value: safeNum(summary.total_std_score)?.toFixed(3) },
    { label: 'Kr-20', value: safeNum(summary.total_kr20)?.toFixed(3) },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
      {cards.map((c) => (
        <Card key={c.label} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              {c.label}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {c.value ?? '—'}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

const ClusterCards = ({ cluster }: { cluster: any }) => {
  if (!cluster) return null

  const clusterIds = Object.keys(cluster.scores_mean ?? {}).sort((a, b) => Number(a) - Number(b))
  if (clusterIds.length === 0) {
    return <Alert severity="info">No hay clusters disponibles para este dataset.</Alert>
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
      {clusterIds.map((cid) => {
        const mean = safeNum(cluster?.scores_mean?.[cid])
        const nStudents = cluster?.n_students?.[cid] ?? cluster?.n_students?.[String(cid)]
        const students = cluster?.student_ids?.[cid] ?? []

        return (
          <Card key={cid} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2">Cluster {cid}</Typography>
              <Typography variant="body2" color="text.secondary">
                Puntaje medio: {mean === null ? '—' : mean.toFixed(3)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estudiantes: {nStudents ?? students?.length ?? '—'}
              </Typography>

              {Array.isArray(students) && students.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ejemplo de IDs:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {students.slice(0, 12).join(', ')}{students.length > 12 ? '…' : ''}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}


const MetaReportGlobalReportPage = () => {
  const { isAdmin } = useUserProfilesResources()

  const { data: schoolsRaw } = useSchoolAllNames()
  const schools = Array.isArray(schoolsRaw) ? schoolsRaw : []

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | ''>('')

  const [bundle, setBundle] = useState<any>(null)
  const bundleId = bundle?.id ? Number(bundle.id) : 0

  const { executeAction: fetchLatest, isInProgress: latestLoading } = useMetaReportGlobalLatestAction()
  const { executeAction: fetchLatestBySchool, isInProgress: latestBySchoolLoading } =
    useMetaReportGlobalLatestBySchoolIdAction({ school_id: selectedSchoolId === '' ? 0 : selectedSchoolId })

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

  const generateAll = useMetaReportGlobalGenerateAll()

  const [manifest, setManifest] = useState<any>(null)
  const [summaries, setSummaries] = useState<any>(null)
  const [questionsStats, setQuestionsStats] = useState<any>(null)
  const [studentsStats, setStudentsStats] = useState<any>(null)

  const [tab, setTab] = useState<T_Tab>('resumen')
  const [topError, setTopError] = useState<string | null>(null)

  // Dataset selection (clusters + graph)
  const datasetOptions = useMemo(() => buildDatasetOptions(manifest), [manifest])
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('')
  const [selectedSubjects, setSelectedSubjects] = useState<string>('')

  const { executeAction: fetchClusterSummary, isInProgress: clusterLoading } = useMetaReportGlobalDatasetAction({
    bundleId,
    grade: selectedGrade === '' ? 0 : selectedGrade,
    subjects: selectedSubjects || 'Lenguage',
    name: 'cluster_summary',
  })

  const { executeAction: fetchGraph, isInProgress: graphLoading } = useMetaReportGlobalDatasetAction({
    bundleId,
    grade: selectedGrade === '' ? 0 : selectedGrade,
    subjects: selectedSubjects || 'Lenguage',
    name: 'graph',
  })

  const { executeAction: fetchData, isInProgress: dataLoading } = useMetaReportGlobalDatasetAction({
    bundleId,
    grade: selectedGrade === '' ? 0 : selectedGrade,
    subjects: selectedSubjects || 'Lenguage',
    name: 'data',
  })

  const { executeAction: chatAction, isInProgress: chatLoading } = useMetaReportGlobalChatAction({ bundleId })

  const [clusterSummary, setClusterSummary] = useState<any>(null)
  const [graph, setGraph] = useState<T_GraphJson | null>(null)
  const [datasetData, setDatasetData] = useState<any>(null)

  const [chatText, setChatText] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  const ready = bundle?.status === 'D'

  const loadLatestBundle = async () => {
    setTopError(null)
    try {
      const data = isAdmin && selectedSchoolId !== '' ? await fetchLatestBySchool() : await fetchLatest()
      setBundle(data)
    } catch (e: any) {
      handleServiceError(e)
      setBundle(null)
      setTopError(e?.message ?? 'No se pudo cargar el reporte global')
    }
  }

  const loadManifest = async () => {
    if (!bundleId) return
    setTopError(null)
    try {
      const data = await fetchManifest()
      setManifest(data)

      // Set defaults for dataset selectors
      const options = buildDatasetOptions(data)
      if (options.length > 0) {
        if (selectedGrade === '') setSelectedGrade(options[0].grade)
        if (!selectedSubjects) setSelectedSubjects(options[0].subjects)
      }
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando manifest')
    }
  }

  const loadSummaries = async () => {
    if (!bundleId || !ready) return
    setTopError(null)
    try {
      const data = await fetchSummaries()
      setSummaries(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando resumen')
    }
  }

  const loadQuestions = async () => {
    if (!bundleId || !ready) return
    setTopError(null)
    try {
      const data = await fetchQuestionsStats()
      setQuestionsStats(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando preguntas')
    }
  }

  const loadStudents = async () => {
    if (!bundleId || !ready) return
    setTopError(null)
    try {
      const data = await fetchStudentsStats()
      setStudentsStats(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando estudiantes')
    }
  }

  const loadCluster = async () => {
    if (!bundleId || !ready || selectedGrade === '' || !selectedSubjects) return
    setTopError(null)
    try {
      const data = await fetchClusterSummary()
      setClusterSummary(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando clustering')
    }
  }

  const loadGraph = async () => {
    if (!bundleId || !ready || selectedGrade === '' || !selectedSubjects) return
    setTopError(null)
    try {
      const data = await fetchGraph()
      setGraph(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando red')
    }
  }

  const loadDatasetData = async () => {
    if (!bundleId || !ready || selectedGrade === '' || !selectedSubjects) return
    setTopError(null)
    try {
      const data = await fetchData()
      setDatasetData(data)
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'Error cargando datos de dataset')
    }
  }

  const regenerateAll = async () => {
    setTopError(null)
    try {
      await generateAll({ force_new_version: true })
      successToast('Generación del reporte global encolada')
      loadLatestBundle()
    } catch (e: any) {
      handleServiceError(e)
      setTopError(e?.message ?? 'No se pudo encolar la regeneración')
    }
  }

  const sendChat = async () => {
    if (!chatText.trim()) return
    const userMsg = chatText.trim()
    setChatText('')
    setMessages((m) => [...m, { role: 'user', content: userMsg }])

    try {
      const res = await chatAction({ message: userMsg, filters: { grade: selectedGrade, subjects: selectedSubjects } })
      const text = (res as any)?.response ?? (res as any)?.answer ?? ''
      setMessages((m) => [...m, { role: 'assistant', content: text || '—' }])
    } catch (e: any) {
      handleServiceError(e)
      setMessages((m) => [...m, { role: 'assistant', content: 'Error al consultar el chat.' }])
    }
  }

  useEffect(() => {
    loadLatestBundle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    loadLatestBundle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchoolId])

  useEffect(() => {
    if (!bundleId) return

    // When we switch bundles (e.g. admin selecting another school),
    // clear all derived UI state so the page reloads data from the
    // new manifest instead of showing stale tabs from the previous bundle.
    setManifest(null)
    setSummaries(null)
    setQuestionsStats(null)
    setStudentsStats(null)
    setClusterSummary(null)
    setGraph(null)
    setDatasetData(null)
    setSelectedGrade('')
    setSelectedSubjects('')
    setMessages([])
    setChatText('')

    loadManifest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleId])

  useEffect(() => {
    if (!ready) return
    if (tab === 'resumen' && !summaries && !summariesLoading) loadSummaries()
    if (tab === 'preguntas' && !questionsStats && !questionsLoading) loadQuestions()
    if (tab === 'estudiantes' && !studentsStats && !studentsLoading) loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, ready])

  useEffect(() => {
    if (!ready) return
    if (!selectedGrade || !selectedSubjects) return
    // Preload clustering+graph when switching tabs
    if (tab === 'agrupamiento' && !clusterSummary && !clusterLoading) loadCluster()
    if (tab === 'red' && !graph && !graphLoading) loadGraph()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedGrade, selectedSubjects, ready])

  const questionsRows = useMemo(() => {
    if (!questionsStats || typeof questionsStats !== 'object') return []
    return Object.entries(questionsStats).map(([qid, v]: any, idx) => {
      return {
        id: qid,
        qid,
        count: safeNum(v?.count),
        mean: safeNum(v?.mean),
        competencia: v?.competencia ?? '',
        question: v?.question ?? '',
        contenido: v?.contenido ?? '',
      }
    })
  }, [questionsStats])

  const questionColumns: Array<GridColDef> = [
    { field: 'qid', headerName: 'Pregunta', flex: 1 },
    { field: 'mean', headerName: 'Promedio', flex: 0.7, valueFormatter: ({ value }) => (value == null ? '—' : Number(value).toFixed(3)) },
    { field: 'count', headerName: 'N', flex: 0.5 },
    { field: 'competencia', headerName: 'Competencia', flex: 1 },
    { field: 'question', headerName: 'Enunciado', flex: 2 },
  ]

  const studentsRows = useMemo(() => {
    if (!studentsStats || typeof studentsStats !== 'object') return []
    return Object.entries(studentsStats).map(([k, v]: any) => {
      // Key can be: "(student_id, grade, school, 'L')"
      let student_id: number | null = null
      let grade: number | null = null
      let school_id: number | null = null
      let subject: string | null = null

      if (typeof k === 'string' && k.startsWith('(')) {
        const m = k.match(/\((\d+),\s*(\d+),\s*(\d+),\s*'([^']+)'\)/)
        if (m) {
          student_id = Number(m[1])
          grade = Number(m[2])
          school_id = Number(m[3])
          subject = m[4]
        }
      }

      return {
        id: k,
        student_id: student_id ?? k,
        grade,
        school_id,
        subject,
        count: safeNum(v?.count),
        mean: safeNum(v?.mean),
      }
    })
  }, [studentsStats])

  const studentColumns: Array<GridColDef> = [
    { field: 'student_id', headerName: 'Estudiante', flex: 1 },
    { field: 'grade', headerName: 'Año', flex: 0.6 },
    { field: 'school_id', headerName: 'Escuela', flex: 0.8 },
    { field: 'subject', headerName: 'Materia', flex: 0.8 },
    { field: 'mean', headerName: 'Promedio', flex: 0.7, valueFormatter: ({ value }) => (value == null ? '—' : Number(value).toFixed(3)) },
    { field: 'count', headerName: 'N', flex: 0.5 },
  ]

  const gradeOptions = useMemo(() => {
    const grades = Array.from(new Set(datasetOptions.map((d) => d.grade))).sort((a, b) => a - b)
    return grades
  }, [datasetOptions])

  const subjectsOptions = useMemo(() => {
    if (selectedGrade === '') return []
    return datasetOptions.filter((d) => d.grade === selectedGrade)
  }, [datasetOptions, selectedGrade])

  return (
    <Page>
      <H3>Reporte META (Global)</H3>

      {topError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {topError}
        </Alert>
      )}

      <Spacer size="s" />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Estado: <b>{statusLabel(bundle?.status)}</b>
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Versión: <b>{bundle?.version ?? '—'}</b>
        </Typography>

        {isAdmin && (
          <TextField
            size="small"
            select
            label="Escuela"
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">(Todas)</MenuItem>
            {schools.map((s: any) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Button onClick={loadLatestBundle} disabled={latestLoading || latestBySchoolLoading}>
          Refrescar
        </Button>

        {isAdmin && (
          <Button variant="contained" onClick={regenerateAll}>
            Regenerar global
          </Button>
        )}
      </Box>

      <Spacer size="default" />

      {!bundle && (latestLoading || latestBySchoolLoading) && <Spinner />}

      {!bundle && !(latestLoading || latestBySchoolLoading) && (
        <Alert severity="info">No hay un reporte global disponible todavía.</Alert>
      )}

      {!!bundle && (
        <>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            sx={{ borderBottom: '1px solid rgba(0,0,0,0.12)' }}
          >
            <Tab label="Resumen" value="resumen" />
            <Tab label="Preguntas" value="preguntas" />
            <Tab label="Estudiantes" value="estudiantes" />
            <Tab label="Agrupamiento" value="agrupamiento" />
            <Tab label="Red" value="red" />
            <Tab label="Chat" value="chat" />
          </Tabs>

          <Spacer size="s" />

          {/* Dataset selectors for clustering + graph */}
          {(tab === 'agrupamiento' || tab === 'red' || tab === 'chat') && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                select
                label="Año"
                value={selectedGrade}
                onChange={(e) => {
                  const g = e.target.value === '' ? '' : Number(e.target.value)
                  setSelectedGrade(g)
                  const first = datasetOptions.find((d) => d.grade === g)
                  if (first) setSelectedSubjects(first.subjects)
                  setClusterSummary(null)
                  setGraph(null)
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">Seleccionar…</MenuItem>
                {gradeOptions.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}º
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                select
                label="Dataset"
                value={selectedSubjects}
                onChange={(e) => {
                  setSelectedSubjects(String(e.target.value))
                  setClusterSummary(null)
                  setGraph(null)
                }}
                sx={{ minWidth: 280 }}
                disabled={selectedGrade === ''}
              >
                <MenuItem value="">Seleccionar…</MenuItem>
                {subjectsOptions.map((d) => (
                  <MenuItem key={`${d.grade}|${d.subjects}`} value={d.subjects}>
                    {d.label}
                  </MenuItem>
                ))}
              </TextField>

              {tab === 'agrupamiento' && (
                <Button onClick={loadCluster} disabled={clusterLoading || selectedGrade === '' || !selectedSubjects}>
                  Cargar agrupamiento
                </Button>
              )}

              {tab === 'red' && (
                <Button onClick={loadGraph} disabled={graphLoading || selectedGrade === '' || !selectedSubjects}>
                  Cargar red
                </Button>
              )}
            </Box>
          )}

          <Spacer size="s" />

          {tab === 'resumen' && (
            <>
              {summariesLoading && <Spinner />}
              {!summariesLoading && summaries && (
                <>
                  <SummaryCards summary={summaries} />

                  <Spacer size="default" />

                  <H4>Detalle por año</H4>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {Object.entries(summaries?.by_grade ?? {}).map(([g, v]: any) => (
                      <Card key={g} sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle2">{g}º</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Promedio: {safeNum(v?.total_avg_score)?.toFixed(3) ?? '—'} | Kr-20:{' '}
                            {safeNum(v?.total_kr20)?.toFixed(3) ?? '—'}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </>
              )}

              {!summariesLoading && !summaries && (
                <Alert severity="info">Todavía no hay resumen disponible para este reporte.</Alert>
              )}
            </>
          )}

          {tab === 'preguntas' && (
            <>
              {questionsLoading && <Spinner />}
              {!questionsLoading && questionsRows.length === 0 && (
                <Alert severity="info">No hay estadísticas de preguntas disponibles.</Alert>
              )}
              {questionsRows.length > 0 && (
                <Box sx={{ height: 560, width: '100%' }}>
                  <DataGrid
                    rows={questionsRows}
                    columns={questionColumns}
                    disableRowSelectionOnClick
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                  />
                </Box>
              )}
            </>
          )}

          {tab === 'estudiantes' && (
            <>
              {studentsLoading && <Spinner />}
              {!studentsLoading && studentsRows.length === 0 && (
                <Alert severity="info">No hay estadísticas de estudiantes disponibles.</Alert>
              )}
              {studentsRows.length > 0 && (
                <Box sx={{ height: 560, width: '100%' }}>
                  <DataGrid
                    rows={studentsRows}
                    columns={studentColumns}
                    disableRowSelectionOnClick
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                  />
                </Box>
              )}
            </>
          )}

          {tab === 'agrupamiento' && (
            <>
              {clusterLoading && <Spinner />}
              {!clusterLoading && clusterSummary && <ClusterCards cluster={clusterSummary} />}
              {!clusterLoading && !clusterSummary && (
                <Alert severity="info">Seleccioná año y dataset y luego “Cargar agrupamiento”.</Alert>
              )}
            </>
          )}

          {tab === 'red' && (
            <>
              {graphLoading && <Spinner />}
              {!graphLoading && graph && (
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2">Red / Grafo</Typography>
                    <Typography variant="body2" color="text.secondary">
                      (Vista simplificada) — para inspección rápida de clusters y puntajes.
                    </Typography>
                    <Spacer size="s" />
                    <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                      <SimpleGraphSvg graph={graph} />
                    </Box>
                  </CardContent>
                </Card>
              )}
              {!graphLoading && !graph && (
                <Alert severity="info">Seleccioná año y dataset y luego “Cargar red”.</Alert>
              )}
            </>
          )}

          {tab === 'chat' && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                El chat responde con contexto del reporte global (según tus permisos).
              </Alert>

              <Box
                sx={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 2,
                  p: 2,
                  minHeight: 260,
                  maxHeight: 420,
                  overflowY: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                }}
              >
                {messages.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Hacé una pregunta para empezar (ej: “¿Qué competencias tienen más dificultades en 10º Lenguaje?”)
                  </Typography>
                )}
                {messages.map((m, idx) => (
                  <Box key={idx} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {m.role === 'user' ? 'Vos' : 'META'}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {m.content}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Spacer size="s" />

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mensaje"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      sendChat()
                    }
                  }}
                />
                <Button variant="contained" onClick={sendChat} disabled={chatLoading || !chatText.trim()}>
                  Enviar
                </Button>
              </Box>
            </>
          )}

          {(manifestLoading || !manifest) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {manifestLoading ? 'Cargando manifest…' : ''}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Page>
  )
}

// --- Simple SVG graph renderer (fast + no dependencies) ---

const SimpleGraphSvg = ({ graph }: { graph: T_GraphJson }) => {
  const width = 980
  const height = 560

  const nodes = graph?.nodes ?? []
  const links = graph?.links ?? []

  const nodeById = useMemo(() => {
    const m = new Map<string, any>()
    nodes.forEach((n) => m.set(String(n.id), n))
    return m
  }, [nodes])

  const pts = useMemo(() => {
    const out: Array<[number, number]> = []
    nodes.forEach((n) => {
      if (Array.isArray(n.pos) && n.pos.length === 2) out.push([Number(n.pos[0]), Number(n.pos[1])])
    })
    return out
  }, [nodes])

  const bounds = useMemo(() => {
    if (pts.length === 0) return { minX: -1, maxX: 1, minY: -1, maxY: 1 }
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    return { minX, maxX, minY, maxY }
  }, [pts])

  const scale = (p: [number, number]) => {
    const { minX, maxX, minY, maxY } = bounds
    const pad = 40
    const sx = (p[0] - minX) / (maxX - minX || 1)
    const sy = (p[1] - minY) / (maxY - minY || 1)
    const x = pad + sx * (width - 2 * pad)
    const y = pad + (1 - sy) * (height - 2 * pad)
    return [x, y]
  }

  const colorFor = (n: any) => {
    const s = safeNum(n?.score)
    if (s == null) return 'rgba(30,30,30,0.45)'
    // grayscale-ish based on score; keep it simple
    const v = Math.max(0, Math.min(1, s))
    const c = Math.round(220 - v * 180)
    return `rgb(${c},${c},${c})`
  }

  const renderedNodes = nodes.filter((n) => Array.isArray(n.pos) && n.pos.length === 2)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="560" style={{ display: 'block' }}>
      {/* links */}
      <g>
        {links.map((l, idx) => {
          const a = nodeById.get(String(l.source))
          const b = nodeById.get(String(l.target))
          if (!a?.pos || !b?.pos) return null
          const [x1, y1] = scale([a.pos[0], a.pos[1]])
          const [x2, y2] = scale([b.pos[0], b.pos[1]])
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(0,0,0,0.12)"
              strokeWidth={1}
            />
          )
        })}
      </g>

      {/* nodes */}
      <g>
        {renderedNodes.map((n) => {
          const [x, y] = scale([n.pos![0], n.pos![1]])
          const r = n.is_leaf ? 3.5 : 2.2
          return (
            <circle
              key={String(n.id)}
              cx={x}
              cy={y}
              r={r}
              fill={colorFor(n)}
              opacity={n.is_leaf ? 0.95 : 0.35}
            >
              <title>
                {`id: ${n.id}\nleaf: ${n.is_leaf ? 'sí' : 'no'}\nscore: ${safeNum(n.score) ?? '—'}\ncluster: ${n.cluster_label ?? '—'}`}
              </title>
            </circle>
          )
        })}
      </g>
    </svg>
  )
}

export default withAuth(MetaReportGlobalReportPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})
