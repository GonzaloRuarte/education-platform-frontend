import Checkbox from '@mui/material/Checkbox'

import {
  I_EvaluationDetail,
  I_EvaluationDetail_MultipleChoiceAnswer,
  I_EvaluationDetail_NumericAnswer,
  T_AnswerType,
  T_EvaluationId,
  T_QuestionId,
} from '@/mta_evaluations/types'
import Button from '@/shared/components/Button'
import Chip from '@/shared/components/Chip'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1, Body2 } from '@/shared/components/Typography'
import { sharedLabels } from '@/shared/labels'
import { T_ArrayElement } from '@/shared/types'
import truncateString, { strippedString } from '@/shared/utils'

import Bold from '@/shared/components/Bold'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import UploadIcon from '@mui/icons-material/Upload'
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, FormGroup, Grid2 as Grid } from '@mui/material'
import parse from 'html-react-parser'
import React, { FC } from 'react'
import { useNavigateToQuestionEdit } from '@/mta_evaluations/hooks'

const Toolbar: FC<{ questionId: T_QuestionId; evaluationId: T_EvaluationId }> = ({ questionId, evaluationId }) => {
  const navigateToEdit = useNavigateToQuestionEdit()
  const handleEdit = () => {
    navigateToEdit({ evaluationId, questionId })
  }
  return (
    <>
      <Grid container justifyContent="flex-end" alignItems="center">
        <MagicGrid itemSize={'auto'}>
          <Button onClick={handleEdit} startIcon={<EditIcon />}>
            {sharedLabels.edit}
          </Button>
          <Button startIcon={<UploadIcon />}>{sharedLabels.moveUp}</Button>
          <Button startIcon={<DownloadIcon />}>{sharedLabels.moveDown}</Button>
          <Button startIcon={<DeleteIcon />}>{sharedLabels.delete}</Button>
        </MagicGrid>
      </Grid>
    </>
  )
}

const MultipleChoiceAnswer: FC<{ data: I_EvaluationDetail_MultipleChoiceAnswer }> = ({ data }) => {
  return (
    <React.Fragment>
      <FormGroup>
        {data.options.map((option) => {
          return (
            <FormControlLabel
              key={option.id}
              control={<Checkbox checked={option.is_true} />}
              label={
                <>
                  <Chip label={option.name} /> {option.content}
                </>
              }
            />
          )
        })}
      </FormGroup>
    </React.Fragment>
  )
}
const NumericAnswer: FC<{ data: I_EvaluationDetail_NumericAnswer }> = ({ data }) => {
  return (
    <React.Fragment key={data.id}>
      <Body1>
        Respuesta: <Bold>{data.value}</Bold>
      </Body1>
    </React.Fragment>
  )
}

const answersComponents: Record<T_AnswerType, FC<any>> = {
  MultipleChoice: MultipleChoiceAnswer,
  Numeric: NumericAnswer,
}

const QuestionAccordion: FC<{
  evaluationId: T_EvaluationId
  question: T_ArrayElement<I_EvaluationDetail['questions']>
  isExpanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<number | false>>
}> = ({ isExpanded, setExpanded, question, evaluationId }) => {
  const handleChange = (panel: I_EvaluationDetail['id']) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }
  const AnswerComponent = answersComponents[question.answer.resource_type]

  return (
    <Accordion style={{ margin: '.5em 0' }} slotProps={{ transition: { unmountOnExit: true } }} expanded={isExpanded} onChange={handleChange(question.id)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Body1 component="span" sx={{ width: '33%', flexShrink: 0 }}>
          Pregunta #{question.order + 1} {question.is_mandatory && <Chip variant="outlined" size="small" label="Obligatoria" />}
        </Body1>
        {!isExpanded && (
          <>
            <Body2 component="span" sx={{ color: 'text.secondary' }}>
              <Chip variant="outlined" size="small" label={question.answer.resource_type} /> {truncateString(strippedString(question.content), 40)}
            </Body2>
          </>
        )}
      </AccordionSummary>

      <AccordionDetails>
        <MagicGrid>
          <Box>{parse(question.content)}</Box>
          <AnswerComponent data={question.answer} />
          <Toolbar evaluationId={evaluationId} questionId={question.id} />
        </MagicGrid>
      </AccordionDetails>
    </Accordion>
  )
}

export default QuestionAccordion
