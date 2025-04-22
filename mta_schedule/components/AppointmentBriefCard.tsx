import { LIGHT_BG_COLOR } from '@/config'
import { I_AppointmentEvaluationBrief, T_AppointmentId } from '@/mta_schedule/types'
import { SchoolGrade } from '@/mta_schools/constants'
import { gradeLabel, schoolLabels } from '@/mta_schools/labels'
import Bold from '@/shared/components/Bold'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import { Body1, H4 } from '@/shared/components/Typography'
import { sentence } from '@/shared/utils'
import TodayIcon from '@mui/icons-material/Today'
import { Box } from '@mui/material'
import dayjs from 'dayjs'

interface I_Props {
  title: string
  begins_at: string
  subject?: string
  grade?: SchoolGrade
  evaluation?: I_AppointmentEvaluationBrief
  appointmentId: T_AppointmentId
}

const AppointmentBriefCard = ({ appointmentId, title, begins_at, subject, grade, evaluation }: I_Props) => {
  return (
    <Box bgcolor={LIGHT_BG_COLOR} borderRadius={2} padding={2}>
      <TodayIcon />
      <MagicGrid spacing={1}>
        <H4>{title}</H4>
        <MagicGrid itemSize="auto">
          <Body1>{sentence(dayjs(begins_at).locale('es').format('LLLL'))}</Body1>
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
      </MagicGrid>
    </Box>
  )
}

export default AppointmentBriefCard
