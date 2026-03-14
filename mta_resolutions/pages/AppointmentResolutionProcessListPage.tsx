'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useNavigateToARPDetail, useARPList, useARPListByUserSchool } from '@/mta_resolutions/hooks/arp'
import { useSchoolScopeResources } from '@/mta_schools/hooks/state'
import Spinner from '@/shared/components/Spinner'
import Page from '@/shared/components/Page'
import { Alert } from '@mui/material'
import ListPage from '@/shared/pages/ListPage'
import { idExposeColumn } from '@/shared/pages/utils'
import { GridColDef } from '@mui/x-data-grid'
import { dateFromDatetimeColumn, timeFromDatetimeColumn } from '@/shared/components/DateTimeColumns'

const columns: Array<GridColDef> = [
  idExposeColumn({ field: 'id', headerName: 'ID', flex: 0.5 }),

  dateFromDatetimeColumn({
    field: 'begins_at_date',      // ✅ virtual column name sent to backend
    datetimeField: 'begins_at',   // ✅ raw datetime from API
    headerName: 'Fecha Turno',
  }),

  timeFromDatetimeColumn({
    field: 'begins_at_time',      // ✅ virtual column name sent to backend
    datetimeField: 'begins_at',
    headerName: 'Hora Turno',
  }),

  {
    field: 'evaluation_title',
    headerName: 'Evaluación',
    flex: 2,
    filterable: true,
    sortable: true,
  },

  {
    field: 'school',
    headerName: 'Escuela',
    flex: 2,
    filterable: true,
    sortable: true,
  },

  {
    field: 'subject',
    headerName: 'Materia',
    flex: 1.5,
    filterable: true,
    sortable: true,
  },

  {
    field: 'grade',
    headerName: 'Año',
    flex: 0.8,
    valueGetter: (_v, row) => (row.grade ? `${row.grade}º` : ''),
    filterable: true,
    sortable: true,
  },

  {
    field: 'division',
    headerName: 'División',
    flex: 1.2,
    filterable: true,
    sortable: true,
  },

  // you already have this working (Option 1)
  // (this assumes your dateFromDatetimeColumn uses date operators)
  dateFromDatetimeColumn({
    field: 'created_at',
    datetimeField: 'created_at',
    headerName: 'Fecha Procesamiento',
  }),
]

const AppointmentResolutionProcessListPage = () => {
  const navigateToDetail = useNavigateToARPDetail()
  const canManageAppointmentSlots = useHasCapabilities(['manage_appointment_slots'])
  const { selectedSchool, isLoading, shouldSelectSchool } = useSchoolScopeResources()

  if (isLoading) return <Spinner />

  if (!canManageAppointmentSlots && shouldSelectSchool && selectedSchool === null) {
    return (
      <Page>
        <Page.Title>Listado de {APPOINTMENT_RESOLUTION_PROCESS_NAME.plural}</Page.Title>
        <Page.Content>
          <Alert severity="info">Seleccioná una escuela para ver los procesos de evaluación.</Alert>
        </Page.Content>
      </Page>
    )
  }

  const filtersData = !canManageAppointmentSlots && selectedSchool !== null ? { school_id: selectedSchool?.id } : undefined
  const stateKey = !canManageAppointmentSlots ? `scope-${selectedSchool?.id ?? 'all-accessible'}` : undefined

  return (
    <ListPage
      columns={columns}
      useList={canManageAppointmentSlots ? useARPList : useARPListByUserSchool}
      entityName={APPOINTMENT_RESOLUTION_PROCESS_NAME}
      onRowClick={ListPage.mapNavToOnRowClick(navigateToDetail)}
      filtersData={filtersData}
      stateKey={stateKey}
    />
  )
}

export default withAuth(AppointmentResolutionProcessListPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
