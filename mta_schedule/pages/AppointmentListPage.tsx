'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentBatchDelete,
  useAppointmentList,
  useNavigateToAppointmentCreate,
  useNavigateToAppointmentDetail,
} from '@/mta_schedule/hooks'
import ListPage from '@/shared/pages/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
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
    // flex: 1.5,
    renderCell: ({ value }) => <AppointmentStatusChip status={value} size="small" />,
  },
  {
    field: 'school',
    headerName: 'Escuela',
    flex: 2,
    renderCell: ({ value }) => <>{value !== null ? value.name : '-'}</>,
  },
]

const AppointmentListPage = () => {
  const navToDetail = useNavigateToAppointmentDetail()
  const navToCreate = useNavigateToAppointmentCreate()
  const batchDelete = useAppointmentBatchDelete()
  return (
    <ListPage
      columns={columns}
      useList={useAppointmentList}
      entityName={APPOINTMENT_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      onCreate={navToCreate}
      onBatchDelete={batchDelete}
    />
  )
}

export default withAuth(AppointmentListPage, ['admin', 'school_staff'])
