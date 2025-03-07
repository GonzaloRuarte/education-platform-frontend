import { evaluationLabels } from '@/mta_evaluations/labels'
import Pastilla from '@/shared/components/Pastilla'
import Grid from '@mui/material/Grid2'
import InsertPageBreakIcon from '@mui/icons-material/InsertPageBreak'
import QuizIcon from '@mui/icons-material/Quiz'
import Button from '@/shared/components/Button'

const CreationToolbar = () => {
  return (
    <Pastilla>
      <Grid container justifyContent="center" alignItems="center">
        <Grid size="grow">{evaluationLabels.create}</Grid>
        <Grid container spacing={2}>
          <Grid>
            <Button startIcon={<InsertPageBreakIcon />}>{evaluationLabels.pageBreak}</Button>
          </Grid>
          <Grid>
            <Button startIcon={<QuizIcon />}>{evaluationLabels.newQuestion}</Button>
          </Grid>
        </Grid>
      </Grid>
    </Pastilla>
  )
}

export default CreationToolbar
