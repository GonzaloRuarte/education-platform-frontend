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
} from '@/mta_schedule/hooks'
import { AppointmentOccurrenceStatus, AppointmentStatus, I_AppointmentListItem } from '@/mta_schedule/types'
import { appointmentShowPostProcessingResources } from '@/mta_schedule/utils'
import Button from '@/shared/components/Button'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import CalculateIcon from '@mui/icons-material/Calculate'
import RuleIcon from '@mui/icons-material/Rule'
import SchoolIcon from '@mui/icons-material/School'
import TroubleshootIcon from '@mui/icons-material/Troubleshoot'
import UploadIcon from '@mui/icons-material/Upload'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import RescheduleDialog from '@/mta_schedule/components/AppointmentRescheduleDialog'
import MoreVertIcon        from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material'





const columns = (a: {
  navToProcess: (args: Record<'appointmentId', string | number>) => void
  navToEditStudents: (args: Record<'appointmentId', string | number>) => void
  navToDetail: (id) => void
  openReschedule: (row: I_AppointmentListItem) => void
}): Array<GridColDef<I_AppointmentListItem>> => [
  idExposeColumn({
    field: 'begins_at_date',
    headerName: 'Fecha',
    renderCell: ({ row }) => <>{dayjs(row.begins_at).format('DD/MM/YYYY')}</>,
  }),
  {
    field: 'begins_at_time',
    headerName: 'Hora Inicio',
    // flex: 1,
    renderCell: ({ row }) => <>{dayjs(row.begins_at).format('HH:mm')}</>,
  },
  {
    field: 'status',
    headerName: 'Estado',
    flex: 0.7,
    renderCell: ({ value }) => <AppointmentStatusChip status={value} size="small" />,
  },
  {
    field: 'occurrence_status',
    headerName: 'Estado de Ocurrencia',
    flex: 0.7,
    renderCell: ({ value }) => <AppointmentOccurrenceStatusChip status={value} size="small" />,
  },

  {
    field: 'school',
    headerName: 'Escuela',
    flex: 2,
    renderCell: ({ value }) => <>{value !== null ? value.name : '-'}</>,
  },
  { field: 'pin', headerName: 'PIN' },
  {
    field: 'student_count',
    headerName: 'Cantidad Estudiantes',
    renderCell: ({ row }) => <>{row.status === AppointmentStatus.approved ? row.student_count : '-'}</>,
    flex: 0.7,
  },
  {
    field: 'was_post_processed',
    headerName: 'Fue Procesado',
    flex: 0.7,
    renderCell: ({ row }) => {
        if (!appointmentShowPostProcessingResources(row)) return <>-</>
        return <>{row.was_post_processed ? 'Sí' : 'No'}</>
      },
    },
    {
      field      : 'actions',
      headerName : 'Acciones',
      flex       : 0.6,
      sortable   : false,
      filterable : false,

      // drop `type: 'actions'` so we have full control
      renderCell: (params) => {
    const { row, id } = params

    /* build the menu for this row (same logic you already wrote) */
    const items: { label: string; icon?: React.ReactNode; run: () => void }[] = []

    if (appointmentShowPostProcessingResources(row) && !row.was_post_processed) {
      items.push({
        label: 'Procesar resultados',
        icon : <CalculateIcon fontSize="small" />,
        run: () => a.navToDetail(row.id),
      })
    }
    if (row.occurrence_status === AppointmentOccurrenceStatus.ongoing) {
      items.push({
        label : 'Monitorear',
        icon  : <TroubleshootIcon fontSize="small" />,
        run: () => a.navToDetail(id),
      })
    }
    if (row.status === 'P') {
      items.push({
        label : 'Procesar',
        icon  : <RuleIcon fontSize="small" />,
        run: () => a.navToProcess({ appointmentId: id }),
      })
    }
    if (row.status === 'A') {
      const hasToAdd = row.student_count === 0
      items.push({
        label : `${hasToAdd ? 'Agregar' : 'Editar'} estudiantes`,
        icon  : <SchoolIcon fontSize="small" />,
        run: () => a.navToEditStudents({ appointmentId: id }),
      })
    }
    if (
      row.status === AppointmentStatus.approved &&
      row.occurrence_status === AppointmentOccurrenceStatus.upcoming
    ) {
      items.push({
        label : 'Reprogramar',
        run: () => a.openReschedule(row),
      })
    }
    if (items.length === 0) return null

    /* ---- local state & helpers ---- */
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open  = (e: React.MouseEvent<HTMLElement>) => { e.stopPropagation(); setAnchorEl(e.currentTarget) }
    const close = () => setAnchorEl(null)
    const exec =
      (run: () => void) =>
      (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        close()
        run()
      }

    /* ---- stop every click inside this cell from bubbling ---- */
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

const AppointmentListPage = () => {
  /* ─ hooks already present ─ */
  const navToProcess              = useNavigateToAppointmentProcess()
  const navToEditStudents         = useNavigateToAppointmentEditStudents()
  const navToCreate               = useNavigateToAppointmentCreate()
  const navToDetail               = useNavigateToAppointmentDetail()
  const navToUploadOfflineStates  = useNavigateToAppointmentUploadOfflineStates()

  /* the list hook still feeds <ListPage> */
  const useList = useAppointmentList          // alias for readability


  /* ─ local state for dialog ─ */
  const [target, setTarget] = useState<I_AppointmentListItem | null>(null)
  const openReschedule   = (row: I_AppointmentListItem) => setTarget(row)
  const closeReschedule  = () => setTarget(null)
  const [refresh, setRefresh] = useState(0)

  const handleRescheduled = () => setRefresh((v) => v + 1)
  return (
    <>
      <ListPage
        key = {refresh}
        columns={columns({ navToProcess, navToEditStudents, navToDetail, openReschedule })}
        useList={useList}
        entityName={APPOINTMENT_NAME}
        onCreate={navToCreate}
        useBatchDelete={useAppointmentBatchDelete}
        onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
        customButtons={
          <Button startIcon={<UploadIcon />} onClick={navToUploadOfflineStates}>
            Cargar Resoluciones Offline
          </Button>
        }
      />

      {/* ─────────── Dialog lives next to the page ─────────── */}
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
