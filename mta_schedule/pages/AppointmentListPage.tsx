'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentBatchDelete,
  useAppointmentList,
  useNavigateToAppointmentCreate,
  useNavigateToAppointmentProcess,
} from '@/mta_schedule/hooks'
import { I_AppointmentListItem, T_AppointmentList } from '@/mta_schedule/types'
import Button from '@/shared/components/Button'
import ListPage from '@/shared/pages/ListPage'
import RuleIcon from '@mui/icons-material/Rule'
import { GridColDef, GridRowParams } from '@mui/x-data-grid'

const columns = (
  navToProcess: (args: Record<'appointmentId', string | number>) => void,
): Array<GridColDef<I_AppointmentListItem>> => [
  { field: 'id', headerName: '#' },
  {
    field: 'begins_at',
    headerName: 'Inicio',
    flex: 1,
    renderCell: ({ value }) => <>{new Date(value).toLocaleString()}</>,
  },
  {
    field: 'ends_at',
    headerName: 'Finalización',
    flex: 1,
    renderCell: ({ value }) => <>{new Date(value).toLocaleString()}</>,
  },
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
    flex: 1,
    headerName: 'Acciones',
    getActions: (params) => {
      const actions: Array<any> = []

      if (params.row.status === 'P') {
        actions.push(
          <Button size="small" startIcon={<RuleIcon />} onClick={() => navToProcess({ appointmentId: params.id })}>
            Procesar
          </Button>,
        )
      }
      return actions
    },
  },
]

const AppointmentListPage = () => {
  const navToProcess = useNavigateToAppointmentProcess()
  const navToCreate = useNavigateToAppointmentCreate()

  return (
    <ListPage
      columns={columns(navToProcess)}
      useList={useAppointmentList}
      entityName={APPOINTMENT_NAME}
      onCreate={navToCreate}
      useBatchDelete={useAppointmentBatchDelete}
    />
  )
}

export default withAuth(AppointmentListPage, {
  allowedAccessGroups: ['admin'],
  logoutDestination: 'dashboard',
})
