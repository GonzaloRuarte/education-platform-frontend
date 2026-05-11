'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Chip, CircularProgress, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import EditIcon from '@mui/icons-material/Edit'
import GroupsIcon from '@mui/icons-material/Groups'
import SchoolIcon from '@mui/icons-material/School'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import ListPage from '@/shared/pages/ListPage'
import { handleServiceError } from '@/shared/service'
import { successToast, warningToast } from '@/shared/toasts'
import { AURORA_REPORT_NAME } from '@/mta_reports_v2/constants'
import {
  useAuroraReportBatchDelete,
  useAuroraReportCancelRegenerate,
  useAuroraReportList,
  useAuroraReportPublish,
  useAuroraReportRegenerateAll,
  useAuroraReportRegenerateStatus,
  useAuroraReportUnpublish,
  useNavigateToAuroraReportCreate,
} from '@/mta_reports_v2/hooks'
import type { I_AuroraReportListItem } from '@/mta_reports_v2/types'
import { GridColDef, GridRowParams } from '@mui/x-data-grid'

// Cada fila apunta a UN sujeto: escuela XOR agrupamiento. Centralizamos la decisión
// acá para que tanto el render de la columna como las navegaciones (row click, botón
// editar) consuman exactamente la misma lógica.
type T_SubjectKind = 'school' | 'grouping'
const subjectFor = (
  row: I_AuroraReportListItem,
): { kind: T_SubjectKind; id: number; name: string } => {
  if (row.grouping !== null) {
    return { kind: 'grouping', id: row.grouping, name: row.grouping_name ?? '—' }
  }
  return { kind: 'school', id: row.school ?? 0, name: row.school_name ?? '—' }
}

const reportPathFor = (row: I_AuroraReportListItem, edit = false): string => {
  const { kind, id } = subjectFor(row)
  const segment = kind === 'grouping' ? 'agrupamiento' : 'escuela'
  return `/reports/${segment}/${id}/toma/${row.toma}${edit ? '?edit=1' : ''}`
}

const SubjectCell = ({ row }: { row: I_AuroraReportListItem }) => {
  const { kind, name } = subjectFor(row)
  const isGrouping = kind === 'grouping'
  return (
    <Tooltip placement="left" title={`Id ${row.id}`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
        <Chip
          size="small"
          variant="outlined"
          icon={isGrouping ? <GroupsIcon /> : <SchoolIcon />}
          label={isGrouping ? 'Agrupamiento' : 'Escuela'}
          color={isGrouping ? 'secondary' : 'primary'}
        />
        <span>{name}</span>
      </Box>
    </Tooltip>
  )
}

const baseColumns: Array<GridColDef<I_AuroraReportListItem>> = [
  {
    field: 'subject',
    headerName: 'Sujeto',
    flex: 1.6,
    // Sortable false porque no hay un único campo subyacente: la grilla ordena por
    // school__name o grouping__name según el tipo, lo cual no se mapea a una
    // columna virtual sin un cambio mayor en el backend.
    sortable: false,
    valueGetter: (_value, row) => subjectFor(row).name,
    renderCell: ({ row }) => <SubjectCell row={row} />,
  },
  { field: 'toma', headerName: 'Toma', flex: 0.6 },
]

function ReportesAuroraListPage() {
  const navigateToAuroraReportCreate = useNavigateToAuroraReportCreate()
  const canEdit = useHasCapabilities(['manage_reports'])
  const regenerateAll = useAuroraReportRegenerateAll()
  const cancelRegenerate = useAuroraReportCancelRegenerate()
  const fetchRegenStatus = useAuroraReportRegenerateStatus()
  const publish = useAuroraReportPublish()
  const unpublish = useAuroraReportUnpublish()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenProgress, setRegenProgress] = useState<{ written: number; total: number } | null>(null)
  // Progreso de agrupamientos. Va por separado del de escuelas porque las tasks de
  // agrupamiento se encolan una por una y pueden seguir corriendo después de que el
  // streaming run de escuelas haya marcado `done`.
  const [groupingsProgress, setGroupingsProgress] = useState<{ written: number; total: number } | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const reloadRef = useRef<(() => void) | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tracking de progreso para detectar pollings colgados. Si las tasks de agrupamiento
  // se pierden (ej: worker reiniciado a media run), `groupings_written < groupings_total`
  // queda fijo y el frontend polleaba indefinidamente. Si no vemos progreso durante este
  // umbral, asumimos que el run quedó stuck y paramos el polling.
  const GROUPINGS_STALE_THRESHOLD_MS = 90_000
  const lastGroupingsProgressRef = useRef<{ written: number; at: number } | null>(null)
  // Track de la última cantidad de filas escritas para decidir si vale la pena
  // refetchear la grilla. Sin esto, cada tick (3s) refetcheaba aunque no hubiera
  // progreso nuevo, y las filas hacían blink al desmontarse momentáneamente.
  const lastReloadCountsRef = useRef<{ schools: number; groupings: number }>({
    schools: 0,
    groupings: 0,
  })

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    lastGroupingsProgressRef.current = null
    lastReloadCountsRef.current = { schools: 0, groupings: 0 }
  }

  const startPolling = (baselineRunId?: string) => {
    if (pollRef.current) return
    const tick = async () => {
      try {
        const s = await fetchRegenStatus()
        const currentRunId = 'run_id' in s ? s.run_id : undefined
        // Si todavía vemos el run anterior, esperamos a que el backend gire al run nuevo.
        // Sin esto, el primer tick justo después de un click leería `done` del run viejo
        // y apagaría `isRegenerating` antes de que el worker arranque el nuevo.
        if (baselineRunId && currentRunId === baselineRunId) return

        const groupingsTotal = 'groupings_total' in s ? s.groupings_total ?? 0 : 0
        const groupingsWritten = 'groupings_written' in s ? s.groupings_written ?? 0 : 0
        const groupingsPending = groupingsTotal > 0 && groupingsWritten < groupingsTotal

        // Si el contador de grouping no avanzó en GROUPINGS_STALE_THRESHOLD_MS, asumimos
        // que las tasks se perdieron (worker reiniciado, exception silenciosa) y paramos
        // el polling para no quedar girando para siempre.
        const now = Date.now()
        if (groupingsPending) {
          const last = lastGroupingsProgressRef.current
          if (!last || last.written !== groupingsWritten) {
            lastGroupingsProgressRef.current = { written: groupingsWritten, at: now }
          } else if (now - last.at > GROUPINGS_STALE_THRESHOLD_MS && s.status !== 'running') {
            warningToast(
              `Generación de agrupamientos detenida en ${groupingsWritten}/${groupingsTotal}. ` +
                'Volvé a apretar "Generar reportes faltantes" si querés reintentar.',
            )
            setIsRegenerating(false)
            setRegenProgress(null)
            setGroupingsProgress(null)
            stopPolling()
            reloadRef.current?.()
            return
          }
        } else {
          lastGroupingsProgressRef.current = null
        }

        // `cancelled` es terminal: corta el polling igual que `done`. No esperamos a
        // que `groupings_written` llegue al total porque las tasks pendientes se
        // saltan y nunca van a llegar.
        if ((s.status === 'running' || groupingsPending) && s.status !== 'cancelled') {
          setIsRegenerating(true)
          setRegenProgress({
            written: s.schools_written ?? 0,
            total: s.schools_total ?? 0,
          })
          setGroupingsProgress(
            groupingsTotal > 0 ? { written: groupingsWritten, total: groupingsTotal } : null,
          )
          // Sólo refrescamos el listado cuando algún contador efectivamente avanzó
          // — sin esto, cada tick refetcheaba la grilla aunque no hubiera filas nuevas
          // y las filas hacían blink al desmontarse durante el fetch.
          const schoolsWritten = s.schools_written ?? 0
          const last = lastReloadCountsRef.current
          if (schoolsWritten > last.schools || groupingsWritten > last.groupings) {
            lastReloadCountsRef.current = { schools: schoolsWritten, groupings: groupingsWritten }
            reloadRef.current?.()
          }
        } else if (s.status !== 'never') {
          // Schools done + groupings done (o sin agrupamientos elegibles): apagamos.
          setIsRegenerating(false)
          setRegenProgress(null)
          setGroupingsProgress(null)
          stopPolling()
          reloadRef.current?.()
        }
      } catch {
        // Silencioso: el polling puede fallar puntualmente sin romper la UI.
      }
    }
    tick()
    pollRef.current = setInterval(tick, 3000)
  }

  useEffect(() => {
    if (!canEdit) return
    fetchRegenStatus()
      .then((s) => {
        const groupingsTotal = 'groupings_total' in s ? s.groupings_total ?? 0 : 0
        const groupingsWritten = 'groupings_written' in s ? s.groupings_written ?? 0 : 0
        const groupingsPending = groupingsTotal > 0 && groupingsWritten < groupingsTotal
        // Retomamos polling también si una tanda de agrupamientos quedó incompleta
        // (p.ej. el usuario refrescó la página mientras los workers seguían procesando).
        if (s.status === 'running' || groupingsPending) {
          setIsRegenerating(true)
          setRegenProgress({
            written: s.schools_written ?? 0,
            total: s.schools_total ?? 0,
          })
          setGroupingsProgress(
            groupingsTotal > 0 ? { written: groupingsWritten, total: groupingsTotal } : null,
          )
          startPolling()
        }
      })
      .catch(() => {})
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit])

  const handleChangeStatus = async (
    row: I_AuroraReportListItem,
    nextStatus: 'draft' | 'published',
  ) => {
    if (busyId !== null) return
    if (nextStatus === row.status) return
    setBusyId(row.id)
    try {
      if (nextStatus === 'published') {
        await publish(row.id)
        successToast('Reporte publicado.')
      } else {
        await unpublish(row.id)
        successToast('Reporte despublicado.')
      }
      reloadRef.current?.()
    } catch (err) {
      handleServiceError(err)
    } finally {
      setBusyId(null)
    }
  }

  const handleRowClick = (params: GridRowParams<I_AuroraReportListItem>) => {
    window.open(reportPathFor(params.row), '_blank')
  }

  const [isCancelling, setIsCancelling] = useState(false)
  const handleCancel = async () => {
    if (isCancelling) return
    setIsCancelling(true)
    try {
      await cancelRegenerate({})
      // Optimista: el backend ya marcó `cancelled` y las tasks pendientes lo van a
      // ver al arrancar. Apagamos el banner sin esperar al próximo tick del polling.
      setIsRegenerating(false)
      setRegenProgress(null)
      setGroupingsProgress(null)
      stopPolling()
      reloadRef.current?.()
      successToast('Generación cancelada.')
    } catch (err) {
      handleServiceError(err)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleRegenerateAll = async (reload: () => void) => {
    if (isRegenerating) return
    setIsRegenerating(true)
    // Capturamos el run_id actual antes de disparar el POST. Lo usa `startPolling` para
    // ignorar el estado del run viejo hasta que el backend rote a uno nuevo (sin esto, el
    // primer tick lee `done` del anterior y apaga el flag inmediatamente).
    let baselineRunId: string | undefined
    try {
      const baseline = await fetchRegenStatus()
      if ('run_id' in baseline) baselineRunId = baseline.run_id
    } catch {
      // Sin baseline el polling se comporta como antes; aceptable.
    }
    try {
      const res = await regenerateAll()
      if (res.status === 'generated') {
        successToast('Se están regenerando los reportes.')
        reload()
        startPolling(baselineRunId)
      } else if (res.status === 'already_complete') {
        warningToast('Ya se generaron todos los reportes.')
        setIsRegenerating(false)
        setRegenProgress(null)
        setGroupingsProgress(null)
      } else if (res.status === 'no_eligible_schools') {
        warningToast('No hay escuelas con datos para reportar.')
        setIsRegenerating(false)
        setRegenProgress(null)
        setGroupingsProgress(null)
      }
    } catch (err) {
      handleServiceError(err)
      setIsRegenerating(false)
      setRegenProgress(null)
      setGroupingsProgress(null)
    }
  }

  const columns = useMemo<Array<GridColDef<I_AuroraReportListItem>>>(() => {
    const statusColumn: GridColDef<I_AuroraReportListItem> = {
      field: 'status',
      headerName: 'Estado',
      flex: 0.6,
      renderCell: ({ row }) => (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
        >
          <Select
            size="small"
            value={row.status}
            disabled={!canEdit || busyId === row.id}
            onChange={(e) =>
              handleChangeStatus(row, e.target.value as 'draft' | 'published')
            }
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: 999,
              '& .MuiSelect-icon': { color: 'primary.contrastText', fontSize: '1.25rem' },
              '& .MuiSelect-select': { py: '6px', pl: '12px', pr: '32px !important' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
              '&:hover': { bgcolor: 'primary.dark' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
            }}
          >
            <MenuItem value="draft" sx={{ fontSize: '0.875rem' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EditIcon sx={{ fontSize: '1.125rem' }} />
                <span>Borrador</span>
              </Stack>
            </MenuItem>
            <MenuItem value="published" sx={{ fontSize: '0.875rem' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <VisibilityIcon sx={{ fontSize: '1.125rem' }} />
                <span>Publicado</span>
              </Stack>
            </MenuItem>
          </Select>
        </Box>
      ),
    }
    const cols = [...baseColumns, statusColumn]
    if (!canEdit) return cols
    return [
      ...cols,
      {
        field: 'actions',
        headerName: 'Acciones',
        flex: 0.6,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Button
              size="medium"
              variant="contained"
              onClick={() => {
                window.open(reportPathFor(row, true), '_blank')
              }}
            >
              Editar
            </Button>
          </Box>
        ),
      },
    ]
  }, [canEdit, busyId])

  const buttonLabel = (() => {
    if (!isRegenerating) return 'Generar reportes faltantes'
    const segments: string[] = []
    if (regenProgress && regenProgress.total > 0) {
      segments.push(`escuelas ${regenProgress.written}/${regenProgress.total}`)
    }
    if (groupingsProgress && groupingsProgress.total > 0) {
      segments.push(`agrupamientos ${groupingsProgress.written}/${groupingsProgress.total}`)
    }
    return segments.length > 0 ? `Generando… ${segments.join(' · ')}` : 'Generando…'
  })()

  const customButtons = canEdit
    ? ({ reload }: { reload: () => void }) => {
      reloadRef.current = reload
      return (
        <Button
          onClick={() => handleRegenerateAll(reload)}
          startIcon={<AutorenewIcon />}
          disabled={isRegenerating}
        >
          {buttonLabel}
        </Button>
      )
    }
    : undefined

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isRegenerating && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: 'primary.50',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CircularProgress size={20} />
          <Stack direction="column" spacing={0.25} sx={{ flex: 1 }}>
            <Typography variant="body2">
              Generando reportes… Las filas aparecen a medida que se terminan.
            </Typography>
            {(regenProgress && regenProgress.total > 0) || (groupingsProgress && groupingsProgress.total > 0) ? (
              <Typography variant="caption" color="text.secondary">
                {regenProgress && regenProgress.total > 0 && (
                  <>
                    Escuelas {regenProgress.written}/{regenProgress.total}
                  </>
                )}
                {regenProgress && regenProgress.total > 0 && groupingsProgress && groupingsProgress.total > 0 && ' · '}
                {groupingsProgress && groupingsProgress.total > 0 && (
                  <>
                    Agrupamientos {groupingsProgress.written}/{groupingsProgress.total}
                  </>
                )}
              </Typography>
            ) : null}
          </Stack>
          {canEdit && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelando…' : 'Cancelar'}
            </Button>
          )}
        </Stack>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ListPage
          columns={columns}
          useList={useAuroraReportList}
          useBatchDelete={useAuroraReportBatchDelete}
          entityName={AURORA_REPORT_NAME}
          onCreate={navigateToAuroraReportCreate}
          customButtons={customButtons}
          onRowClick={handleRowClick}
          filtersData={{ ready: 1 }}
        />
      </Box>
    </Box>
  )
}

export default withAuth(ReportesAuroraListPage, {
  allowedCapabilities: ['manage_admin_users'],
  logoutDestination: 'dashboard',
})
