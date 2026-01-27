'use client'

import { apiUrl } from '@/config'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import Page from '@/shared/components/Page'
import { useStore } from '@/shared/state'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    __metaReportFlaskRoot?: HTMLDivElement
    __metaReportFlaskHiddenHost?: HTMLDivElement
    __metaReportFlaskScriptsLoaded?: boolean
    __metaReportFlaskFetchPatched?: boolean
    __metaReportFlaskOriginalFetch?: typeof fetch
  }
}

// Body markup from the original Flask UI (public/meta_report/index.html), without <html>/<head>.
// We keep it as raw HTML so the legacy D3/tab scripts can bind 1:1.
const FLASK_UI_BODY_HTML = String.raw`
<header class="app-header">
  <h1 class="app-title">Reporte META+</h1>
  <nav class="tab-nav">
    <button class="tab-button active" data-tab="estadisticas">Estadísticas</button>
    <button class="tab-button" data-tab="preguntas">Preguntas</button>
    <button class="tab-button" data-tab="estudiantes">Estudiantes</button>
    <button class="tab-button" data-tab="agrupamiento">Agrupamiento</button>
    <button class="tab-button" data-tab="graph">Red</button>
    <button class="tab-button" data-tab="chat">Chat</button>
  </nav>
</header>

<!-- Tab: Estadísticas -->
<div class="tab-content active" data-tab-content="estadisticas">
  <main class="stats-layout">
    <div class="stats-container">
      <section class="stats-summary">
        <h2>Estadísticas Totales</h2>
        <div id="total-stats" class="stats-cards">
          <div class="stat-card">
            <span class="stat-label">Total de Respuestas</span>
            <span class="stat-value" id="stat-total-responses">—</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total de Preguntas</span>
            <span class="stat-value" id="stat-total-questions">—</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total de Estudiantes</span>
            <span class="stat-value" id="stat-total-students">—</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total de Escuelas</span>
            <span class="stat-value" id="stat-total-schools">—</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">KR-20 Total</span>
            <span class="stat-value" id="stat-total-kr20">—</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Promedio Total</span>
            <span class="stat-value" id="stat-total-mean">—</span>
          </div>
        </div>
      </section>

      <section class="stats-table-section">
        <h2>Datos por Grado, Escuela y Materia</h2>
        <div class="table-controls">
          <div class="filter-controls" id="filter-controls"></div>
        </div>
        <div class="table-wrapper">
          <table id="stats-table">
            <thead>
              <tr>
                <th class="sortable" data-sort="grade">
                  <div class="th-label">Grado</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
                <th class="sortable" data-sort="school">
                  <div class="th-label">Escuela</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
                <th class="sortable" data-sort="subject">
                  <div class="th-label">Materia</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
                <th class="sortable" data-sort="total_responses">
                  <div class="th-label">Respuestas</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
                <th class="sortable" data-sort="n_students">
                  <div class="th-label">Estudiantes</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
                <th class="sortable" data-sort="n_schools">
                  <div class="th-label">Escuelas</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
                <th class="sortable" data-sort="mean">
                  <div class="th-label">Promedio</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
                <th class="sortable" data-sort="kr_20">
                  <div class="th-label">KR-20</div>
                  <div class="th-sort-indicator" aria-hidden="true"></div>
                </th>
              </tr>
            </thead>
            <tbody id="table-body">
              <!-- Table rows will be injected by JS -->
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</div>

<!-- Tab: Preguntas -->
<div class="tab-content" data-tab-content="preguntas">
  <main class="questions-layout">
    <div class="controls-container">
      <label for="questions-subject-select">Materia:</label>
      <select id="questions-subject-select">
        <option value="all">Todas</option>
        <option value="L">Lengua</option>
        <option value="M">Matemática</option>
      </select>
    </div>

    <section class="questions-content">
      <div class="chart-panel">
        <h2>Promedio por Pregunta</h2>
        <div id="questions-chart" class="chart-container"></div>
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-color" style="background: #ef4444"></span>
            Bajo (&lt; 0.4)
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #fbbf24"></span>
            Medio (0.4 - 0.6)
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #10b981"></span>
            Alto (&gt; 0.6)
          </span>
        </div>
      </div>

      <div class="detail-panel">
        <h2>Detalles de la Pregunta</h2>
        <div id="question-details" class="detail-content">
          <p class="placeholder">Haga clic en una barra para ver detalles</p>
        </div>
      </div>
    </section>
  </main>
</div>

<!-- Tab: Estudiantes -->
<div class="tab-content" data-tab-content="estudiantes">
  <main class="students-layout">
    <div class="controls-container">
      <div class="filter-row">
        <div class="filter-control">
          <label for="students-grade-select">Grado:</label>
          <select id="students-grade-select">
            <option value="all">Todos</option>
          </select>
        </div>

        <div class="filter-control">
          <label for="students-school-select">Escuela:</label>
          <select id="students-school-select">
            <option value="all">Todas</option>
          </select>
        </div>

        <div class="filter-control">
          <label for="students-subject-select">Materia:</label>
          <select id="students-subject-select">
            <option value="all">Todas</option>
            <option value="L">Lengua</option>
            <option value="M">Matemática</option>
          </select>
        </div>
      </div>

      <!-- Hidden thresholds (still supported by JS) -->
      <div class="threshold-controls" id="threshold-controls" hidden>
        <h3>Umbrales</h3>
        <div class="threshold-row">
          <div class="threshold-control">
            <label for="low-threshold">Bajo:</label>
            <input type="number" id="low-threshold" min="0" max="1" step="0.01" value="0.4" />
          </div>
          <div class="threshold-control">
            <label for="high-threshold">Alto:</label>
            <input type="number" id="high-threshold" min="0" max="1" step="0.01" value="0.6" />
          </div>
        </div>
      </div>
    </div>

    <section class="students-content">
      <div class="chart-panel">
        <h2>Promedio por Estudiante</h2>
        <div id="students-chart" class="chart-container"></div>
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-color" style="background: #ef4444"></span>
            Bajo (&lt; 0.4)
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #fbbf24"></span>
            Medio (0.4 - 0.6)
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #10b981"></span>
            Alto (&gt; 0.6)
          </span>
        </div>
      </div>

      <div class="detail-panel">
        <h2>Detalles del Estudiante</h2>
        <div id="student-details" class="detail-content">
          <p class="placeholder">Haga clic en una barra para ver detalles</p>
        </div>
      </div>
    </section>
  </main>
</div>

<!-- Tab: Agrupamiento -->
<div class="tab-content" data-tab-content="agrupamiento">
  <main class="agrupamiento-layout">
    <div class="controls-container">
      <div class="filter-row">
        <div class="filter-control">
          <label for="agrupamiento-grade-select">Grado:</label>
          <select id="agrupamiento-grade-select">
            <option value="">Seleccione un grado</option>
          </select>
        </div>

        <div class="filter-control">
          <label for="agrupamiento-subject-select">Materia:</label>
          <select id="agrupamiento-subject-select">
            <option value="">Seleccione una materia</option>
            <option value="L">Lengua</option>
            <option value="M">Matemática</option>
          </select>
        </div>
      </div>
    </div>

    <section class="agrupamiento-content">
      <div id="agrupamiento-clusters-container" class="clusters-container">
        <p class="agrupamiento-placeholder">Seleccione un grado y una materia para ver los clusters</p>
      </div>
    </section>
  </main>
</div>

<!-- Tab: Graph -->
<div class="tab-content" data-tab-content="graph">
  <main class="graph-layout">
    <div class="graph-header">
      <div class="graph-title-group">
        <h2>Visualización de Red</h2>
        <p id="graph-subtitle">Selección de conjunto de datos</p>
      </div>

      <div class="graph-controls">
        <div class="graph-control">
          <label for="grade-select">Grado</label>
          <select id="grade-select"></select>
        </div>

        <div class="graph-control">
          <label for="dataset-select">Conjunto</label>
          <select id="dataset-select"></select>
        </div>

        <div class="graph-control">
          <label for="graph-view-select">Vista</label>
          <select id="graph-view-select">
            <option value="clusters">Clusters</option>
            <option value="force">Red</option>
            <option value="heatmap">Calor</option>
          </select>
        </div>

        <div class="graph-control">
          <label for="filter-input">Filtro</label>
          <input id="filter-input" type="search" placeholder="Buscar..." />
        </div>

        <button id="download-members" class="graph-button" type="button">Descargar miembros</button>
      </div>
    </div>

    <div id="graph-status" class="graph-status">Cargando...</div>

    <section class="graph-content">
      <div class="graph-panel">
        <div class="graph-canvas-header">
          <h3 id="graph-panel-title">Red</h3>
          <div class="graph-canvas-actions">
            <button id="reset-zoom" class="graph-button ghost" type="button">Reiniciar zoom</button>
            <button id="toggle-labels" class="graph-button ghost" type="button">Etiquetas</button>
          </div>
        </div>

        <div class="graph-canvas-container">
          <svg id="graph-svg" class="graph-svg"></svg>
          <canvas id="heatmap-canvas" class="heatmap-canvas"></canvas>
        </div>

        <div class="graph-metrics">
          <div class="metric">
            <span class="metric-label">Nodos</span>
            <span class="metric-value" id="metric-nodes">0</span>
          </div>
          <div class="metric">
            <span class="metric-label">Enlaces</span>
            <span class="metric-value" id="metric-links">0</span>
          </div>
          <div class="metric">
            <span class="metric-label">Miembros</span>
            <span class="metric-value" id="metric-members">0</span>
          </div>
        </div>
      </div>

      <section class="graph-side-panel">
        <div class="graph-side-section">
          <h3>Configuración</h3>

          <div class="settings-grid">
            <label class="setting">
              <span>Mostrar etiquetas</span>
              <input id="labels-checkbox" type="checkbox" />
            </label>

            <label class="setting">
              <span>Mostrar IDs</span>
              <input id="ids-checkbox" type="checkbox" />
            </label>

            <label class="setting">
              <span>Mostrar nodos aislados</span>
              <input id="isolates-checkbox" type="checkbox" />
            </label>

            <label class="setting">
              <span>Clusters por tamaño</span>
              <input id="cluster-size-checkbox" type="checkbox" />
            </label>
          </div>

          <div class="setting-group">
            <label for="min-size-filter">Tamaño mínimo</label>
            <input id="min-size-filter" type="range" min="1" max="25" step="1" />
            <div class="setting-hint" id="min-size-display">1</div>
          </div>

          <div class="setting-group">
            <label for="link-strength">Fuerza de enlace</label>
            <input id="link-strength" type="range" min="0.05" max="1" step="0.05" />
            <div class="setting-hint" id="link-strength-display">0.45</div>
          </div>

          <div class="setting-group">
            <label for="charge-strength">Repulsión</label>
            <input id="charge-strength" type="range" min="-80" max="0" step="1" />
            <div class="setting-hint" id="charge-strength-display">-10</div>
          </div>

          <div class="setting-group">
            <label for="node-size">Tamaño nodo</label>
            <input id="node-size" type="range" min="1" max="8" step="0.25" />
            <div class="setting-hint" id="node-size-display">3.5</div>
          </div>

          <div class="setting-group">
            <label for="font-size">Tamaño fuente</label>
            <input id="font-size" type="range" min="0.5" max="2" step="0.05" />
            <div class="setting-hint" id="font-size-display">1</div>
          </div>

          <div class="setting-group">
            <label for="collision-padding">Colisión</label>
            <input id="collision-padding" type="range" min="0" max="30" step="1" />
            <div class="setting-hint" id="collision-padding-display">8</div>
          </div>
        </div>

        <div class="graph-side-section">
          <h3>Panel</h3>
          <div id="selection-panel" class="selection-panel"></div>
        </div>

        <div class="table-panel">
          <h2 id="table-title">Nodo seleccionado</h2>
          <div id="table-content" class="table-content"></div>
        </div>
      </section>
    </section>
  </main>
  </div>

<!-- Tab: Chat -->
<div class="tab-content" data-tab-content="chat">
  <main class="chat-layout">
    <div class="chat-container">
      <div class="chat-messages" id="chat-messages">
        <div class="chat-message chat-message-assistant">
          <div class="chat-message-content">
            <p>Hola! Soy tu asistente para analizar los datos de META+. ¿En qué puedo ayudarte?</p>
          </div>
        </div>
      </div>
      <div class="chat-input-container">
        <form id="chat-form" class="chat-form">
          <input
            type="text"
            id="chat-input"
            class="chat-input"
            placeholder="Escribe tu pregunta aquí..."
            autocomplete="off"
          />
          <button type="submit" class="chat-submit" id="chat-submit">
            <span class="chat-submit-icon">➤</span>
          </button>
        </form>
      </div>
    </div>
  </main>
</div>
`

const SCRIPT_SOURCES = [
  'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
  '/meta_report/static/js/tabs.js',
  '/meta_report/static/js/estadisticas-tab.js',
  '/meta_report/static/js/preguntas-tab.js',
  '/meta_report/static/js/estudiantes-tab.js',
  '/meta_report/static/js/agrupamiento-tab.js',
  '/meta_report/static/js/graph-tab.js',
  '/meta_report/static/js/chat-tab.js',
]

const META_API_BASE = apiUrl('/meta-reports-global/flask')

function ensureTrailingSlash(path: string) {
  if (path.includes('?')) {
    const [p, q] = path.split('?', 2)
    return ensureTrailingSlash(p) + '?' + q
  }
  return path.endsWith('/') ? path : path + '/'
}

function isMetaReportPath(pathname: string) {
  const core = ['config', 'summaries', 'questions_stats', 'students_stats', 'datasets', 'chat']
  if (pathname.startsWith('/datasets') || pathname.includes('/datasets/')) return true
  const last = pathname.split('/').filter(Boolean).pop() || ''
  if (core.includes(last)) return true
  return false
}

function rewriteMetaUrl(urlStr: string): string | null {
  try {
    const url = new URL(urlStr, window.location.href)
    const apiBaseUrl = new URL(META_API_BASE, window.location.origin)

    // Already pointing at the correct API base
    if (url.origin === apiBaseUrl.origin && url.pathname.startsWith(apiBaseUrl.pathname)) {
      return ensureTrailingSlash(url.pathname + url.search)
    }

    // Extract a meta path from either absolute root (/datasets/..) or nested route (/dashboard/.../datasets)
    const pathname = url.pathname
    let subPath: string | null = null

    const idxDatasets = pathname.lastIndexOf('/datasets')
    if (idxDatasets !== -1) {
      subPath = pathname.slice(idxDatasets)
    } else {
      const core = ['config', 'summaries', 'questions_stats', 'students_stats', 'chat']
      for (const name of core) {
        const idx = pathname.lastIndexOf('/' + name)
        if (idx !== -1 && idx + name.length + 1 === pathname.length) {
          subPath = '/' + name
          break
        }
      }
    }

    if (!subPath) return null
    if (!isMetaReportPath(subPath)) return null

    const newPath = ensureTrailingSlash(apiBaseUrl.pathname.replace(/\/+$/, '') + subPath)
    return newPath + url.search
  } catch {
    return null
  }
}

const buildAuthedRequest = (input: RequestInfo | URL, init: RequestInit | undefined, token?: string) => {
  const baseHeaders = input instanceof Request ? new Headers(input.headers) : new Headers()
  const initHeaders = init?.headers ? new Headers(init.headers as any) : new Headers()

  // merge init headers over base
  initHeaders.forEach((v, k) => baseHeaders.set(k, v))

  if (token && !baseHeaders.has('Authorization')) {
    baseHeaders.set('Authorization', `Bearer ${token}`)
  }

  // If input is a Request, clone it to allow header override.
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

async function loadScript(src: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-meta-report-src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      // Already loaded
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.defer = false
    s.dataset.metaReportSrc = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(s)
  })
}

const MetaReportGlobalReportPage = () => {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // 1) Create (or reuse) a persistent root node so legacy scripts keep their DOM references.
    if (!window.__metaReportFlaskHiddenHost) {
      const hidden = document.createElement('div')
      hidden.id = 'meta-report-hidden-host'
      hidden.style.display = 'none'
      document.body.appendChild(hidden)
      window.__metaReportFlaskHiddenHost = hidden
    }

    if (!window.__metaReportFlaskRoot) {
      const root = document.createElement('div')
      root.id = 'meta-report'
      root.innerHTML = FLASK_UI_BODY_HTML
      root.style.height = '100%'
      window.__metaReportFlaskRoot = root
      window.__metaReportFlaskHiddenHost.appendChild(root)
    }

    const rootEl = window.__metaReportFlaskRoot
    rootEl.style.display = ''

    // Move into page container
    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(rootEl)

    // 2) Patch fetch once: rewrite legacy endpoints to Django + attach auth.
    if (!window.__metaReportFlaskFetchPatched) {
      const originalFetch = window.fetch.bind(window)
      window.__metaReportFlaskOriginalFetch = originalFetch

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        try {
          // Determine URL string
          let urlStr: string | null = null
          if (typeof input === 'string') urlStr = input
          else if (input instanceof Request) urlStr = input.url
          else if (input && typeof input === 'object' && 'toString' in (input as any)) urlStr = String(input)

          if (urlStr) {
            const rewritten = rewriteMetaUrl(urlStr)
            if (rewritten) {
              const state = useStore.getState()
              const accessToken = state.auth_accessToken
              const refreshToken = state.auth_refreshToken

              const doFetch = async (token?: string) => {
                const req = buildAuthedRequest(rewritten, init, token)
                return originalFetch(req)
              }

              let res = await doFetch(accessToken)

              if (res.status === 401 && refreshToken) {
                try {
                  const refreshRes = await originalFetch(apiUrl('/token/refresh/'), {
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
          }
        } catch {
          // fall through
        }

        return window.__metaReportFlaskOriginalFetch!(input as any, init)
      }

      window.__metaReportFlaskFetchPatched = true
    }

    // 3) Load legacy scripts once.
    const loadAll = async () => {
      if (window.__metaReportFlaskScriptsLoaded) return
      for (const src of SCRIPT_SOURCES) {
        await loadScript(src)
      }
      window.__metaReportFlaskScriptsLoaded = true
    }

    void loadAll()

    return () => {
      // Keep the persistent root around for fast re-entry; just hide it.
      // (This prevents legacy scripts from losing their cached element references.)
      if (window.__metaReportFlaskHiddenHost && window.__metaReportFlaskRoot) {
        window.__metaReportFlaskRoot.style.display = 'none'
        try {
          window.__metaReportFlaskHiddenHost.appendChild(window.__metaReportFlaskRoot)
        } catch {
          // ignore
        }
      }

      if (mountRef.current) {
        mountRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <Page>
      <Page.Title disableMarginBottom>Reporte META+</Page.Title>
      <Page.Content>
        <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </Page.Content>
    </Page>
  )
}

export default withAuth(MetaReportGlobalReportPage, {
  allowedUserProfiles: ['admin', 'school_staff', 'executive'],
  logoutDestination: 'dashboard',
})
