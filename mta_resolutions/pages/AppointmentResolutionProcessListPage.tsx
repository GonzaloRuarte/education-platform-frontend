'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useNavigateToARPDetail, useARPList } from '@/mta_resolutions/hooks/arp'
import ListPage from '@/shared/pages/ListPage'
import { GridColDef } from '@mui/x-data-grid'

const columns: Array<GridColDef> = [
  { field: 'id', headerName: '#' },
  { field: 'appointment_id', headerName: 'ID de la Cita', flex: 1 },
  { field: 'resolutions_count', headerName: 'Cantidad de Resoluciones', flex: 1 },
  { field: 'created_at', headerName: 'Creado el', flex: 1 },
]

const AppointmentResolutionProcessListPage = () => {
  const navigateToDetail = useNavigateToARPDetail()

  return (
    <ListPage
      columns={columns}
      useList={useARPList}
      entityName={APPOINTMENT_RESOLUTION_PROCESS_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navigateToDetail)}
    />
  )
}

export default withAuth(AppointmentResolutionProcessListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
