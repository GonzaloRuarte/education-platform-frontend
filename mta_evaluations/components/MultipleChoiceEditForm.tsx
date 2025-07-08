'use client'

import MultipleChoiceOption from '@/mta_evaluations/components/MultipleChoiceOption'
import OptionDraftForm from '@/mta_evaluations/components/OptionDraftForm'
import { useQuestionMultipleChoiceUpdate } from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'
import {
  I_AnswerMultipleChoiceDetail,
  I_QuestionUpdateMultipleChoiceRequestData,
  T_QuestionForm,
} from '@/mta_evaluations/types'
import { AddButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Button from '@/shared/components/Button'
import { H4 } from '@/shared/components/Typography'
import { useDialog } from '@/shared/dialogs'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { Box } from '@mui/material'
import { FC, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'


interface I_FormFields extends I_QuestionUpdateMultipleChoiceRequestData {}

type LocalOption = I_AnswerMultipleChoiceDetail['options'][number]

interface OptionsProps {
  options: LocalOption[]
  addOption: (o: LocalOption) => void
  deleteOption: (id: number) => void
  toggleOptionTrue: (idx: number, value: boolean) => void
}

const Options: FC<OptionsProps> = ({
  options,
  addOption,
  deleteOption,
  toggleOptionTrue,
}) => {
  const { DialogComponent, componentProps, showDialog, closeDialog } = useDialog()

  // opens a tiny local form (see next file) -------------------------------
  const handleAddOption = () =>
    showDialog({
      title: 'Agregar Opción',
      content: (
        <OptionDraftForm
          onCreate={(opt) => {
            addOption(opt)
            closeDialog()
          }}
        />
      ),
      actions: [],
    })

  return (
    <>
      <Box maxWidth="md">
        <H4>
          Opciones <AddButton size="small" variant="outlined" onClick={handleAddOption} />
        </H4>
        <Spacer />
        {options.map((o, idx) => (
          <MultipleChoiceOption
            key={o.id}
            data={o}
            onDelete={() => deleteOption(o.id)}
            onToggleTrue={(v) => toggleOptionTrue(idx, v)}
            withDelete
          />
        ))}
      </Box>
      <DialogComponent {...componentProps} />
    </>
  )
}

interface OptionDTO {
  id: number
  name: string
  content: string
  is_true: boolean
}

interface MultipleChoiceUpdatePayload {
  content: string
  options_ops: {
    create: Array<Omit<OptionDTO, 'id'>>   // new rows (no id yet)
    update: Array<OptionDTO>               // existing rows with changes
    delete: number[]                       // ids of rows to remove
  }
}

const MultipleChoiceEditForm: T_QuestionForm<I_AnswerMultipleChoiceDetail> = ({
  data,
  onSuccess,          // <-- called only when finally persisting
  onCancel,
}) => {
  const { content, answer } = data

  // ① Local working copy of the option list (NOT yet persisted)
  const [options, setOptions] = useState(answer.options)
  // keep the original list to diff later
  const originalOptionsRef = useRef(answer.options)
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const update = useQuestionMultipleChoiceUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    /* -------- 1. diff the arrays -------- */
    const original = originalOptionsRef.current
    const originalMap = new Map(original.map((o) => [o.id, o]))

    const toCreate = options.filter((o) => o.id == null || o.id < 0)

    const toDelete = original
      .filter((o) => !options.some((n) => n.id === o.id))
      .map((o) => o.id)

    const toUpdate = options.filter((o) => {
      if (o.id == null || o.id < 0) return false
      const orig = originalMap.get(o.id)!
      return (
        o.name !== orig.name ||
        o.content !== orig.content ||
        o.is_true !== orig.is_true
      )
    })

    /* -------- 2. build batch payload -------- */
    const payload: MultipleChoiceUpdatePayload = {
      content: updatedData.content,
      options_ops: {
        create: toCreate.map(({ id, ...rest }) => rest),
        update: toUpdate,
        delete: toDelete,
      },
    }
    setInProgressStatus(true)
    update(data.id, payload)
      .then(() => {
        log.info('Question edited succesfully:')
        successToast('Pregunta editada correctamente')
        onSuccess()
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form>
      <MagicGrid>
        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={questionLabels.content}
          rules={{ ...rules.required() }}
          name="content"
        />
      </MagicGrid>
      <Spacer />

      <Options
        options={options}
        addOption={(opt) => setOptions((prev) => [...prev, opt])}
        deleteOption={(id) =>
          setOptions((prev) => prev.filter((o) => o.id !== id))
        }
        toggleOptionTrue={(idx, val) =>
          setOptions((prev) =>
            prev.map((o, i) => (i === idx ? { ...o, is_true: val } : o)),
          )
        }
      />
      <Spacer />

      <Submit onClick={handleSubmit(onSubmit)}>{sharedLabels.update}</Submit>
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            {sharedLabels.cancel}
          </Button>
        )}
    </form>
  )
}

export default MultipleChoiceEditForm
