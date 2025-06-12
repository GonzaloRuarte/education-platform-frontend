import AnswerTypeChip from '@/mta_evaluations/components/AnswerTypeChip'
import MultipleChoiceOption from '@/mta_evaluations/components/MultipleChoiceOption'
import { QUESTION_NAME } from '@/mta_evaluations/constants'
import {
  useNavigateToQuestionEdit,
  useQuestionDelete,
  useQuestionMoveBackward,
  useQuestionMoveForward,
} from '@/mta_evaluations/hooks'
import {
  EvaluationStatus,
  I_AnswerMultipleChoiceDetail,
  I_AnswerNumericDetail,
  I_EvaluationPageDetail,
  T_EvaluationStatusCode,
  T_AnswerType,
  T_EvaluationId,
  T_QuestionId,
} from '@/mta_evaluations/types'
import Bold from '@/shared/components/Bold'
import Button from '@/shared/components/Button'
import DeleteInstanceButton from '@/shared/components/DeleteInstanceButton'
import HTMLParser from '@/shared/components/HTMLParser'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1, Body2 } from '@/shared/components/Typography'
import { sharedLabels } from '@/shared/labels'
import { T_ArrayElement, T_VoidFn } from '@/shared/types'
import { strippedString, truncateString } from '@/shared/utils'
import DownloadIcon from '@mui/icons-material/Download'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import UploadIcon from '@mui/icons-material/Upload'
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid2 as Grid } from '@mui/material'
import React, { FC } from 'react'

const Toolbar: FC<{ questionId: T_QuestionId; evaluationId: T_EvaluationId; reload: T_VoidFn; disabled: boolean }> = ({
  questionId,
  evaluationId,
  reload,
  disabled,
}) => {
  const navigateToEdit = useNavigateToQuestionEdit()
  const mBackward = useQuestionMoveBackward()
  const mForward = useQuestionMoveForward()
  const handleEdit = () => {
    navigateToEdit({ evaluationId, questionId })
  }
  const handleMoveForward = () => {
    mForward(questionId, {}).then(reload)
  }
  const handleMoveBackward = () => {
    mBackward(questionId, {}).then(reload)
  }
  return (
    <>
      <Grid container justifyContent="flex-end" alignItems="center">
        <MagicGrid itemSize={'auto'}>
          <Button disabled={disabled} onClick={handleEdit} startIcon={<EditIcon />}>
            {sharedLabels.edit}
          </Button>
          <Button disabled={disabled} onClick={handleMoveBackward} startIcon={<UploadIcon />}>
            {sharedLabels.moveUp}
          </Button>
          <Button disabled={disabled} onClick={handleMoveForward} startIcon={<DownloadIcon />}>
            {sharedLabels.moveDown}
          </Button>
          <DeleteInstanceButton
            disabled={disabled}
            callback={reload}
            entityName={QUESTION_NAME}
            useDelete={useQuestionDelete}
            id={questionId}
          />
        </MagicGrid>
      </Grid>
    </>
  )
}

const MultipleChoiceAnswer: FC<{ data: I_AnswerMultipleChoiceDetail }> = ({ data }) => {
  return (
    <React.Fragment>
      {data.options.map((option) => {
        return <MultipleChoiceOption key={option.id} data={option} />
      })}
    </React.Fragment>
  )
}
const NumericAnswer: FC<{ data: I_AnswerNumericDetail }> = ({ data }) => {
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
  question: T_ArrayElement<I_EvaluationPageDetail['questions']>
  isExpanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<number | false>>
  reload: T_VoidFn
  evaluationStatus: T_EvaluationStatusCode
}> = ({ isExpanded, setExpanded, question, evaluationId, reload, evaluationStatus }) => {
  const handleChange = (panel: I_EvaluationPageDetail['id']) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }
  const AnswerComponent = answersComponents[question.answer.resource_type]

  return (
    <Accordion
      style={{ margin: '.5em 0' }}
      slotProps={{ transition: { unmountOnExit: true } }}
      expanded={isExpanded}
      onChange={handleChange(question.id)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Body1 component="span" sx={{ width: '33%', flexShrink: 0 }}>
          Pregunta #{question.order + 1}
        </Body1>
        {!isExpanded && (
          <>
            <Body2 component="span" sx={{ color: 'text.secondary' }}>
              <AnswerTypeChip type={question.answer.resource_type} />{' '}
              {truncateString(strippedString(question.content), 40)}
            </Body2>
          </>
        )}
      </AccordionSummary>

      <AccordionDetails>
        <MagicGrid>
          <Box>
            <HTMLParser htmlContent={question.content} />
          </Box>
          <AnswerComponent data={question.answer} />
          <Toolbar
            evaluationId={evaluationId}
            questionId={question.id}
            reload={reload}
            disabled={evaluationStatus === EvaluationStatus.Published}
          />
        </MagicGrid>
      </AccordionDetails>
    </Accordion>
  )
}

export default QuestionAccordion
