'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentBatchDelete,
  useAppointmentList,
  useNavigateToAppointmentCreate,
  useNavigateToAppointmentEditStudents,
  useNavigateToAppointmentProcess,
} from '@/mta_schedule/hooks'
import { I_AppointmentListItem } from '@/mta_schedule/types'
import Button from '@/shared/components/Button'
import ListPage from '@/shared/pages/ListPage'
import RuleIcon from '@mui/icons-material/Rule'
import SchoolIcon from '@mui/icons-material/School'
import { grey, yellow } from '@mui/material/colors'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

const columns = (a: {
  navToProcess: (args: Record<'appointmentId', string | number>) => void
  navToEditStudents: (args: Record<'appointmentId', string | number>) => void
}): Array<GridColDef<I_AppointmentListItem>> => [
  { field: 'id', headerName: '#' },
  {
    field: 'begins_at_date',

    headerName: 'Fecha',
    // flex: 1,
    renderCell: ({ row }) => <>{dayjs(row.begins_at).format('DD/MM/YYYY')}</>,
  },
  {
    field: 'begins_at_time',
    headerName: 'Hora Inicio',
    // flex: 1,
    renderCell: ({ row }) => <>{dayjs(row.begins_at).format('HH:mm')}</>,
  },
  // {
  //   field: 'ends_at',
  //   headerName: 'Finalización',
  //   flex: 1,
  //   renderCell: ({ value }) => <>{new Date(value).toLocaleString()}</>,
  // },
  {
    field: 'status',
    headerName: 'Estado',
    flex: 0.7,
    renderCell: ({ value }) => <AppointmentStatusChip status={value} size="small" />,
  },
  {
    field: 'school',
    headerName: 'Escuela',
    flex: 2,
    renderCell: ({ value }) => <>{value !== null ? value.name : '-'}</>,
  },
  {
    field: 'actions',
    type: 'actions',
    flex: 1.5,
    headerName: 'Acciones',
    getActions: (params) => {
      const actions: Array<any> = []

      if (params.row.status === 'P') {
        actions.push(
          <Button
            bgcolor="purple"
            size="small"
            startIcon={<RuleIcon />}
            onClick={() => a.navToProcess({ appointmentId: params.id })}
          >
            Procesar
          </Button>,
        )
      }
      if (params.row.status === 'A') {
        const hasToAdd = params.row.student_count === 0
        actions.push(
          <Button
            size="small"
            bgcolor={hasToAdd ? 'yellow' : undefined}
            startIcon={<SchoolIcon />}
            onClick={() => a.navToEditStudents({ appointmentId: params.id })}
          >
            {hasToAdd ? 'Agregar' : 'Editar'} estudiantes
          </Button>,
        )
      }
      return actions
    },
  },
]

const AppointmentListPage = () => {
  const navToProcess = useNavigateToAppointmentProcess()
  const navToEditStudents = useNavigateToAppointmentEditStudents()
  const navToCreate = useNavigateToAppointmentCreate()

  return (
    <ListPage
      columns={columns({ navToProcess, navToEditStudents })}
      useList={useAppointmentList}
      entityName={APPOINTMENT_NAME}
      onCreate={navToCreate}
      useBatchDelete={useAppointmentBatchDelete}
    />
  )
}

export default withAuth(AppointmentListPage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})
