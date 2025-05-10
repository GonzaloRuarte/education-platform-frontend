'use client'

import { APPOINTMENT_RESOLUTION_PROCESS_NAME } from '@/mta_resolutions/constants'
import { useARPDetail, useNavigateToARPList } from '@/mta_resolutions/hooks/arp'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { STUDENT_PROFILE_NAME } from '@/mta_schools/constants'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import Table from '@/shared/components/Table'
import { H3 } from '@/shared/components/Typography'
import { secondsToHHMMSS } from '@/shared/utils'
import { GridColDef } from '@mui/x-data-grid'
import { useParams } from 'next/navigation'

const columns: Array<GridColDef> = [
  { field: 'student_personal_id', headerName: 'DNI' },
  { field: 'total_question_resolutions', headerName: 'Cantidad de respuestas', flex: 1 },
  // { field: 'right_resolutions', headerName: 'Correctas', flex: 1 },
  // { field: 'started_at', headerName: 'Iniciado el', flex: 1 },
  // { field: 'finished_at', headerName: 'Finalizado el', flex: 1 },
  {
    field: 'elapsed_time',
    headerName: 'Tiempo utilizado',
    flex: 1,
    renderCell: ({ value }) => {
      return <>{secondsToHHMMSS(value)}</>
    },
  },
]

const AppointmentResolutionProcessDetailPage = () => {
  const { id } = useParams()
  const { data, reload } = useARPDetail(Number(id))
  const navToList = useNavigateToARPList()
  const { paginationModel, setPaginationModel } = Table.usePaginationModel()

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
            <AppointmentBriefCard
              appointmentId={data.appointment.id}
              status={data.appointment.status}
              begins_at={data.appointment.begins_at}
              title={data.appointment.school === null ? undefined : data.appointment.school.name}
              subject={
                data.appointment.requested_evaluation_subject === null
                  ? ''
                  : data.appointment.requested_evaluation_subject.name
              }
              grade={
                data.appointment.requested_evaluation_grade === null
                  ? undefined
                  : data.appointment.requested_evaluation_grade
              }
              evaluation={data.appointment.evaluation_brief !== null ? data.appointment.evaluation_brief : undefined}
            />
            <Spacer size="l" />

            <H3>Listado de resoluciones por {STUDENT_PROFILE_NAME.singular}</H3>
            <Spacer size="s" />
            <Table
              columns={columns}
              data={data.resolutions}
              count={data.resolutions.length}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default AppointmentResolutionProcessDetailPage
