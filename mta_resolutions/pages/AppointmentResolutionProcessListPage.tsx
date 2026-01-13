'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useUserProfilesResources } from '@/mta_auth/hooks'
import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useNavigateToARPDetail, useARPList, useARPListByUserSchool } from '@/mta_resolutions/hooks/arp'
import Spinner from '@/shared/components/Spinner'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

const columns: Array<GridColDef> = [
  idExposeColumn({ field: 'appointment', headerName: 'Turno', flex: 2}),
  {
    field: 'created_at',
    headerName: 'Fecha Procesamiento',
    flex: 1,
    valueGetter: (_value, row) => dayjs(row.created_at).format('DD/MM/YYYY'),
      renderCell: ({ value }) => <>{value}</>,
      sortComparator: (a, b) =>
        dayjs(String(a), 'DD/MM/YYYY').valueOf() - dayjs(String(b), 'DD/MM/YYYY').valueOf(),
    },
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
  allowedUserProfiles: ['admin', 'school_staff','executive'],
  logoutDestination: 'dashboard',
})
