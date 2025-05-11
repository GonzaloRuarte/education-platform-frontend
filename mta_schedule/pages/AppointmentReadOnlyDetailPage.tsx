'use client'

import { useNavigateToARPDetail, useNavigateToARPList } from '@/mta_resolutions/hooks/arp'
import { T_AppointmentResolutionProcessId } from '@/mta_resolutions/types/arp'
import AppointmentBriefCard from '@/mta_schedule/components/AppointmentBriefCard'
import { APPOINTMENT_NAME } from '@/mta_schedule/constants'
import {
  useAppointmentDetail,
  useAppointmentRequestPostProcess,
  useNavigateToAppointmentList,
} from '@/mta_schedule/hooks'
import { appointmentShowPostProcessingResources } from '@/mta_schedule/utils'
import Button from '@/shared/components/Button'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Page from '@/shared/components/Page'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Body1, H2, H3 } from '@/shared/components/Typography'
import CalculateIcon from '@mui/icons-material/Calculate'
import { Grid2 } from '@mui/material'
import { useParams } from 'next/navigation'

const AppointmentReadOnlyDetail = () => {
  const { appointmentId } = useParams()
  const { data, reload } = useAppointmentDetail(Number(appointmentId))
  const navToList = useNavigateToAppointmentList()
  const requestAppointmentPostProcess = useAppointmentRequestPostProcess(reload)

  const navToAPRDetail = useNavigateToARPDetail()

  return (
    <Page>
      <Page.Title>Detalle {APPOINTMENT_NAME.singular} (solo lectura)</Page.Title>
      <Page.BasicToolbar entityName={APPOINTMENT_NAME} id={Number(appointmentId)} onExit={navToList} reload={reload} />

      <Page.Content>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            <AppointmentBriefCard
              appointmentId={data.id}
              status={data.status}
              begins_at={data.begins_at}
              title={data.school === null ? undefined : data.school.name}
              subject={data.requested_evaluation_subject === null ? '' : data.requested_evaluation_subject.name}
              grade={data.requested_evaluation_grade === null ? undefined : data.requested_evaluation_grade}
              evaluation={data.evaluation_brief !== null ? data.evaluation_brief : undefined}
              occurrence_status={data.occurrence_status}
              pin={data.pin}
            />
            <Spacer />
            {data.students.length > 0 && (
              <>
                <H3>Listado de estudiantes</H3>
                <Spacer size="s" />
                <Body1>Cantidad: {data.students.length}</Body1>
                <Spacer size="s" />
                <MagicGrid itemSize="auto">
                  {data.students.map((s) => (
                    <Chip key={s.personal_id} label={`${s.personal_id} (${s.cohort})`} />
                  ))}
                </MagicGrid>
              </>
            )}
            {data.real_time_status !== null && (
              <>
                <Spacer size="l" />
                <H3>Estado en tiempo real</H3>
                <Spacer size="s" />
                <Grid2 container spacing={5}>
                  <Grid2 size={4}>
                    <Pastilla variant="light_blue" padding={'20px 30px'}>
                      <H2>{data.real_time_status.included_students}</H2>
                      <Body1>Estudiantes incluidos</Body1>
                    </Pastilla>
                  </Grid2>
                  <Grid2 size={4}>
                    <Pastilla variant="light_blue" padding={'20px 30px'}>
                      <H2>{data.real_time_status.started_students}</H2>
                      <Body1>Estudiantes iniciados</Body1>
                    </Pastilla>
                  </Grid2>
                  <Grid2 size={4}>
                    <Pastilla variant="light_blue" padding={'20px 30px'}>
                      <H2>{data.real_time_status.finished_students}</H2>
                      <Body1>Estudiantes finalizados</Body1>
                    </Pastilla>
                  </Grid2>
                </Grid2>
              </>
            )}

            {appointmentShowPostProcessingResources(data) && (
              <>
                <Spacer size="l" />
                <H3 id="process-results">Procesamiento de Resultados</H3>
                <Spacer size="l" />
                {data.was_post_processed ? (
                  <Button
                    bgcolor="purple"
                    size="large"
                    startIcon={<CalculateIcon />}
                    onClick={() => navToAPRDetail(data.post_process as T_AppointmentResolutionProcessId)}
                  >
                    Ver Resultados
                  </Button>
                ) : (
                  <Button
                    bgcolor="purple"
                    size="large"
                    startIcon={<CalculateIcon />}
                    onClick={() => requestAppointmentPostProcess({ appointment_id: data.id })}
                  >
                    Procesar Resultados
                  </Button>
                )}
              </>
            )}
          </>
        )}
        <Spacer size="xxl" />
      </Page.Content>
    </Page>
  )
}

export default AppointmentReadOnlyDetail
