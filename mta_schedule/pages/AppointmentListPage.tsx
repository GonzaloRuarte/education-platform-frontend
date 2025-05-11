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

const columns = (a: {
  navToProcess: (args: Record<'appointmentId', string | number>) => void
  navToEditStudents: (args: Record<'appointmentId', string | number>) => void
  navToDetail: (id) => void
  // requestAppointmentPostProcess: (data: { appointment_id: T_AppointmentId }) => void
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
    field: 'actions',
    type: 'actions',
    flex: 1.5,
    headerName: 'Acciones',
    getActions: (params) => {
      const actions: Array<any> = []

      if (appointmentShowPostProcessingResources(params.row) && !params.row.was_post_processed) {
        return [
          <Button startIcon={<CalculateIcon />} size="small" onClick={() => a.navToDetail(params.row.id)}>
            Procesar Resultados
          </Button>,
        ]
      }

      if (params.row.occurrence_status === AppointmentOccurrenceStatus.past) {
        return []
      }
      if (params.row.occurrence_status === AppointmentOccurrenceStatus.ongoing) {
        return [
          <Button startIcon={<TroubleshootIcon />} size="small" onClick={() => a.navToDetail(params.id)}>
            Monitorear
          </Button>,
        ]
      }

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
  const navToDetail = useNavigateToAppointmentDetail()
  const navToUploadOfflineStates = useNavigateToAppointmentUploadOfflineStates()

  return (
    <ListPage
      columns={columns({ navToProcess, navToEditStudents, navToDetail })}
      useList={useAppointmentList}
      entityName={APPOINTMENT_NAME}
      onCreate={navToCreate}
      useBatchDelete={useAppointmentBatchDelete}
      onRowClick={ListPage.mapNavToOnRowClick(navToDetail)}
      customButtons={
        <>
          <Button startIcon={<UploadIcon />} onClick={navToUploadOfflineStates}>
            Cargar Resoluciones Offline
          </Button>
        </>
      }
    />
  )
}

export default withAuth(AppointmentListPage, {
  allowedUserProfiles: ['admin'],
  logoutDestination: 'dashboard',
})
