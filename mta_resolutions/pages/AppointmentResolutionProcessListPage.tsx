'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useNavigateToARPDetail, useARPList, useARPListByUserSchool } from '@/mta_resolutions/hooks/arp'
import Spinner from '@/shared/components/Spinner'
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
  const { isAdmin } = useUserProfilesResources()

  if (isAdmin === undefined) return <Spinner />
  return (
    <ListPage
      columns={columns}
      useList={isAdmin ? useARPList : useARPListByUserSchool}
      entityName={APPOINTMENT_RESOLUTION_PROCESS_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navigateToDetail)}
    />
  )
}

export default withAuth(AppointmentResolutionProcessListPage, {
  allowedUserProfiles: ['admin', 'school_staff'],
  logoutDestination: 'dashboard',
})
