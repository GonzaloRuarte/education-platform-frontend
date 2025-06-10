import { LIGHT_BG_COLOR } from '@/config'
import AppointmentOccurrenceStatusChip from '@/mta_schedule/components/AppointmentOccurrenceStatusChip'
import AppointmentStatusChip from '@/mta_schedule/components/AppointmentStatusChip'
import {
  I_AppointmentEvaluationBrief,
  T_AppointmentId,
  T_AppointmentOccurrenceStatus,
  T_AppointmentStatus,
} from '@/mta_schedule/types'
import { appointmentFormattedStringDate } from '@/mta_schedule/utils'
import { SchoolGrade } from '@/mta_schools/constants'
import { gradeLabel } from '@/mta_schools/labels'
import Bold from '@/shared/components/Bold'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import { Body1, H1, H4 } from '@/shared/components/Typography'
import TodayIcon from '@mui/icons-material/Today'
import { Box, Grid2 } from '@mui/material'

interface I_Props {
  title?: string
  begins_at: string
  subject?: string
  grade?: SchoolGrade
  evaluation?: I_AppointmentEvaluationBrief
  appointmentId: T_AppointmentId
  status?: T_AppointmentStatus
  occurrence_status?: T_AppointmentOccurrenceStatus
  pin?: number
  comments?: string
}

const AppointmentBriefCard = ({
  appointmentId,
  title,
  begins_at,
  subject,
  grade,
  evaluation,
  status,
  occurrence_status,
  pin,
  comments,
}: I_Props) => {
  return (
    <Box bgcolor={LIGHT_BG_COLOR} borderRadius={2} padding={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TodayIcon />
        {(status !== undefined || occurrence_status !== undefined) && (
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
            <Body1>Estado del turno:</Body1>
            {status !== undefined && <AppointmentStatusChip style={{ background: '#FFFFFFAA' }} status={status} />}
            {occurrence_status !== undefined && <AppointmentOccurrenceStatusChip status={occurrence_status} />}
          </Box>
        )}
      </Box>
      <Grid2 container spacing={5}>
        <Grid2 size={8}>
          <MagicGrid spacing={1}>
            {title !== undefined && <H4>{title}</H4>}
            <MagicGrid itemSize="auto">
              <Body1>{appointmentFormattedStringDate(begins_at)}</Body1>
              <Chip sx={{ opacity: 0.4 }} size="small" label={`ID: ${appointmentId}`} />
            </MagicGrid>
            <MagicGrid itemSize="auto">
              {subject && <Chip size="small" label={subject} color="info" />}
              {grade && <Chip size="small" label={gradeLabel(grade)} color="success" />}
            </MagicGrid>
            <Box>
              {evaluation && (
                <>
                  <Spacer />
                  <Body1>
                    Evaluación asignada:
                    <br />
                    <Bold>
                      {evaluation.title} ({evaluation.code})
                    </Bold>
                  </Body1>

                </>
              )}
            </Box>
            {comments && comments.length > 0 &&  
              <>
                  <Spacer />
                  <Body1>
                    Comentarios:
                    <br />
                    <Bold>{comments}</Bold>
                  </Body1>
              </>
            }
          </MagicGrid>
        </Grid2>
        {pin !== undefined && (
          <Grid2 size={4} justifyContent={'flex-end'} display="flex" textAlign={'right'} alignItems={'flex-end'}>
            <Box>
              <Body1>PIN</Body1>
              <H1 fontSize={50} fontWeight="bold" fontFamily="monospace">
                {pin}
              </H1>
            </Box>
          </Grid2>
        )}
      </Grid2>
    </Box>
  )
}

export default AppointmentBriefCard
