'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import Logo from '@/shared/components/Logo'
import LogoAustral from '@/shared/components/LogoAustral'
import {
  useEscuelaReporteReactList,
  useBustCacheEscuela,
  useNavigateToEscuelaReporte,
} from '@/mta_reports_v2/hooks'
import type { I_EscuelaListItem } from '@/mta_reports_v2/hooks'

// ── Theme ─────────────────────────────────────────────────────────────────────
const C = {
  navy: '#041552', blue: '#0b2280',
  accent: '#00a6e6', barFill: '#1a3080',
  white: '#fff', off: '#f4f5f8', bdr: '#dde0e8',
  txt: '#041552', tb: '#333', tm: '#7a8399',
  red: '#e84c4c', orange: '#ff9800',
}
const F = "'Segoe UI',-apple-system,system-ui,sans-serif"

// ── Toma badge ────────────────────────────────────────────────────────────────
function TomaBadge({ toma }: { toma: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
      background: C.off, border: `1px solid ${C.bdr}`, color: C.tb, marginRight: 4,
    }}>
      {toma}
    </span>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────
function SchoolRow({
  school, canManage, onView, onBust, busting,
}: {
  school: I_EscuelaListItem
  canManage: boolean
  onView: () => void
  onBust: (e: React.MouseEvent) => void
  busting: boolean
}) {
  return (
    <tr
      onClick={onView}
      style={{ borderBottom: `1px solid ${C.bdr}`, cursor: 'pointer', transition: 'background 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.background = C.off)}
      onMouseLeave={e => (e.currentTarget.style.background = C.white)}
    >
      <td style={{ padding: '12px 20px', fontWeight: 600, color: C.txt }}>{school.nombre}</td>
      <td style={{ padding: '12px 16px', color: C.tm, fontSize: 12 }}>{school.meta_id}</td>
      <td style={{ padding: '12px 16px' }}>
        {school.tomas.map(t => <TomaBadge key={t} toma={t} />)}
      </td>
      <td style={{ padding: '12px 16px', fontWeight: 600, color: C.accent, fontSize: 13 }}>
        {school.ultima_toma ?? '—'}
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <button
          onClick={e => { e.stopPropagation(); onView() }}
          style={{
            padding: '5px 14px', borderRadius: 4, border: `1px solid ${C.accent}`,
            background: C.white, color: C.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 8,
          }}
        >
          Ver reporte
        </button>
        {canManage && (
          <button
            onClick={onBust}
            disabled={busting}
            style={{
              padding: '5px 14px', borderRadius: 4, border: `1px solid ${C.bdr}`,
              background: C.white, color: busting ? C.tm : C.tb, fontSize: 12, cursor: busting ? 'not-allowed' : 'pointer',
            }}
          >
            {busting ? 'Regenerando…' : 'Regenerar'}
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function ReportesReactListPage() {
  const { data, loading, error } = useEscuelaReporteReactList()
  const { bust, bustingId } = useBustCacheEscuela()
  const navigateToEscuela = useNavigateToEscuelaReporte()
  const canManage = useHasCapabilities(['manage_reports'])

  return (
    <div style={{ fontFamily: F, minHeight: '100vh', background: C.off }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(90deg,${C.navy} 0%,${C.blue} 100%)`,
        padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
            PROYECTO REACT
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.white }}>Reportes por escuela</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Logo width={80} height={26} variant="white" />
          <LogoAustral width={100} height={26} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '32px auto', padding: '0 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: C.tm, fontSize: 14 }}>
            Cargando escuelas…
          </div>
        )}

        {!loading && error && (
          <div style={{ background: '#ffebee', border: '1px solid #f44336', borderRadius: 8, padding: 20, color: C.red }}>
            Error al cargar: {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ background: C.white, borderRadius: 8, border: `1px solid ${C.bdr}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.txt }}>
                {data.length} {data.length === 1 ? 'escuela' : 'escuelas'} con datos
              </div>
            </div>

            {data.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.tm, fontSize: 14 }}>
                No hay datos disponibles aún.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.off }}>
                    {['Escuela', 'ID', 'Tomas disponibles', 'Última toma', ''].map(h => (
                      <th key={h} style={{
                        padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                        color: C.tm, fontSize: 11, borderBottom: `1px solid ${C.bdr}`,
                        ...(h === '' ? { textAlign: 'right' as const, paddingRight: 20 } : {}),
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(school => (
                    <SchoolRow
                      key={school.id}
                      school={school}
                      canManage={canManage}
                      onView={() => navigateToEscuela({ escuelaId: school.id })}
                      onBust={e => { e.stopPropagation(); bust(school.id) }}
                      busting={bustingId === school.id}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default withAuth(ReportesReactListPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
