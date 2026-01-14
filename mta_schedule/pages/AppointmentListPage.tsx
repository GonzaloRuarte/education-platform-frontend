'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentOccurrenceStatusChip from '@/mta_schedule/components/AppointmentOccurrenceStatusChip'
import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentBatchDelete,
  useAppointmentList,
  useNavigateToAppointmentCreate,
  useNavigateToAppointmentDetail,
  useNavigateToAppointmentEditStudents,
  useNavigateToAppointmentProcess,
  useNavigateToAppointmentUploadOfflineStates,
  useExportAppointments
} from '@/mta_schedule/hooks'
import { AppointmentOccurrenceStatus, AppointmentStatus, I_AppointmentListItem } from '@/mta_schedule/types'
import { appointmentShowPostProcessingResources } from '@/mta_schedule/utils'
import Button from '@/shared/components/Button'
import ListPage from '@/shared/pages/ListPage'
import { dateFromDatetimeColumn, timeFromDatetimeColumn } from '@/shared/components/DateTimeColumns'
import RuleIcon from '@mui/icons-material/Rule'
import SchoolIcon from '@mui/icons-material/School'
import TroubleshootIcon from '@mui/icons-material/Troubleshoot'
import UploadIcon from '@mui/icons-material/Upload'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { GridColDef } from '@mui/x-data-grid'
import React, { useState } from 'react'
import RescheduleDialog from '@/mta_schedule/components/AppointmentRescheduleDialog'
import { IconButton, Menu, MenuItem, Box } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import Stack from '@mui/material/Stack';


/* ─ helpers for labels & sorting ─ */

const getStatusLabel = (s: I_AppointmentListItem['status']) => {
  const map: Record<string, string> = {
    [AppointmentStatus.pending]: 'Pendiente',
    [AppointmentStatus.approved]: 'Aprobada',
    [AppointmentStatus.free]: 'Libre',
    [AppointmentStatus.rejected]: 'Rechazada',
  }
  return map[String(s)] ?? String(s)
}

const getOccurrenceStatusLabel = (s: I_AppointmentListItem['occurrence_status']) => {
  const map: Record<string, string> = {
    [AppointmentOccurrenceStatus.upcoming]: 'Próxima',
    [AppointmentOccurrenceStatus.ongoing]: 'En curso',
    [AppointmentOccurrenceStatus.past]: 'Pasado',
  }
  return map[String(s)] ?? String(s)
}

const compareMaybeNumberText = (a: unknown, b: unknown) => {
  const sa = String(a ?? '')
  const sb = String(b ?? '')
  if (sa === '-' && sb === '-') return 0
  if (sa === '-') return 1
  if (sb === '-') return -1
  const na = Number(sa)
  const nb = Number(sb)
  const ia = Number.isFinite(na)
  const ib = Number.isFinite(nb)
  if (ia && ib) return na - nb
  return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' })
}

/* ─ columns ─ */

const columns = (a: {
  navToProcess: (args: Record<'appointmentId', string | number>) => void
  navToEditStudents: (args: Record<'appointmentId', string | number>) => void
  navToDetail: (id) => void
  openReschedule: (row: I_AppointmentListItem) => void
}): Array<GridColDef<I_AppointmentListItem>> => [
    // Fecha (replaces idExposeColumn; uses v7 valueGetter signature)
    dateFromDatetimeColumn({ field: 'begins_at_date', datetimeField: 'begins_at', headerName: 'Fecha' }),
    timeFromDatetimeColumn({ field: 'begins_at_time', datetimeField: 'begins_at', headerName: 'Hora Inicio' }),
    // Estado
    {
      field: 'status',
      headerName: 'Estado',
      flex: 0.7,
      valueGetter: (_value, row) => getStatusLabel(row.status),
      renderCell: ({ row }) => <AppointmentStatusChip status={row.status} size="small" />,
      sortComparator: (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }),
    },

    // Estado de Ocurrencia
    {
      field: 'occurrence_status',
      headerName: 'Estado de Ocurrencia',
      flex: 0.7,
      valueGetter: (_value, row) => getOccurrenceStatusLabel(row.occurrence_status),
      renderCell: ({ row }) => <AppointmentOccurrenceStatusChip status={row.occurrence_status} size="small" />,
      sortComparator: (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }),
    },

    // Escuela
    {
      field: 'school',
      headerName: 'Escuela',
      flex: 2,
      valueGetter: (_value, row) => row.school?.name ?? '-',
      renderCell: ({ value }) => <>{value}</>,
      sortComparator: (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }),
    },
    {
      field: 'subject',
      headerName: 'Materia',
      flex: 1.2,
      valueGetter: (_value, row) => row.subject ?? '-',
      renderCell: ({ value }) => <>{value}</>,
    },
    {
      field: 'grade',
      headerName: 'Año',
      flex: 0.6,
      valueGetter: (_value, row) => (row.grade ? `${row.grade}º` : '-'),
      renderCell: ({ value }) => <>{value}</>,
    },
    {
      field: 'division',
      headerName: 'División',
      flex: 0.8,
      valueGetter: (_value, row) => row.division ?? '-',
      renderCell: ({ value }) => <>{value}</>,
    },
    // PIN
    { field: 'pin', headerName: 'PIN' },

    // Cantidad Estudiantes
    {
      field: 'student_count',
      headerName: 'Cantidad Estudiantes',
      flex: 0.7,
      valueGetter: (_value, row) =>
        row.status === AppointmentStatus.approved ? String(row.student_count) : '-',
      renderCell: ({ value }) => <>{value}</>,
      sortComparator: compareMaybeNumberText,
    },

    // Fue Procesado
    {
      field: 'was_post_processed',
      headerName: 'Fue Procesado',
      flex: 0.7,
      valueGetter: (_value, row) => {
        if (!appointmentShowPostProcessingResources(row)) return '-'
        return row.was_post_processed ? 'Sí' : 'No'
      },
      renderCell: ({ value }) => <>{value}</>,
      sortComparator: (a, b) => {
        const order: Record<string, number> = { 'Sí': 0, 'No': 1, '-': 2 }
        return (order[String(a)] ?? 9) - (order[String(b)] ?? 9)
      },
    },

    // Acciones (unchanged)
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 0.6,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const { row, id } = params

        const items: { label: string; icon?: React.ReactNode; run: () => void }[] = []

        if (row.occurrence_status === AppointmentOccurrenceStatus.ongoing) {
          items.push({
            label: 'Monitorear',
            icon: <TroubleshootIcon fontSize="small" />,
            run: () => a.navToDetail(id),
          })
        }
        if (row.status === 'P') {
          items.push({
            label: 'Procesar',
            icon: <RuleIcon fontSize="small" />,
            run: () => a.navToProcess({ appointmentId: id }),
          })
        }
        if (row.status === 'A') {
          const hasToAdd = row.student_count === 0
          items.push({
            label: `${hasToAdd ? 'Agregar' : 'Editar'} estudiantes`,
            icon: <SchoolIcon fontSize="small" />,
            run: () => a.navToEditStudents({ appointmentId: id }),
          })
        }
        if (
          row.status === AppointmentStatus.approved &&
          row.occurrence_status === AppointmentOccurrenceStatus.upcoming
        ) {
          items.push({
            label: 'Reprogramar',
            run: () => a.openReschedule(row),
          })
        }
        if (items.length === 0) return null

        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
        const open = (e: React.MouseEvent<HTMLElement>) => { e.stopPropagation(); setAnchorEl(e.currentTarget) }
        const close = () => setAnchorEl(null)
        const exec =
          (run: () => void) =>
            (e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation()
              close()
              run()
            }

        return (
          <Box onClick={(e) => e.stopPropagation()}>
            <IconButton size="small" onClick={open}>
              <MoreVertIcon fontSize="inherit" />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
              {items.map(({ label, icon, run }) => (
                <MenuItem key={label} onClick={exec(run)}>
                  {icon && <Box component="span" sx={{ mr: 1 }}>{icon}</Box>}
                  {label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )
      },
    },
  ]

/* ─ page ─ */

const AppointmentListPage = () => {
  const navToProcess = useNavigateToAppointmentProcess()
  const navToEditStudents = useNavigateToAppointmentEditStudents()
  const navToCreate = useNavigateToAppointmentCreate()
  const navToDetail = useNavigateToAppointmentDetail()
  const navToUploadOfflineStates = useNavigateToAppointmentUploadOfflineStates()

  const useList = useAppointmentList

  const list = useAppointmentList()
  const { startExport, exporting } = useExportAppointments(list)

  const [target, setTarget] = useState<I_AppointmentListItem | null>(null)
  const openReschedule = (row: I_AppointmentListItem) => setTarget(row)
  const closeReschedule = () => setTarget(null)
  const [refresh, setRefresh] = useState(0)

  const handleRescheduled = () => setRefresh((v) => v + 1)

  return (
    <>
      <ListPage
        key={refresh}
        columns={columns({ navToProcess, navToEditStudents, navToDetail, openReschedule })}
        useList={useList}
        entityName={APPOINTMENT_NAME}
        onCreate={navToCreate}
        useBatchDelete={useAppointmentBatchDelete}
        onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
        customButtons={

          <Stack direction="row" spacing={2}>
            <Button startIcon={<UploadIcon />} onClick={navToUploadOfflineStates}>
              Cargar Resoluciones Offline
            </Button>


          </Stack>
        }
      />

      <RescheduleDialog
        open={Boolean(target)}
        onClose={closeReschedule}
        originalAppointment={target}
        onRescheduled={handleRescheduled}
      />
    </>
  )
}

export default withAuth(AppointmentListPage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})
