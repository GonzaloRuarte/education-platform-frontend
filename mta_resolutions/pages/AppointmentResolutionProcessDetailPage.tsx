'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { useHasCapabilities } from '@/mta_auth/hooks'
import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useARPDetail, useNavigateToARPList } from '@/mta_resolutions/hooks/arp'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import SelectedSchoolMismatchAlert from '@/mta_schools/components/SelectedSchoolMismatchAlert'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import Table from '@/shared/components/Table'
import { H3 } from '@/shared/components/Typography'
import { secondsToHHMMSS } from '@/shared/utils'
import { GridColDef } from '@mui/x-data-grid'
import { useParams } from 'next/navigation'

const baseColumns: Array<GridColDef> = [
  { field: 'student_personal_id', headerName: 'DNI' },
  { field: 'total_question_resolutions', headerName: 'Cantidad de respuestas', flex: 1 },
  {
    field: 'elapsed_time',
    headerName: 'Tiempo utilizado',
    flex: 1,
    renderCell: ({ value }) => <>{secondsToHHMMSS(value)}</>,
  },
]

const AppointmentResolutionProcessDetailPage = () => {
  const { id } = useParams()
  const { data, reload } = useARPDetail(Number(id))
  const navToList = useNavigateToARPList()
  const canViewStudentDni = useHasCapabilities(['view_student_dni'])
  const { paginationModel, setPaginationModel } = Table.usePaginationModel()
  const columns = canViewStudentDni
    ? baseColumns
    : baseColumns.filter((column) => column.field !== 'student_personal_id')

  return (
    <Page>
      <Page.Title>Detalle {APPOINTMENT_RESOLUTION_PROCESS_NAME.singular} (solo lectura)</Page.Title>
      <Page.BasicToolbar
        entityName={APPOINTMENT_RESOLUTION_PROCESS_NAME}
        id={Number(id)}
        onExit={navToList}
        reload={reload}
      />

      <Page.Content>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            <SelectedSchoolMismatchAlert entitySchool={data.appointment.school} entityLabel="proceso" />
            <AppointmentBriefCard
              appointmentId={data.appointment.id}
              status={data.appointment.status}
              begins_at={data.appointment.begins_at}
              title={data.appointment.school === null ? undefined : data.appointment.school.name}
              subject={data.appointment.requested_evaluation_subject?.name || ''}
              grade={data.appointment.requested_evaluation_grade || undefined}
              evaluation={data.appointment.evaluation_brief || undefined}
              occurrence_status={data.appointment.occurrence_status}
              pin={data.appointment.pin}
              comments={data.appointment.comments}
            />
            <Spacer size="l" />
            <H3>{STUDENT_PROFILE_NAME.plural}</H3>
            <Spacer size="s" />
            <Table
              data={data.resolutions}
              count={data.resolutions.length}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default withAuth(AppointmentResolutionProcessDetailPage, {
  allowedCapabilities: ['view_reports'],
  logoutDestination: 'dashboard',
})
