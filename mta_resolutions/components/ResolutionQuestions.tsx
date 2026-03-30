import { T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import { useResolutionState, useResolutionStateUpdateAnswer } from '@/mta_resolutions/hooks/data'
import {
  I_EvaluationToResolve,
  I_Page,
  T_EvaluationToResolve_MultipleChoiceAnswer,
  T_EvaluationToResolve_NumericAnswer,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
  T_EvaluationToResolve_OpenEndedAnswer,
  T_ResolutionState_OpenEndedAnswerData,
  I_Question,
} from '@/mta_resolutions/types'
import Chip from '@/shared/components/Chip'
import Spacer from '@/shared/components/Spacer'
import { Body1 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import HTMLParser from '@/shared/components/HTMLParser'
import { Box, Checkbox, FormControl, FormControlLabel, Grid2 as Grid, Radio } from '@mui/material'
import { FC, Fragment, useEffect, useMemo, useState } from 'react'
import MultipleChoiceOptionContainer from '@/mta_evaluations/components/MultipleChoiceOptionContainer'
import { useDebouncedCallback } from 'use-debounce'

const NumericForm: FC<{ data: T_EvaluationToResolve_NumericAnswer; questionId: T_QuestionId }> = ({
  data,
  questionId,
}) => {
  const resolutionState = useResolutionState()
  const { updateNumeric } = useResolutionStateUpdateAnswer()

  const specific_data = resolutionState?.answers[questionId]?.specific_data as
    | T_ResolutionState_NumericAnswerData['specific_data']
    | undefined

  return (
    <Input
      type="number"
      name={String(data.id)}
      label="Respuesta"
      placeholder="Escribí solo números (si hay decimales, usá punto)"
      value={specific_data?.value === undefined ? '' : specific_data.value}
      onChange={(e) => {
        updateNumeric(questionId, data.id, e.target.value === '' ? null : Number(e.target.value))
      }}
    />
  )
}

const OpenEndedForm: FC<{ data: T_EvaluationToResolve_OpenEndedAnswer; questionId: T_QuestionId }> = ({
  data,
  questionId,
}) => {
  const resolutionState = useResolutionState()
  const { updateOpenEnded } = useResolutionStateUpdateAnswer()

  const specific_data = resolutionState?.answers[questionId]?.specific_data as
    | T_ResolutionState_OpenEndedAnswerData['specific_data']
    | undefined

  const externalValue = specific_data?.value ?? ''
  const [draft, setDraft] = useState(externalValue)

  useEffect(() => {
    setDraft(externalValue)
  }, [externalValue, questionId])

  const debouncedCommit = useDebouncedCallback((value: string) => {
    updateOpenEnded(questionId, data.id, value)
  }, 700)

  useEffect(() => {
    return () => {
      debouncedCommit.flush()
    }
  }, [debouncedCommit])

  return (
    <textarea
      name={String(data.id)}
      value={draft}
      onChange={(e) => {
        const nextValue = e.target.value
        setDraft(nextValue)
        debouncedCommit(nextValue)
      }}
      onBlur={() => {
        debouncedCommit.flush()
        updateOpenEnded(questionId, data.id, draft)
      }}
      placeholder="Escribe tu respuesta…"
      rows={4}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid hsl(0 0% 80%)',
        lineHeight: 1.5,
        resize: 'vertical',
        outline: 'none',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          // Optional submit shortcut
        }
      }}
    />
  )
}

const MultipleChoiceForm: FC<{ data: T_EvaluationToResolve_MultipleChoiceAnswer; questionId: T_QuestionId }> = ({
  data,
  questionId,
}) => {
  const resolutionState = useResolutionState()
  const { updateMultipleChoice } = useResolutionStateUpdateAnswer()

  const specific_data = resolutionState?.answers[questionId]?.specific_data as
    | T_ResolutionState_MultipleChoiceAnswerData['specific_data']
    | undefined

  const handleCbChange = (name: string, checked: boolean) => {
    if (checked && specific_data?.chosen_options?.includes(name)) return
    if (!checked && !specific_data?.chosen_options?.includes(name)) return

    const checkedOption = () => {
      const newChosenOptions = specific_data?.chosen_options?.map((i) => i) || []
      newChosenOptions.push(name)
      return newChosenOptions
    }

    const uncheckedOption = () => {
      return specific_data?.chosen_options.filter((i) => i !== name) || []
    }

    updateMultipleChoice(questionId, data.id, checked ? checkedOption() : uncheckedOption())
  }

  const handleRadioChange = (name: string, _: boolean) => {
    updateMultipleChoice(questionId, data.id, [name])
  }

  return (
    <FormControl sx={{ width: '100%' }}>
      {data.specific_data.options.map((option) => {
        return (
          <MultipleChoiceOptionContainer key={`answer_${data.id}-option_${option.id}`}>
            <FormControlLabel
              value={option.content}
              control={
                data.specific_data.is_multiselect ? (
                  <Checkbox
                    onChange={(_, checked) => {
                      handleCbChange(option.name, checked)
                    }}
                    checked={specific_data?.chosen_options?.includes(option.name) || false}
                  />
                ) : (
                  <Radio
                    onChange={(_, checked) => {
                      handleRadioChange(option.name, checked)
                    }}
                    checked={specific_data?.chosen_options?.includes(option.name) || false}
                  />
                )
              }
              label={
                <Grid spacing={2} container justifyContent="center" alignItems="center">
                  <Grid size="auto">
                    <Chip label={option.name} />
                  </Grid>
                  <Grid size="grow">
                    <HTMLParser htmlContent={option.content} />
                  </Grid>
                </Grid>
              }
            />
          </MultipleChoiceOptionContainer>
        )
      })}
    </FormControl>
  )
}

const forms: Record<T_AnswerType, FC<any>> = {
  MultipleChoice: MultipleChoiceForm,
  Numeric: NumericForm,
  OpenEnded: OpenEndedForm,
}

type QuestionBlock =
  | { kind: 'plain'; questions: I_Question[] }
  | { kind: 'section'; title: string; questions: I_Question[] }

function buildQuestionBlocks(questions: I_Question[]): QuestionBlock[] {
  const blocks: QuestionBlock[] = []

  let plain: I_Question[] = []
  let section: { title: string; questions: I_Question[] } | null = null

  const flushPlain = () => {
    if (plain.length) blocks.push({ kind: 'plain', questions: plain })
    plain = []
  }

  const flushSection = () => {
    if (section) blocks.push({ kind: 'section', title: section.title, questions: section.questions })
    section = null
  }

  for (const q of questions) {
    const title = (q.section_title ?? '').trim()

    if (title) {
      flushPlain()
      flushSection()
      section = { title, questions: [] }
    }

    if (section) {
      section.questions.push(q)
    } else {
      plain.push(q)
    }
  }

  flushPlain()
  flushSection()

  return blocks
}

const ResolutionQuestions: FC<{ evaluationToResolve: I_EvaluationToResolve; currentPage: number }> = ({
  evaluationToResolve,
  currentPage,
}) => {
  const page: I_Page = evaluationToResolve.pages[currentPage - 1]
  const { questions } = page

  const blocks = useMemo(() => buildQuestionBlocks(questions), [questions])

  const renderQuestion = (question: I_Question) => {
    const AnswerForm = forms[question.answer.resource_type]

    return (
      <Fragment key={question.id}>
        <Body1>Pregunta {question.global_order + 1}</Body1>

        <Box sx={{ fontSize: '1.5em' }}>
          <HTMLParser htmlContent={question.content} />
        </Box>

        <Spacer size="s" />
        <AnswerForm data={question.answer} questionId={question.id} />
        <Spacer size="xl" />
      </Fragment>
    )
  }

  return (
    <>
      {blocks.map((block, idx) => {
        if (block.kind === 'section') {
          return (
            <Fragment key={`section-${idx}`}>
              <Body1 style={{ fontWeight: 700, marginTop: 16 }}>{block.title}</Body1>
              <Spacer size="s" />
              {block.questions.map(renderQuestion)}
            </Fragment>
          )
        }

        return <Fragment key={`plain-${idx}`}>{block.questions.map(renderQuestion)}</Fragment>
      })}
    </>
  )
}

export default ResolutionQuestions