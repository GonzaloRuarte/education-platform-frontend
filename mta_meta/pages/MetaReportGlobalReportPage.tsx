'use client'

import * as d3 from 'd3'
import { apiUrl } from '@/config'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Page from '@/shared/components/Page'
import { useStore } from '@/shared/state'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Paper, Stack, Tab, Tabs, TextField, Typography, Grid2, FormControl, InputLabel, Select, MenuItem, NativeSelect, Chip, Divider, Popover, Slider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material'

// -----------------------------------------------------------------------------
// Auth-aware fetch (same refresh semantics as the rest of the app)
// -----------------------------------------------------------------------------

const buildAuthedRequest = (input: RequestInfo | URL, init: RequestInit | undefined, token?: string) => {
  const baseHeaders = input instanceof Request ? new Headers(input.headers) : new Headers()
  const initHeaders = init?.headers ? new Headers(init.headers as any) : new Headers()

  initHeaders.forEach((v, k) => baseHeaders.set(k, v))
  if (token && !baseHeaders.has('Authorization')) {
    baseHeaders.set('Authorization', `Bearer ${token}`)
  }

  if (input instanceof Request) {
    const mergedInit: RequestInit = {
      method: init?.method ?? input.method,
      body: init?.body ?? (input as any).body,
      mode: init?.mode ?? input.mode,
      credentials: init?.credentials ?? input.credentials,
      cache: init?.cache ?? input.cache,
      redirect: init?.redirect ?? input.redirect,
      referrer: init?.referrer ?? input.referrer,
      referrerPolicy: init?.referrerPolicy ?? input.referrerPolicy,
      integrity: init?.integrity ?? input.integrity,
      keepalive: init?.keepalive ?? (input as any).keepalive,
      signal: init?.signal ?? input.signal,
      headers: baseHeaders,
    }
    return new Request(input.url, mergedInit)
  }

  return new Request(String(input), { ...init, headers: baseHeaders })
}

const metaReportFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const state = useStore.getState()
  const accessToken = state.auth_accessToken
  const refreshToken = state.auth_refreshToken

  const doFetch = async (token?: string) => {
    const req = buildAuthedRequest(input, init, token)
    return fetch(req)
  }

  let res = await doFetch(accessToken)

  // Try refresh once on 401
  if (res.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(apiUrl('/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (refreshRes.ok) {
        const data: any = await refreshRes.json()
        if (data?.access) {
          useStore.getState().auth_storeRefreshedToken(String(data.access))
          res = await doFetch(String(data.access))
        }
      } else {
        useStore.getState().auth_clearAuthData()
      }
    } catch {
      useStore.getState().auth_clearAuthData()
    }
  }

  return res
}

// -----------------------------------------------------------------------------
// Small utilities
// -----------------------------------------------------------------------------

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [rect, setRect] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr) return
      setRect({ width: cr.width, height: cr.height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, rect }
}

const subjectNames: Record<string, string> = { L: 'Lengua', M: 'Matemática' }
const formatPct = (v: any) => (v === null || v === undefined || Number.isNaN(Number(v)) ? '—' : `${(Number(v) * 100).toFixed(1)}%`)
const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  </Grid2>
)


const TabPanel = ({ active, tab, children }: { active: boolean; tab: string; children: React.ReactNode }) => (
  <Box role="tabpanel" data-tab-content={tab} sx={{ display: active ? 'block' : 'none' }}>
    {children}
  </Box>
)



// -----------------------------------------------------------------------------
// API hook
// -----------------------------------------------------------------------------

const useMetaReportApi = () => {
  const apiBase = useMemo(() => apiUrl('/meta-reports-global/flask'), [])

  const getJson = useCallback(
    async <T,>(path: string): Promise<T> => {
      const url = `${apiBase}${path}`
      const res = await metaReportFetch(url, { cache: 'no-store' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${res.statusText} (${url}) ${text}`)
      }
      return (await res.json()) as T
    },
    [apiBase],
  )

  const postJson = useCallback(
    async <TResponse, TBody extends object>(path: string, body: TBody): Promise<TResponse> => {
      const url = `${apiBase}${path}`
      const res = await metaReportFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${res.statusText} (${url}) ${text}`)
      }
      return (await res.json()) as TResponse
    },
    [apiBase],
  )

  return { apiBase, getJson, postJson }
}

// -----------------------------------------------------------------------------
// Estadísticas tab
// -----------------------------------------------------------------------------

type T_SummariesRow = {
  evaluation_grade: number | string
  school_id: number | string
  subject_id: string
  n_students: number
  mean_score: number
  std_score: number
  standard_error: number
  kr20: number | null
  [k: string]: any
}

type T_SummariesResponse = {
  total_responses?: number
  total_questions?: number
  total_students?: number
  total_schools?: number
  total_kr20_lengua?: number | null
  total_mean_score?: number | null
  data?: T_SummariesRow[]
  [k: string]: any
}

const EstadisticasTab = ({ active }: { active: boolean }) => {
  const { getJson } = useMetaReportApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summaries, setSummaries] = useState<T_SummariesResponse | null>(null)

  const STORAGE_PREFIX = 'reporteMeta.estadisticas.'
  const STORAGE_KEY_FILTERS = STORAGE_PREFIX + 'filters'
  const STORAGE_KEY_SORT = STORAGE_PREFIX + 'sort'

  const [filters, setFilters] = useState<{ grade: string; school: string; subject: string }>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEY_FILTERS), { grade: '', school: '', subject: '' }),
  )
  const [sort, setSort] = useState<{ column: string | null; direction: 'asc' | 'desc' }>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEY_SORT), { column: null, direction: 'asc' }),
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters))
    } catch { }
  }, [filters])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SORT, JSON.stringify(sort))
    } catch { }
  }, [sort])

  useEffect(() => {
    if (!active) return
    if (summaries) return
    setLoading(true)
    setError(null)
    getJson<T_SummariesResponse>('/summaries/')
      .then((data) => setSummaries(data))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }, [active, summaries, getJson])

  const rows = summaries?.data ?? []
  const options = useMemo(() => {
    const grades = new Set<string>()
    const schools = new Set<string>()
    const subjects = new Set<string>()
    rows.forEach((r) => {
      grades.add(String(r.evaluation_grade))
      schools.add(String(r.school_id))
      subjects.add(String(r.subject_id))
    })
    return {
      grades: Array.from(grades).sort((a, b) => Number(a) - Number(b)),
      schools: Array.from(schools).sort((a, b) => Number(a) - Number(b)),
      subjects: Array.from(subjects).sort(),
    }
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.grade && String(r.evaluation_grade) !== filters.grade) return false
      if (filters.school && String(r.school_id) !== filters.school) return false
      if (filters.subject && String(r.subject_id) !== filters.subject) return false
      return true
    })
  }, [rows, filters])

  const sorted = useMemo(() => {
    if (!sort.column) return filtered
    const col = sort.column
    const dir = sort.direction
    const copy = [...filtered]
    copy.sort((a: any, b: any) => {
      const av = a?.[col]
      const bv = b?.[col]
      if (av === bv) return 0
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return copy
  }, [filtered, sort])

  const toggleSort = (column: string) => {
    setSort((s) => {
      if (s.column !== column) return { column, direction: 'asc' }
      return { column, direction: s.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

return (
  <TabPanel active={active} tab="estadisticas">
    <Typography variant="h5" sx={{ mb: 2 }}>
      Estadísticas
    </Typography>

    {loading && (
      <Alert severity="info" sx={{ mb: 2 }}>
        Cargando datos...
      </Alert>
    )}
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}

    {summaries && (
      <Stack spacing={2}>
        <Grid2 container spacing={2}>
          <StatCard label="Respuestas" value={summaries.total_responses ?? '—'} />
          <StatCard label="Preguntas" value={summaries.total_questions ?? '—'} />
          <StatCard label="Estudiantes" value={summaries.total_students ?? '—'} />
          <StatCard label="Escuelas" value={summaries.total_schools ?? '—'} />
          <StatCard
            label="KR-20"
            value={
              summaries.total_kr20_lengua === null || summaries.total_kr20_lengua === undefined
                ? '—'
                : Number(summaries.total_kr20_lengua).toFixed(3)
            }
          />
          <StatCard
            label="Promedio"
            value={
              summaries.total_mean_score === null || summaries.total_mean_score === undefined
                ? '—'
                : `${(Number(summaries.total_mean_score) * 100).toFixed(1)}%`
            }
          />
        </Grid2>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="estadisticas-grade-label">Grado</InputLabel>
              <Select
                labelId="estadisticas-grade-label"
                label="Grado"
                value={filters.grade}
                onChange={(e) => setFilters((f) => ({ ...f, grade: String(e.target.value) }))}
              >
                <MenuItem value="">Todos</MenuItem>
                {options.grades.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}°
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="estadisticas-school-label">Escuela</InputLabel>
              <Select
                labelId="estadisticas-school-label"
                label="Escuela"
                value={filters.school}
                onChange={(e) => setFilters((f) => ({ ...f, school: String(e.target.value) }))}
              >
                <MenuItem value="">Todas</MenuItem>
                {options.schools.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="estadisticas-subject-label">Materia</InputLabel>
              <Select
                labelId="estadisticas-subject-label"
                label="Materia"
                value={filters.subject}
                onChange={(e) => setFilters((f) => ({ ...f, subject: String(e.target.value) }))}
              >
                <MenuItem value="">Todas</MenuItem>
                {options.subjects.map((s) => (
                  <MenuItem key={s} value={s}>
                    {subjectNames[s] ?? s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="outlined"
              onClick={() => {
                setFilters({ grade: '', school: '', subject: '' })
                setSort({ column: null, direction: 'asc' })
              }}
            >
              Limpiar
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    ['evaluation_grade', 'Grado'],
                    ['school_id', 'Escuela'],
                    ['subject_id', 'Materia'],
                    ['n_students', 'Estudiantes'],
                    ['mean_score', 'Promedio'],
                    ['std_score', 'Std'],
                    ['standard_error', 'Error Std'],
                    ['kr20', 'KR-20'],
                  ].map(([key, label]) => (
                    <TableCell key={key}>
                      <TableSortLabel
                        active={sort.column === key}
                        direction={sort.column === key ? sort.direction : 'asc'}
                        onClick={() => toggleSort(key)}
                      >
                        {label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((r, idx) => (
                  <TableRow key={`${r.evaluation_grade}-${r.school_id}-${r.subject_id}-${idx}`} hover>
                    <TableCell>{String(r.evaluation_grade)}</TableCell>
                    <TableCell>{String(r.school_id)}</TableCell>
                    <TableCell>{subjectNames[String(r.subject_id)] ?? String(r.subject_id)}</TableCell>
                    <TableCell>{r.n_students}</TableCell>
                    <TableCell>{formatPct(r.mean_score)}</TableCell>
                    <TableCell>{formatPct(r.std_score)}</TableCell>
                    <TableCell>{formatPct(r.standard_error)}</TableCell>
                    <TableCell>{r.kr20 === null || r.kr20 === undefined ? '—' : Number(r.kr20).toFixed(3)}</TableCell>
                  </TableRow>
                ))}

                {!sorted.length && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No hay datos con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    )}
  </TabPanel>
)
}

// -----------------------------------------------------------------------------
// Preguntas tab
// -----------------------------------------------------------------------------

type T_QuestionsStatsResponse = Record<
  string,
  {
    mean?: number
    count?: number
    question?: string
    competencia?: string | null
    contenido?: string | null
  }
>

const PreguntasTab = ({ active }: { active: boolean }) => {
  const { getJson } = useMetaReportApi()
  const STORAGE_PREFIX = 'reporteMeta.preguntas.'
  const STORAGE_KEY_FILTERS = STORAGE_PREFIX + 'filters'

  const [filters, setFilters] = useState<{ subject: string; competencia: string; contenido: string }>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEY_FILTERS), { subject: '', competencia: '', contenido: '' }),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T_QuestionsStatsResponse | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ open: boolean; x: number; y: number; id: string; pct: number; count: number }>(() => ({ open: false, x: 0, y: 0, id: '', pct: 0, count: 0 }))

  const { ref: containerRef, rect } = useResizeObserver<HTMLDivElement>()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters))
    } catch { }
  }, [filters])

  useEffect(() => {
    if (!active) return
    if (data) return
    setLoading(true)
    setError(null)
    getJson<T_QuestionsStatsResponse>('/questions_stats/')
      .then((d) => setData(d))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }, [active, data, getJson])

  const options = useMemo(() => {
    const subjects = new Set<string>()
    const competencias = new Set<string>()
    const contenidos = new Set<string>()
    if (!data) return { subjects: [], competencias: [], contenidos: [] }
    Object.entries(data).forEach(([qid, v]) => {
      const m = qid.match(/^([LM])_/)?.[1]
      if (m) subjects.add(m)
      if (v.competencia) competencias.add(v.competencia)
      if (v.contenido) contenidos.add(v.contenido)
    })
    return {
      subjects: Array.from(subjects).sort(),
      competencias: Array.from(competencias).sort((a, b) => a.localeCompare(b)),
      contenidos: Array.from(contenidos).sort((a, b) => a.localeCompare(b)),
    }
  }, [data])

  const filteredEntries = useMemo(() => {
    if (!data) return [] as Array<[string, any]>
    return Object.entries(data).filter(([qid, v]) => {
      const subj = qid.match(/^([LM])_/)?.[1] ?? ''
      if (filters.subject && subj !== filters.subject) return false
      if (filters.competencia && String(v.competencia ?? '') !== filters.competencia) return false
      if (filters.contenido && String(v.contenido ?? '') !== filters.contenido) return false
      return true
    })
  }, [data, filters])

  const colorByCompetencia = useMemo(() => {
    const palette = [
      '#1f3a93',
      '#2a9d8f',
      '#e76f51',
      '#6d28d9',
      '#0ea5e9',
      '#f59e0b',
      '#22c55e',
      '#ef4444',
      '#14b8a6',
      '#a855f7',
    ]
    const map = new Map<string, string>()
    options.competencias.forEach((c, i) => map.set(c, palette[i % palette.length]))
    return map
  }, [options.competencias])

  const darker = (hex: string) => {
    const c = d3.color(hex)
    if (!c) return hex
    c.opacity = 1
    const rgb = c.rgb()
    return d3.rgb(Math.max(0, rgb.r - 30), Math.max(0, rgb.g - 30), Math.max(0, rgb.b - 30)).formatHex()
  }

  useEffect(() => {
    if (!active) return
    if (!data) return
    if (!containerRef.current) return

    const container = d3.select(containerRef.current)
    container.selectAll('*').remove()

    const entries = filteredEntries
    if (!entries.length) {
      container
        .append('div')
        .style('padding', '2rem')
        .style('text-align', 'center')
        .style('color', '#64748b')
        .text('No hay datos de preguntas para los filtros seleccionados')
      return
    }

    const questionsArray = entries
      .map(([qid, v]) => ({
        id: qid,
        mean: Number(v.mean ?? 0),
        count: Number(v.count ?? 0),
        question: String(v.question ?? ''),
        competencia: v.competencia ?? null,
        contenido: v.contenido ?? null,
      }))
      .sort((a, b) => a.mean - b.mean)

    const minMean = d3.min(questionsArray, (d) => d.mean) ?? 0
    const maxMean = d3.max(questionsArray, (d) => d.mean) ?? 0
    const normalize = (value: number) => {
      if (maxMean === minMean) return 0.5
      return (value - minMean) / (maxMean - minMean)
    }
    questionsArray.forEach((d: any) => (d.normalizedMean = normalize(d.mean)))

    const width = Math.max(300, rect.width || containerRef.current.getBoundingClientRect().width)
    const height = Math.max(360, rect.height || containerRef.current.getBoundingClientRect().height)
    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = container.append('svg').attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleBand<string>()
      .domain(questionsArray.map((d) => d.id))
      .range([0, chartWidth])
      .padding(0)

    const yScale = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0])

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickValues([] as any))

    const yAxis = g
      .append('g')
      .call(d3.axisLeft(yScale).ticks(10).tickFormat((d: any) => (Number(d) * 100).toFixed(0) + '%'))

    yAxis.selectAll('text').style('font-size', '0.85rem').style('fill', '#64748b')
    yAxis.selectAll('line').style('stroke', '#e2e8f0')
    xAxis.selectAll('line').style('stroke', '#e2e8f0')
    g.selectAll('.domain').style('stroke', '#cbd5e1')

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(10).tickSize(-chartWidth).tickFormat(() => ''))
      .style('stroke', '#f1f5f9')
      .style('stroke-opacity', 0.7)
      .selectAll('.domain')
      .remove()

    const getBarColor = (d: any) => {
      const c = d.competencia ? colorByCompetencia.get(String(d.competencia)) : null
      const fallback = '#1f3a93'
      return c ?? fallback
    }

    
const showTooltip = (event: any, d: any) => {
  setTooltip({
    open: true,
    x: event.clientX + 10,
    y: event.clientY - 28,
    id: String(d.id ?? ''),
    pct: Number(d.normalizedMean ?? 0),
    count: Number(d.count ?? 0),
  })
}
const hideTooltip = () => {
  setTooltip((t) => ({ ...t, open: false }))
}


    g.selectAll('.bar')
      .data(questionsArray as any)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => (xScale(d.id) ?? 0) - 0.5)
      .attr('y', (d: any) => yScale(d.normalizedMean))
      .attr('width', xScale.bandwidth() + 1)
      .attr('height', (d: any) => chartHeight - yScale(d.normalizedMean))
      .attr('fill', (d: any) => (selectedId === d.id ? darker(getBarColor(d)) : getBarColor(d)))
      .attr('stroke', (d: any) => (selectedId === d.id ? '#1f3a93' : 'none'))
      .attr('stroke-width', (d: any) => (selectedId === d.id ? 2 : 0))
      .style('cursor', 'pointer')
      .on('click', (_event: any, d: any) => {
        setSelectedId(d.id)
      })
      .on('mouseover', function (event: any, d: any) {
        showTooltip(event, d)
        d3.select(this).attr('fill', darker(getBarColor(d)))
      })
      .on('mousemove', function (event: any, d: any) {
        showTooltip(event, d)
      })
      .on('mouseout', function (event: any, d: any) {
        hideTooltip()
        const isSelected = selectedId === d.id
        d3.select(this).attr('fill', isSelected ? darker(getBarColor(d)) : getBarColor(d))
      })

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 15)
      .style('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('fill', '#475569')
      .style('font-weight', '600')
      .text('Promedio de Aciertos')

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('fill', '#475569')
      .style('font-weight', '600')
      .text(`Preguntas (${questionsArray.length} total)`) // matches Flask

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, data, filteredEntries, rect.width, rect.height, selectedId, colorByCompetencia])

  const selected = useMemo(() => {
    if (!data || !selectedId) return null
    const v = data[selectedId]
    if (!v) return null
    const mean = Number(v.mean ?? 0)
    return {
      id: selectedId,
      normalizedMean: mean, // raw, normalized is chart-relative
      mean,
      count: Number(v.count ?? 0),
      question: String(v.question ?? ''),
      competencia: v.competencia ?? null,
      contenido: v.contenido ?? null,
    }
  }, [data, selectedId])

  const detail = useMemo(() => {
    if (!selected) return null
    const subj = selected.id.match(/^([LM])_/)?.[1]
    return {
      ...selected,
      subject: subj ? subjectNames[subj] ?? subj : 'No especificada',
    }
  }, [selected])

return (
  <TabPanel active={active} tab="preguntas">
    <Typography variant="h5" sx={{ mb: 2 }}>
      Preguntas
    </Typography>

    {loading && (
      <Alert severity="info" sx={{ mb: 2 }}>
        Cargando datos...
      </Alert>
    )}
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}

    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap" alignItems="center">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="preguntas-subject-label">Materia</InputLabel>
          <Select
            labelId="preguntas-subject-label"
            label="Materia"
            value={filters.subject}
            onChange={(e) => setFilters((f) => ({ ...f, subject: String(e.target.value) }))}
          >
            <MenuItem value="">Todas</MenuItem>
            {options.subjects.map((s) => (
              <MenuItem key={s} value={s}>
                {subjectNames[s] ?? s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="preguntas-competencia-label">Competencia</InputLabel>
          <Select
            labelId="preguntas-competencia-label"
            label="Competencia"
            value={filters.competencia}
            onChange={(e) => setFilters((f) => ({ ...f, competencia: String(e.target.value) }))}
          >
            <MenuItem value="">Todas</MenuItem>
            {options.competencias.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="preguntas-contenido-label">Contenido</InputLabel>
          <Select
            labelId="preguntas-contenido-label"
            label="Contenido"
            value={filters.contenido}
            onChange={(e) => setFilters((f) => ({ ...f, contenido: String(e.target.value) }))}
          >
            <MenuItem value="">Todos</MenuItem>
            {options.contenidos.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          onClick={() => {
            setFilters({ subject: '', competencia: '', contenido: '' })
            setSelectedId(null)
          }}
        >
          Limpiar
        </Button>
      </Stack>
    </Paper>

    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <Paper variant="outlined" sx={{ p: 1, minHeight: 420 }}>
          <Box ref={containerRef} id="questions-chart-container" sx={{ minHeight: 400 }} />
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, minHeight: 420 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Detalle
          </Typography>

          {!detail ? (
            <Typography variant="body2" color="text.secondary">
              Selecciona una barra para ver el detalle.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Texto
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {detail.question || 'Sin texto disponible'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip size="small" label={`Respuestas: ${detail.count}`} />
                <Chip size="small" label={`Promedio: ${formatPct(detail.mean)}`} />
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Materia
                  </Typography>
                  <Typography variant="body2">{detail.subject}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Competencia
                  </Typography>
                  <Typography variant="body2">{detail.competencia || 'No especificada'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Contenido
                  </Typography>
                  <Typography variant="body2">{detail.contenido || 'No especificado'}</Typography>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Grid2>
    </Grid2>

    <Popover
      open={tooltip.open}
      onClose={() => setTooltip((t) => ({ ...t, open: false }))}
      anchorReference="anchorPosition"
      anchorPosition={{ top: tooltip.y, left: tooltip.x }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{ sx: { p: 1.25, maxWidth: 320 } }}
    >
      <Typography variant="subtitle2">Pregunta: {tooltip.id}</Typography>
      <Typography variant="body2" color="text.secondary">
        Promedio: {(tooltip.pct * 100).toFixed(1)}% • Respuestas: {tooltip.count}
      </Typography>
    </Popover>
  </TabPanel>
)
}

// -----------------------------------------------------------------------------
// Estudiantes tab
// -----------------------------------------------------------------------------

type T_StudentsStatsResponse = Record<string, { mean?: number; count?: number }>

const parseStudentKey = (key: string) => {
  const match = key.match(/\((\d+),\s*(\d+),\s*(\d+),\s*'([LM])'\)/)
  if (!match) return null
  return {
    studentId: Number(match[1]),
    grade: Number(match[2]),
    school: Number(match[3]),
    subject: String(match[4]),
  }
}

const EstudiantesTab = ({ active }: { active: boolean }) => {
  const { getJson } = useMetaReportApi()
  const STORAGE_PREFIX = 'reporteMeta.estudiantes.'
  const STORAGE_KEY_FILTERS = STORAGE_PREFIX + 'filters'
  const STORAGE_KEY_THRESHOLDS = STORAGE_PREFIX + 'thresholds'

  const [filters, setFilters] = useState<{ grade: string; school: string; subject: string }>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEY_FILTERS), { grade: '', school: '', subject: '' }),
  )
  const [thresholds, setThresholds] = useState<{ redYellow: number; yellowGreen: number }>(() =>
    safeJsonParse(localStorage.getItem(STORAGE_KEY_THRESHOLDS), { redYellow: 0.4, yellowGreen: 0.6 }),
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T_StudentsStatsResponse | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ open: boolean; x: number; y: number; id: string; pct: number; count: number }>(() => ({ open: false, x: 0, y: 0, id: '', pct: 0, count: 0 }))
  const { ref: containerRef, rect } = useResizeObserver<HTMLDivElement>()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters))
    } catch { }
  }, [filters])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(thresholds))
    } catch { }
  }, [thresholds])

  useEffect(() => {
    if (!active) return
    if (data) return
    setLoading(true)
    setError(null)
    getJson<T_StudentsStatsResponse>('/students_stats/')
      .then((d) => setData(d))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }, [active, data, getJson])

  const options = useMemo(() => {
    const grades = new Set<number>()
    const schools = new Set<number>()
    const subjects = new Set<string>()
    if (!data) return { grades: [], schools: [], subjects: [] }
    Object.keys(data).forEach((k) => {
      const p = parseStudentKey(k)
      if (!p) return
      grades.add(p.grade)
      schools.add(p.school)
      subjects.add(p.subject)
    })
    return {
      grades: Array.from(grades).sort((a, b) => a - b),
      schools: Array.from(schools).sort((a, b) => a - b),
      subjects: Array.from(subjects).sort(),
    }
  }, [data])

  const filteredEntries = useMemo(() => {
    if (!data) return [] as Array<[string, { mean?: number; count?: number }]>
    return Object.entries(data).filter(([key]) => {
      const p = parseStudentKey(key)
      if (!p) return false
      if (filters.grade && p.grade !== Number(filters.grade)) return false
      if (filters.school && p.school !== Number(filters.school)) return false
      if (filters.subject && p.subject !== filters.subject) return false
      return true
    })
  }, [data, filters])

  const getBarColor = (score01: number) => {
    if (score01 < thresholds.redYellow) return '#ef4444'
    if (score01 < thresholds.yellowGreen) return '#f59e0b'
    return '#22c55e'
  }
  const darkerColor = (hex: string) => {
    const c = d3.color(hex)
    if (!c) return hex
    const rgb = c.rgb()
    return d3.rgb(Math.max(0, rgb.r - 30), Math.max(0, rgb.g - 30), Math.max(0, rgb.b - 30)).formatHex()
  }

  const counts = useMemo(() => {
    if (!data || !filteredEntries.length) return { red: 0, yellow: 0, green: 0 }
    const arr = filteredEntries.map(([k, v]) => ({ k, mean: Number(v.mean ?? 0) }))
    const min = d3.min(arr, (d) => d.mean) ?? 0
    const max = d3.max(arr, (d) => d.mean) ?? 0
    const norm = (val: number) => (max === min ? 0.5 : (val - min) / (max - min))
    let red = 0,
      yellow = 0,
      green = 0
    arr.forEach((d) => {
      const c = getBarColor(norm(d.mean))
      if (c === '#ef4444') red++
      else if (c === '#f59e0b') yellow++
      else green++
    })
    return { red, yellow, green }
  }, [data, filteredEntries, thresholds.redYellow, thresholds.yellowGreen])

  const selectedDetail = useMemo(() => {
    if (!data || !selectedKey) return null
    const parsed = parseStudentKey(selectedKey)
    if (!parsed) return null
    const lenguaKey = `(${parsed.studentId}, ${parsed.grade}, ${parsed.school}, 'L')`
    const matemKey = `(${parsed.studentId}, ${parsed.grade}, ${parsed.school}, 'M')`
    const lengua = data[lenguaKey]
    const matem = data[matemKey]
    return {
      studentId: parsed.studentId,
      grade: parsed.grade,
      school: parsed.school,
      lengua: lengua ? { mean: Number(lengua.mean ?? 0), count: Number(lengua.count ?? 0) } : null,
      matematica: matem ? { mean: Number(matem.mean ?? 0), count: Number(matem.count ?? 0) } : null,
    }
  }, [data, selectedKey])

  useEffect(() => {
    if (!active) return
    if (!data) return
    if (!containerRef.current) return

    const container = d3.select(containerRef.current)
    container.selectAll('*').remove()

    const entries = filteredEntries
    if (!entries.length) {
      container
        .append('div')
        .style('padding', '2rem')
        .style('text-align', 'center')
        .style('color', '#64748b')
        .text('No hay datos de estudiantes para los filtros seleccionados')
      return
    }

    const studentsArray = entries
      .map(([id, v]) => ({ id, mean: Number(v.mean ?? 0), count: Number(v.count ?? 0) }))
      .sort((a, b) => a.mean - b.mean)

    const minMean = d3.min(studentsArray, (d) => d.mean) ?? 0
    const maxMean = d3.max(studentsArray, (d) => d.mean) ?? 0
    const normalize = (value: number) => (maxMean === minMean ? 0.5 : (value - minMean) / (maxMean - minMean))
    studentsArray.forEach((d: any) => (d.normalizedMean = normalize(d.mean)))

    const width = Math.max(300, rect.width || containerRef.current.getBoundingClientRect().width)
    const height = Math.max(360, rect.height || containerRef.current.getBoundingClientRect().height)
    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = container.append('svg').attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleBand<string>()
      .domain(studentsArray.map((d) => d.id))
      .range([0, chartWidth])
      .padding(0)

    const yScale = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0])

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickValues([] as any))

    const yAxis = g
      .append('g')
      .call(d3.axisLeft(yScale).ticks(10).tickFormat((d: any) => (Number(d) * 100).toFixed(0) + '%'))

    yAxis.selectAll('text').style('font-size', '0.85rem').style('fill', '#64748b')
    yAxis.selectAll('line').style('stroke', '#e2e8f0')
    xAxis.selectAll('line').style('stroke', '#e2e8f0')
    g.selectAll('.domain').style('stroke', '#cbd5e1')

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(10).tickSize(-chartWidth).tickFormat(() => ''))
      .style('stroke', '#f1f5f9')
      .style('stroke-opacity', 0.7)
      .selectAll('.domain')
      .remove()

    
const showTooltip = (event: any, d: any) => {
  const parsed = parseStudentKey(String(d.id ?? ''))
  const studentId = parsed ? String(parsed.studentId) : String(d.id ?? '')
  setTooltip({
    open: true,
    x: event.clientX + 10,
    y: event.clientY - 28,
    studentId,
    pct: Number(d.normalizedMean ?? 0),
  })
}
const hideTooltip = () => {
  setTooltip((t) => ({ ...t, open: false }))
}


    g.selectAll('.bar')
      .data(studentsArray as any)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => (xScale(d.id) ?? 0) - 0.5)
      .attr('y', (d: any) => yScale(d.normalizedMean))
      .attr('width', xScale.bandwidth() + 1)
      .attr('height', (d: any) => chartHeight - yScale(d.normalizedMean))
      .attr('fill', (d: any) => {
        const base = getBarColor(d.normalizedMean)
        return selectedKey === d.id ? darkerColor(base) : base
      })
      .attr('stroke', (d: any) => (selectedKey === d.id ? '#1f3a93' : 'none'))
      .attr('stroke-width', (d: any) => (selectedKey === d.id ? 2 : 0))
      .style('cursor', 'pointer')
      .on('click', (_event: any, d: any) => setSelectedKey(d.id))
      .on('mouseover', function (event: any, d: any) {
        showTooltip(event, d)
        d3.select(this).attr('fill', darkerColor(getBarColor(d.normalizedMean)))
      })
      .on('mousemove', function (event: any, d: any) {
        showTooltip(event, d)
      })
      .on('mouseout', function (event: any, d: any) {
        hideTooltip()
        const isSelected = selectedKey === d.id
        const base = getBarColor(d.normalizedMean)
        d3.select(this).attr('fill', isSelected ? darkerColor(base) : base)
      })

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 15)
      .style('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('fill', '#475569')
      .style('font-weight', '600')
      .text('Puntaje Promedio')

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '0.9rem')
      .style('fill', '#475569')
      .style('font-weight', '600')
      .text(`Estudiantes (${studentsArray.length} total)`)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, data, filteredEntries, rect.width, rect.height, thresholds.redYellow, thresholds.yellowGreen, selectedKey])

return (
  <TabPanel active={active} tab="estudiantes">
    <Typography variant="h5" sx={{ mb: 2 }}>
      Estudiantes
    </Typography>

    {loading && (
      <Alert severity="info" sx={{ mb: 2 }}>
        Cargando datos...
      </Alert>
    )}
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}

    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap" alignItems="center">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="estudiantes-grade-label">Grado</InputLabel>
          <Select
            labelId="estudiantes-grade-label"
            label="Grado"
            value={filters.grade}
            onChange={(e) => setFilters((f) => ({ ...f, grade: String(e.target.value) }))}
          >
            <MenuItem value="">Todos</MenuItem>
            {options.grades.map((g) => (
              <MenuItem key={g} value={String(g)}>
                {g}°
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="estudiantes-school-label">Escuela</InputLabel>
          <Select
            labelId="estudiantes-school-label"
            label="Escuela"
            value={filters.school}
            onChange={(e) => setFilters((f) => ({ ...f, school: String(e.target.value) }))}
          >
            <MenuItem value="">Todas</MenuItem>
            {options.schools.map((s) => (
              <MenuItem key={s} value={String(s)}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="estudiantes-subject-label">Materia</InputLabel>
          <Select
            labelId="estudiantes-subject-label"
            label="Materia"
            value={filters.subject}
            onChange={(e) => setFilters((f) => ({ ...f, subject: String(e.target.value) }))}
          >
            <MenuItem value="">Todas</MenuItem>
            {options.subjects.map((s) => (
              <MenuItem key={s} value={s}>
                {subjectNames[s] ?? s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          onClick={() => {
            setFilters({ grade: '', school: '', subject: '' })
            setSelectedKey(null)
          }}
        >
          Limpiar
        </Button>
      </Stack>
    </Paper>

    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle2">Rojo → Amarillo</Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(thresholds.redYellow * 100)}%
            </Typography>
          </Stack>
          <Slider
            value={thresholds.redYellow}
            min={0}
            max={0.95}
            step={0.01}
            onChange={(_e, value) => {
              const v = Array.isArray(value) ? value[0] : value
              setThresholds((t) => ({ ...t, redYellow: Math.min(Number(v), t.yellowGreen - 0.01) }))
            }}
          />
        </Box>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle2">Amarillo → Verde</Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(thresholds.yellowGreen * 100)}%
            </Typography>
          </Stack>
          <Slider
            value={thresholds.yellowGreen}
            min={0.05}
            max={1}
            step={0.01}
            onChange={(_e, value) => {
              const v = Array.isArray(value) ? value[0] : value
              setThresholds((t) => ({ ...t, yellowGreen: Math.max(Number(v), t.redYellow + 0.01) }))
            }}
          />
        </Box>

        <Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
            <Typography variant="body2">{counts.red}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
            <Typography variant="body2">{counts.yellow}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} />
            <Typography variant="body2">{counts.green}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>

    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <Paper variant="outlined" sx={{ p: 1, minHeight: 420 }}>
          <Box ref={containerRef} id="students-chart-container" sx={{ minHeight: 400 }} />
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, minHeight: 420 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Detalle
          </Typography>

          {!selectedDetail ? (
            <Typography variant="body2" color="text.secondary">
              Selecciona una barra para ver el detalle.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    ID Estudiante
                  </Typography>
                  <Typography variant="body2">{selectedDetail.studentId}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Escuela
                  </Typography>
                  <Typography variant="body2">{selectedDetail.school}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Grado
                  </Typography>
                  <Typography variant="body2">{selectedDetail.grade}°</Typography>
                </Stack>
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="subtitle2">Lengua</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`Puntaje: ${selectedDetail.lengua ? formatPct(selectedDetail.lengua.mean) : 'N/A'}`}
                  />
                  <Chip size="small" label={`Preguntas: ${selectedDetail.lengua ? selectedDetail.lengua.count : 'N/A'}`} />
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Matemática</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`Puntaje: ${selectedDetail.matematica ? formatPct(selectedDetail.matematica.mean) : 'N/A'}`}
                  />
                  <Chip
                    size="small"
                    label={`Preguntas: ${selectedDetail.matematica ? selectedDetail.matematica.count : 'N/A'}`}
                  />
                </Stack>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Grid2>
    </Grid2>

    <Popover
      open={tooltip.open}
      onClose={() => setTooltip((t) => ({ ...t, open: false }))}
      anchorReference="anchorPosition"
      anchorPosition={{ top: tooltip.y, left: tooltip.x }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{ sx: { p: 1.25 } }}
    >
      <Typography variant="subtitle2">Estudiante: {tooltip.studentId}</Typography>
      <Typography variant="body2" color="text.secondary">
        Puntaje: {(tooltip.pct * 100).toFixed(1)}%
      </Typography>
    </Popover>
  </TabPanel>
)
}

// -----------------------------------------------------------------------------
// Agrupamiento tab
// -----------------------------------------------------------------------------

type T_DatasetsResponse = {
  grades?: Array<{ id: string; label: string; datasets: Array<{ id: string; label: string; graph_url: string; data_url: string }> }>
  datasets?: Array<{ grade_id: string; id: string; label: string } & any>
}

const AgrupamientoTab = ({ active }: { active: boolean }) => {
  const { getJson } = useMetaReportApi()
  const STORAGE_PREFIX = 'reporteMeta.agrupamiento.'
  const STORAGE_KEY_GRADE = STORAGE_PREFIX + 'grade'
  const STORAGE_KEY_SUBJECT = STORAGE_PREFIX + 'subject'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datasets, setDatasets] = useState<T_DatasetsResponse | null>(null)
  const [grade, setGrade] = useState<string>(() => localStorage.getItem(STORAGE_KEY_GRADE) || '')
  const [subject, setSubject] = useState<string>(() => localStorage.getItem(STORAGE_KEY_SUBJECT) || '')
  const [cluster, setCluster] = useState<any | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GRADE, grade)
      localStorage.setItem(STORAGE_KEY_SUBJECT, subject)
    } catch { }
  }, [grade, subject])

  useEffect(() => {
    if (!active) return
    if (datasets) return
    setLoading(true)
    setError(null)
    getJson<T_DatasetsResponse>('/datasets/')
      .then((d) => setDatasets(d))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }, [active, datasets, getJson])

  const gradeOptions = useMemo(() => datasets?.grades ?? [], [datasets])
  const subjectOptions = useMemo(() => {
    const list = datasets?.datasets ?? []
    if (!grade) return [] as Array<{ id: string; label: string }>
    const filtered = list.filter((d) => String(d.grade_id) === String(grade))
    const map = new Map<string, string>()
    filtered.forEach((d) => map.set(String(d.id), String(d.label)))
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [datasets, grade])

  useEffect(() => {
    setCluster(null)
    if (!active) return
    if (!grade || !subject) return
    setLoading(true)
    setError(null)
    getJson<any>(`/datasets/${grade}/${subject}/cluster_summary/`)
      .then((d) => setCluster(d))
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false))
  }, [active, grade, subject, getJson])

  const clusterIds = useMemo(() => {
    if (!cluster) return [] as string[]
    return Object.keys(cluster?.scores_mean ?? {}).sort((a, b) => Number(a) - Number(b))
  }, [cluster])

  const formatCompetenciaName = (name: string) =>
    name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const downloadStudentIds = (clusterId: string, studentIds: any[]) => {
    if (!studentIds?.length) return
    const csv = 'student_id\n' + studentIds.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cluster_${clusterId}_grade_${grade}_${subject}_students.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  
  return (
    <TabPanel active={active} tab="agrupamiento">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Agrupamiento
      </Typography>

      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Cargando datos...
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="agrupamiento-grade-label">Grado</InputLabel>
              <Select
                labelId="agrupamiento-grade-label"
                id="agrupamiento-grade-select"
                label="Grado"
                value={grade}
                onChange={(e) => {
                  setGrade(String(e.target.value))
                  setSubject('')
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {gradeOptions.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" disabled={!grade}>
              <InputLabel id="agrupamiento-subject-label">Materia</InputLabel>
              <Select
                labelId="agrupamiento-subject-label"
                id="agrupamiento-subject-select"
                label="Materia"
                value={subject}
                onChange={(e) => setSubject(String(e.target.value))}
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {subjectOptions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
        </Grid2>
      </Paper>

      {!grade || !subject ? (
        <Alert severity="info">Seleccione un grado y una materia para ver los grupos.</Alert>
      ) : !cluster ? (
        <Alert severity="info">Cargando datos...</Alert>
      ) : !clusterIds.length ? (
        <Alert severity="warning">No hay datos de clusters disponibles.</Alert>
      ) : (
        <Grid2 container spacing={2}>
          {clusterIds.map((clusterId) => {
            const nStudents = cluster?.n_students?.[clusterId] ?? 0
            const scoresMean = cluster?.scores_mean?.[clusterId] ?? 0
            const studentIds = cluster?.student_ids?.[clusterId] ?? []

            const competencias: Array<{ name: string; value: any }> = []
            Object.keys(cluster).forEach((key) => {
              if (['scores_mean', 'n_students', 'student_ids'].includes(key)) return
              if (cluster?.[key]?.[clusterId] === undefined) return
              competencias.push({ name: formatCompetenciaName(key), value: cluster[key][clusterId] })
            })

            return (
              <Grid2 key={clusterId} size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h6">Grupo {clusterId}</Typography>
                    <Chip
                      size="small"
                      label={`${nStudents} estudiante${nStudents !== 1 ? 's' : ''}`}
                    />
                  </Stack>

                  <Divider sx={{ mb: 1 }} />

                  <Stack spacing={1} sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Promedio Global
                      </Typography>
                      <Chip size="small" label={formatPct(scoresMean)} />
                    </Stack>

                    {competencias.map((c) => (
                      <Stack key={c.name} direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          {c.name}
                        </Typography>
                        <Chip size="small" label={formatPct(c.value)} />
                      </Stack>
                    ))}
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => downloadStudentIds(clusterId, studentIds)}
                    >
                      Descargar IDs de Estudiantes
                    </Button>
                  </Box>
                </Paper>
              </Grid2>
            )
          })}
        </Grid2>
      )}
    </TabPanel>
  )
}

// -----------------------------------------------------------------------------
// Graph tab (ported from Flask's graph-tab.js, embedded as D3 inside React)
// -----------------------------------------------------------------------------

const GraphTab = ({ active }: { active: boolean }) => {
  const { apiBase, getJson } = useMetaReportApi()
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!active) return
    if (mountedRef.current) return
    mountedRef.current = true

    // Most of this code mirrors the original graph-tab.js (D3 force graph).
    // It renders entirely within the DOM subtree of this React component.

    const STORAGE_PREFIX = 'reporteMeta.graph.'
    const STORAGE_KEY_GRADE = STORAGE_PREFIX + 'grade'
    const STORAGE_KEY_DATASET = STORAGE_PREFIX + 'dataset'

    const gradeSelect = document.getElementById('grade-select') as HTMLSelectElement | null
    const dataSelect = document.getElementById('data-select') as HTMLSelectElement | null
    const container = d3.select('#viz-container')
    const status = d3.select('#status')
    const legendCanvas = document.getElementById('legend-canvas') as HTMLCanvasElement | null
    const legendCtx = legendCanvas?.getContext('2d') ?? null
    const legendMinLabel = d3.select('#legend-min')
    const legendMaxLabel = d3.select('#legend-max')
    const tableTitle = d3.select('#table-title')
    const tableContent = d3.select('#table-content')
    const histogramSvg = d3.select('#histogram-svg')
    const histogramMessage = d3.select('#histogram-message')

    const histogramWidth = Number(histogramSvg.attr('width')) || 180
    const histogramHeight = Number(histogramSvg.attr('height')) || 110
    histogramSvg
      .attr('viewBox', `0 0 ${histogramWidth} ${histogramHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    if (!histogramMessage.empty()) {
      histogramMessage.text('Los puntajes de hojas aparecen cuando se carga un conjunto de datos.')
    }

    type NormalizedDataset = {
      id: string
      label: string
      gradeId: string
      gradeLabel: string
      graphUrl: string
      dataUrl: string
    }
    type NormalizedGrade = { id: string; label: string; datasets: NormalizedDataset[] }

    const titleCase = (value: string) =>
      value.replace(/\w\S*/g, (segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())

    const formatGradeLabel = (gradeId: string) => {
      const trimmed = String(gradeId ?? '').trim()
      if (!trimmed) return 'Grado'
      if (/^\d+$/.test(trimmed)) return `Grado ${trimmed}`
      const normalized = trimmed.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim() || trimmed
      if (normalized.toLowerCase() === 'all') return 'Todos'
      return titleCase(normalized)
    }

    const normalizeDataset = (entry: any, gradeId: string, gradeLabel: string): NormalizedDataset | null => {
      const id = typeof entry?.id === 'string' && entry.id.trim() ? entry.id.trim() : null
      let graphUrl = typeof entry?.graph_url === 'string' && entry.graph_url.trim() ? entry.graph_url.trim() : null
      let dataUrl = typeof entry?.data_url === 'string' && entry.data_url.trim() ? entry.data_url.trim() : null
      if (!id || !graphUrl || !dataUrl) return null
      if (!graphUrl.startsWith('/')) graphUrl = '/' + graphUrl.replace(/^\/+/, '')
      if (!dataUrl.startsWith('/')) dataUrl = '/' + dataUrl.replace(/^\/+/, '')
      const label = typeof entry?.label === 'string' && entry.label.trim() ? entry.label.trim() : titleCase(id)
      return { id, label, gradeId, gradeLabel, graphUrl, dataUrl }
    }

    const normalizeGrade = (entry: any): NormalizedGrade | null => {
      const id = typeof entry?.id === 'string' && entry.id.trim() ? entry.id.trim() : null
      if (!id) return null
      const label = typeof entry?.label === 'string' && entry.label.trim() ? entry.label.trim() : formatGradeLabel(id)
      const rawDatasets = Array.isArray(entry?.datasets) ? entry.datasets : []
      const datasets = rawDatasets
        .map((d: any) => normalizeDataset(d, id, label))
        .filter((d: any) => d !== null) as NormalizedDataset[]
      if (!datasets.length) return null
      return { id, label, datasets }
    }

    // Authed JSON loader
    const authedJson = async (pathOrUrl: string) => {
      const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${apiBase}${pathOrUrl}`
      const res = await metaReportFetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`)
      return res.json()
    }

    const gradeFallbackOrder = ['10', '7']
    const datasetFallbackOrder = [
      'lengua_sid',
      'matematica_sid',
      'lengua_pid',
      'matematica_pid',
      'lengua_sid_umap',
      'matematica_sid_umap',
    ]

    let grades: NormalizedGrade[] = []
    let currentGradeId: string | null = null
    let currentDatasetId: string | null = null
    let dfCatData: any[] | null = null
    let currentGraphData: any | null = null
    let currentRootNode: any | null = null
    let currentSimulation: d3.Simulation<any, any> | null = null
    let highlightedNodeId: string | null = null
    let currentColorScale: any = null
    let clusterColorScale: any = null
    const colorMode: 'score' | 'cluster' = 'score'

    const clearViz = () => {
      container.selectAll('*').remove()
      tableTitle.text('')
      tableContent.html('')
      histogramSvg.selectAll('*').remove()
      if (!histogramMessage.empty()) histogramMessage.text('')
    }

    const setStatus = (msg: string) => {
      status.text(msg)
    }

    const populateGradeSelect = () => {
      if (!gradeSelect) return
      gradeSelect.innerHTML = ''
      grades.forEach((g) => {
        const opt = document.createElement('option')
        opt.value = g.id
        opt.textContent = g.label
        gradeSelect.appendChild(opt)
      })
    }

    const populateDatasetSelect = () => {
      if (!dataSelect || !currentGradeId) return
      const g = grades.find((x) => x.id === currentGradeId)
      dataSelect.innerHTML = ''
        ; (g?.datasets ?? []).forEach((ds) => {
          const opt = document.createElement('option')
          opt.value = ds.id
          opt.textContent = ds.label
          dataSelect.appendChild(opt)
        })
    }

    const chooseDefault = () => {
      const savedGrade = localStorage.getItem(STORAGE_KEY_GRADE)
      const savedDataset = localStorage.getItem(STORAGE_KEY_DATASET)
      const gradeCandidates = [savedGrade, ...gradeFallbackOrder].filter(Boolean) as string[]
      currentGradeId = gradeCandidates.find((g) => grades.some((x) => x.id === g)) ?? grades[0]?.id ?? null
      if (!currentGradeId) return
      const g = grades.find((x) => x.id === currentGradeId)
      const datasetCandidates = [savedDataset, ...datasetFallbackOrder].filter(Boolean) as string[]
      currentDatasetId = datasetCandidates.find((d) => (g?.datasets ?? []).some((x) => x.id === d)) ?? g?.datasets?.[0]?.id ?? null
    }

    const persistSelection = () => {
      try {
        if (currentGradeId) localStorage.setItem(STORAGE_KEY_GRADE, currentGradeId)
        if (currentDatasetId) localStorage.setItem(STORAGE_KEY_DATASET, currentDatasetId)
      } catch { }
    }

    const renderLegend = (min: number, max: number) => {
      if (!legendCtx || !legendCanvas) return
      const w = legendCanvas.width
      const h = legendCanvas.height
      const grd = legendCtx.createLinearGradient(0, 0, w, 0)
      const colors = ['#ef4444', '#f59e0b', '#22c55e']
      grd.addColorStop(0, colors[0])
      grd.addColorStop(0.5, colors[1])
      grd.addColorStop(1, colors[2])
      legendCtx.clearRect(0, 0, w, h)
      legendCtx.fillStyle = grd
      legendCtx.fillRect(0, 0, w, h)
      legendMinLabel.text(`${Math.round(min * 100)}%`)
      legendMaxLabel.text(`${Math.round(max * 100)}%`)
    }

    const renderHistogram = (scores: number[]) => {
      histogramSvg.selectAll('*').remove()
      if (!scores.length) {
        histogramMessage.text('No hay puntajes para mostrar.')
        return
      }
      histogramMessage.text('')
      const bins = d3.bin().domain([0, 1]).thresholds(12)(scores)
      const x = d3
        .scaleBand()
        .domain(bins.map((b) => String(b.x0)))
        .range([6, histogramWidth - 6])
        .padding(0.1)
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (b) => b.length) ?? 1])
        .range([histogramHeight - 22, 8])
      histogramSvg
        .selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('x', (d) => x(String(d.x0)) ?? 0)
        .attr('y', (d) => y(d.length))
        .attr('width', x.bandwidth())
        .attr('height', (d) => histogramHeight - 22 - y(d.length))
        .attr('fill', '#1f3a93')
        .attr('opacity', 0.45)
      histogramSvg
        .append('g')
        .attr('transform', `translate(0,${histogramHeight - 22})`)
        .call(d3.axisBottom(x).tickValues([] as any))
        .selectAll('path,line')
        .attr('stroke', '#cbd5e1')
    }

    const scoreToColor = (score: number) => {
      if (!currentColorScale) {
        currentColorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 1])
      }
      return currentColorScale(score)
    }

    const nodeLabel = (node: any) => {
      if (!node) return ''
      if (node.name) return String(node.name)
      if (node.id) return String(node.id)
      return ''
    }

    const updateTable = (node: any) => {
      if (!node) {
        tableTitle.text('')
        tableContent.html('')
        return
      }
      const label = nodeLabel(node)
      tableTitle.text(label)
      const rows: Array<[string, any]> = []
      if (node.score_mean !== undefined) rows.push(['Promedio', formatPct(node.score_mean)])
      if (node.n_students !== undefined) rows.push(['Estudiantes', node.n_students])
      if (node.depth !== undefined) rows.push(['Nivel', node.depth])
      const html = `
        <table class="node-table">
          <tbody>
            ${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
          </tbody>
        </table>
      `
      tableContent.html(html)
    }

    const stopSimulation = () => {
      if (currentSimulation) {
        currentSimulation.stop()
        currentSimulation = null
      }
    }

    const renderGraph = () => {
      if (!currentGraphData) return
      clearViz()

      const width = Math.max(600, (document.getElementById('viz-container')?.clientWidth ?? 600))
      const height = Math.max(520, (document.getElementById('viz-container')?.clientHeight ?? 520))
      const svg = container
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      const zoomLayer = svg.append('g').attr('class', 'zoom-layer')
      const linkLayer = zoomLayer.append('g').attr('class', 'links')
      const nodeLayer = zoomLayer.append('g').attr('class', 'nodes')

      const root = d3.hierarchy(currentGraphData)
      currentRootNode = root

      const nodes = root.descendants().map((d) => {
        // Ensure D3 force has x/y
        ; (d as any).x = (d as any).x ?? width / 2 + (Math.random() - 0.5) * 40
          ; (d as any).y = (d as any).y ?? height / 2 + (Math.random() - 0.5) * 40
        return d
      })
      const links = root.links()

      const leafScores = nodes
        .filter((n) => !n.children || n.children.length === 0)
        .map((n: any) => Number(n.data?.score_mean ?? n.data?.score ?? 0))
        .filter((v) => Number.isFinite(v))
        .map((v) => Math.max(0, Math.min(1, v)))
      renderHistogram(leafScores)
      renderLegend(0, 1)

      clusterColorScale = d3.scaleOrdinal(d3.schemeTableau10)
      const nodeColor = (n: any) => {
        if (colorMode === 'cluster') {
          const cid = n.data?.cluster_id ?? n.data?.cluster ?? n.data?.id ?? n.data?.name
          return clusterColorScale(String(cid))
        }
        const s = Number(n.data?.score_mean ?? n.data?.score ?? 0)
        return scoreToColor(Math.max(0, Math.min(1, s)))
      }

      const link = linkLayer
        .selectAll('line')
        .data(links as any)
        .enter()
        .append('line')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1)

      const node = nodeLayer
        .selectAll('circle')
        .data(nodes as any)
        .enter()
        .append('circle')
        .attr('r', (d: any) => (d.children ? 8 : 5))
        .attr('fill', (d: any) => nodeColor(d))
        .attr('stroke', '#0f172a')
        .attr('stroke-width', (d: any) => (highlightedNodeId && nodeLabel(d.data) === highlightedNodeId ? 2 : 0))
        .style('cursor', 'pointer')
        .on('click', (_ev: any, d: any) => {
          highlightedNodeId = nodeLabel(d.data)
          updateTable(d.data)
          node.attr('stroke-width', (n: any) => (nodeLabel(n.data) === highlightedNodeId ? 2 : 0))
        })
        .call(
          d3
            .drag<any, any>()
            .on('start', (event: any, d: any) => {
              if (!event.active && currentSimulation) currentSimulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
            })
            .on('drag', (event: any, d: any) => {
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', (event: any, d: any) => {
              if (!event.active && currentSimulation) currentSimulation.alphaTarget(0)
              d.fx = null
              d.fy = null
            }),
        )

      const zoom = d3
        .zoom<any, any>()
        .scaleExtent([0.15, 2.5])
        .on('zoom', (event: any) => {
          zoomLayer.attr('transform', event.transform)
        })

      svg.call(zoom as any)

      stopSimulation()
      currentSimulation = d3
        .forceSimulation(nodes as any)
        .force(
          'link',
          d3
            .forceLink(links as any)
            .id((d: any) => d)
            .distance((l: any) => (l.source.depth === 0 ? 110 : 70)),
        )
        .force('charge', d3.forceManyBody().strength(-120))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius((d: any) => (d.children ? 12 : 7)))
        .on('tick', () => {
          link
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y)
          node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
        })
    }

    const loadDataset = async () => {
      if (!currentGradeId || !currentDatasetId) return
      const g = grades.find((x) => x.id === currentGradeId)
      const ds = g?.datasets.find((x) => x.id === currentDatasetId)
      if (!ds) return

      setStatus('Cargando conjunto de datos...')
      try {
        const graph = await authedJson(ds.graphUrl + (ds.graphUrl.endsWith('/') ? '' : '/'))
        const df = await authedJson(ds.dataUrl + (ds.dataUrl.endsWith('/') ? '' : '/'))
        currentGraphData = graph
        dfCatData = df
        persistSelection()
        setStatus('')
        renderGraph()
      } catch (e: any) {
        console.error(e)
        setStatus('Error al cargar los datos.')
      }
    }

    const handleGradeChange = () => {
      currentGradeId = gradeSelect?.value ?? null
      currentDatasetId = null
      populateDatasetSelect()
      currentDatasetId = dataSelect?.value ?? null
      loadDataset()
    }

    const handleDatasetChange = () => {
      currentDatasetId = dataSelect?.value ?? null
      loadDataset()
    }

    const init = async () => {
      try {
        setStatus('Cargando conjuntos de datos...')
        const dsResp = await getJson<T_DatasetsResponse>('/datasets/')
        grades = (dsResp.grades ?? []).map((g: any) => normalizeGrade(g)).filter(Boolean) as any
        if (!grades.length) {
          setStatus('No hay conjuntos de datos disponibles.')
          return
        }
        populateGradeSelect()
        chooseDefault()
        if (gradeSelect && currentGradeId) gradeSelect.value = currentGradeId
        populateDatasetSelect()
        if (dataSelect && currentDatasetId) dataSelect.value = currentDatasetId

        gradeSelect?.addEventListener('change', handleGradeChange)
        dataSelect?.addEventListener('change', handleDatasetChange)

        await loadDataset()
        setStatus('')
      } catch (e: any) {
        console.error(e)
        setStatus('Error al cargar los conjuntos de datos.')
      }
    }

    init()

    return () => {
      gradeSelect?.removeEventListener('change', handleGradeChange)
      dataSelect?.removeEventListener('change', handleDatasetChange)
    }
  }, [active, getJson])

  return (
    <TabPanel active={active} tab="graph">
      <Typography variant="h5" sx={{ mb: 2 }}>
        Gráfico
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel shrink htmlFor="grade-select">
                Grado
              </InputLabel>
              <NativeSelect inputProps={{ id: 'grade-select' }} />
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel shrink htmlFor="data-select">
                Conjunto de datos
              </InputLabel>
              <NativeSelect inputProps={{ id: 'data-select' }} />
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 3 }}>
            <Box id="status" sx={{ typography: 'body2', color: 'text.secondary', minHeight: 20 }} />
          </Grid2>
        </Grid2>
      </Paper>

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 1, minHeight: 540 }}>
            <Box id="viz-container" sx={{ minHeight: 520 }} />
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Puntaje
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography id="legend-min" variant="caption">
                  0%
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <canvas id="legend-canvas" width={160} height={10} style={{ width: '100%' }} />
                </Box>
                <Typography id="legend-max" variant="caption">
                  100%
                </Typography>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Distribución
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <svg id="histogram-svg" width={180} height={110} />
              </Box>
              <Box id="histogram-message" sx={{ typography: 'caption', color: 'text.secondary', mt: 1 }} />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box id="table-title" sx={{ typography: 'subtitle2', mb: 1 }} />
              <Box id="table-content" />
            </Paper>
          </Stack>
        </Grid2>
      </Grid2>
    </TabPanel>
)
}
// -----------------------------------------------------------------------------
// Chat tab
// -----------------------------------------------------------------------------

const ChatTab = ({ active, enabled }: { active: boolean; enabled: boolean }) => {
  const { postJson } = useMetaReportApi()
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hola. Podés preguntarme sobre el reporte.' },
  ])
  const [value, setValue] = useState('')
  const [waiting, setWaiting] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    if (!active) return
    // scroll on activation and when new messages arrive
    setTimeout(scrollToBottom, 0)
  }, [active, messages.length, scrollToBottom])

  const send = async () => {
    const text = value.trim()
    if (!text || waiting) return

    setMessages((m) => [...m, { role: 'user', text }])
    setValue('')
    setWaiting(true)

    try {
      const resp = await postJson<{ response?: string }, { message: string }>('/chat/', { message: text })
      setMessages((m) => [...m, { role: 'assistant', text: resp?.response || '—' }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.' },
      ])
    } finally {
      setWaiting(false)
      setTimeout(scrollToBottom, 0)
    }
  }

  return (
    <TabPanel active={active} tab="chat">
      <Stack spacing={2}>
        <Typography variant="h6">Chat</Typography>

        {!enabled ? (
          <Alert severity="info">Chat deshabilitado.</Alert>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box
                ref={scrollRef}
                sx={{
                  height: 380,
                  overflowY: 'auto',
                  pr: 1,
                }}
              >
                <Stack spacing={1.25}>
                  {messages.map((m, idx) => {
                    const isUser = m.role === 'user'
                    return (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.25,
                            maxWidth: '85%',
                            bgcolor: isUser ? 'action.selected' : 'background.paper',
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {m.text}
                          </Typography>
                        </Paper>
                      </Box>
                    )
                  })}
                  {waiting && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Typography variant="caption" color="text.secondary">
                        Escribiendo…
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
                  <TextField
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={waiting}
                    placeholder="Escribí una pregunta..."
                    size="small"
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                  />
                  <Button variant="contained" type="submit" disabled={waiting || !value.trim()} sx={{ minWidth: 120 }}>
                    {waiting ? 'Enviando...' : 'Enviar'}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </>
        )}
      </Stack>
    </TabPanel>
  )
}


// -----------------------------------------------------------------------------
// Main app component (tabs)
// -----------------------------------------------------------------------------

type T_TabId = 'estadisticas' | 'preguntas' | 'estudiantes' | 'agrupamiento' | 'graph' | 'chat'

const MetaReportApp = () => {
  const { getJson } = useMetaReportApi()
  const [activeTab, setActiveTab] = useState<T_TabId>('estadisticas')
  const [chatEnabled, setChatEnabled] = useState<boolean>(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    setConfigError(null)
    getJson<{ chat_enabled?: boolean }>('/config/')
      .then((c) => {
        setChatEnabled(Boolean(c?.chat_enabled))
        setConfigLoaded(true)
      })
      .catch((e) => {
        setConfigError(String(e?.message ?? e))
        setConfigLoaded(true)
      })
  }, [getJson])

  const tabs: Array<{ id: T_TabId; label: string; visible?: boolean }> = useMemo(
    () => [
      { id: 'estadisticas', label: 'Estadísticas' },
      { id: 'preguntas', label: 'Preguntas' },
      { id: 'estudiantes', label: 'Estudiantes' },
      { id: 'agrupamiento', label: 'Agrupamiento' },
      { id: 'graph', label: 'Gráfico' },
      { id: 'chat', label: 'Chat', visible: chatEnabled },
    ],
    [chatEnabled],
  )

  const visibleTabs = tabs.filter((t) => t.visible !== false)

  // if chat is hidden and currently selected, snap back
  useEffect(() => {
    if (activeTab === 'chat' && !chatEnabled) setActiveTab('estadisticas')
  }, [activeTab, chatEnabled])

  return (
    <div id="meta-report">
      <Box sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          {visibleTabs.map((t) => (
            <Tab key={t.id} value={t.id} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {!configLoaded && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Cargando configuración...
        </Alert>
      )}
      {configError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {configError}
        </Alert>
      )}

      <Box >
        <EstadisticasTab active={activeTab === 'estadisticas'} />
        <PreguntasTab active={activeTab === 'preguntas'} />
        <EstudiantesTab active={activeTab === 'estudiantes'} />
        <AgrupamientoTab active={activeTab === 'agrupamiento'} />
        <GraphTab active={activeTab === 'graph'} />
        <ChatTab active={activeTab === 'chat'} enabled={chatEnabled} />
      </Box>
    </div>
  )
}

const MetaReportGlobalReportPage = () => {
  return (
    <Page>
      <Page.Title disableMarginBottom>Reporte META+</Page.Title>
      <Page.Content>
        <MetaReportApp />
      </Page.Content>
    </Page>
  )
}

export default withAuth(MetaReportGlobalReportPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})
